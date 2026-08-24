package repositories

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/zira-invest/backend/internal/domain/audit"
)

type PostgresAuditRepo struct {
	db *sql.DB
}

func NewPostgresAuditRepo(db *sql.DB) *PostgresAuditRepo {
	return &PostgresAuditRepo{db: db}
}

func (r *PostgresAuditRepo) Log(ctx context.Context, entry *audit.AuditLog) error {
	query := `
		INSERT INTO audit_logs (
			id, actor_id, actor_email, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		entry.ID, entry.ActorID, entry.ActorEmail, entry.Action, entry.ResourceType, entry.ResourceID,
		entry.Metadata, entry.IPAddress, entry.UserAgent, entry.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion log audit: %w", err)
	}
	return nil
}

func (r *PostgresAuditRepo) ListByResource(ctx context.Context, resourceType, resourceID string, limit, offset int) ([]*audit.AuditLog, int64, error) {
	countQuery := `SELECT COUNT(*) FROM audit_logs WHERE resource_type = $1 AND resource_id = $2`
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, resourceType, resourceID).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, actor_id, actor_email, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at
		FROM audit_logs
		WHERE resource_type = $1 AND resource_id = $2
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`
	rows, err := r.db.QueryContext(ctx, query, resourceType, resourceID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*audit.AuditLog
	for rows.Next() {
		var a audit.AuditLog
		if err := rows.Scan(
			&a.ID, &a.ActorID, &a.ActorEmail, &a.Action, &a.ResourceType, &a.ResourceID,
			&a.Metadata, &a.IPAddress, &a.UserAgent, &a.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, &a)
	}
	return list, total, nil
}

func (r *PostgresAuditRepo) ListByActor(ctx context.Context, actorID string, limit, offset int) ([]*audit.AuditLog, int64, error) {
	countQuery := `SELECT COUNT(*) FROM audit_logs WHERE actor_id = $1`
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery, actorID).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, actor_id, actor_email, action, resource_type, resource_id, metadata, ip_address, user_agent, created_at
		FROM audit_logs
		WHERE actor_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.QueryContext(ctx, query, actorID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*audit.AuditLog
	for rows.Next() {
		var a audit.AuditLog
		if err := rows.Scan(
			&a.ID, &a.ActorID, &a.ActorEmail, &a.Action, &a.ResourceType, &a.ResourceID,
			&a.Metadata, &a.IPAddress, &a.UserAgent, &a.CreatedAt,
		); err != nil {
			return nil, 0, err
		}
		list = append(list, &a)
	}
	return list, total, nil
}
