package application

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/domain/audit"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/user"
)

// UserService orchestre les règles métier relatives aux utilisateurs, identités et profils
type UserService struct {
	userRepo  user.Repository
	auditRepo audit.Repository
}

// NewUserService instancie le service utilisateur
func NewUserService(userRepo user.Repository, auditRepo audit.Repository) *UserService {
	return &UserService{
		userRepo:  userRepo,
		auditRepo: auditRepo,
	}
}

// SyncOrGetUser synchronise l'utilisateur Clerk avec la base PostgreSQL locale
func (s *UserService) SyncOrGetUser(ctx context.Context, clerkID, email, defaultName, defaultRole string) (*user.User, error) {
	existing, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err == nil && existing != nil {
		return existing, nil
	}

	// Déterminer un nom d'utilisateur initial sécurisé et unique
	baseCandidate := "user"
	if email != "" {
		parts := strings.Split(email, "@")
		if len(parts) > 0 && len(parts[0]) >= 3 {
			baseCandidate = parts[0]
		}
	}
	rawCandidate := fmt.Sprintf("%s-%s", baseCandidate, uuid.New().String()[:4])
	validatedUsername, err := user.NewUsername(rawCandidate)
	if err != nil {
		validatedUsername, _ = user.NewUsername(fmt.Sprintf("user-%s", uuid.New().String()[:8]))
	}

	role := user.RolePorteur
	if defaultRole == string(user.RoleInvestisseur) {
		role = user.RoleInvestisseur
	} else if defaultRole == string(user.RoleModerateur) {
		role = user.RoleModerateur
	}

	displayName := defaultName
	if displayName == "" {
		displayName = validatedUsername.String()
	}

	newUser := &user.User{
		ID:          uuid.New().String(),
		ClerkUserID: clerkID,
		Username:    validatedUsername.String(),
		Email:       email,
		DisplayName: displayName,
		City:        "Kinshasa",
		Country:     "RDC",
		Role:        role,
		Status:      user.StatusActive,
		IsPublic:    true,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}

	if err := s.userRepo.Create(ctx, newUser); err != nil {
		return nil, fmt.Errorf("création utilisateur: %w", err)
	}

	// Audit log
	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &newUser.ID,
		ActorEmail:   &newUser.Email,
		Action:       "user.registered",
		ResourceType: "user",
		ResourceID:   newUser.ID,
		CreatedAt:    time.Now().UTC(),
	})

	return newUser, nil
}

// GetProfile retourne le profil complet de l'utilisateur connecté
func (s *UserService) GetProfile(ctx context.Context, userID string) (*user.User, error) {
	u, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, common.ErrUserNotFound
	}
	return u, nil
}

// UpdateProfile met à jour les informations du profil utilisateur
func (s *UserService) UpdateProfile(ctx context.Context, userID string, updates *user.User) (*user.User, error) {
	existing, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, common.ErrUserNotFound
	}

	if updates.DisplayName != "" {
		existing.DisplayName = updates.DisplayName
	}
	if updates.Title != nil {
		existing.Title = updates.Title
	}
	if updates.Bio != nil {
		existing.Bio = updates.Bio
	}
	if updates.AvatarURL != nil {
		existing.AvatarURL = updates.AvatarURL
	}
	if updates.Phone != nil {
		existing.Phone = updates.Phone
	}
	if updates.CompanyName != nil {
		existing.CompanyName = updates.CompanyName
	}
	if updates.City != "" {
		existing.City = updates.City
	}
	if updates.Country != "" {
		existing.Country = updates.Country
	}
	if updates.Website != nil {
		existing.Website = updates.Website
	}
	if updates.LinkedInURL != nil {
		existing.LinkedInURL = updates.LinkedInURL
	}
	if updates.TwitterURL != nil {
		existing.TwitterURL = updates.TwitterURL
	}
	existing.IsPublic = updates.IsPublic
	existing.UpdatedAt = time.Now().UTC()

	if err := s.userRepo.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("mise à jour profil: %w", err)
	}

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &userID,
		ActorEmail:   &existing.Email,
		Action:       "user.profile_updated",
		ResourceType: "user",
		ResourceID:   userID,
		CreatedAt:    time.Now().UTC(),
	})

	return existing, nil
}

// ChangeUsername modifie le nom d'utilisateur unique avec validation et archivage
func (s *UserService) ChangeUsername(ctx context.Context, userID, newUsernameRaw string) (*user.User, error) {
	validated, err := user.NewUsername(newUsernameRaw)
	if err != nil {
		return nil, err
	}

	existing, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, common.ErrUserNotFound
	}

	if strings.EqualFold(existing.Username, validated.String()) {
		return existing, nil // Rien à changer
	}

	taken, err := s.userRepo.IsUsernameTaken(ctx, validated.String())
	if err != nil {
		return nil, fmt.Errorf("vérification nom d'utilisateur: %w", err)
	}
	if taken {
		return nil, common.ErrUsernameTaken
	}

	oldUsername := existing.Username
	existing.Username = validated.String()
	existing.UpdatedAt = time.Now().UTC()

	if err := s.userRepo.Update(ctx, existing); err != nil {
		return nil, fmt.Errorf("mise à jour nom d'utilisateur: %w", err)
	}

	// Enregistrer l'historique pour redirection SEO et sécurité
	_ = s.userRepo.RecordUsernameChange(ctx, &user.UsernameHistory{
		ID:          uuid.New().String(),
		UserID:      userID,
		OldUsername: oldUsername,
		ChangedAt:   time.Now().UTC(),
	})

	_ = s.auditRepo.Log(ctx, &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      &userID,
		ActorEmail:   &existing.Email,
		Action:       "user.username_changed",
		ResourceType: "user",
		ResourceID:   userID,
		CreatedAt:    time.Now().UTC(),
	})

	return existing, nil
}

// GetPublicProfileByUsername résout un profil public pour les pages SEO /@username
func (s *UserService) GetPublicProfileByUsername(ctx context.Context, username string) (*user.PublicProfile, error) {
	u, err := s.userRepo.GetByUsername(ctx, strings.ToLower(strings.TrimSpace(username)))
	if err != nil || u == nil {
		return nil, common.ErrUserNotFound
	}
	if !u.IsPublic || u.Status == user.StatusSuspended {
		return nil, common.ErrUserNotFound
	}
	return u.ToPublicProfile(), nil
}
