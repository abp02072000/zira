package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/application"
	"github.com/zira-invest/backend/internal/config"
	"github.com/zira-invest/backend/internal/infrastructure/auth"
	"github.com/zira-invest/backend/internal/interfaces/http/handlers"
	"github.com/zira-invest/backend/internal/interfaces/http/middleware"
)

// RouterConfig regroupe les dépendances nécessaires au routage HTTP
type RouterConfig struct {
	Config          *config.Config
	ClerkVerifier   *auth.ClerkVerifier
	UserService     *application.UserService
	KycService      *application.KycService
	ProjectService  *application.ProjectService
	MemberService   *application.MemberService
	DocumentService *application.DocumentService
	HealthHandler   *handlers.HealthHandler
}

// SetupRouter configure les middlewares globaux et toutes les routes RESTful de l'API
func SetupRouter(app *fiber.App, rc *RouterConfig) {
	// Middlewares globaux
	app.Use(middleware.RecoveryMiddleware())
	app.Use(middleware.LoggerMiddleware())
	app.Use(middleware.CorsMiddleware(rc.Config.Server.AllowedOrigins))

	// Routes de santé (non protégées)
	app.Get("/health", rc.HealthHandler.HealthCheck)
	app.Get("/ready", rc.HealthHandler.HealthCheck)
	app.Get("/live", rc.HealthHandler.HealthCheck)

	// Handlers
	userH := handlers.NewUserHandler(rc.UserService)
	kycH := handlers.NewKycHandler(rc.KycService)
	projH := handlers.NewProjectHandler(rc.ProjectService)
	memberH := handlers.NewMemberHandler(rc.MemberService)
	docH := handlers.NewDocumentHandler(rc.DocumentService)

	// Groupe API v1
	v1 := app.Group("/api/v1")

	// Routes Publiques (SEO & Découverte)
	public := v1.Group("/public")
	{
		public.Get("/users/:username", userH.GetPublicProfile)
		public.Get("/projects/:slug", projH.GetPublicProjectBySlug)
	}

	// Middleware d'authentification Clerk
	authMw := middleware.AuthMiddleware(rc.ClerkVerifier, rc.UserService)

	// Routes Utilisateur Authentifié (/me)
	me := v1.Group("/me", authMw)
	{
		me.Get("/", userH.GetMe)
		me.Patch("/profile", userH.UpdateMe)
		me.Post("/username", userH.ChangeUsername)

		// KYC utilisateur
		me.Get("/kyc", kycH.GetMyKycStatus)
		me.Post("/kyc/upload-url", kycH.RequestPresignedUploadURL)
		me.Post("/kyc/submit", kycH.SubmitKyc)
		me.Get("/kyc/documents/:docId/download-url", kycH.GetDocumentDownloadURL)

		// Projets du porteur
		me.Get("/projects", projH.GetMyProjects)
	}

	// Routes Gestion de Projets (/projects)
	projects := v1.Group("/projects", authMw)
	{
		projects.Post("/", projH.CreateProject)
		projects.Get("/:id", projH.GetProjectByID)
		projects.Patch("/:id", projH.UpdateProject)
		projects.Post("/:id/submit", projH.SubmitProject)

		// Équipe & Membres du projet
		projects.Get("/:id/members", memberH.ListMembers)
		projects.Post("/:id/invitations", memberH.InviteMember)
		projects.Delete("/:id/members/:userId", memberH.RemoveMember)

		// Documents & Médias du projet
		projects.Get("/:id/documents", docH.ListDocuments)
		projects.Post("/:id/documents/upload-url", docH.RequestUploadURL)
		projects.Post("/:id/documents", docH.RegisterDocument)
		projects.Get("/:id/documents/:docId/download-url", docH.GetDocumentDownloadURL)
		projects.Delete("/:id/documents/:docId", docH.DeleteDocument)
	}

	// Acceptation des invitations
	invitations := v1.Group("/invitations", authMw)
	{
		invitations.Post("/:token/accept", memberH.AcceptInvitation)
	}
}
