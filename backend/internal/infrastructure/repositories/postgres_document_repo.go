package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/document"
)

type PostgresDocumentRepo struct {
	db *sql.DB
}

func NewPostgresDocumentRepo(db *sql.DB) *PostgresDocumentRepo {
	return &PostgresDocumentRepo{db: db}
}

func (r *PostgresDocumentRepo) AddDocument(ctx context.Context, doc *document.ProjectDocument) error {
	query := `
		INSERT INTO project_documents (
			id, project_id, title, category, file_name, file_size, mime_type, r2_key, is_public, uploaded_by, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		doc.ID, doc.ProjectID, doc.Title, string(doc.Category), doc.FileName, doc.FileSize,
		doc.MimeType, doc.R2Key, doc.IsPublic, doc.UploadedBy, doc.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion document projet: %w", err)
	}
	return nil
}

func (r *PostgresDocumentRepo) GetDocumentByID(ctx context.Context, id string) (*document.ProjectDocument, error) {
	query := `
		SELECT id, project_id, title, category, file_name, file_size, mime_type, r2_key, is_public, uploaded_by, created_at
		FROM project_documents
		WHERE id = $1
	`
	var doc document.ProjectDocument
	var catStr string
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&doc.ID, &doc.ProjectID, &doc.Title, &catStr, &doc.FileName, &doc.FileSize,
		&doc.MimeType, &doc.R2Key, &doc.IsPublic, &doc.UploadedBy, &doc.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrProjectNotFound
		}
		return nil, err
	}
	doc.Category = document.Category(catStr)
	return &doc, nil
}

func (r *PostgresDocumentRepo) ListDocumentsByProject(ctx context.Context, projectID string, publicOnly bool) ([]*document.ProjectDocument, error) {
	var query string
	var args []interface{}
	if publicOnly {
		query = `
			SELECT id, project_id, title, category, file_name, file_size, mime_type, r2_key, is_public, uploaded_by, created_at
			FROM project_documents
			WHERE project_id = $1 AND is_public = true
			ORDER BY created_at DESC
		`
		args = append(args, projectID)
	} else {
		query = `
			SELECT id, project_id, title, category, file_name, file_size, mime_type, r2_key, is_public, uploaded_by, created_at
			FROM project_documents
			WHERE project_id = $1
			ORDER BY created_at DESC
		`
		args = append(args, projectID)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*document.ProjectDocument
	for rows.Next() {
		var doc document.ProjectDocument
		var catStr string
		if err := rows.Scan(
			&doc.ID, &doc.ProjectID, &doc.Title, &catStr, &doc.FileName, &doc.FileSize,
			&doc.MimeType, &doc.R2Key, &doc.IsPublic, &doc.UploadedBy, &doc.CreatedAt,
		); err != nil {
			return nil, err
		}
		doc.Category = document.Category(catStr)
		list = append(list, &doc)
	}
	return list, nil
}

func (r *PostgresDocumentRepo) DeleteDocument(ctx context.Context, id string) error {
	query := `DELETE FROM project_documents WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *PostgresDocumentRepo) AddImage(ctx context.Context, img *document.ProjectImage) error {
	query := `
		INSERT INTO project_images (id, project_id, caption, r2_key, sort_order, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, img.ID, img.ProjectID, img.Caption, img.R2Key, img.SortOrder, img.CreatedAt)
	return err
}

func (r *PostgresDocumentRepo) GetImageByID(ctx context.Context, id string) (*document.ProjectImage, error) {
	query := `SELECT id, project_id, caption, r2_key, sort_order, created_at FROM project_images WHERE id = $1`
	var img document.ProjectImage
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&img.ID, &img.ProjectID, &img.Caption, &img.R2Key, &img.SortOrder, &img.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &img, nil
}

func (r *PostgresDocumentRepo) ListImagesByProject(ctx context.Context, projectID string) ([]*document.ProjectImage, error) {
	query := `SELECT id, project_id, caption, r2_key, sort_order, created_at FROM project_images WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC`
	rows, err := r.db.QueryContext(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*document.ProjectImage
	for rows.Next() {
		var img document.ProjectImage
		if err := rows.Scan(&img.ID, &img.ProjectID, &img.Caption, &img.R2Key, &img.SortOrder, &img.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, &img)
	}
	return list, nil
}

func (r *PostgresDocumentRepo) DeleteImage(ctx context.Context, id string) error {
	query := `DELETE FROM project_images WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
