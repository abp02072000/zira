package middleware

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

// LoggerMiddleware enregistre les requêtes HTTP avec durée et statut
func LoggerMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		latency := time.Since(start)

		log.Printf("[HTTP] %s | %3d | %12v | %-7s %s",
			time.Now().Format("2006/01/02 - 15:04:05"),
			c.Response().StatusCode(),
			latency,
			c.Method(),
			c.Path(),
		)

		return err
	}
}

// RecoveryMiddleware intercepte les paniques inattendues et renvoie une réponse JSON 500
func RecoveryMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[PANIC RECOVERED] %v", r)
				_ = c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"error": fiber.Map{
						"code":    "INTERNAL_SERVER_ERROR",
						"message": "Une erreur critique s'est produite",
					},
				})
			}
		}()
		return c.Next()
	}
}

// CorsMiddleware configure les en-têtes CORS pour les applications frontend ZIRA
func CorsMiddleware(allowedOrigins string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		origin := c.Get("Origin")
		if origin != "" {
			c.Set("Access-Control-Allow-Origin", origin)
		} else if allowedOrigins != "" {
			c.Set("Access-Control-Allow-Origin", allowedOrigins)
		} else {
			c.Set("Access-Control-Allow-Origin", "*")
		}

		c.Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Set("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization,X-Requested-With")
		c.Set("Access-Control-Allow-Credentials", "true")

		if c.Method() == fiber.MethodOptions {
			return c.SendStatus(fiber.StatusNoContent)
		}

		return c.Next()
	}
}
