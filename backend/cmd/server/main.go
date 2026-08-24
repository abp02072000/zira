package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/zira-invest/backend/internal/application"
	"github.com/zira-invest/backend/internal/config"
	"github.com/zira-invest/backend/internal/infrastructure/auth"
	"github.com/zira-invest/backend/internal/infrastructure/database"
	"github.com/zira-invest/backend/internal/infrastructure/repositories"
	"github.com/zira-invest/backend/internal/infrastructure/storage"
	interfacesHttp "github.com/zira-invest/backend/internal/interfaces/http"
	"github.com/zira-invest/backend/internal/interfaces/http/handlers"
)

func main() {
	log.Println("=== Initialisation du Backend Microservice ZIRA Invest (Porteur de Projet) ===")

	// 1. Charger la configuration
	cfg := config.LoadConfig()

	// 2. Initialiser la connexion PostgreSQL
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Printf("[ATTENTION] Connexion PostgreSQL non disponible au démarrage (%v). Mode fallback actif.", err)
	} else {
		defer db.Close()
		log.Println("[INFO] Connexion PostgreSQL établie avec succès.")
	}

	// 3. Initialiser le client Cloudflare R2
	r2Serv, err := storage.NewR2StorageService(cfg)
	if err != nil {
		log.Printf("[ATTENTION] Initialisation Cloudflare R2: %v", err)
	} else {
		log.Println("[INFO] Client Cloudflare R2 initialisé avec succès.")
	}

	// 4. Initialiser le vérificateur de tokens Clerk
	clerkVerifier := auth.NewClerkVerifier(cfg)

	// 5. Initialiser les Repositories
	var (
		sqlDB        = db.DB
		userRepo     = repositories.NewPostgresUserRepo(sqlDB)
		kycRepo      = repositories.NewPostgresKycRepo(sqlDB)
		projectRepo  = repositories.NewPostgresProjectRepo(sqlDB)
		memberRepo   = repositories.NewPostgresMemberRepo(sqlDB)
		documentRepo = repositories.NewPostgresDocumentRepo(sqlDB)
		auditRepo    = repositories.NewPostgresAuditRepo(sqlDB)
	)

	// 6. Initialiser les Services Applicatifs
	userServ := application.NewUserService(userRepo, auditRepo)
	kycServ := application.NewKycService(kycRepo, r2Serv, auditRepo)
	projectServ := application.NewProjectService(projectRepo, memberRepo, auditRepo, r2Serv)
	memberServ := application.NewMemberService(memberRepo, projectRepo, userRepo, auditRepo)
	docServ := application.NewDocumentService(documentRepo, projectRepo, memberRepo, auditRepo, r2Serv)
	healthH := handlers.NewHealthHandler(sqlDB)

	// 7. Initialiser l'application Fiber v2/v3
	app := fiber.New(fiber.Config{
		AppName:               "ZIRA Invest - Project Owner Service",
		ServerHeader:          "ZIRA-Fiber",
		StrictRouting:         false,
		CaseSensitive:         false,
		DisableStartupMessage: false,
		ReadTimeout:           15 * time.Second,
		WriteTimeout:          15 * time.Second,
		IdleTimeout:           60 * time.Second,
	})

	// 8. Monter les routes
	interfacesHttp.SetupRouter(app, &interfacesHttp.RouterConfig{
		Config:          cfg,
		ClerkVerifier:   clerkVerifier,
		UserService:     userServ,
		KycService:      kycServ,
		ProjectService:  projectServ,
		MemberService:   memberServ,
		DocumentService: docServ,
		HealthHandler:   healthH,
	})

	// 9. Démarrer le serveur HTTP en arrière-plan
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	go func() {
		log.Printf("[INFO] Serveur API en écoute sur %s", addr)
		if err := app.Listen(addr); err != nil {
			log.Printf("[INFO] Arrêt du serveur HTTP: %v", err)
		}
	}()

	// 10. Gestion du signal d'arrêt gracieux (Graceful Shutdown)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[INFO] Signal d'arrêt reçu, fermeture gracieuse des ressources...")
	shutdownCtxTimeout := 5 * time.Second
	if err := app.ShutdownWithTimeout(shutdownCtxTimeout); err != nil {
		log.Printf("[ERREUR] Erreur lors de l'arrêt gracieux: %v", err)
	}

	log.Println("[INFO] Backend ZIRA Invest arrêté avec succès.")
}
