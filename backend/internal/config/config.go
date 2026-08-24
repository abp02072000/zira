package config

import (
	"os"
	"strconv"
)

type ServerConfig struct {
	Port           string
	AppEnv         string
	AppName        string
	AppURL         string
	PublicAppURL   string
	AllowedOrigins string
}

type ClerkConfig struct {
	SecretKey      string
	PublishableKey string
	JWKSURL        string
	JWTIssuer      string
	WebhookSecret  string
}

type R2Config struct {
	AccountID            string
	AccessKeyID          string
	AccessKeySecret      string
	BucketName           string
	PublicDomain         string
	Endpoint             string
	PresignExpireSeconds int
}

type DatabaseConfig struct {
	Driver                 string
	Host                   string
	Port                   string
	User                   string
	Password               string
	Name                   string
	SSLMode                string
	MaxOpenConns           int
	MaxIdleConns           int
	ConnMaxLifetimeMinutes int
}

type ResendConfig struct {
	APIKey    string
	FromEmail string
}

// Config regroupe toutes les variables d'environnement de l'application
type Config struct {
	Server                 ServerConfig
	Clerk                  ClerkConfig
	R2                     R2Config
	Database               DatabaseConfig
	Resend                 ResendConfig
	JWTSecret              string
	CORSOrigins            string
	RateLimitMax           int
	RateLimitExpireSeconds int
	EscrowBankName         string
	EscrowAccountNumber    string
	EscrowJurisdiction     string
}

// LoadConfig charge la configuration depuis l'environnement système avec des valeurs par défaut
func LoadConfig() *Config {
	corsOrigins := getEnv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,https://zira-invest.cd")
	return &Config{
		Server: ServerConfig{
			Port:           getEnv("PORT", "8080"),
			AppEnv:         getEnv("APP_ENV", "development"),
			AppName:        getEnv("APP_NAME", "ZIRA_Invest_API"),
			AppURL:         getEnv("APP_URL", "http://localhost:8080"),
			PublicAppURL:   getEnv("PUBLIC_APP_URL", "http://localhost:3000"),
			AllowedOrigins: corsOrigins,
		},

		Clerk: ClerkConfig{
			SecretKey:      getEnv("CLERK_SECRET_KEY", ""),
			PublishableKey: getEnv("CLERK_PUBLISHABLE_KEY", ""),
			JWKSURL:        getEnv("CLERK_JWKS_URL", ""),
			JWTIssuer:      getEnv("CLERK_JWT_ISSUER", ""),
			WebhookSecret:  getEnv("CLERK_WEBHOOK_SECRET", ""),
		},

		R2: R2Config{
			AccountID:            getEnv("CLOUDFLARE_R2_ACCOUNT_ID", ""),
			AccessKeyID:          getEnv("CLOUDFLARE_R2_ACCESS_KEY_ID", ""),
			AccessKeySecret:      getEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY", ""),
			BucketName:           getEnv("CLOUDFLARE_R2_BUCKET_NAME", "zira-invest-assets-rdc"),
			PublicDomain:         getEnv("CLOUDFLARE_R2_PUBLIC_DOMAIN", "https://assets.zira-invest.cd"),
			Endpoint:             getEnv("CLOUDFLARE_R2_ENDPOINT", ""),
			PresignExpireSeconds: getEnvAsInt("CLOUDFLARE_R2_PRESIGNED_EXPIRATION_SECONDS", 900),
		},

		Database: DatabaseConfig{
			Driver:                 getEnv("DB_DRIVER", "postgres"),
			Host:                   getEnv("DB_HOST", "localhost"),
			Port:                   getEnv("DB_PORT", "5432"),
			User:                   getEnv("DB_USER", "zira_admin"),
			Password:               getEnv("DB_PASSWORD", "zira_secure_password"),
			Name:                   getEnv("DB_NAME", "zira_invest_db"),
			SSLMode:                getEnv("DB_SSLMODE", "disable"),
			MaxOpenConns:           getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:           getEnvAsInt("DB_MAX_IDLE_CONNS", 10),
			ConnMaxLifetimeMinutes: getEnvAsInt("DB_CONN_MAX_LIFETIME_MINUTES", 30),
		},

		Resend: ResendConfig{
			APIKey:    getEnv("RESEND_API_KEY", ""),
			FromEmail: getEnv("RESEND_FROM_EMAIL", "notifications@zira-invest.cd"),
		},

		JWTSecret:              getEnv("JWT_SECRET", "zira-invest-secret-key-change-in-production-rdc"),
		CORSOrigins:            corsOrigins,
		RateLimitMax:           getEnvAsInt("RATE_LIMIT_MAX", 100),
		RateLimitExpireSeconds: getEnvAsInt("RATE_LIMIT_EXPIRATION_SECONDS", 60),

		EscrowBankName:      getEnv("ESCROW_BANK_NAME", "Rawbank_Kinshasa"),
		EscrowAccountNumber: getEnv("ESCROW_ACCOUNT_NUMBER", "01000-243-987654321-USD"),
		EscrowJurisdiction:  getEnv("ESCROW_REGULATORY_JURISDICTION", "OHADA_Kinshasa_Gombe"),
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
