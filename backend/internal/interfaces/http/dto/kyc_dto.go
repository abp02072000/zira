package dto

type PresignedKycUploadRequest struct {
	DocType  string `json:"doc_type"`
	FileName string `json:"file_name"`
	MimeType string `json:"mime_type"`
	FileSize int64  `json:"file_size"`
}

type ModerateKycRequest struct {
	Status          string  `json:"status"` // APPROVED, REJECTED, RESUBMISSION
	RejectionReason *string `json:"rejection_reason,omitempty"`
}
