package dto

type InviteMemberRequest struct {
	Email string `json:"email"`
	Role  string `json:"role"` // COFOUNDER, MANAGER, MEMBER
}

type AcceptInvitationRequest struct {
	Token string `json:"token"`
}
