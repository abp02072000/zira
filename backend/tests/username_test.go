package tests

import (
	"testing"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/user"
)

func TestUsernameValidation(t *testing.T) {
	tests := []struct {
		name      string
		raw       string
		expected  string
		expectErr error
	}{
		{
			name:      "Valid simple username",
			raw:       "johndoe",
			expected:  "johndoe",
			expectErr: nil,
		},
		{
			name:      "Valid uppercase normalized to lowercase",
			raw:       "JohnDoe2026",
			expected:  "johndoe2026",
			expectErr: nil,
		},
		{
			name:      "Valid with hyphens and underscores",
			raw:       "john_doe-rdc",
			expected:  "john_doe-rdc",
			expectErr: nil,
		},
		{
			name:      "Too short username",
			raw:       "ab",
			expectErr: common.ErrInvalidUsername,
		},
		{
			name:      "Username with forbidden characters",
			raw:       "john@doe!",
			expectErr: common.ErrInvalidUsername,
		},
		{
			name:      "Reserved system username - admin",
			raw:       "admin",
			expectErr: common.ErrUsernameReserved,
		},
		{
			name:      "Reserved system username - kyc",
			raw:       "KYC",
			expectErr: common.ErrUsernameReserved,
		},
		{
			name:      "Reserved system username - api",
			raw:       "api",
			expectErr: common.ErrUsernameReserved,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			u, err := user.NewUsername(tt.raw)
			if tt.expectErr != nil {
				if err == nil {
					t.Errorf("attendu une erreur %v, obtenu nil", tt.expectErr)
				}
			} else {
				if err != nil {
					t.Errorf("erreur inattendue: %v", err)
				}
				if u.String() != tt.expected {
					t.Errorf("attendu '%s', obtenu '%s'", tt.expected, u.String())
				}
			}
		})
	}
}

func TestUsernamePublicURL(t *testing.T) {
	u, err := user.NewUsername("christian-rdc")
	if err != nil {
		t.Fatalf("erreur inattendue: %v", err)
	}

	expected := "https://zira-invest.cd/@christian-rdc"
	actual := u.PublicURL("https://zira-invest.cd/")
	if actual != expected {
		t.Errorf("attendu %s, obtenu %s", expected, actual)
	}
}
