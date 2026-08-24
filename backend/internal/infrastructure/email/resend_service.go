package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/zira-invest/backend/internal/config"
)

type EmailService interface {
	SendKYCStatusEmail(ctx context.Context, toEmail, userName, status, reason string) error
	SendInvestmentConfirmationEmail(ctx context.Context, toEmail, userName, projectName string, amountUSD float64, equity float64) error
	SendProjectStatusEmail(ctx context.Context, toEmail, userName, projectName, status string) error
}

type ResendEmailService struct {
	apiKey     string
	fromEmail  string
	httpClient *http.Client
}

func NewResendEmailService(cfg *config.Config) *ResendEmailService {
	return &ResendEmailService{
		apiKey:    cfg.Resend.APIKey,
		fromEmail: cfg.Resend.FromEmail,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

type resendSendRequest struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

func (s *ResendEmailService) sendEmail(ctx context.Context, toEmail, subject, html string) error {
	if s.apiKey == "" {
		// Mock log in development mode when API key is not configured
		fmt.Printf("[RESEND MOCK EMAIL] To: %s | Subject: %s\n", toEmail, subject)
		return nil
	}

	reqBody := resendSendRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: subject,
		HTML:    html,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("marshal resend request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("create resend request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("execute resend HTTP call: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("resend API returned HTTP error: %d", resp.StatusCode)
	}

	return nil
}

func (s *ResendEmailService) SendKYCStatusEmail(ctx context.Context, toEmail, userName, status, reason string) error {
	subject := "Mise à jour de votre dossier KYC - ZIRA Invest"
	var html string
	if status == "approved" {
		html = fmt.Sprintf(`
			<div style="font-family: sans-serif; padding: 20px;">
				<h2>Bonjour %s,</h2>
				<p style="color: #16a34a; font-bold;">Votre dossier de vérification d'identité KYC a été approuvé avec succès !</p>
				<p>Votre compte est désormais certifié et vous pouvez réaliser vos opérations financières en toute sécurité sur ZIRA Invest.</p>
				<p><a href="https://zira-invest.cd" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; borderRadius: 8px;">Accéder à mon espace</a></p>
			</div>
		`, userName)
	} else {
		html = fmt.Sprintf(`
			<div style="font-family: sans-serif; padding: 20px;">
				<h2>Bonjour %s,</h2>
				<p style="color: #dc2626; font-bold;">Votre dossier KYC n'a pas pu être validé.</p>
				<p><strong>Motif :</strong> %s</p>
				<p>Veuillez vous connecter à votre compte pour soumettre un document lisible et valide.</p>
			</div>
		`, userName, reason)
	}
	return s.sendEmail(ctx, toEmail, subject, html)
}

func (s *ResendEmailService) SendInvestmentConfirmationEmail(ctx context.Context, toEmail, userName, projectName string, amountUSD float64, equity float64) error {
	subject := fmt.Sprintf("Confirmation d'investissement - %s", projectName)
	html := fmt.Sprintf(`
		<div style="font-family: sans-serif; padding: 20px;">
			<h2>Félicitations %s,</h2>
			<p>Votre investissement de <strong>%.2f $ USD</strong> dans le projet <strong>%s</strong> (soit %.2f%% d'equity) a été enregistré sous séquestre bancaire.</p>
			<p>Vous pouvez suivre l'avancement de la levée et télécharger vos certificats d'actions sur votre tableau de bord.</p>
		</div>
	`, userName, amountUSD, projectName, equity)
	return s.sendEmail(ctx, toEmail, subject, html)
}

func (s *ResendEmailService) SendProjectStatusEmail(ctx context.Context, toEmail, userName, projectName, status string) error {
	subject := fmt.Sprintf("Statut de votre projet %s - ZIRA Invest", projectName)
	html := fmt.Sprintf(`
		<div style="font-family: sans-serif; padding: 20px;">
			<h2>Bonjour %s,</h2>
			<p>Le statut de votre campagne <strong>%s</strong> a été mis à jour vers : <strong>%s</strong>.</p>
		</div>
	`, userName, projectName, status)
	return s.sendEmail(ctx, toEmail, subject, html)
}
