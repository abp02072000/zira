package document

import (
	"context"
)

// Repository définit le contrat d'accès aux données pour les documents et images de projet
type Repository interface {
	AddDocument(ctx context.Context, doc *ProjectDocument) error
	GetDocumentByID(ctx context.Context, id string) (*ProjectDocument, error)
	ListDocumentsByProject(ctx context.Context, projectID string, publicOnly bool) ([]*ProjectDocument, error)
	DeleteDocument(ctx context.Context, id string) error

	AddImage(ctx context.Context, img *ProjectImage) error
	GetImageByID(ctx context.Context, id string) (*ProjectImage, error)
	ListImagesByProject(ctx context.Context, projectID string) ([]*ProjectImage, error)
	DeleteImage(ctx context.Context, id string) error
}
