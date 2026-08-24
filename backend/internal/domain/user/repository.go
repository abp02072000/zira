package user

import (
	"context"
)

// Repository définit le contrat d'accès aux données pour les utilisateurs et l'identité
type Repository interface {
	Create(ctx context.Context, u *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByClerkID(ctx context.Context, clerkID string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByUsername(ctx context.Context, username string) (*User, error)
	Update(ctx context.Context, u *User) error
	RecordUsernameChange(ctx context.Context, history *UsernameHistory) error
	IsUsernameTaken(ctx context.Context, username string) (bool, error)
	IsEmailTaken(ctx context.Context, email string) (bool, error)
}
