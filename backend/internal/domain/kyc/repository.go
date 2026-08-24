package kyc

import (
	"context"
)

// Repository définit les opérations de persistance pour le domaine KYC
type Repository interface {
	CreateVerification(ctx context.Context, k *KycVerification) error
	GetByUserID(ctx context.Context, userID string) (*KycVerification, error)
	GetByID(ctx context.Context, id string) (*KycVerification, error)
	UpdateVerification(ctx context.Context, k *KycVerification) error
	AddDocument(ctx context.Context, doc *KycDocument) error
	GetDocumentByID(ctx context.Context, docID string) (*KycDocument, error)
	DeleteDocument(ctx context.Context, docID string) error
	ListPendingVerifications(ctx context.Context, limit, offset int) ([]*KycVerification, int64, error)
}
