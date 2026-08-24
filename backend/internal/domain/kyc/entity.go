package kyc

import (
	"time"

	"github.com/zira-invest/backend/internal/domain/common"
)

// Status représente l'état du dossier KYC
type Status string

const (
	StatusNotStarted    Status = "NOT_STARTED"
	StatusInProgress    Status = "IN_PROGRESS"
	StatusSubmitted     Status = "SUBMITTED"
	StatusUnderReview   Status = "UNDER_REVIEW"
	StatusApproved      Status = "APPROVED"
	StatusRejected      Status = "REJECTED"
	StatusResubmission  Status = "RESUBMISSION"
)

// DocumentType représente la nature de la pièce justificative
type DocumentType string

const (
	DocNationalID       DocumentType = "national_id"
	DocPassport         DocumentType = "passport"
	DocRccmCertificate  DocumentType = "rccm_certificate"
	DocBankStatement    DocumentType = "bank_statement"
	DocTaxID            DocumentType = "tax_id"
	DocPowerOfAttorney  DocumentType = "power_of_attorney"
)

// KycDocument représente un document chiffré/isolé stocké sur Cloudflare R2
type KycDocument struct {
	ID         string       `json:"id"`
	KycID      string       `json:"kyc_id"`
	DocType    DocumentType `json:"doc_type"`
	FileName   string       `json:"file_name"`
	FileSize   int64        `json:"file_size"`
	MimeType   string       `json:"mime_type"`
	R2Key      string       `json:"r2_key"` // Ne jamais exposer en URL publique
	UploadedAt time.Time    `json:"uploaded_at"`
}

// KycVerification est l'entité centrale de conformité pour un utilisateur (porteur ou investisseur)
type KycVerification struct {
	ID              string        `json:"id"`
	UserID          string        `json:"user_id"`
	Type            string        `json:"type"` // "porteur", "investisseur", "institutionnel"
	Status          Status        `json:"status"`
	ReviewerID      *string       `json:"reviewer_id,omitempty"`
	RejectionReason *string       `json:"rejection_reason,omitempty"`
	SubmittedAt     *time.Time    `json:"submitted_at,omitempty"`
	ReviewedAt      *time.Time    `json:"reviewed_at,omitempty"`
	Documents       []KycDocument `json:"documents"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

// CanTransitionTo valide les transitions légales de la machine à états KYC
func (k *KycVerification) CanTransitionTo(target Status) bool {
	switch k.Status {
	case StatusNotStarted:
		return target == StatusInProgress || target == StatusSubmitted
	case StatusInProgress:
		return target == StatusSubmitted
	case StatusSubmitted:
		return target == StatusUnderReview || target == StatusApproved || target == StatusRejected
	case StatusUnderReview:
		return target == StatusApproved || target == StatusRejected || target == StatusResubmission
	case StatusRejected, StatusResubmission:
		return target == StatusInProgress || target == StatusSubmitted
	case StatusApproved:
		// Un dossier approuvé ne peut pas être rétrogradé sans procédure administrative spéciale
		return false
	default:
		return false
	}
}

// Submit effectue la soumission du dossier KYC
func (k *KycVerification) Submit() error {
	if len(k.Documents) == 0 {
		return common.ErrKycDocsRequired
	}
	if !k.CanTransitionTo(StatusSubmitted) {
		return common.ErrInvalidKycState
	}
	now := time.Now().UTC()
	k.Status = StatusSubmitted
	k.SubmittedAt = &now
	k.UpdatedAt = now
	return nil
}
