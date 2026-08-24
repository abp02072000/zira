package application

import (
	"context"
	"fmt"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/domain/audit"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/kyc"
	"github.com/zira-invest/backend/internal/domain/storage"
)

// AllowedKYCMimeTypes définit les types MIME autorisés pour les pièces d'identité et statuts
var AllowedKYCMimeTypes = map[string]bool{
	"application/pdf": true,
	"image/jpeg":      true,
	"image/jpg":       true,
	"image/png":       true,
}

const MaxKYCFileSize = 10 * 1024 * 1024 // 10 Mo max

// KycService gère le cycle de vie des dossiers de vérification d'identité et de conformité OHADA
type KycService struct {
	kycRepo     kyc.Repository
	storageServ storage.Service
	auditRepo   audit.Repository
}

// NewKycService instancie le service KYC
func NewKycService(kycRepo kyc.Repository, storageServ storage.Service, auditRepo audit.Repository) *KycService {
	return &KycService{
		kycRepo:     kycRepo,
		storageServ: storageServ,
		auditRepo:   auditRepo,
	}
}

// GetOrCreateVerification récupère ou initialise le dossier KYC de l'utilisateur
func (s *KycService) GetOrCreateVerification(ctx context.Context, userID, userType string) (*kyc.KycVerification, error) {
	k, err := s.kycRepo.GetByUserID(ctx, userID)
	if err == nil && k != nil {
		return k, nil
	}

	newKYC := &kyc.KycVerification{
		ID:        uuid.New().String(),
		UserID:    userID,
		Type:      userType,
		Status:    kyc.StatusNotStarted,
		Documents: []kyc.KycDocument{},
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}

	if err := s.kycRepo.CreateVerification(ctx, newKYC); err != nil {
		return nil, fmt.Errorf("création dossier KYC: %w", err)
	}

	return newKYC, nil
}

// RequestPresignedKycUpload génère une URL pré-signée sécurisée pour l'envoi direct du document vers Cloudflare R2
func (s *KycService) RequestPresignedKycUpload(ctx context.Context, userID string, docType kyc.DocumentType, fileName, mimeType string, fileSize int64) (*storage.PresignedURLResponse, error) {
	if !AllowedKYCMimeTypes[mimeType] {
		return nil, common.ErrInvalidFileType
	}
	if fileSize > MaxKYCFileSize {
		return nil, common.ErrFileTooLarge
	}

	k, err := s.GetOrCreateVerification(ctx, userID, "porteur")
	if err != nil {
		return nil, err
	}

	// Clé R2 isolée et confidentielle : kyc/{userID}/{docID}_{cleanFilename}
	cleanExt := filepath.Ext(fileName)
	docID := uuid.New().String()
	r2Key := fmt.Sprintf("kyc/%s/%s%s", userID, docID, cleanExt)

	presigned, err := s.storageServ.GeneratePresignedUploadURL(ctx, r2Key, mimeType, MaxKYCFileSize, 15*time.Minute)
	if err != nil {
		return nil, fmt.Errorf("génération URL de téléversement R2: %w", err)
	}

	// Pré-enregistrer les métadonnées du document
	doc := &kyc.KycDocument{
		ID:         docID,
		KycID:      k.ID,
		DocType:    docType,
		FileName:   fileName,
		FileSize:   fileSize,
		MimeType:   mimeType,
		R2Key:      r2Key,
		UploadedAt: time.Now().UTC(),
	}

	if err := s.kycRepo.AddDocument(ctx, doc); err != nil {
		return nil, fmt.Errorf("enregistrement métadonnées document KYC: %w", err)
	}

	return presigned, nil
}

// SubmitKyc transmet le dossier complet à l'équipe de conformité
func (s *KycService) SubmitKyc(ctx context.Context, userID string) (*kyc.KycVerification, error) {
	k, err := s.kycRepo.GetByUserID(ctx, userID)
	if err != nil || k == nil {
		return nil, common.ErrKycNotFound
	}

	if err := k.Submit(); err != nil {
		return nil, err
	}

	if err := s.kycRepo.UpdateVerification(ctx, k); err != nil {
		return nil, fmt.Errorf("mise à jour statut KYC: %w", err)
	}

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &userID,
		Action:       "kyc.submitted",
		ResourceType: "kyc_verification",
		ResourceID:   k.ID,
		CreatedAt:    time.Now().UTC(),
	})

	return k, nil
}

// GetPrivateKycDocumentURL génère une URL de consultation temporaire (presigned GET) pour le titulaire ou un modérateur
func (s *KycService) GetPrivateKycDocumentURL(ctx context.Context, requestingUserID string, isModerator bool, docID string) (string, error) {
	doc, err := s.kycRepo.GetDocumentByID(ctx, docID)
	if err != nil || doc == nil {
		return "", common.ErrKycNotFound
	}

	k, err := s.kycRepo.GetByID(ctx, doc.KycID)
	if err != nil || k == nil {
		return "", common.ErrKycNotFound
	}

	// Contrôle d'accès strict : seul le propriétaire du dossier ou un modérateur autorisé peut générer le lien
	if !isModerator && k.UserID != requestingUserID {
		return "", common.ErrStorageAccessDenied
	}

	return s.storageServ.GeneratePresignedDownloadURL(ctx, doc.R2Key, 10*time.Minute)
}
