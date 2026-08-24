package tests

import (
	"testing"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/project"
)

func TestProjectStateMachine(t *testing.T) {
	p := &project.Project{
		ID:     "proj-1",
		Status: project.StatusDraft,
	}

	// Draft can transition to Submitted
	if !p.CanTransitionTo(project.StatusSubmitted) {
		t.Errorf("Draft devrait pouvoir transiter vers Submitted")
	}

	// Draft cannot transition directly to Published
	if p.CanTransitionTo(project.StatusPublished) {
		t.Errorf("Draft ne devrait PAS pouvoir transiter directement vers Published sans revue")
	}

	// Execute Submit
	err := p.Submit()
	if err != nil {
		t.Fatalf("Submit a échoué: %v", err)
	}
	if p.Status != project.StatusSubmitted {
		t.Errorf("Statut attendu SUBMITTED, obtenu %s", p.Status)
	}

	// Submitted can transition to UnderReview or Approved
	if !p.CanTransitionTo(project.StatusUnderReview) {
		t.Errorf("Submitted devrait pouvoir transiter vers UnderReview")
	}
	if !p.CanTransitionTo(project.StatusApproved) {
		t.Errorf("Submitted devrait pouvoir transiter vers Approved")
	}

	// Approved can transition to Published
	p.Status = project.StatusApproved
	if !p.CanTransitionTo(project.StatusPublished) {
		t.Errorf("Approved devrait pouvoir transiter vers Published")
	}
}

func TestFundingValidation(t *testing.T) {
	validFunding := project.FundingParams{
		TargetAmountUSD:  50000,
		MinInvestmentUSD: 100,
		MaxInvestmentUSD: 10000,
		EquityPercent:    10,
	}
	if err := validFunding.Validate(); err != nil {
		t.Errorf("funding valide a été rejeté: %v", err)
	}

	invalidTarget := project.FundingParams{
		TargetAmountUSD: 0,
		EquityPercent:   10,
	}
	if err := invalidTarget.Validate(); err != common.ErrInvalidFundingParams {
		t.Errorf("funding avec target 0 aurait dû être rejeté")
	}

	invalidEquity := project.FundingParams{
		TargetAmountUSD: 10000,
		EquityPercent:   120, // > 100%
	}
	if err := invalidEquity.Validate(); err != common.ErrInvalidFundingParams {
		t.Errorf("funding avec equity > 100%% aurait dû être rejeté")
	}
}

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"AgriTech Congo SARL", "agritech-congo-sarl"},
		{"Kivu Solar Energy - 2026", "kivu-solar-energy-2026"},
		{"   Projet Spécial @ Kinshasa!   ", "projet-sp-cial-kinshasa"},
	}

	for _, tt := range tests {
		res := project.GenerateSlug(tt.input)
		if res != tt.expected {
			t.Errorf("input '%s': attendu '%s', obtenu '%s'", tt.input, tt.expected, res)
		}
	}
}
