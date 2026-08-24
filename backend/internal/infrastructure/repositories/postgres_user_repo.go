package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/user"
)

type PostgresUserRepo struct {
	db *sql.DB
}

func NewPostgresUserRepo(db *sql.DB) *PostgresUserRepo {
	return &PostgresUserRepo{db: db}
}

func (r *PostgresUserRepo) Create(ctx context.Context, u *user.User) error {
	query := `
		INSERT INTO users (
			id, clerk_user_id, username, email, display_name, title, bio, avatar_url,
			phone, company_name, city, country, role, status, website, linkedin_url, twitter_url,
			is_public, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13, $14, $15, $16, $17,
			$18, $19, $20
		)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		u.ID, u.ClerkUserID, u.Username, u.Email, u.DisplayName, u.Title, u.Bio, u.AvatarURL,
		u.Phone, u.CompanyName, u.City, u.Country, string(u.Role), string(u.Status), u.Website, u.LinkedInURL, u.TwitterURL,
		u.IsPublic, u.CreatedAt, u.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion utilisateur: %w", err)
	}
	return nil
}

func (r *PostgresUserRepo) GetByID(ctx context.Context, id string) (*user.User, error) {
	query := `
		SELECT
			id, clerk_user_id, username, email, display_name, title, bio, avatar_url,
			phone, company_name, city, country, role, status, website, linkedin_url, twitter_url,
			is_public, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)
	return r.scanUser(row)
}

func (r *PostgresUserRepo) GetByClerkID(ctx context.Context, clerkID string) (*user.User, error) {
	query := `
		SELECT
			id, clerk_user_id, username, email, display_name, title, bio, avatar_url,
			phone, company_name, city, country, role, status, website, linkedin_url, twitter_url,
			is_public, created_at, updated_at
		FROM users
		WHERE clerk_user_id = $1
	`
	row := r.db.QueryRowContext(ctx, query, clerkID)
	return r.scanUser(row)
}

func (r *PostgresUserRepo) GetByEmail(ctx context.Context, email string) (*user.User, error) {
	query := `
		SELECT
			id, clerk_user_id, username, email, display_name, title, bio, avatar_url,
			phone, company_name, city, country, role, status, website, linkedin_url, twitter_url,
			is_public, created_at, updated_at
		FROM users
		WHERE email = $1
	`
	row := r.db.QueryRowContext(ctx, query, email)
	return r.scanUser(row)
}

func (r *PostgresUserRepo) GetByUsername(ctx context.Context, username string) (*user.User, error) {
	query := `
		SELECT
			id, clerk_user_id, username, email, display_name, title, bio, avatar_url,
			phone, company_name, city, country, role, status, website, linkedin_url, twitter_url,
			is_public, created_at, updated_at
		FROM users
		WHERE username = $1
	`
	row := r.db.QueryRowContext(ctx, query, username)
	return r.scanUser(row)
}

func (r *PostgresUserRepo) Update(ctx context.Context, u *user.User) error {
	query := `
		UPDATE users SET
			username = $1, display_name = $2, title = $3, bio = $4, avatar_url = $5,
			phone = $6, company_name = $7, city = $8, country = $9, role = $10,
			status = $11, website = $12, linkedin_url = $13, twitter_url = $14,
			is_public = $15, updated_at = $16
		WHERE id = $17
	`
	res, err := r.db.ExecContext(
		ctx, query,
		u.Username, u.DisplayName, u.Title, u.Bio, u.AvatarURL,
		u.Phone, u.CompanyName, u.City, u.Country, string(u.Role),
		string(u.Status), u.Website, u.LinkedInURL, u.TwitterURL,
		u.IsPublic, u.UpdatedAt, u.ID,
	)
	if err != nil {
		return fmt.Errorf("mise à jour utilisateur: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return common.ErrUserNotFound
	}
	return nil
}

func (r *PostgresUserRepo) RecordUsernameChange(ctx context.Context, history *user.UsernameHistory) error {
	query := `
		INSERT INTO username_history (id, user_id, old_username, changed_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := r.db.ExecContext(ctx, query, history.ID, history.UserID, history.OldUsername, history.ChangedAt)
	return err
}

func (r *PostgresUserRepo) IsUsernameTaken(ctx context.Context, username string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, username).Scan(&exists)
	return exists, err
}

func (r *PostgresUserRepo) IsEmailTaken(ctx context.Context, email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, email).Scan(&exists)
	return exists, err
}

func (r *PostgresUserRepo) scanUser(row *sql.Row) (*user.User, error) {
	var u user.User
	var roleStr, statusStr string

	err := row.Scan(
		&u.ID, &u.ClerkUserID, &u.Username, &u.Email, &u.DisplayName, &u.Title, &u.Bio, &u.AvatarURL,
		&u.Phone, &u.CompanyName, &u.City, &u.Country, &roleStr, &statusStr, &u.Website, &u.LinkedInURL, &u.TwitterURL,
		&u.IsPublic, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrUserNotFound
		}
		return nil, err
	}
	u.Role = user.Role(roleStr)
	u.Status = user.Status(statusStr)
	return &u, nil
}
