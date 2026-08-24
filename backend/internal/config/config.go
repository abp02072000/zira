package config

import (
	"os"
	"strconv"
)

// Config regroupe toutes les variables d'environnement de l'application
type Config struct {
	// Server
	Port         string
	AppEnv       string
	AppName      string
	AppURL       string
	PublicAppURL string

	// Clerk Authentication & Identity
	ClerkSecretKey     string
	ClerkPublishableKey string
	ClerkJWKSURL       string
	ClerkJWTIssuer     string
	ClerkWebhookSecret string

	// Cloudflare R2 (S3-Compatible Object Storage)
	R2AccountID            string
	R2AccessKeyID          string
	R2SecretAccessKey      string
	R2BucketName           string
	R2PublicDomain         string
	R2Endpoint             string
	R2PresignExpireSeconds int

	// PostgreSQL Database
	DBDriver               string
	DBHost                 string
	DBPort                 string
	DBUser                 string
	DBPassword             string
	DBName                 string
	DBSSLMode              string
	DBMaxOpenConns         int
	DBMaxIdleConns         int
	DBConnMaxLifetimeMins  int

	// JWT Fallback (Legacy or Testing)
	JWTSecret string

	// Security & Rate Limiting
	CORSOrigins              string
	RateLimitMax             int
	RateLimitExpireSeconds   int

	// Financial Escrow (RDC Kinshasa)
	EscrowBankName        string
	EscrowAccountNumber   string
	EscrowJurisdiction    string
}

// LoadConfig charge la configuration depuis l'environnement système avec des valeurs par défaut sécurisées
func LoadConfig() *Config {
	return &Config{
		Port:                   getEnv("PORT", "8080"),
		AppEnv:                 getEnv("APP_ENV", "development"),
		AppName:                getEnv("APP_NAME", "ZIRA_Invest_API"),
		AppURL:                 getEnv("APP_URL", "http://localhost:8080"),
		PublicAppURL:           getEnv("PUBLIC_APP_URL", "http://localhost:3000"),

		ClerkSecretKey:         getEnv("CLERK_SECRET_KEY", ""),
		ClerkPublishableKey:    getEnv("CLERK_PUBLISHABLE_KEY", ""),
		ClerkJWKSURL:           getEnv("CLERK_JWKS_URL", ""),
		ClerkJWTIssuer:         getEnv("CLERK_JWT_ISSUER", ""),
		ClerkWebhookSecret:     getEnv("CLERK_WEBHOOK_SECRET", ""),

		R2AccountID:            getEnv("CLOUDFLARE_R2_ACCOUNT_ID", ""),
		R2AccessKeyID:          getEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", ""),
		R2SecretAccessKey:      getEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", ""),
		R2BucketName:           getEnv("CLOUDFLARE_R2_BUCKET_NAME", "zira-invest-assets-rdc"),
		R2PublicDomain:         getEnv("CLOUDFLARE_R2_PUBLIC_DOMAIN", "https://assets.zira-invest.cd"),
		R2Endpoint:             getEnv("CLOUDFLARE_R2_ENDPOINT", ""),
		R2PresignExpireSeconds: getEnvAsInt("CLOUDFLARE_R2_PRESIGNED_EXPIRATION_SECONDS", 900),

		DBDriver:               getEnv("DB_DRIVER", "postgres"),
		DBHost:                 getEnv("DB_HOST", "localhost"),
		DBPort:                 getEnv("DB_PORT", "5432"),
		DBUser:                 getEnv("DB_USER", "zira_admin"),
		DBPassword:             getEnv("DB_PASSWORD", "zira_secure_password"),
		DBName:                 getEnv("DB_NAME", "zira_invest_db"),
		DBSSLMode:              getEnv("DB_SSLMODE", "disable"),
		DBMaxOpenConns:         getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
		DBMaxIdleConns:         getEnvAsInt("DB_MAX_IDLE_CONNS", 10),
		DBConnMaxLifetimeMins:  getEnvAsInt("DB_CONN_MAX_LIFETIME_MINUTES", 30),

		JWTSecret:              getEnv("JWT_SECRET", "zira-invest-secret-key-change-in-production-rdc"),
		CORSOrigins:            getEnv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,https://zira-invest.cd"),
		RateLimitMax:           getEnvAsInt("RATE_LIMIT_MAX", 100),
		RateLimitExpireSeconds: getEnvAsInt("RATE_LIMIT_EXPIRATION_SECONDS", 60),

		EscrowBankName:         getEnv("ESCROW_BANK_NAME", "Rawbank_Kinshasa"),
		EscrowAccountNumber:   getEnv("ESCROW_ACCOUNT_NUMBER", "01000-243-987654321-USD"),
		EscrowJurisdiction:    getEnv("ESCROW_REGULATORY_JURISDICTION", "OHADA_Kinshasa_Gombe"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	valStr := os.Getenv(key)
	if valStr == "" {
		return fallback
	}
	val, err := strconv.Atoi(valStr)
	if err != nil {
		return fallback
	}
	return val
}
