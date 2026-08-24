package application

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/domain/audit"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/member"
	"github.com/zira-invest/backend/internal/domain/project"
	"github.com/zira-invest/backend/internal/domain/storage"
)

// ProjectService orchestre le cycle de vie, la création et la gestion des levées de fonds
type ProjectService struct {
	projectRepo project.Repository
	memberRepo  member.Repository
	auditRepo   audit.Repository
	storageServ storage.Service
}

// NewProjectService instancie le service des projets
func NewProjectService(
	projectRepo project.Repository,
	memberRepo member.Repository,
	auditRepo audit.Repository,
	storageServ storage.Service,
) *ProjectService {
	return &ProjectService{
		projectRepo: projectRepo,
		memberRepo:  memberRepo,
		auditRepo:   auditRepo,
		storageServ: storageServ,
	}
}

// CreateProjectPayload contient les données requises pour initialiser une campagne
type CreateProjectPayload struct {
	Name             string                `json:"name"`
	ShortDescription string                `json:"short_description"`
	FullDescription  *string               `json:"full_description,omitempty"`
	Sector           string                `json:"sector"`
	Stage            string                `json:"stage"`
	TargetMarket     string                `json:"target_market"`
	Country          string                `json:"country"`
	City             string                `json:"city"`
	VideoURL         *string               `json:"video_url,omitempty"`
	LogoR2Key        *string               `json:"logo_r2_key,omitempty"`
	PosterR2Key      *string               `json:"poster_r2_key,omitempty"`
	Funding          project.FundingParams `json:"funding"`
}

// CreateProject crée une nouvelle opportunité d'investissement et assigne le créateur comme OWNER
func (s *ProjectService) CreateProject(ctx context.Context, ownerID string, payload CreateProjectPayload) (*project.Project, error) {
	if err := payload.Funding.Validate(); err != nil {
		return nil, err
	}

	baseSlug := project.GenerateSlug(payload.Name)
	finalSlug := baseSlug

	// Garantir l'unicité du slug pour les URLs publiques et le SEO
	taken, err := s.projectRepo.IsSlugTaken(ctx, finalSlug)
	if err != nil {
		return nil, fmt.Errorf("vérification slug: %w", err)
	}
	if taken {
		finalSlug = fmt.Sprintf("%s-%s", baseSlug, uuid.New().String()[:6])
	}

	country := payload.Country
	if country == "" {
		country = "RDC"
	}
	city := payload.City
	if city == "" {
		city = "Kinshasa"
	}
	stage := payload.Stage
	if stage == "" {
		stage = "Growth"
	}

	newProj := &project.Project{
		ID:               uuid.New().String(),
		Slug:             finalSlug,
		OwnerID:          ownerID,
		Name:             payload.Name,
		ShortDescription: payload.ShortDescription,
		FullDescription:  payload.FullDescription,
		Sector:           payload.Sector,
		Stage:            stage,
		TargetMarket:     payload.TargetMarket,
		Country:          country,
		City:             city,
		VideoURL:         payload.VideoURL,
		LogoR2Key:        payload.LogoR2Key,
		PosterR2Key:      payload.PosterR2Key,
		Funding:          payload.Funding,
		Status:           project.StatusDraft,
		CreatedAt:        time.Now().UTC(),
		UpdatedAt:        time.Now().UTC(),
	}

	if err := s.projectRepo.Create(ctx, newProj); err != nil {
		return nil, fmt.Errorf("création projet en base: %w", err)
	}

	// Ajouter automatiquement le créateur en tant que Propriétaire (OWNER)
	ownerMember := &member.ProjectMember{
		ID:               uuid.New().String(),
		ProjectID:        newProj.ID,
		UserID:           ownerID,
		Role:             member.RoleOwner,
		Permissions:      member.DefaultPermissionsForRole(member.RoleOwner),
		InvitationStatus: "ACTIVE",
		CreatedAt:        time.Now().UTC(),
		UpdatedAt:        time.Now().UTC(),
	}
	_ = s.memberRepo.AddMember(ctx, ownerMember)

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &ownerID,
		Action:       "project.created",
		ResourceType: "project",
		ResourceID:   newProj.ID,
		CreatedAt:    time.Now().UTC(),
	})

	return newProj, nil
}

