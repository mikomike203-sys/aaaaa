-- Tech Developers Kenya & East Africa - Database Schema
-- Migration 001: Initial Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================
-- USERS & AUTH
-- =======================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'commissioner', 'developer', 'client', 'support');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'client',
  password_hash VARCHAR(255),
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =======================
-- COMPANIES
-- =======================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  tax_id VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- COMMISSIONERS
-- =======================

DO $$ BEGIN
    CREATE TYPE commissioner_tier AS ENUM ('tier1', 'tier2', 'tier3');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS commissioners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier commissioner_tier DEFAULT 'tier1',
  rate_percent DECIMAL(5,2) DEFAULT 25.00,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  parent_commissioner_id UUID REFERENCES commissioners(id),
  total_revenue DECIMAL(15,2) DEFAULT 0,
  kyc_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissioners_user ON commissioners(user_id);
CREATE INDEX IF NOT EXISTS idx_commissioners_referral ON commissioners(referral_code);

-- =======================
-- DEVELOPERS
-- =======================

CREATE TABLE IF NOT EXISTS developers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  roles JSONB DEFAULT '[]', -- Array of skill tags
  hourly_rate DECIMAL(10,2),
  portfolio_links JSONB DEFAULT '[]',
  verified BOOLEAN DEFAULT FALSE,
  kyc_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_developers_user ON developers(user_id);
CREATE INDEX IF NOT EXISTS idx_developers_company ON developers(company_id);

-- =======================
-- CLIENTS
-- =======================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);

-- =======================
-- PROJECTS
-- =======================

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('lead', 'scoped', 'deposit_pending', 'deposit_pending_verification', 'active', 'in_review', 'completed', 'disputed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE escrow_status AS ENUM ('no_deposit', 'pending_verification', 'deposit_verified', 'held_for_dispute', 'released');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES clients(id),
  commissioner_id UUID REFERENCES commissioners(id),
  developer_id UUID REFERENCES developers(id),
  company_id UUID REFERENCES companies(id),
  total_value DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  status project_status DEFAULT 'lead',
  escrow_status escrow_status DEFAULT 'no_deposit',
  escrow_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_commissioner ON projects(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_projects_developer ON projects(developer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- =======================
-- PROJECT MILESTONES
-- =======================

DO $$ BEGIN
    CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'delivered', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  percent_amount DECIMAL(5,2) NOT NULL,
  due_date DATE,
  status milestone_status DEFAULT 'pending',
  deliverable_links JSONB DEFAULT '[]',
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);

-- =======================
-- PAYMENTS
-- =======================

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('card', 'mpesa', 'crypto', 'bank', 'paypal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending_verification', 'verified', 'released', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  payer_id UUID REFERENCES users(id),
  method payment_method NOT NULL,
  gateway VARCHAR(50),
  currency VARCHAR(10) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  fiat_equivalent DECIMAL(15,2),
  exchange_rate DECIMAL(15,6),
  status payment_status DEFAULT 'pending_verification',
  tx_hash VARCHAR(255),
  raw_payload JSONB,
  verified_by_admin_id UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_project ON payments(project_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_tx_hash ON payments(tx_hash);

-- =======================
-- ESCROW LEDGER
-- =======================

DO $$ BEGIN
    CREATE TYPE escrow_action AS ENUM ('hold', 'release', 'refund', 'adjust');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS escrow_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  payment_id UUID REFERENCES payments(id),
  action escrow_action NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_project ON escrow_ledger(project_id);
CREATE INDEX IF NOT EXISTS idx_escrow_created ON escrow_ledger(created_at);

-- =======================
-- COMMISSIONS
-- =======================

DO $$ BEGIN
    CREATE TYPE commission_status AS ENUM ('pending', 'released', 'paid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  commissioner_id UUID NOT NULL REFERENCES commissioners(id),
  percent DECIMAL(5,2) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status commission_status DEFAULT 'pending',
  released_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_commissioner ON commissions(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_project ON commissions(project_id);

-- =======================
-- REFERRALS
-- =======================

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES commissioners(id),
  referee_id UUID NOT NULL REFERENCES commissioners(id),
  override_percent DECIMAL(5,2) DEFAULT 5.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);

-- =======================
-- PAYOUTS
-- =======================

DO $$ BEGIN
    CREATE TYPE payout_status AS ENUM ('scheduled', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  amount DECIMAL(15,2) NOT NULL,
  method VARCHAR(50),
  details JSONB,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  executed_at TIMESTAMP WITH TIME ZONE,
  status payout_status DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_recipient ON payouts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- =======================
-- DISPUTES
-- =======================

DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM ('open', 'investigating', 'resolved', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  evidence_links JSONB DEFAULT '[]',
  status dispute_status DEFAULT 'open',
  investigator_notes TEXT,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_disputes_project ON disputes(project_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- =======================
-- AUDIT LOGS
-- =======================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  actor_role user_role,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- =======================
-- FILES
-- =======================

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  uploader_id UUID NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  filename VARCHAR(255),
  file_type VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_uploader ON files(uploader_id);

-- =======================
-- NOTIFICATIONS
-- =======================

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'in_app', 'push');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  channel notification_channel NOT NULL,
  title VARCHAR(255),
  body TEXT NOT NULL,
  metadata JSONB,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_at);

-- =======================
-- KYC DOCUMENTS
-- =======================

DO $$ BEGIN
    CREATE TYPE kyc_doc_type AS ENUM ('id', 'selfie', 'proof_of_address', 'tax_cert', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_doc_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  doc_type kyc_doc_type NOT NULL,
  url TEXT NOT NULL,
  status kyc_doc_status DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_documents(status);

-- =======================
-- LEADS (for intake flow)
-- =======================

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('created', 'sent', 'viewed', 'meeting_scheduled', 'deposit_paid', 'active', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commissioner_id UUID NOT NULL REFERENCES commissioners(id),
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_email VARCHAR(255),
  project_summary TEXT,
  budget DECIMAL(15,2),
  status lead_status DEFAULT 'created',
  intake_token VARCHAR(255) UNIQUE NOT NULL,
  intake_link TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_commissioner ON leads(commissioner_id);
CREATE INDEX IF NOT EXISTS idx_leads_intake_token ON leads(intake_token);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- =======================
-- FUNCTIONS
-- =======================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_commissioners_updated_at BEFORE UPDATE ON commissioners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_developers_updated_at BEFORE UPDATE ON developers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON project_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
