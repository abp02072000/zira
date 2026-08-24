package document

import (
	"time"
)

// Category définit le type de document projet
type Category string

const (
	CategoryPitchDeck       Category = "pitch_deck"
	CategoryBusinessPlan    Category = "business_plan"
	CategoryFinancialModel  Category = "financial_model"
	CategoryRccmStatuts     Category = "rccm_statuts"
	CategoryAuditReport     Category = "audit_report"
	CategoryContract        Category = "contract"
	CategoryOther           Category = "other"
)

// ProjectDocument représente un document PDF / Excel / Docx rattaché à un projet
type ProjectDocument struct {
	ID         string    `json:"id"`
	ProjectID  string    `json:"project_id"`
	Title      string    `json:"title"`
	Category   Category  `json:"category"`
	FileName   string    `json:"file_name"`
	FileSize   int64     `json:"file_size"`
	MimeType   string    `json:"mime_type"`
	R2Key      string    `json:"r2_key"`
	IsPublic   bool      `json:"is_public"`
	UploadedBy string    `json:"uploaded_by"`
	CreatedAt  time.Time `json:"created_at"`
}

// ProjectImage représente une image illustrative pour la galerie du projet
type ProjectImage struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"project_id"`
	Caption   *string   `json:"caption,omitempty"`
	R2Key     string    `json:"r2_key"`
	SortOrder int       `json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
}
