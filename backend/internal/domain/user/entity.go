package user

import (
	"time"
)

// Role définit le rôle utilisateur au sein de la plateforme
type Role string

const (
	RolePorteur      Role = "porteur"
	RoleInvestisseur Role = "investisseur"
	RoleModerateur   Role = "moderateur"
	RoleAdmin        Role = "admin"
)

// Status définit le statut d'activation du compte
type Status string

const (
	StatusActive     Status = "active"
	StatusPendingKYC Status = "pending_kyc"
	StatusSuspended  Status = "suspended"
)

// User est l'entité racine du domaine Utilisateur & Identité
type User struct {
	ID           string    `json:"id"`
	ClerkUserID  string    `json:"clerk_user_id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	DisplayName  string    `json:"display_name"`
	Title        *string   `json:"title,omitempty"`
	Bio          *string   `json:"bio,omitempty"`
	AvatarURL    *string   `json:"avatar_url,omitempty"`
	Phone        *string   `json:"phone,omitempty"`
	CompanyName  *string   `json:"company_name,omitempty"`
	City         string    `json:"city"`
	Country      string    `json:"country"`
	Role         Role      `json:"role"`
	Status       Status    `json:"status"`
	Website      *string   `json:"website,omitempty"`
	LinkedInURL  *string   `json:"linkedin_url,omitempty"`
	TwitterURL   *string   `json:"twitter_url,omitempty"`
	IsPublic     bool      `json:"is_public"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// PublicProfile représente la vue publique et optimisée SEO d'un utilisateur
type PublicProfile struct {
	Username    string    `json:"username"`
	DisplayName string    `json:"display_name"`
	Title       *string   `json:"title,omitempty"`
	Bio         *string   `json:"bio,omitempty"`
	AvatarURL   *string   `json:"avatar_url,omitempty"`
	CompanyName *string   `json:"company_name,omitempty"`
	City        string    `json:"city"`
	Country     string    `json:"country"`
	Role        Role      `json:"role"`
	Website     *string   `json:"website,omitempty"`
	LinkedInURL *string   `json:"linkedin_url,omitempty"`
	TwitterURL  *string   `json:"twitter_url,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// ToPublicProfile extrait uniquement les informations autorisées pour l'indexation publique et SEO
func (u *User) ToPublicProfile() *PublicProfile {
	return &PublicProfile{
		Username:    u.Username,
		DisplayName: u.DisplayName,
		Title:       u.Title,
		Bio:         u.Bio,
		AvatarURL:   u.AvatarURL,
		CompanyName: u.CompanyName,
		City:        u.City,
		Country:     u.Country,
		Role:        u.Role,
		Website:     u.Website,
		LinkedInURL: u.LinkedInURL,
		TwitterURL:  u.TwitterURL,
		CreatedAt:   u.CreatedAt,
	}
}

// UsernameHistory trace les modifications de noms d'utilisateur pour la sécurité
type UsernameHistory struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	OldUsername string    `json:"old_username"`
	ChangedAt   time.Time `json:"changed_at"`
}
