package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/zira-invest/backend/internal/domain/common"
	"github.com/zira-invest/backend/internal/domain/member"
)

type PostgresMemberRepo struct {
	db *sql.DB
}

func NewPostgresMemberRepo(db *sql.DB) *PostgresMemberRepo {
	return &PostgresMemberRepo{db: db}
}

func (r *PostgresMemberRepo) AddMember(ctx context.Context, m *member.ProjectMember) error {
	permsJSON, err := json.Marshal(m.Permissions)
	if err != nil {
		permsJSON = []byte("[]")
	}

	query := `
		INSERT INTO project_members (
			id, project_id, user_id, role, permissions, invitation_status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err = r.db.ExecContext(
		ctx, query,
		m.ID, m.ProjectID, m.UserID, string(m.Role), permsJSON, m.InvitationStatus, m.CreatedAt, m.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion membre: %w", err)
	}
	return nil
}

func (r *PostgresMemberRepo) GetMember(ctx context.Context, projectID, userID string) (*member.ProjectMember, error) {
	query := `
		SELECT
			pm.id, pm.project_id, pm.user_id, pm.role, pm.permissions, pm.invitation_status, pm.created_at, pm.updated_at,
			u.display_name, u.email, u.avatar_url, u.title
		FROM project_members pm
		JOIN users u ON u.id = pm.user_id
		WHERE pm.project_id = $1 AND pm.user_id = $2
	`
	row := r.db.QueryRowContext(ctx, query, projectID, userID)
	return r.scanMember(row)
}

func (r *PostgresMemberRepo) ListProjectMembers(ctx context.Context, projectID string) ([]*member.ProjectMember, error) {
	query := `
		SELECT
			pm.id, pm.project_id, pm.user_id, pm.role, pm.permissions, pm.invitation_status, pm.created_at, pm.updated_at,
			u.display_name, u.email, u.avatar_url, u.title
		FROM project_members pm
		JOIN users u ON u.id = pm.user_id
		WHERE pm.project_id = $1
		ORDER BY pm.created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*member.ProjectMember
	for rows.Next() {
		var m member.ProjectMember
		var roleStr string
		var permsJSON []byte
		if err := rows.Scan(
			&m.ID, &m.ProjectID, &m.UserID, &roleStr, &permsJSON, &m.InvitationStatus, &m.CreatedAt, &m.UpdatedAt,
			&m.UserDisplayName, &m.UserEmail, &m.UserAvatarURL, &m.UserTitle,
		); err != nil {
			return nil, err
		}
		m.Role = member.Role(roleStr)
		_ = json.Unmarshal(permsJSON, &m.Permissions)
		list = append(list, &m)
	}
	return list, nil
}

