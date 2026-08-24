package storage

import (
	"context"
	"time"
)

// PresignedURLResponse contient l'URL pré-signée et les en-têtes requis pour le transfert direct client <-> R2
type PresignedURLResponse struct {
	UploadURL string            `json:"upload_url"`
	Key       string            `json:"key"`
	PublicURL *string           `json:"public_url,omitempty"`
	ExpiresAt time.Time         `json:"expires_at"`
	Headers   map[string]string `json:"headers,omitempty"`
}

// Service définit le contrat d'interaction avec le stockage objet Cloudflare R2
type Service interface {
	GeneratePresignedUploadURL(ctx context.Context, key, mimeType string, maxSizeBytes int64, ttl time.Duration) (*PresignedURLResponse, error)
	GeneratePresignedDownloadURL(ctx context.Context, key string, ttl time.Duration) (string, error)
	GetPublicURL(key string) string
	DeleteObject(ctx context.Context, key string) error
	ObjectExists(ctx context.Context, key string) (bool, error)
}
