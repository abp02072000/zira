package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/application"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/user"
	"github.com/zira-invest/backend/internal/interfaces/http/dto"
	"github.com/zira-invest/backend/internal/interfaces/http/middleware"
	"github.com/zira-invest/backend/internal/interfaces/http/response"
)

type DocumentHandler struct {
	docServ *application.DocumentService
}

func NewDocumentHandler(docServ *application.DocumentService) *DocumentHandler {
	return &DocumentHandler{docServ: docServ}
}

// RequestUploadURL génère un lien pré-signé R2 pour un document ou image projet
func (h *DocumentHandler) RequestUploadURL(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	projectID := c.Params("id")
	var req dto.PresignedProjectUploadRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	presigned, err := h.docServ.RequestUploadURL(
		c.Context(),
		u.ID,
		projectID,
		req.FileName,
		req.MimeType,
		req.FileSize,
		req.IsImage,
	)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, presigned)
}

// RegisterDocument confirme et enregistre les métadonnées du document dans PostgreSQL
func (h *DocumentHandler) RegisterDocument(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	projectID := c.Params("id")
	var req dto.RegisterDocumentRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	doc, err := h.docServ.RegisterDocument(
		c.Context(),
		u.ID,
		projectID,
		req.Title,
		req.Category,
		req.FileName,
		req.MimeType,
		req.R2Key,
		req.FileSize,
		req.IsPublic,
	)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.Created(c, doc)
}

// ListDocuments liste les documents du projet
func (h *DocumentHandler) ListDocuments(c *fiber.Ctx) error {
	var currentUserID string
	if u, ok := c.Locals(middleware.CtxUserKey).(*user.User); ok && u != nil {
		currentUserID = u.ID
	}

	projectID := c.Params("id")
	docs, err := h.docServ.ListProjectDocuments(c.Context(), currentUserID, projectID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, docs)
}

// GetDocumentDownloadURL génère une URL de lecture sécurisée pour un document projet
func (h *DocumentHandler) GetDocumentDownloadURL(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	docID := c.Params("docId")
	downloadURL, err := h.docServ.GetDocumentDownloadURL(c.Context(), u.ID, docID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, fiber.Map{
		"download_url": downloadURL,
	})
}

// DeleteDocument supprime un document de projet
func (h *DocumentHandler) DeleteDocument(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	docID := c.Params("docId")
	if err := h.docServ.DeleteDocument(c.Context(), u.ID, docID); err != nil {
		return response.Fail(c, err)
	}

	return response.NoContent(c)
}