func (r *PostgresMemberRepo) UpdateMember(ctx context.Context, m *member.ProjectMember) error {
	permsJSON, err := json.Marshal(m.Permissions)
	if err != nil {
		permsJSON = []byte("[]")
	}

	query := `
		UPDATE project_members SET
			role = $1, permissions = $2, invitation_status = $3, updated_at = $4
		WHERE project_id = $5 AND user_id = $6
	`
	res, err := r.db.ExecContext(ctx, query, string(m.Role), permsJSON, m.InvitationStatus, m.UpdatedAt, m.ProjectID, m.UserID)
	if err != nil {
		return fmt.Errorf("mise à jour membre: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return common.ErrMemberNotFound
	}
	return nil
}

func (r *PostgresMemberRepo) RemoveMember(ctx context.Context, projectID, userID string) error {
	query := `DELETE FROM project_members WHERE project_id = $1 AND user_id = $2`
	_, err := r.db.ExecContext(ctx, query, projectID, userID)
	return err
}

func (r *PostgresMemberRepo) CreateInvitation(ctx context.Context, inv *member.ProjectInvitation) error {
	query := `
		INSERT INTO project_invitations (
			id, project_id, inviter_id, invitee_email, role, token, status, expires_at, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.ExecContext(
		ctx, query,
		inv.ID, inv.ProjectID, inv.InviterID, inv.InviteeEmail, string(inv.Role), inv.Token, string(inv.Status), inv.ExpiresAt, inv.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("insertion invitation: %w", err)
	}
	return nil
}

func (r *PostgresMemberRepo) GetInvitationByToken(ctx context.Context, token string) (*member.ProjectInvitation, error) {
	query := `
		SELECT id, project_id, inviter_id, invitee_email, role, token, status, expires_at, created_at
		FROM project_invitations
		WHERE token = $1
	`
	var inv member.ProjectInvitation
	var roleStr, statusStr string
	err := r.db.QueryRowContext(ctx, query, token).Scan(
		&inv.ID, &inv.ProjectID, &inv.InviterID, &inv.InviteeEmail, &roleStr, &inv.Token, &statusStr, &inv.ExpiresAt, &inv.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrInvitationNotFound
		}
		return nil, err
	}
	inv.Role = member.Role(roleStr)
	inv.Status = member.InvitationStatus(statusStr)
	return &inv, nil
}

func (r *PostgresMemberRepo) GetPendingInvitation(ctx context.Context, projectID, email string) (*member.ProjectInvitation, error) {
	query := `
		SELECT id, project_id, inviter_id, invitee_email, role, token, status, expires_at, created_at
		FROM project_invitations
		WHERE project_id = $1 AND invitee_email = $2 AND status = 'PENDING'
		ORDER BY created_at DESC
		LIMIT 1
	`
	var inv member.ProjectInvitation
	var roleStr, statusStr string
	err := r.db.QueryRowContext(ctx, query, projectID, email).Scan(
		&inv.ID, &inv.ProjectID, &inv.InviterID, &inv.InviteeEmail, &roleStr, &inv.Token, &statusStr, &inv.ExpiresAt, &inv.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrInvitationNotFound
		}
		return nil, err
	}
	inv.Role = member.Role(roleStr)
	inv.Status = member.InvitationStatus(statusStr)
	return &inv, nil
}

func (r *PostgresMemberRepo) ListProjectInvitations(ctx context.Context, projectID string) ([]*member.ProjectInvitation, error) {
	query := `
		SELECT id, project_id, inviter_id, invitee_email, role, token, status, expires_at, created_at
		FROM project_invitations
		WHERE project_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*member.ProjectInvitation
	for rows.Next() {
		var inv member.ProjectInvitation
		var roleStr, statusStr string
		if err := rows.Scan(
			&inv.ID, &inv.ProjectID, &inv.InviterID, &inv.InviteeEmail, &roleStr, &inv.Token, &statusStr, &inv.ExpiresAt, &inv.CreatedAt,
		); err != nil {
			return nil, err
		}
		inv.Role = member.Role(roleStr)
		inv.Status = member.InvitationStatus(statusStr)
		list = append(list, &inv)
	}
	return list, nil
}

func (r *PostgresMemberRepo) UpdateInvitationStatus(ctx context.Context, id string, status member.InvitationStatus) error {
	query := `UPDATE project_invitations SET status = $1 WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, string(status), id)
	return err
}

func (r *PostgresMemberRepo) scanMember(row *sql.Row) (*member.ProjectMember, error) {
	var m member.ProjectMember
	var roleStr string
	var permsJSON []byte

	err := row.Scan(
		&m.ID, &m.ProjectID, &m.UserID, &roleStr, &permsJSON, &m.InvitationStatus, &m.CreatedAt, &m.UpdatedAt,
		&m.UserDisplayName, &m.UserEmail, &m.UserAvatarURL, &m.UserTitle,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.ErrMemberNotFound
		}
		return nil, err
	}
	m.Role = member.Role(roleStr)
	_ = json.Unmarshal(permsJSON, &m.Permissions)
	return &m, nil
}
