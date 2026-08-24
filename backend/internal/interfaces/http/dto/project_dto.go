package dto

type CreateProjectRequest struct {
	Name             string  `json:"name"`
	ShortDescription string  `json:"short_description"`
	FullDescription  *string `json:"full_description,omitempty"`
	Sector           string  `json:"sector"`
	Stage            string  `json:"stage"`
	TargetMarket     string  `json:"target_market"`
	Country          string  `json:"country"`
	City             string  `json:"city"`
	VideoURL         *string `json:"video_url,omitempty"`
	LogoR2Key        *string `json:"logo_r2_key,omitempty"`
	PosterR2Key      *string `json:"poster_r2_key,omitempty"`
	TargetAmountUSD  float64 `json:"target_amount_usd"`
	MinInvestmentUSD float64 `json:"min_investment_usd"`
	MaxInvestmentUSD float64 `json:"max_investment_usd"`
	EquityPercent    float64 `json:"equity_percent"`
}

type UpdateProjectRequest struct {
	CreateProjectRequest
}
