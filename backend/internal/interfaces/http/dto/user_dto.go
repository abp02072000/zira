package dto

type UpdateProfileRequest struct {
	DisplayName string  `json:"display_name"`
	Title       *string `json:"title"`
	Bio         *string `json:"bio"`
	AvatarURL   *string `json:"avatar_url"`
	Phone       *string `json:"phone"`
	CompanyName *string `json:"company_name"`
	City        string  `json:"city"`
	Country     string  `json:"country"`
	Website     *string `json:"website"`
	LinkedInURL *string `json:"linkedin_url"`
	TwitterURL  *string `json:"twitter_url"`
	IsPublic    bool    `json:"is_public"`
}

type ChangeUsernameRequest struct {
	Username string `json:"username"`
}

type CheckUsernameRequest struct {
	Username string `json:"username"`
}

type CheckUsernameResponse struct {
	Available bool   `json:"available"`
	Username  string `json:"username"`
}
