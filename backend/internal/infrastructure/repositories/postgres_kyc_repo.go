package repositories

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/kyc"
)

type PostgresKycRepo struct {
	db *sql.DB
}

func NewPostgresKycRepo(db *sql.DB) *PostgresKycRepo {
	return &PostgresKycRepo{db: db}
}

func (r *PostgresKycRepo) CreateVerification(ctx context.Context, k *kyc.KycVerification) error {
	query := `
		INSERT INTO kyc_verifications (
			id, user_id, type, status, reviewer_id, rejection_reason,
			submitted_at, reviewed_at, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		k.ID, k.UserID, k.Type, string(k.Status), k.ReviewerID, k.RejectionReason,
		k.SubmittedAt, k.ReviewedAt, k.CreatedAt, k.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion verification kyc: %w", err)
	}
	return nil
}

func (r *PostgresKycRepo) GetByUserID(ctx context.Context, userID string) (*kyc.KycVerification, error) {
	query := `
		SELECT
			id, user_id, type, status, reviewer_id, rejection_reason,
			submitted_at, reviewed_at, created_at, updated_at
		FROM kyc_verifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`
	var k kyc.KycVerification
	var statusStr string
	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&k.ID, &k.UserID, &k.Type, &statusStr, &k.ReviewerID, &k.RejectionReason,
		&k.SubmittedAt, &k.ReviewedAt, &k.CreatedAt, &k.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrKycNotFound
		}
		return nil, err
	}
	k.Status = kyc.Status(statusStr)

	// Charger les documents associés
	docs, err := r.getDocumentsByKycID(ctx, k.ID)
	if err == nil {
		k.Documents = docs
	}

	return &k, nil
}

func (r *PostgresKycRepo) GetByID(ctx context.Context, id string) (*kyc.KycVerification, error) {
	query := `
		SELECT
			id, user_id, type, status, reviewer_id, rejection_reason,
			submitted_at, reviewed_at, created_at, updated_at
		FROM kyc_verifications
		WHERE id = $1
	`
	var k kyc.KycVerification
	var statusStr string
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&k.ID, &k.UserID, &k.Type, &statusStr, &k.ReviewerID, &k.RejectionReason,
		&k.SubmittedAt, &k.ReviewedAt, &k.CreatedAt, &k.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrKycNotFound
		}
		return nil, err
	}
	k.Status = kyc.Status(statusStr)

	docs, err := r.getDocumentsByKycID(ctx, k.ID)
	if err == nil {
		k.Documents = docs
	}

	return &k, nil
}

func (r *PostgresKycRepo) UpdateVerification(ctx context.Context, k *kyc.KycVerification) error {
	query := `
		UPDATE kyc_verifications SET
			status = $1, reviewer_id = $2, rejection_reason = $3,
			submitted_at = $4, reviewed_at = $5, updated_at = $6
		WHERE id = $7
	`
	res, err := r.db.ExecContext(
		ctx, query,
		string(k.Status), k.ReviewerID, k.RejectionReason,
		k.SubmittedAt, k.ReviewedAt, k.UpdatedAt, k.ID,
	)
	if err != nil {
		return fmt.Errorf("mise à jour verification kyc: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return common.ErrKycNotFound
	}
	return nil
}

func (r *PostgresKycRepo) AddDocument(ctx context.Context, doc *kyc.KycDocument) error {
	query := `
		INSERT INTO kyc_documents (
			id, kyc_id, doc_type, file_name, file_size, mime_type, r2_key, uploaded_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		doc.ID, doc.KycID, string(doc.DocType), doc.FileName, doc.FileSize, doc.MimeType, doc.R2Key, doc.UploadedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion document kyc: %w", err)
	}
	return nil
}

func (r *PostgresKycRepo) GetDocumentByID(ctx context.Context, docID string) (*kyc.KycDocument, error) {
	query := `
		SELECT id, kyc_id, doc_type, file_name, file_size, mime_type, r2_key, uploaded_at
		FROM kyc_documents
		WHERE id = $1
	`
	var d kyc.KycDocument
	var typeStr string
	err := r.db.QueryRowContext(ctx, query, docID).Scan(
		&d.ID, &d.KycID, &typeStr, &d.FileName, &d.FileSize, &d.MimeType, &d.R2Key, &d.UploadedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrKycNotFound
		}
		return nil, err
	}
	d.DocType = kyc.DocumentType(typeStr)
	return &d, nil
}

func (r *PostgresKycRepo) DeleteDocument(ctx context.Context, docID string) error {
	query := `DELETE FROM kyc_documents WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, docID)
	return err
}

func (r *PostgresKycRepo) ListPendingVerifications(ctx context.Context, limit, offset int) ([]*kyc.KycVerification, int64, error) {
	countQuery := `SELECT COUNT(*) FROM kyc_verifications WHERE status = 'SUBMITTED'`
	var total int64
	if err := r.db.QueryRowContext(ctx, countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, user_id, type, status, reviewer_id, rejection_reason, submitted_at, reviewed_at, created_at, updated_at
		FROM kyc_verifications
		WHERE status = 'SUBMITTED'
		ORDER BY submitted_at ASC
		LIMIT $1 OFFSET $2
	`
	rows, err := r.db.QueryContext(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*kyc.KycVerification
	for rows.Next() {
		var k kyc.KycVerification
		var s string
		if err := rows.Scan(
			&k.ID, &k.UserID, &k.Type, &s, &k.ReviewerID, &k.RejectionReason,
			&k.SubmittedAt, &k.ReviewedAt, &k.CreatedAt, &k.UpdatedAt,
		); err != nil {
			return nil, 0, err
		}
		k.Status = kyc.Status(s)
		list = append(list, &k)
	}

	return list, total, nil
}

func (r *PostgresKycRepo) getDocumentsByKycID(ctx context.Context, kycID string) ([]kyc.KycDocument, error) {
	query := `
		SELECT id, kyc_id, doc_type, file_name, file_size, mime_type, r2_key, uploaded_at
		FROM kyc_documents
		WHERE kyc_id = $1
		ORDER BY uploaded_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, kycID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []kyc.KycDocument
	for rows.Next() {
		var d kyc.KycDocument
		var typeStr string
		if err := rows.Scan(
			&d.ID, &d.KycID, &typeStr, &d.FileName, &d.FileSize, &d.MimeType, &d.R2Key, &d.UploadedAt,
		); err != nil {
			return nil, err
		}
		d.DocType = kyc.DocumentType(typeStr)
		docs = append(docs, d)
	}
	return docs, nil
}
