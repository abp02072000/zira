package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/application"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/kyc"
	"github.com/zira-invest/backend/internal/domain/user"
	"github.com/zira-invest/backend/internal/interfaces/http/dto"
	"github.com/zira-invest/backend/internal/interfaces/http/middleware"
	"github.com/zira-invest/backend/internal/interfaces/http/response"
)

type KycHandler struct {
	kycServ *application.KycService
}

func NewKycHandler(kycServ *application.KycService) *KycHandler {
	return &KycHandler{kycServ: kycServ}
}

// GetMyKycStatus retourne l'état actuel de conformité KYC
func (h *KycHandler) GetMyKycStatus(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	verification, err := h.kycServ.GetOrCreateVerification(c.Context(), u.ID, string(u.Role))
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, verification)
}

// RequestPresignedUploadURL génère un lien pré-signé direct pour téléverser sur Cloudflare R2
func (h *KycHandler) RequestPresignedUploadURL(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	var req dto.PresignedKycUploadRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	presigned, err := h.kycServ.RequestPresignedKycUpload(
		c.Context(),
		u.ID,
		kyc.DocumentType(req.DocType),
		req.FileName,
		req.MimeType,
		req.FileSize,
	)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, presigned)
}

// SubmitKyc soumet le dossier complet à l'équipe de conformité
func (h *KycHandler) SubmitKyc(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	submitted, err := h.kycServ.SubmitKyc(c.Context(), u.ID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, submitted)
}

// GetDocumentDownloadURL génère une URL de lecture temporaire pour une pièce KYC
func (h *KycHandler) GetDocumentDownloadURL(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	docID := c.Params("docId")
	isModerator := u.Role == user.RoleModerateur || u.Role == user.RoleAdmin

	downloadURL, err := h.kycServ.GetPrivateKycDocumentURL(c.Context(), u.ID, isModerator, docID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, fiber.Map{
		"download_url": downloadURL,
	})
}
