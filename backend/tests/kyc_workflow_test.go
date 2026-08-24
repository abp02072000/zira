package tests

import (
	"testing"
	"time"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/kyc"
)

func TestKycStateMachine(t *testing.T) {
	k := &kyc.KycVerification{
		ID:        "kyc-1",
		UserID:    "user-1",
		Status:    kyc.StatusNotStarted,
		Documents: []kyc.KycDocument{},
	}

	// Ne peut pas soumettre sans documents
	err := k.Submit()
	if err != common.ErrKycDocsRequired {
		t.Errorf("attendu ErrKycDocsRequired, obtenu %v", err)
	}

	// Ajouter un document valide
	k.Documents = append(k.Documents, kyc.KycDocument{
		ID:         "doc-1",
		KycID:      k.ID,
		DocType:    kyc.DocNationalID,
		FileName:   "id_card.pdf",
		FileSize:   1024 * 1024,
		MimeType:   "application/pdf",
		R2Key:      "kyc/user-1/doc-1.pdf",
		UploadedAt: time.Now().UTC(),
	})

	// Doit réussir la soumission
	err = k.Submit()
	if err != nil {
		t.Fatalf("échec soumission avec documents: %v", err)
	}
	if k.Status != kyc.StatusSubmitted {
		t.Errorf("statut attendu SUBMITTED, obtenu %s", k.Status)
	}

	// Transition vers UnderReview ou Approved
	if !k.CanTransitionTo(kyc.StatusUnderReview) {
		t.Errorf("Submitted devrait pouvoir transiter vers UnderReview")
	}
	if !k.CanTransitionTo(kyc.StatusApproved) {
		t.Errorf("Submitted devrait pouvoir transiter vers Approved")
	}
}
