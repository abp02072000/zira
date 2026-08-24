package application

import (
	"context"
	"fmt"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/domain/audit"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/document"
	"github.com/zira-invest/backend/internal/domain/member"
	"github.com/zira-invest/backend/internal/domain/project"
	"github.com/zira-invest/backend/internal/domain/storage"
)

var AllowedDocumentMimeTypes = map[string]bool{
	"application/pdf":                                                        true,
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":         true, // .xlsx
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document":   true, // .docx
	"application/vnd.ms-excel":                                               true, // .xls
}

var AllowedImageMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/webp": true,
}

const MaxDocumentSize = 25 * 1024 * 1024 // 25 Mo max
const MaxImageSize = 8 * 1024 * 1024    // 8 Mo max

// DocumentService gère les documents d'investissement et la galerie multimédia
type DocumentService struct {
	docRepo     document.Repository
	projectRepo project.Repository
	memberRepo  member.Repository
	auditRepo   audit.Repository
	storageServ storage.Service
}

// NewDocumentService instancie le service des documents
func NewDocumentService(
	docRepo document.Repository,
	projectRepo project.Repository,
	memberRepo member.Repository,
	auditRepo audit.Repository,
	storageServ storage.Service,
) *DocumentService {
	return &DocumentService{
		docRepo:     docRepo,
		projectRepo: projectRepo,
		memberRepo:  memberRepo,
		auditRepo:   auditRepo,
		storageServ: storageServ,
	}
}

// RequestUploadURL génère une URL pré-signée sécurisée vers Cloudflare R2
func (s *DocumentService) RequestUploadURL(ctx context.Context, userID, projectID, fileName, mimeType string, fileSize int64, isImage bool) (*storage.PresignedURLResponse, error) {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return nil, common.ErrProjectNotFound
	}

	if proj.OwnerID != userID {
		m, err := s.memberRepo.GetMember(ctx, projectID, userID)
		if err != nil || m == nil || !m.HasPermission(member.PermProjectManageDocuments) {
			return nil, common.ErrUnauthorizedProjectOp
		}
	}

	maxSize := int64(MaxDocumentSize)
	folder := "documents"
	if isImage {
		if !AllowedImageMimeTypes[mimeType] {
			return nil, common.ErrInvalidFileType
		}
		maxSize = MaxImageSize
		folder = "images"
	} else {
		if !AllowedDocumentMimeTypes[mimeType] {
			return nil, common.ErrInvalidFileType
		}
	}

	if fileSize > maxSize {
		return nil, common.ErrFileTooLarge
	}

	cleanExt := filepath.Ext(fileName)
	fileUUID := uuid.New().String()
	r2Key := fmt.Sprintf("projects/%s/%s/%s%s", projectID, folder, fileUUID, cleanExt)

	presigned, err := s.storageServ.GeneratePresignedUploadURL(ctx, r2Key, mimeType, maxSize, 15*time.Minute)
	if err != nil {
		return nil, fmt.Errorf("génération URL pré-signée document: %w", err)
	}

	// Si c'est une image publique, fournir également l'URL CDN publique
	if isImage {
		pubURL := s.storageServ.GetPublicURL(r2Key)
		presigned.PublicURL = &pubURL
	}

	return presigned, nil
}

// RegisterDocument confirme et enregistre les métadonnées du document dans PostgreSQL
func (s *DocumentService) RegisterDocument(ctx context.Context, userID, projectID, title, category, fileName, mimeType, r2Key string, fileSize int64, isPublic bool) (*document.ProjectDocument, error) {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return nil, common.ErrProjectNotFound
	}

	if proj.OwnerID != userID {
		m, err := s.memberRepo.GetMember(ctx, projectID, userID)
		if err != nil || m == nil || !m.HasPermission(member.PermProjectManageDocuments) {
			return nil, common.ErrUnauthorizedProjectOp
		}
	}

	doc := &document.ProjectDocument{
		ID:         uuid.New().String(),
		ProjectID:  projectID,
		Title:      title,
		Category:   document.Category(category),
		FileName:   fileName,
		FileSize:   fileSize,
		MimeType:   mimeType,
		R2Key:      r2Key,
		IsPublic:   isPublic,
		UploadedBy: userID,
		CreatedAt:  time.Now().UTC(),
	}

	if err := s.docRepo.AddDocument(ctx, doc); err != nil {
		return nil, fmt.Errorf("enregistrement métadonnées document: %w", err)
	}

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &userID,
		Action:       "document.registered",
		ResourceType: "project_document",
		ResourceID:   doc.ID,
		CreatedAt:    time.Now().UTC(),
	})

	return doc, nil
}

// ListProjectDocuments liste les documents disponibles selon les privilèges d'accès
func (s *DocumentService) ListProjectDocuments(ctx context.Context, userID, projectID string) ([]*document.ProjectDocument, error) {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return nil, common.ErrProjectNotFound
	}

	isAuthorizedMember := false
	if proj.OwnerID == userID {
		isAuthorizedMember = true
	} else {
		m, _ := s.memberRepo.GetMember(ctx, projectID, userID)
		if m != nil {
			isAuthorizedMember = true
		}
	}

	// Si ce n'est pas un membre officiel, filtrer uniquement les documents publics
	return s.docRepo.ListDocumentsByProject(ctx, projectID, !isAuthorizedMember)
}

// GetDocumentDownloadURL génère une URL pré-signée de téléchargement (GET) pour les documents confidentiels
func (s *DocumentService) GetDocumentDownloadURL(ctx context.Context, userID, docID string) (string, error) {
	doc, err := s.docRepo.GetDocumentByID(ctx, docID)
	if err != nil || doc == nil {
		return "", common.ErrProjectNotFound
	}

	if doc.IsPublic {
		return s.storageServ.GetPublicURL(doc.R2Key), nil
	}

	proj, err := s.projectRepo.GetByID(ctx, doc.ProjectID)
	if err != nil || proj == nil {
		return "", common.ErrProjectNotFound
	}

	if proj.OwnerID != userID {
		m, err := s.memberRepo.GetMember(ctx, doc.ProjectID, userID)
		if err != nil || m == nil {
			return "", common.ErrStorageAccessDenied
		}
	}

	return s.storageServ.GeneratePresignedDownloadURL(ctx, doc.R2Key, 15*time.Minute)
}

// DeleteDocument supprime le document de la base et du bucket R2
func (s *DocumentService) DeleteDocument(ctx context.Context, userID, docID string) error {
	doc, err := s.docRepo.GetDocumentByID(ctx, docID)
	if err != nil || doc == nil {
		return common.ErrProjectNotFound
	}

	proj, err := s.projectRepo.GetByID(ctx, doc.ProjectID)
	if err != nil || proj == nil {
		return common.ErrProjectNotFound
	}

	if proj.OwnerID != userID {
		m, err := s.memberRepo.GetMember(ctx, doc.ProjectID, userID)
		if err != nil || m == nil || !m.HasPermission(member.PermProjectManageDocuments) {
			return common.ErrUnauthorizedProjectOp
		}
	}

	_ = s.storageServ.DeleteObject(ctx, doc.R2Key)
	return s.docRepo.DeleteDocument(ctx, docID)
}
