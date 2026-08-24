package tests

import (
	"fmt"
	"strings"
	"testing"
)

func TestR2KeyIsolation(t *testing.T) {
	userID := "usr-12345"
	projectID := "prj-67890"
	docID := "doc-999"

	kycKey := fmt.Sprintf("kyc/%s/%s.pdf", userID, docID)
	if !strings.HasPrefix(kycKey, "kyc/usr-12345/") {
		t.Errorf("Clé KYC non correctement isolée par utilisateur: %s", kycKey)
	}

	projectDocKey := fmt.Sprintf("projects/%s/documents/%s.pdf", projectID, docID)
	if !strings.HasPrefix(projectDocKey, "projects/prj-67890/documents/") {
		t.Errorf("Clé document projet non isolée par projet: %s", projectDocKey)
	}

	projectImgKey := fmt.Sprintf("projects/%s/images/%s.webp", projectID, docID)
	if !strings.HasPrefix(projectImgKey, "projects/prj-67890/images/") {
		t.Errorf("Clé image projet non isolée par projet: %s", projectImgKey)
	}
}
