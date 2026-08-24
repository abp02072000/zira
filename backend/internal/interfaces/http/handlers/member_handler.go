package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/application"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/member"
	"github.com/zira-invest/backend/internal/domain/user"
	"github.com/zira-invest/backend/internal/interfaces/http/dto"
	"github.com/zira-invest/backend/internal/interfaces/http/middleware"
	"github.com/zira-invest/backend/internal/interfaces/http/response"
)

type MemberHandler struct {
	memberServ *application.MemberService
}

func NewMemberHandler(memberServ *application.MemberService) *MemberHandler {
	return &MemberHandler{memberServ: memberServ}
}

// ListMembers liste les collaborateurs du projet
func (h *MemberHandler) ListMembers(c *fiber.Ctx) error {
	projectID := c.Params("id")
	members, err := h.memberServ.ListProjectMembers(c.Context(), projectID)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, members)
}

// InviteMember génère une invitation d'équipe
func (h *MemberHandler) InviteMember(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	projectID := c.Params("id")
	var req dto.InviteMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Fail(c, common.ErrInvalidRequestBody)
	}

	role := member.Role(req.Role)
	if role == "" {
		role = member.RoleMember
	}

	inv, err := h.memberServ.InviteMember(c.Context(), u.ID, projectID, req.Email, role)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.Created(c, inv)
}

// AcceptInvitation accepte une invitation de projet
func (h *MemberHandler) AcceptInvitation(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	token := c.Params("token")
	m, err := h.memberServ.AcceptInvitation(c.Context(), u.ID, token)
	if err != nil {
		return response.Fail(c, err)
	}

	return response.OK(c, m)
}

// RemoveMember retire un membre du projet
func (h *MemberHandler) RemoveMember(c *fiber.Ctx) error {
	u, ok := c.Locals(middleware.CtxUserKey).(*user.User)
	if !ok || u == nil {
		return response.Fail(c, common.ErrUnauthorized)
	}

	projectID := c.Params("id")
	targetUserID := c.Params("userId")

	if err := h.memberServ.RemoveMember(c.Context(), u.ID, projectID, targetUserID); err != nil {
		return response.Fail(c, err)
	}

	return response.NoContent(c)
}
