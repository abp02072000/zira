package common

import (
	"time"
)

// PaginationParams contient les paramètres de pagination standard
type PaginationParams struct {
	Page  int `json:"page" query:"page"`
	Limit int `json:"limit" query:"limit"`
}

// EnsureDefaults applique les valeurs de pagination par défaut
func (p *PaginationParams) EnsureDefaults() {
	if p.Page <= 0 {
		p.Page = 1
	}
	if p.Limit <= 0 || p.Limit > 100 {
		p.Limit = 20
	}
}

// Offset calcule le décalage pour SQL
func (p *PaginationParams) Offset() int {
	return (p.Page - 1) * p.Limit
}

// PaginatedResult contient les données et métadonnées paginées
type PaginatedResult[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	TotalPages int   `json:"total_pages"`
}

// NewPaginatedResult instancie un résultat paginé calculé
func NewPaginatedResult[T any](data []T, total int64, page, limit int) PaginatedResult[T] {
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	if totalPages == 0 {
		totalPages = 1
	}
	return PaginatedResult[T]{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}
}

// BaseEntity définit les champs temporels communs
type BaseEntity struct {
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
