package response

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/domain/common"
)

// Response structure uniforme pour toutes les réponses JSON de l'API
type Response[T any] struct {
	Success bool   `json:"success"`
	Data    T      `json:"data,omitempty"`
	Error   *Error `json:"error,omitempty"`
}

// Error détails standardisés d'une erreur
type Error struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// OK renvoie une réponse 200 OK avec données
func OK[T any](c *fiber.Ctx, data T) error {
	return c.Status(fiber.StatusOK).JSON(Response[T]{
		Success: true,
		Data:    data,
	})
}

// Created renvoie une réponse 201 Created avec données
func Created[T any](c *fiber.Ctx, data T) error {
	return c.Status(fiber.StatusCreated).JSON(Response[T]{
		Success: true,
		Data:    data,
	})
}

// NoContent renvoie 204 No Content
func NoContent(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNoContent)
}

// Fail transforme une erreur de domaine en réponse HTTP appropriée
func Fail(c *fiber.Ctx, err error) error {
	var domErr *common.DomainError
	if errors.As(err, &domErr) {
		return c.Status(domErr.HTTPStatus).JSON(Response[any]{
			Success: false,
			Error: &Error{
				Code:    domErr.Code,
				Message: domErr.Message,
			},
		})
	}

	// Erreur inconnue / 500 interne
	return c.Status(fiber.StatusInternalServerError).JSON(Response[any]{
		Success: false,
		Error: &Error{
			Code:    "INTERNAL_SERVER_ERROR",
			Message: "Une erreur interne est survenue sur le serveur",
		},
	})
}
