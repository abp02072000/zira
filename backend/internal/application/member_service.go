package application

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/domain/audit"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/member"
	"github.com/zira-invest/backend/internal/domain/project"
	"github.com/zira-invest/backend/internal/domain/user"
)

// MemberService gère l'équipe, les rôles RBAC et les invitations par lien/email
type MemberService struct {
	memberRepo  member.Repository
	projectRepo project.Repository
	userRepo    user.Repository
	auditRepo   audit.Repository
}

// NewMemberService instancie le service des membres
func NewMemberService(
	memberRepo member.Repository,
	projectRepo project.Repository,
	userRepo user.Repository,
	auditRepo audit.Repository,
) *MemberService {
	return &MemberService{
		memberRepo:  memberRepo,
		projectRepo: projectRepo,
		userRepo:    userRepo,
		auditRepo:   auditRepo,
	}
}

// ListProjectMembers retourne l'ensemble des collaborateurs d'un projet
func (s *MemberService) ListProjectMembers(ctx context.Context, projectID string) ([]*member.ProjectMember, error) {
	return s.memberRepo.ListProjectMembers(ctx, projectID)
}

// InviteMember génère une invitation sécurisée pour un cofondateur ou collaborateur
func (s *MemberService) InviteMember(ctx context.Context, actorID, projectID, email string, role member.Role) (*member.ProjectInvitation, error) {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return nil, common.ErrProjectNotFound
	}

	// Vérifier que l'acteur a le droit d'administrer les membres
	if proj.OwnerID != actorID {
		m, err := s.memberRepo.GetMember(ctx, projectID, actorID)
		if err != nil || m == nil || !m.HasPermission(member.PermProjectManageMembers) {
			return nil, common.ErrUnauthorizedProjectOp
		}
	}

	// Ne pas réinviter le propriétaire
	if role == member.RoleOwner {
		return nil, common.ErrInvalidRole
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(email))

	// Vérifier si une invitation en attente existe déjà
	existing, err := s.memberRepo.GetPendingInvitation(ctx, projectID, cleanEmail)
	if err == nil && existing != nil && !existing.IsExpired() {
		return existing, nil
	}

	// Générer un jeton cryptographique aléatoire de 32 octets (64 caractères hex)
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return nil, fmt.Errorf("génération jeton d'invitation: %w", err)
	}
	token := hex.EncodeToString(tokenBytes)

	inv := &member.ProjectInvitation{
		ID:           uuid.New().String(),
		ProjectID:    projectID,
		InviterID:    actorID,
		InviteeEmail: cleanEmail,
		Role:         role,
		Token:        token,
		Status:       member.InvitePending,
		ExpiresAt:    time.Now().UTC().Add(7 * 24 * time.Hour), // 7 jours de validité
		CreatedAt:    time.Now().UTC(),
	}

	if err := s.memberRepo.CreateInvitation(ctx, inv); err != nil {
		return nil, fmt.Errorf("création invitation: %w", err)
	}

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &actorID,
		Action:       "member.invited",
		ResourceType: "project",
		ResourceID:   projectID,
		CreatedAt:    time.Now().UTC(),
	})

	return inv, nil
}

// AcceptInvitation valide le token et rattache l'utilisateur comme membre officiel
func (s *MemberService) AcceptInvitation(ctx context.Context, userID, token string) (*member.ProjectMember, error) {
	inv, err := s.memberRepo.GetInvitationByToken(ctx, token)
	if err != nil || inv == nil {
		return nil, common.ErrInvitationNotFound
	}

	if inv.Status != member.InvitePending || inv.IsExpired() {
		return nil, common.ErrInvitationExpired
	}

	// Vérifier l'utilisateur
	u, err := s.userRepo.GetByID(ctx, userID)
	if err != nil || u == nil {
		return nil, common.ErrUserNotFound
	}

	// Vérifier si l'utilisateur est déjà membre
	existingMember, err := s.memberRepo.GetMember(ctx, inv.ProjectID, userID)
	if err == nil && existingMember != nil {
		_ = s.memberRepo.UpdateInvitationStatus(ctx, inv.ID, member.InviteAccepted)
		return existingMember, nil
	}

	newMember := &member.ProjectMember{
		ID:               uuid.New().String(),
		ProjectID:        inv.ProjectID,
		UserID:           userID,
		Role:             inv.Role,
		Permissions:      member.DefaultPermissionsForRole(inv.Role),
		InvitationStatus: "ACTIVE",
		CreatedAt:        time.Now().UTC(),
		UpdatedAt:        time.Now().UTC(),
	}

	if err := s.memberRepo.AddMember(ctx, newMember); err != nil {
		return nil, fmt.Errorf("rattachement membre au projet: %w", err)
	}

	_ = s.memberRepo.UpdateInvitationStatus(ctx, inv.ID, member.InviteAccepted)

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &userID,
		Action:       "member.invitation_accepted",
		ResourceType: "project",
		ResourceID:   inv.ProjectID,
		CreatedAt:    time.Now().UTC(),
	})

	return newMember, nil
}

// RemoveMember retire un collaborateur (interdit sur le OWNER)
func (s *MemberService) RemoveMember(ctx context.Context, actorID, projectID, targetUserID string) error {
	proj, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil || proj == nil {
		return common.ErrProjectNotFound
	}

	if targetUserID == proj.OwnerID {
		return common.ErrCannotRemoveOwner
	}

	if proj.OwnerID != actorID {
		m, err := s.memberRepo.GetMember(ctx, projectID, actorID)
		if err != nil || m == nil || !m.HasPermission(member.PermProjectManageMembers) {
			return common.ErrUnauthorizedProjectOp
		}
	}

	if err := s.memberRepo.RemoveMember(ctx, projectID, targetUserID); err != nil {
		return fmt.Errorf("suppression membre: %w", err)
	}

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &actorID,
		Action:       "member.removed",
		ResourceType: "project",
		ResourceID:   projectID,
		CreatedAt:    time.Now().UTC(),
	})

	return nil
}
