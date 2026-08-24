package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/application"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/project"
	"github.com/zira-invest/backend/internal/domain/user"
	"github.com/zira-invest/backend/internal/interfaces/http/dto"
	"github.com/zira-invest/backend/internal/interfaces/http/middleware"
	"github.com/zira-invest/backend/internal/interfaces/http/response"
)

type ProjectHandler struct {
	projectServ *application.ProjectService
}

func NewProjectHandler(projectServ *application.ProjectService) *ProjectHandler {
	return &ProjectHandler{projectServ: projectServ}
}

// CreateProject initialise un nouveau projet de levée de fonds
func (h *ProjectHandler) CreateProject(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	var req dto.CreateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	payload := application.CreateProjectPayload{
		Name:             req.Name,
		ShortDescription: req.ShortDescription,
		FullDescription:  req.FullDescription,
		Sector:           req.Sector,
		Stage:            req.Stage,
		TargetMarket:     req.TargetMarket,
		Country:          req.Country,
		City:             req.City,
		VideoURL:         req.VideoURL,
		LogoR2Key:        req.LogoR2Key,
		PosterR2Key:      req.PosterR2Key,
		Funding: project.FundingParams{
			TargetAmountUSD:  req.TargetAmountUSD,
			MinInvestmentUSD: req.MinInvestmentUSD,
			MaxInvestmentUSD: req.MaxInvestmentUSD,
			EquityPercent:    req.EquityPercent,
		},
	}

	newProj, err := h.projectServ.CreateProject(c.Context(), u.ID, payload)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.Created(c, newProj)
}

// UpdateProject met à jour les informations du projet
func (h *ProjectHandler) UpdateProject(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	projectID := c.Params("id")
	var req dto.UpdateProjectRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	payload := application.CreateProjectPayload{
		Name:             req.Name,
		ShortDescription: req.ShortDescription,
		FullDescription:  req.FullDescription,
		Sector:           req.Sector,
		Stage:            req.Stage,
		TargetMarket:     req.TargetMarket,
		Country:          req.Country,
		City:             req.City,
		VideoURL:         req.VideoURL,
		LogoR2Key:        req.LogoR2Key,
		PosterR2Key:      req.PosterR2Key,
		Funding: project.FundingParams{
			TargetAmountUSD:  req.TargetAmountUSD,
			MinInvestmentUSD: req.MinInvestmentUSD,
			MaxInvestmentUSD: req.MaxInvestmentUSD,
			EquityPercent:    req.EquityPercent,
		},
	}

	updated, err := h.projectServ.UpdateProject(c.Context(), u.ID, projectID, payload)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, updated)
}

// GetMyProjects liste les projets du porteur connecté
func (h *ProjectHandler) GetMyProjects(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	result, err := h.projectServ.GetProjectsByOwner(c.Context(), u.ID, page, limit)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, result)
}

// GetProjectByID retourne les détails d'un projet pour son propriétaire ou un membre
func (h *ProjectHandler) GetProjectByID(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	projectID := c.Params("id")
	proj, err := h.projectServ.GetProjectByID(c.Context(), u.ID, projectID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, proj)
}

// SubmitProject soumet le projet pour validation par l'équipe de modération
func (h *ProjectHandler) SubmitProject(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	projectID := c.Params("id")
	submitted, err := h.projectServ.SubmitProject(c.Context(), u.ID, projectID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, submitted)
}

// GetPublicProjectBySlug retourne les informations publiques pour les moteurs de recherche et investisseurs
func (h *ProjectHandler) GetPublicProjectBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	publicProj, err := h.projectServ.GetPublicProjectBySlug(c.Context(), slug)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, publicProj)
}
