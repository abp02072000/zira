package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/application"
	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/infrastructure/auth"
	"github.com/zira-invest/backend/internal/interfaces/http/response"
)

const (
	CtxUserKey   = "current_user"
	CtxClaimsKey = "user_claims"
)

// AuthMiddleware valide le JWT Clerk et garantit la présence de l'utilisateur synchronisé
func AuthMiddleware(verifier *auth.ClerkVerifier, userServ *application.UserService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.Fail(c, common.ErrUnauthorized)
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return response.Fail(c, common.ErrInvalidToken)
		}

		tokenString := parts[1]
		claims, err := verifier.VerifyToken(c.Context(), tokenString)
		if err != nil {
			return response.Fail(c, common.ErrUnauthorized)
		}

		// Synchroniser ou récupérer l'utilisateur dans PostgreSQL
		u, err := userServ.SyncOrGetUser(c.Context(), claims.ClerkUserID, claims.Email, claims.Name, claims.Role)
		if err != nil {
			return response.Fail(c, err)
		}

		c.Locals(CtxClaimsKey, claims)
		c.Locals(CtxUserKey, u)

		return c.Next()
	}
}
