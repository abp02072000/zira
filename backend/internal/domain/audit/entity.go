package audit

import (
	"context"
	"encoding/json"
	"time"
)

// AuditLog enregistre chaque action sensible pour la conformité et la traçabilité
type AuditLog struct {
	ID           string          `json:"id"`
	ActorID      *string         `json:"actor_id,omitempty"`
	ActorEmail   *string         `json:"actor_email,omitempty"`
	Action       string          `json:"action"`
	ResourceType string          `json:"resource_type"`
	ResourceID   string          `json:"resource_id"`
	Metadata     json.RawMessage `json:"metadata,omitempty"`
	IPAddress    *string         `json:"ip_address,omitempty"`
	UserAgent    *string         `json:"user_agent,omitempty"`
	CreatedAt    time.Time       `json:"created_at"`
}

// Repository définit l'interface de persistance du journal d'audit
type Repository interface {
	Log(ctx context.Context, entry *AuditLog) error
	ListByResource(ctx context.Context, resourceType, resourceID string, limit, offset int) ([]*AuditLog, int64, error)
	ListByActor(ctx context.Context, actorID string, limit, offset int) ([]*AuditLog, int64, error)
}
