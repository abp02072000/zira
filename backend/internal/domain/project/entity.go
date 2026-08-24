package project

import (
	"regexp"
	"strings"
	"time"

	"github.com/zira-invest/backend/internal/domain/common"
)

var slugRegex = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

// Status représente l'état du cycle de vie du projet
type Status string

const (
	StatusDraft            Status = "DRAFT"
	StatusSubmitted        Status = "SUBMITTED"
	StatusUnderReview      Status = "UNDER_REVIEW"
	StatusChangesRequested Status = "CHANGES_REQUESTED"
	StatusApproved         Status = "APPROVED"
	StatusPublished        Status = "PUBLISHED"
	StatusFunding          Status = "FUNDING"
	StatusFunded           Status = "FUNDED"
	StatusCompleted        Status = "COMPLETED"
	StatusRejected         Status = "REJECTED"
	StatusSuspended        Status = "SUSPENDED"
	StatusArchived         Status = "ARCHIVED"
)

// FundingParams regroupe les paramètres financiers d'une levée de fonds
type FundingParams struct {
	TargetAmountUSD  float64 `json:"target_amount_usd"`
	MinInvestmentUSD float64 `json:"min_investment_usd"`
	MaxInvestmentUSD float64 `json:"max_investment_usd"`
	EquityPercent    float64 `json:"equity_percent"`
	RaisedAmountUSD  float64 `json:"raised_amount_usd"`
}

// Validate valide la cohérence des paramètres financiers
func (f *FundingParams) Validate() error {
	if f.TargetAmountUSD <= 0 {
		return common.ErrInvalidFundingParams
	}
	if f.MinInvestmentUSD <= 0 {
		f.MinInvestmentUSD = 50 // Seuil minimal par défaut ZIRA
	}
	if f.MaxInvestmentUSD <= 0 {
		f.MaxInvestmentUSD = f.TargetAmountUSD
	}
	if f.MinInvestmentUSD > f.MaxInvestmentUSD {
		return common.ErrInvalidFundingParams
	}
	if f.EquityPercent <= 0 || f.EquityPercent > 100 {
		return common.ErrInvalidFundingParams
	}
	return nil
}

// Project est l'entité centrale de levée de fonds
type Project struct {
	ID               string        `json:"id"`
	Slug             string        `json:"slug"`
	OwnerID          string        `json:"owner_id"`
	Name             string        `json:"name"`
	ShortDescription string        `json:"short_description"`
	FullDescription  *string       `json:"full_description,omitempty"`
	Sector           string        `json:"sector"`
	Stage            string        `json:"stage"`
	TargetMarket     string        `json:"target_market"`
	Country          string        `json:"country"`
	City             string        `json:"city"`
	VideoURL         *string       `json:"video_url,omitempty"`
	LogoR2Key        *string       `json:"logo_r2_key,omitempty"`
	PosterR2Key      *string       `json:"poster_r2_key,omitempty"`
	Funding          FundingParams `json:"funding"`
	Status           Status        `json:"status"`
	CreatedAt        time.Time     `json:"created_at"`
	UpdatedAt        time.Time     `json:"updated_at"`
	SubmittedAt      *time.Time    `json:"submitted_at,omitempty"`
	PublishedAt      *time.Time    `json:"published_at,omitempty"`
}

// PublicProject représente la vue publique optimisée pour le SEO et le partage
type PublicProject struct {
	Slug             string        `json:"slug"`
	Name             string        `json:"name"`
	ShortDescription string        `json:"short_description"`
	FullDescription  *string       `json:"full_description,omitempty"`
	Sector           string        `json:"sector"`
	Stage            string        `json:"stage"`
	TargetMarket     string        `json:"target_market"`
	Country          string        `json:"country"`
	City             string        `json:"city"`
	VideoURL         *string       `json:"video_url,omitempty"`
	LogoURL          *string       `json:"logo_url,omitempty"`
	PosterURL        *string       `json:"poster_url,omitempty"`
	Funding          FundingParams `json:"funding"`
	Status           Status        `json:"status"`
	PublishedAt      *time.Time    `json:"published_at,omitempty"`
}

// GenerateSlug normalise un titre en slug SEO valide
func GenerateSlug(name string) string {
	raw := strings.ToLower(strings.TrimSpace(name))
	// Replace non alphanumeric with hyphen
	reg := regexp.MustCompile(`[^a-z0-9]+`)
	slug := reg.ReplaceAllString(raw, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "projet"
	}
	return slug
}
