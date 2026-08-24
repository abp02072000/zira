package handlers

import (
	"database/sql"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/interfaces/http/response"
)

type HealthHandler struct {
	db *sql.DB
}

func NewHealthHandler(db *sql.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

// HealthCheck retourne l'état de fonctionnement général du microservice
func (h *HealthHandler) HealthCheck(c *fiber.Ctx) error {
	dbStatus := "up"
	if h.db != nil {
		if err := h.db.PingContext(c.Context()); err != nil {
			dbStatus = "down"
		}
	}

	return response.OK(c, fiber.Map{
		"status":    "healthy",
		"service":   "zira-backend-porteur",
		"timestamp": time.Now().UTC(),
		"database":  dbStatus,
	})
}
