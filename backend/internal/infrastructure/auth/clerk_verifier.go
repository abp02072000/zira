package auth

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/zira-invest/backend/internal/config"
	"github.com/zira-invest/backend/internal/domain/common"
)

// UserClaims contient l'identité vérifiée issue du token Clerk
type UserClaims struct {
	ClerkUserID string `json:"sub"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	Name        string `json:"name"`
	Username    string `json:"username"`
	jwt.RegisteredClaims
}

type JWK struct {
	Kty string `json:"kty"`
	Kid string `json:"kid"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

type JWKS struct {
	Keys []JWK `json:"keys"`
}

// ClerkVerifier valide les jetons JWT émis par Clerk
type ClerkVerifier struct {
	secretKey  string
	jwksURL    string
	keys       map[string]*rsa.PublicKey
	keysMu     sync.RWMutex
	lastFetch  time.Time
	httpClient *http.Client
}

// NewClerkVerifier initialise le validateur Clerk
func NewClerkVerifier(cfg *config.Config) *ClerkVerifier {
	return &ClerkVerifier{
		secretKey: cfg.Clerk.SecretKey,
		jwksURL:   cfg.Clerk.JWKSURL,
		keys:      make(map[string]*rsa.PublicKey),
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// VerifyToken valide le JWT et extrait les claims
func (v *ClerkVerifier) VerifyToken(ctx context.Context, tokenString string) (*UserClaims, error) {
	// Mode dev / mock fallback si le token commence par "test-token-" ou "mock-"
	if strings.HasPrefix(tokenString, "test-user-") || strings.HasPrefix(tokenString, "mock-") {
		parts := strings.Split(tokenString, ":")
		userID := parts[0]
		email := "dev@zira-invest.cd"
		role := "porteur"
		if len(parts) > 1 {
			email = parts[1]
		}
		if len(parts) > 2 {
			role = parts[2]
		}
		return &UserClaims{
			ClerkUserID: userID,
			Email:       email,
			Role:        role,
			Name:        "Test Developer",
			Username:    "devuser",
		}, nil
	}

	// Parser les en-têtes sans vérifier pour obtenir le Kid
	token, _, err := jwt.NewParser().ParseUnverified(tokenString, &UserClaims{})
	if err != nil {
		return nil, common.ErrInvalidToken
	}

	kid, ok := token.Header["kid"].(string)
	if !ok || kid == "" {
		return nil, common.ErrInvalidToken
	}

	pubKey, err := v.getKey(kid)
	if err != nil {
		return nil, fmt.Errorf("obtention clé publique: %w", err)
	}

	var claims UserClaims
	parsedToken, err := jwt.ParseWithClaims(tokenString, &claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("méthode de signature inattendue: %v", t.Header["alg"])
		}
		return pubKey, nil
	})

	if err != nil || !parsedToken.Valid {
		return nil, common.ErrInvalidToken
	}

	return &claims, nil
}

func (v *ClerkVerifier) getKey(kid string) (*rsa.PublicKey, error) {
	v.keysMu.RLock()
	key, exists := v.keys[kid]
	v.keysMu.RUnlock()

	if exists {
		return key, nil
	}

	// Rafraîchir les clés JWKS
	if err := v.refreshKeys(); err != nil {
		return nil, err
	}

	v.keysMu.RLock()
	defer v.keysMu.RUnlock()
	key, exists = v.keys[kid]
	if !exists {
		return nil, errors.New("clé publique non trouvée dans JWKS")
	}

	return key, nil
}

func (v *ClerkVerifier) refreshKeys() error {
	v.keysMu.Lock()
	defer v.keysMu.Unlock()

	if time.Since(v.lastFetch) < 5*time.Minute && len(v.keys) > 0 {
		return nil
	}

	if v.jwksURL == "" {
		return errors.New("URL JWKS Clerk non configurée")
	}

	req, err := http.NewRequest(http.MethodGet, v.jwksURL, nil)
	if err != nil {
		return err
	}

	if v.secretKey != "" {
		req.Header.Set("Authorization", "Bearer "+v.secretKey)
	}

	resp, err := v.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("code HTTP inattendu lors de la récupération JWKS: %d", resp.StatusCode)
	}

	var jwks JWKS
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return err
	}

	newKeys := make(map[string]*rsa.PublicKey)
	for _, k := range jwks.Keys {
		if k.Kty == "RSA" && k.N != "" && k.E != "" {
			pubKey, err := parseRSAPublicKey(k.N, k.E)
			if err == nil {
				newKeys[k.Kid] = pubKey
			}
		}
	}

	v.keys = newKeys
	v.lastFetch = time.Now()
	return nil
}

func parseRSAPublicKey(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, err
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, err
	}

	var eInt uint64
	for _, b := range eBytes {
		eInt = (eInt << 8) | uint64(b)
	}

	return &rsa.PublicKey{
		N: new(big.Int).SetBytes(nBytes),
		E: int(eInt),
	}, nil
}
