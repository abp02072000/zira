package application

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"github.com/zira-invest/backend/internal/domain/audit"
)

// AuditService fournit les capacités d'enregistrement et de consultation du journal d'audit
type AuditService struct {
	auditRepo audit.Repository
}

// NewAuditService instancie le service d'audit
func NewAuditService(auditRepo audit.Repository) *AuditService {
	return &AuditService{auditRepo: auditRepo}
}

// Log enregistre une action d'audit
func (s *AuditService) Log(ctx context.Context, actorID, actorEmail *string, action, resourceType, resourceID string, meta interface{}, ip, userAgent *string) error {
	var rawMeta json.RawMessage
	if meta != nil {
		b, err := json.Marshal(meta)
		if err == nil {
			rawMeta = b
		}
	}

	entry := &audit.AuditLog{
		ID:           uuid.New().String(),
		ActorID:      actorID,
		ActorEmail:   actorEmail,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Metadata:     rawMeta,
		IPAddress:    ip,
		UserAgent:    userAgent,
		CreatedAt:    time.Now().UTC(),
	}

	return s.auditRepo.Log(ctx, entry)
}
