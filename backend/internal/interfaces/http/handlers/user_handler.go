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

type UserHandler struct {
	userServ *application.UserService
}

func NewUserHandler(userServ *application.UserService) *UserHandler {
	return &UserHandler{userServ: userServ}
}

// GetMe retourne le profil privé de l'utilisateur authentifié
func (h *UserHandler) GetMe(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	fresh, err := h.userServ.GetProfile(c.Context(), u.ID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, fresh)
}

// UpdateMe met à jour le profil de l'utilisateur authentifié
func (h *UserHandler) UpdateMe(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	var req dto.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	updates := &user.User{
		DisplayName: req.DisplayName,
		Title:       req.Title,
		Bio:         req.Bio,
		AvatarURL:   req.AvatarURL,
		Phone:       req.Phone,
		CompanyName: req.CompanyName,
		City:        req.City,
		Country:     req.Country,
		Website:     req.Website,
		LinkedInURL: req.LinkedInURL,
		TwitterURL:  req.TwitterURL,
		IsPublic:    req.IsPublic,
	}

	updated, err := h.userServ.UpdateProfile(c.Context(), u.ID, updates)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, updated)
}

// ChangeUsername modifie le nom d'utilisateur avec vérification des réservations et unicité
func (h *UserHandler) ChangeUsername(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	var req dto.ChangeUsernameRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	updated, err := h.userServ.ChangeUsername(c.Context(), u.ID, req.Username)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, updated)
}

// GetPublicProfile retourne la vue publique et SEO pour /@username
func (h *UserHandler) GetPublicProfile(c *fiber.Ctx) error {
	username := c.Params("username")
	if username == "" {
		return response.Fail(c, common.ErrUserNotFound)
	}

	profile, err := h.userServ.GetPublicProfileByUsername(c.Context(), username)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, profile)
}
