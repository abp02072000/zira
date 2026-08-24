-- ==============================================================================
-- ZIRA INVEST - POSTGRESQL PRODUCTION SCHEMA
-- Clean Architecture & Domain-Driven Design for RDC Investment Platform
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & IDENTITY
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    clerk_user_id VARCHAR(128) NOT NULL UNIQUE,
    username VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    title VARCHAR(128),
    bio TEXT,
    avatar_url VARCHAR(512),
    phone VARCHAR(32),
    company_name VARCHAR(128),
    city VARCHAR(64) DEFAULT 'Kinshasa',
    country VARCHAR(32) DEFAULT 'RDC',
    role VARCHAR(32) NOT NULL DEFAULT 'porteur' CHECK (role IN ('porteur', 'investisseur', 'moderateur', 'admin')),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_kyc', 'suspended')),
    website VARCHAR(255),
    linkedin_url VARCHAR(255),
    twitter_url VARCHAR(255),
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique index for usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- 2. USERNAME HISTORY
CREATE TABLE IF NOT EXISTS username_history (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_username VARCHAR(32) NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_username_history_user_id ON username_history (user_id);
CREATE INDEX IF NOT EXISTS idx_username_history_old_username ON username_history (LOWER(old_username));

-- 3. KYC DOMAIN (Conformité & Identification)
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL DEFAULT 'porteur' CHECK (type IN ('porteur', 'investisseur', 'institutionnel')),
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMISSION')),
    reviewer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications (status);
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_verifications (user_id);

CREATE TABLE IF NOT EXISTS kyc_documents (
    id VARCHAR(64) PRIMARY KEY,
    kyc_id VARCHAR(64) NOT NULL REFERENCES kyc_verifications(id) ON DELETE CASCADE,
    doc_type VARCHAR(64) NOT NULL CHECK (doc_type IN ('national_id', 'passport', 'rccm_certificate', 'bank_statement', 'tax_id', 'power_of_attorney')),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    r2_key VARCHAR(512) NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_kyc_id ON kyc_documents (kyc_id);

-- 4. PROJECTS DOMAIN
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(128) NOT NULL UNIQUE,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    short_description VARCHAR(500) NOT NULL,
    full_description TEXT,
    sector VARCHAR(64) NOT NULL,
    stage VARCHAR(64) DEFAULT 'Growth',
    target_market VARCHAR(128) NOT NULL DEFAULT 'RDC (Kinshasa)',
    country VARCHAR(32) DEFAULT 'RDC',
    city VARCHAR(64) DEFAULT 'Kinshasa',
    video_url VARCHAR(512),
    logo_r2_key VARCHAR(512),
    poster_r2_key VARCHAR(512),
    target_amount_usd NUMERIC(15, 2) NOT NULL CHECK (target_amount_usd > 0),
    min_investment_usd NUMERIC(15, 2) NOT NULL DEFAULT 50 CHECK (min_investment_usd > 0),
    max_investment_usd NUMERIC(15, 2) NOT NULL CHECK (max_investment_usd >= min_investment_usd),
    equity_percent NUMERIC(5, 2) NOT NULL CHECK (equity_percent > 0 AND equity_percent <= 100),
    raised_amount_usd NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (raised_amount_usd >= 0),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'FUNDING', 'FUNDED', 'COMPLETED', 'REJECTED', 'SUSPENDED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects (owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects (sector);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);

-- 5. PROJECT MEMBERS & PERMISSIONS
CREATE TABLE IF NOT EXISTS project_members (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('OWNER', 'COFOUNDER', 'MANAGER', 'MEMBER')),
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    invitation_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (invitation_status IN ('PENDING', 'ACTIVE', 'REVOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_project_member UNIQUE (project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members (user_id);

-- 6. PROJECT INVITATIONS
CREATE TABLE IF NOT EXISTS project_invitations (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    inviter_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('COFOUNDER', 'MANAGER', 'MEMBER')),
    token VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REVOKED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON project_invitations (token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON project_invitations (invitee_email);

-- 7. PROJECT DOCUMENTS & IMAGES (Cloudflare R2 metadata)
CREATE TABLE IF NOT EXISTS project_documents (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('pitch_deck', 'business_plan', 'financial_model', 'rccm_statuts', 'audit_report', 'contract', 'other')),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    r2_key VARCHAR(512) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    uploaded_by VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents (project_id);

CREATE TABLE IF NOT EXISTS project_images (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    caption VARCHAR(255),
    r2_key VARCHAR(512) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images (project_id);

-- 8. PROJECT STATUS HISTORY & AUDIT TRAIL
CREATE TABLE IF NOT EXISTS project_status_history (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    from_status VARCHAR(32) NOT NULL,
    to_status VARCHAR(32) NOT NULL,
    changed_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_status_history_proj ON project_status_history (project_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64),
    actor_email VARCHAR(255),
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64) NOT NULL,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
