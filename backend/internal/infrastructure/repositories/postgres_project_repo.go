package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/project"
)

type PostgresProjectRepo struct {
	db *sql.DB
}

func NewPostgresProjectRepo(db *sql.DB) *PostgresProjectRepo {
	return &PostgresProjectRepo{db: db}
}

func (r *PostgresProjectRepo) Create(ctx context.Context, p *project.Project) error {
	query := `
		INSERT INTO projects (
			id, slug, owner_id, name, short_description, full_description, sector, stage,
			target_market, country, city, video_url, logo_r2_key, poster_r2_key,
			target_amount_usd, min_investment_usd, max_investment_usd, equity_percent, raised_amount_usd,
			status, created_at, updated_at, submitted_at, published_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8,
			$9, $10, $11, $12, $13, $14,
			$15, $16, $17, $18, $19,
			$20, $21, $22, $23, $24
		)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		p.ID, p.Slug, p.OwnerID, p.Name, p.ShortDescription, p.FullDescription, p.Sector, p.Stage,
		p.TargetMarket, p.Country, p.City, p.VideoURL, p.LogoR2Key, p.PosterR2Key,
		p.Funding.TargetAmountUSD, p.Funding.MinInvestmentUSD, p.Funding.MaxInvestmentUSD, p.Funding.EquityPercent, p.Funding.RaisedAmountUSD,
		string(p.Status), p.CreatedAt, p.UpdatedAt, p.SubmittedAt, p.PublishedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion projet: %w", err)
	}
	return nil
}

func (r *PostgresProjectRepo) GetByID(ctx context.Context, id string) (*project.Project, error) {
	query := `
		SELECT
			id, slug, owner_id, name, short_description, full_description, sector, stage,
			target_market, country, city, video_url, logo_r2_key, poster_r2_key,
			target_amount_usd, min_investment_usd, max_investment_usd, equity_percent, raised_amount_usd,
			status, created_at, updated_at, submitted_at, published_at
		FROM projects
		WHERE id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)
	return r.scanProject(row)
}

func (r *PostgresProjectRepo) GetBySlug(ctx context.Context, slug string) (*project.Project, error) {
	query := `
		SELECT
			id, slug, owner_id, name, short_description, full_description, sector, stage,
			target_market, country, city, video_url, logo_r2_key, poster_r2_key,
			target_amount_usd, min_investment_usd, max_investment_usd, equity_percent, raised_amount_usd,
			status, created_at, updated_at, submitted_at, published_at
		FROM projects
		WHERE slug = $1
	`
	row := r.db.QueryRowContext(ctx, query, slug)
	return r.scanProject(row)
}

