package member

import (
	"context"
)

// Repository définit les opérations de persistance pour les membres et invitations de projet
type Repository interface {
	AddMember(ctx context.Context, m *ProjectMember) error
	GetMember(ctx context.Context, projectID, userID string) (*ProjectMember, error)
	ListProjectMembers(ctx context.Context, projectID string) ([]*ProjectMember, error)
	UpdateMember(ctx context.Context, m *ProjectMember) error
	RemoveMember(ctx context.Context, projectID, userID string) error

	CreateInvitation(ctx context.Context, inv *ProjectInvitation) error
	GetInvitationByToken(ctx context.Context, token string) (*ProjectInvitation, error)
	GetPendingInvitation(ctx context.Context, projectID, email string) (*ProjectInvitation, error)
	ListProjectInvitations(ctx context.Context, projectID string) ([]*ProjectInvitation, error)
	UpdateInvitationStatus(ctx context.Context, id string, status InvitationStatus) error
}
