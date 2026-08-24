package user

import (
	"regexp"
	"strings"

	"github.com/zira-invest/backend/internal/domain/common"
)

var (
	// Regex: 3 à 30 caractères alphanumériques, tirets et underscores
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]{3,30}$`)

	// Noms d'utilisateur réservés pour les routes système, SEO et sécurité
	reservedUsernames = map[string]bool{
		"admin":        true,
		"administrator": true,
		"root":         true,
		"api":          true,
		"v1":           true,
		"v2":           true,
		"auth":         true,
		"login":        true,
		"register":     true,
		"signup":       true,
		"logout":       true,
		"signin":       true,
		"signout":      true,
		"dashboard":    true,
		"moderateur":   true,
		"moderation":   true,
		"investisseur": true,
		"investor":     true,
		"porteur":      true,
		"founder":      true,
		"project":      true,
		"projects":     true,
		"projet":       true,
		"projets":      true,
		"kyc":          true,
		"profile":      true,
		"profil":       true,
		"settings":     true,
		"paramètres":   true,
		"support":      true,
		"help":         true,
		"faq":          true,
		"blog":         true,
		"about":        true,
		"contact":      true,
		"terms":        true,
		"privacy":      true,
		"legal":        true,
		"webhook":      true,
		"webhooks":     true,
		"health":       true,
		"ready":        true,
		"live":         true,
		"zira":         true,
		"zirainvest":   true,
		"null":         true,
		"undefined":    true,
	}
)

// Username est un Value Object représentant un nom d'utilisateur normalisé et garanti valide
type Username struct {
	value string
}

// NewUsername valide, normalise et construit un Username
func NewUsername(raw string) (Username, error) {
	trimmed := strings.TrimSpace(raw)
	if !usernameRegex.MatchString(trimmed) {
		return Username{}, common.ErrInvalidUsername
	}

	normalized := strings.ToLower(trimmed)

	if reservedUsernames[normalized] {
		return Username{}, common.ErrUsernameReserved
	}

	return Username{value: normalized}, nil
}

// String retourne la valeur brute normalisée du nom d'utilisateur
func (u Username) String() string {
	return u.value
}

// PublicURL retourne l'URL canonique publique pour le partage et le SEO
func (u Username) PublicURL(baseURL string) string {
	cleanBase := strings.TrimRight(baseURL, "/")
	return cleanBase + "/@" + u.value
}