// UpdateProject met à jour les informations du projet après vérification des droits
func (s *ProjectService) UpdateProject(ctx context.Context, userID, projectID string, payload CreateProjectPayload) (*project.Project, error) {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return nil, common.ErrProjectNotFound
	}

	// Vérification des autorisations : OWNER ou membre avec permission project.update
	if proj.OwnerID != userID {
		m, err := s.memberRepo.GetMember(ctx, projectID, userID)
		if err != nil || m == nil || !m.HasPermission(member.PermProjectUpdate) {
			return nil, common.ErrUnauthorizedProjectOp
		}
	}

	if payload.Name != "" {
		proj.Name = payload.Name
	}
	if payload.ShortDescription != "" {
		proj.ShortDescription = payload.ShortDescription
	}
	if payload.FullDescription != nil {
		proj.FullDescription = payload.FullDescription
	}
	if payload.Sector != "" {
		proj.Sector = payload.Sector
	}
	if payload.Stage != "" {
		proj.Stage = payload.Stage
	}
	if payload.TargetMarket != "" {
		proj.TargetMarket = payload.TargetMarket
	}
	if payload.VideoURL != nil {
		proj.VideoURL = payload.VideoURL
	}
	if payload.LogoR2Key != nil {
		proj.LogoR2Key = payload.LogoR2Key
	}
	if payload.PosterR2Key != nil {
		proj.PosterR2Key = payload.PosterR2Key
	}

	// Mise à jour des paramètres financiers si spécifiés
	if payload.Funding.TargetAmountUSD > 0 {
		if err := payload.Funding.Validate(); err != nil {
			return nil, err
		}
		proj.Funding = payload.Funding
	}

	proj.UpdatedAt = time.Now().UTC()

	if err := s.projectRepo.Update(ctx, proj); err != nil {
		return nil, fmt.Errorf("mise à jour projet: %w", err)
	}

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &userID,
		Action:       "project.updated",
		ResourceType: "project",
		ResourceID:   proj.ID,
		CreatedAt:    time.Now().UTC(),
	})

	return proj, nil
}

// SubmitProject soumet le projet pour revue
func (s *ProjectService) SubmitProject(ctx context.Context, userID, projectID string) (*project.Project, error) {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return nil, common.ErrProjectNotFound
	}

	if proj.OwnerID != userID {
		m, err := s.memberRepo.GetMember(ctx, projectID, userID)
		if err != nil || m == nil || !m.HasPermission(member.PermProjectSubmit) {
			return nil, common.ErrUnauthorizedProjectOp
		}
	}

	oldStatus := proj.Status
	if err := proj.Submit(); err != nil {
		return nil, err
	}

	if err := s.projectRepo.Update(ctx, proj); err != nil {
		return nil, fmt.Errorf("mise à jour statut projet: %w", err)
	}

	_ = s.projectRepo.RecordStatusHistory(ctx, &project.StatusHistory{
		ID:        uuid.New().String(),
		ProjectID: proj.ID,
		FromState: oldStatus,
		ToState:   proj.Status,
		ChangedBy: &userID,
		CreatedAt: time.Now().UTC(),
	})

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &userID,
		Action:       "project.submitted",
		ResourceType: "project",
		ResourceID:   proj.ID,
		CreatedAt:    time.Now().UTC(),
	})

	return proj, nil
}

// GetProjectByID récupère les détails d'un projet pour un propriétaire ou membre
func (s *ProjectService) GetProjectByID(ctx context.Context, userID, projectID string) (*project.Project, error) {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return nil, common.ErrProjectNotFound
	}

	// S'il est publié, tout le monde peut le lire
	if proj.Status == project.StatusPublished || proj.Status == project.StatusFunding || proj.Status == project.StatusFunded {
		return proj, nil
	}

	// Sinon, vérifier l'appartenance
	if proj.OwnerID == userID {
		return proj, nil
	}

	m, err := s.memberRepo.GetMember(ctx, projectID, userID)
	if err == nil && m != nil {
		return proj, nil
	}

	return nil, common.ErrUnauthorizedProjectOp
}

// GetProjectsByOwner liste tous les projets appartenant au porteur
func (s *ProjectService) GetProjectsByOwner(ctx context.Context, ownerID string, page, limit int) (*common.PaginatedResult[*project.Project], error) {
	params := common.PaginationParams{Page: page, Limit: limit}
	params.EnsureDefaults()

	projects, total, err := s.projectRepo.GetByOwnerID(ctx, ownerID, params.Limit, params.Offset())
	if err != nil {
		return nil, fmt.Errorf("liste projets porteur: %w", err)
	}

	result := common.NewPaginatedResult(projects, total, params.Page, params.Limit)
	return &result, nil
}

// GetPublicProjectBySlug résout un projet public pour les moteurs de recherche et les investisseurs
func (s *ProjectService) GetPublicProjectBySlug(ctx context.Context, slug string) (*project.PublicProject, error) {
	p, err := s.projectRepo.GetBySlug(ctx, slug)
	if err != nil || p == nil {
		return nil, common.ErrProjectNotFound
	}

	// Seuls les projets validés/publiés sont accessibles publiquement
	if p.Status != project.StatusPublished && p.Status != project.StatusFunding && p.Status != project.StatusFunded && p.Status != project.StatusCompleted {
		return nil, common.ErrProjectNotFound
	}

	var logoURL, posterURL *string
	if p.LogoR2Key != nil {
		u := s.storageServ.GetPublicURL(*p.LogoR2Key)
		logoURL = &u
	}
	if p.PosterR2Key != nil {
		u := s.storageServ.GetPublicURL(*p.PosterR2Key)
		posterURL = &u
	}

	return &project.PublicProject{
		Slug:             p.Slug,
		Name:             p.Name,
		ShortDescription: p.ShortDescription,
		FullDescription:  p.FullDescription,
		Sector:           p.Sector,
		Stage:            p.Stage,
		TargetMarket:     p.TargetMarket,
		Country:          p.Country,
		City:             p.City,
		VideoURL:         p.VideoURL,
		LogoURL:          logoURL,
		PosterURL:        posterURL,
		Funding:          p.Funding,
		Status:           p.Status,
		PublishedAt:      p.PublishedAt,
	}, nil
}
