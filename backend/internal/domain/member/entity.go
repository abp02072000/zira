package member

import (
	"time"
)

// Role définit le niveau de responsabilité au sein de l'équipe du projet
type Role string

const (
	RoleOwner     Role = "OWNER"
	RoleCofounder Role = "COFOUNDER"
	RoleManager   Role = "MANAGER"
	RoleMember    Role = "MEMBER"
)

// InvitationStatus représente l'état d'une invitation
type InvitationStatus string

const (
	InvitePending  InvitationStatus = "PENDING"
	InviteAccepted InvitationStatus = "ACCEPTED"
	InviteDeclined InvitationStatus = "DECLINED"
	InviteExpired  InvitationStatus = "EXPIRED"
	InviteRevoked  InvitationStatus = "REVOKED"
)

// ProjectMember représente l'association d'un utilisateur à un projet avec un rôle et des permissions
type ProjectMember struct {
	ID               string    `json:"id"`
	ProjectID        string    `json:"project_id"`
	UserID           string    `json:"user_id"`
	Role             Role      `json:"role"`
	Permissions      []string  `json:"permissions"`
	InvitationStatus string    `json:"invitation_status"` // "ACTIVE", "PENDING", "REVOKED"
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`

	// Champs joints pour affichage UI
	UserDisplayName string  `json:"user_display_name,omitempty"`
	UserEmail       string  `json:"user_email,omitempty"`
	UserAvatarURL   *string `json:"user_avatar_url,omitempty"`
	UserTitle       *string `json:"user_title,omitempty"`
}

// ProjectInvitation représente une invitation envoyée par email
type ProjectInvitation struct {
	ID           string           `json:"id"`
	ProjectID    string           `json:"project_id"`
	InviterID    string           `json:"inviter_id"`
	InviteeEmail string           `json:"invitee_email"`
	Role         Role             `json:"role"`
	Token        string           `json:"token"`
	Status       InvitationStatus `json:"status"`
	ExpiresAt    time.Time        `json:"expires_at"`
	CreatedAt    time.Time        `json:"created_at"`
}

// IsExpired vérifie si l'invitation a dépassé sa date limite
func (inv *ProjectInvitation) IsExpired() bool {
	return time.Now().UTC().After(inv.ExpiresAt)
}