func (r *PostgresProjectRepo) GetByOwnerID(ctx context.Context, ownerID string, limit, offset int) ([]*project.Project, int64, error) {
	countQuery := `SELECT COUNT(*) FROM projects WHERE owner_id = $1`
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, ownerID).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT
			id, slug, owner_id, name, short_description, full_description, sector, stage,
			target_market, country, city, video_url, logo_r2_key, poster_r2_key,
			target_amount_usd, min_investment_usd, max_investment_usd, equity_percent, raised_amount_usd,
			status, created_at, updated_at, submitted_at, published_at
		FROM projects
		WHERE owner_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, ownerID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list, err := r.scanProjectsList(rows)
	if err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (r *PostgresProjectRepo) Update(ctx context.Context, p *project.Project) error {
	query := `
		UPDATE projects SET
			slug = $1, name = $2, short_description = $3, full_description = $4,
			sector = $5, stage = $6, target_market = $7, country = $8, city = $9,
			video_url = $10, logo_r2_key = $11, poster_r2_key = $12,
			target_amount_usd = $13, min_investment_usd = $14, max_investment_usd = $15,
			equity_percent = $16, raised_amount_usd = $17, status = $18,
			updated_at = $19, submitted_at = $20, published_at = $21
		WHERE id = $22
	`
	res, err := r.db.ExecContext(
		ctx, query,
		p.Slug, p.Name, p.ShortDescription, p.FullDescription,
		p.Sector, p.Stage, p.TargetMarket, p.Country, p.City,
		p.VideoURL, p.LogoR2Key, p.PosterR2Key,
		p.Funding.TargetAmountUSD, p.Funding.MinInvestmentUSD, p.Funding.MaxInvestmentUSD,
		p.Funding.EquityPercent, p.Funding.RaisedAmountUSD, string(p.Status),
		p.UpdatedAt, p.SubmittedAt, p.PublishedAt, p.ID,
	)
	if err != nil {
		return fmt.Errorf("mise à jour projet: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return common.ErrProjectNotFound
	}
	return nil
}

func (r *PostgresProjectRepo) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM projects WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *PostgresProjectRepo) ListPublicProjects(ctx context.Context, sector string, limit, offset int) ([]*project.Project, int64, error) {
	var countQuery string
	var query string
	var args []interface{}
	var countArgs []interface{}

	if sector != "" {
		countQuery = `SELECT COUNT(*) FROM projects WHERE status IN ('PUBLISHED', 'FUNDING', 'FUNDED', 'COMPLETED') AND sector = $1`
		query = `
			SELECT
				id, slug, owner_id, name, short_description, full_description, sector, stage,
				target_market, country, city, video_url, logo_r2_key, poster_r2_key,
				target_amount_usd, min_investment_usd, max_investment_usd, equity_percent, raised_amount_usd,
				status, created_at, updated_at, submitted_at, published_at
			FROM projects
			WHERE status IN ('PUBLISHED', 'FUNDING', 'FUNDED', 'COMPLETED') AND sector = $1
			ORDER BY created_at DESC
			LIMIT $2 OFFSET $3
		`
		countArgs = append(countArgs, sector)
		args = append(args, sector, limit, offset)
	} else {
		countQuery = `SELECT COUNT(*) FROM projects WHERE status IN ('PUBLISHED', 'FUNDING', 'FUNDED', 'COMPLETED')`
		query = `
			SELECT
				id, slug, owner_id, name, short_description, full_description, sector, stage,
				target_market, country, city, video_url, logo_r2_key, poster_r2_key,
				target_amount_usd, min_investment_usd, max_investment_usd, equity_percent, raised_amount_usd,
				status, created_at, updated_at, submitted_at, published_at
			FROM projects
			WHERE status IN ('PUBLISHED', 'FUNDING', 'FUNDED', 'COMPLETED')
			ORDER BY created_at DESC
			LIMIT $1 OFFSET $2
		`
		args = append(args, limit, offset)
	}

	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	list, err := r.scanProjectsList(rows)
	if err != nil {
		return nil, 0, err
	}
	return list, total, nil
}

func (r *PostgresProjectRepo) RecordStatusHistory(ctx context.Context, history *project.StatusHistory) error {
	query := `
		INSERT INTO project_status_history (id, project_id, from_status, to_status, changed_by, reason, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		history.ID, history.ProjectID, string(history.FromState), string(history.ToState),
		history.ChangedBy, history.Reason, history.CreatedAt,
	)
	return err
}

func (r *PostgresProjectRepo) IsSlugTaken(ctx context.Context, slug string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM projects WHERE slug = $1)`
	var exists bool
	err := r.db.QueryRowContext(ctx, query, slug).Scan(&exists)
	return exists, err
}

func (r *PostgresProjectRepo) scanProject(row *sql.Row) (*project.Project, error) {
	var p project.Project
	var statusStr string

	err := row.Scan(
		&p.ID, &p.Slug, &p.OwnerID, &p.Name, &p.ShortDescription, &p.FullDescription, &p.Sector, &p.Stage,
		&p.TargetMarket, &p.Country, &p.City, &p.VideoURL, &p.LogoR2Key, &p.PosterR2Key,
		&p.Funding.TargetAmountUSD, &p.Funding.MinInvestmentUSD, &p.Funding.MaxInvestmentUSD, &p.Funding.EquityPercent, &p.Funding.RaisedAmountUSD,
		&statusStr, &p.CreatedAt, &p.UpdatedAt, &p.SubmittedAt, &p.PublishedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrProjectNotFound
		}
		return nil, err
	}
	p.Status = project.Status(statusStr)
	return &p, nil
}

func (r *PostgresProjectRepo) scanProjectsList(rows *sql.Rows) ([]*project.Project, error) {
	var list []*project.Project
	for rows.Next() {
		var p project.Project
		var statusStr string
		err := rows.Scan(
			&p.ID, &p.Slug, &p.OwnerID, &p.Name, &p.ShortDescription, &p.FullDescription, &p.Sector, &p.Stage,
			&p.TargetMarket, &p.Country, &p.City, &p.VideoURL, &p.LogoR2Key, &p.PosterR2Key,
			&p.Funding.TargetAmountUSD, &p.Funding.MinInvestmentUSD, &p.Funding.MaxInvestmentUSD, &p.Funding.EquityPercent, &p.Funding.RaisedAmountUSD,
			&statusStr, &p.CreatedAt, &p.UpdatedAt, &p.SubmittedAt, &p.PublishedAt,
		)
		if err != nil {
			return nil, err
		}
		p.Status = project.Status(statusStr)
		list = append(list, &p)
	}
	return list, nil
}
