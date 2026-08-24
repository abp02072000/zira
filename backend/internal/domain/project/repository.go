package project

import (
	"context"
)

// Repository définit le contrat d'accès aux données pour les projets
type Repository interface {
	Create(ctx context.Context, p *Project) error
	GetByID(ctx context.Context, id string) (*Project, error)
	GetBySlug(ctx context.Context, slug string) (*Project, error)
	GetByOwnerID(ctx context.Context, ownerID string, limit, offset int) ([]*Project, int64, error)
	Update(ctx context.Context, p *Project) error
	Delete(ctx context.Context, id string) error
	ListPublicProjects(ctx context.Context, sector string, limit, offset int) ([]*Project, int64, error)
	RecordStatusHistory(ctx context.Context, history *StatusHistory) error
	IsSlugTaken(ctx context.Context, slug string) (bool, error)
}
