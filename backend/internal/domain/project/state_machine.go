package project

import (
	"time"

	"github.com/zira-invest/backend/internal/domain/common"
)

// CanTransitionTo valide les transitions autorisées du cycle de vie du projet
func (p *Project) CanTransitionTo(target Status) bool {
	switch p.Status {
	case StatusDraft:
		return target == StatusSubmitted || target == StatusArchived
	case StatusSubmitted:
		return target == StatusUnderReview || target == StatusApproved || target == StatusChangesRequested || target == StatusRejected
	case StatusUnderReview:
		return target == StatusApproved || target == StatusChangesRequested || target == StatusRejected
	case StatusChangesRequested:
		return target == StatusDraft || target == StatusSubmitted || target == StatusArchived
	case StatusApproved:
		return target == StatusPublished || target == StatusFunding || target == StatusSuspended
	case StatusPublished:
		return target == StatusFunding || target == StatusFunded || target == StatusSuspended || target == StatusArchived
	case StatusFunding:
		return target == StatusFunded || target == StatusSuspended || target == StatusCompleted
	case StatusFunded:
		return target == StatusCompleted || target == StatusSuspended
	case StatusSuspended:
		return target == StatusPublished || target == StatusFunding || target == StatusArchived
	case StatusRejected, StatusArchived, StatusCompleted:
		return false
	default:
		return false
	}
}

// Submit soumet le projet pour validation par l'équipe de modération
func (p *Project) Submit() error {
	if !p.CanTransitionTo(StatusSubmitted) {
		return common.ErrInvalidProjectState
	}
	now := time.Now().UTC()
	p.Status = StatusSubmitted
	p.SubmittedAt = &now
	p.UpdatedAt = now
	return nil
}

// Archive passe le projet en archive
func (p *Project) Archive() error {
	if !p.CanTransitionTo(StatusArchived) {
		return common.ErrInvalidProjectState
	}
	p.Status = StatusArchived
	p.UpdatedAt = time.Now().UTC()
	return nil
}

// StatusHistory trace les transitions d'état du projet pour l'auditabilité
type StatusHistory struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	FromState Status    `json:"from_status"`
	ToState   Status    `json:"to_status"`
	ChangedBy *string   `json:"changed_by,omitempty"`
	Reason    *string   `json:"reason,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
