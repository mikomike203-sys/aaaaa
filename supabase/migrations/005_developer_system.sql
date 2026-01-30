-- Migration 005: Developer System Construction

-- =======================
-- 1. DEVELOPER PROFILES UPDATES
-- =======================
ALTER TABLE developers ADD COLUMN IF NOT EXISTS reliability_score DECIMAL(5,2) DEFAULT 100.00;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS available_balance DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE developers ADD COLUMN IF NOT EXISTS is_blacklisted BOOLEAN DEFAULT FALSE;

-- =======================
-- 2. PROJECT SQUADS (Multi-Role Logic)
-- =======================
DO $$ BEGIN
    CREATE TYPE squad_role AS ENUM ('lead', 'execution', 'qa', 'shadow');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS project_squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES developers(id),
  role squad_role NOT NULL,
  percent_allocation DECIMAL(5,2) DEFAULT 0.00, -- e.g. 10.00 for Lead
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id, developer_id) -- A dev can't have multiple roles on same project (simplification)
);

CREATE INDEX IF NOT EXISTS idx_squads_project ON project_squads(project_id);
CREATE INDEX IF NOT EXISTS idx_squads_dev ON project_squads(developer_id);

-- =======================
-- 3. WORK LOGS (Updates)
-- =======================
CREATE TABLE IF NOT EXISTS work_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  developer_id UUID NOT NULL REFERENCES developers(id),
  content TEXT, -- Markdown or Text details
  video_url TEXT, -- Loom link
  blockers TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_logs_project ON work_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_created ON work_logs(created_at);

-- =======================
-- 4. CONTRACTS (NDA & Project Agreement)
-- =======================
DO $$ BEGIN
    CREATE TYPE contract_type AS ENUM ('nda', 'project_agreement', 'contractor_agreement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id), -- Nullable for platform-wide agreements
  developer_id UUID REFERENCES developers(id),
  client_id UUID REFERENCES clients(id),
  commissioner_id UUID REFERENCES commissioners(id),
  title VARCHAR(255) NOT NULL,
  type contract_type NOT NULL,
  content_url TEXT, -- PDF Link or Text body
  signed boolean DEFAULT FALSE,
  signed_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);
CREATE INDEX IF NOT EXISTS idx_contracts_dev ON contracts(developer_id);

-- =======================
-- 5. MILESTONE LOGIC UPDATES
-- =======================
-- Expanding milestone types for consistent strict workflow
DO $$ BEGIN
    CREATE TYPE milestone_type AS ENUM ('scoping', 'design', 'beta', 'final', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS type milestone_type DEFAULT 'custom';
ALTER TABLE project_milestones ADD COLUMN IF NOT EXISTS approval_chain_status JSONB DEFAULT '{"lead": false, "qa": false, "client": false, "admin": false}';

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE project_squads;
ALTER PUBLICATION supabase_realtime ADD TABLE work_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
