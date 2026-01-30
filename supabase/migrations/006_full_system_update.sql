-- Migration 006: Referrals, Lead Pool, and Enhanced Profiles

-- =======================
-- 1. REFERRAL SYSTEM UPDATES
-- =======================

ALTER TABLE commissioners 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_project_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(100),
ADD COLUMN IF NOT EXISTS niche_expertise VARCHAR(255),
ADD COLUMN IF NOT EXISTS mpesa_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS close_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS recruitment_count INTEGER DEFAULT 0;

-- =======================
-- 2. OPEN LEAD POOL SYSTEM
-- =======================

-- Update leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS claimed_by UUID REFERENCES commissioners(id),
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS first_contact_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lead_score VARCHAR(10) DEFAULT 'warm', -- hot, warm, cold
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS co_commissioner_id UUID REFERENCES commissioners(id),
ADD COLUMN IF NOT EXISTS commission_split JSONB;

-- Make commissioner_id nullable since leads start in open pool
ALTER TABLE leads ALTER COLUMN commissioner_id DROP NOT NULL;

-- Lead Audit/Actions table
CREATE TABLE IF NOT EXISTS lead_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES commissioners(id),
  action VARCHAR(50) NOT NULL, -- 'claim', 'unclaim', 'first_contact', 'invite_co_lead', 'status_change'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_actions_lead ON lead_actions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_actions_actor ON lead_actions(actor_id);

-- =======================
-- 3. DEVELOPER PROFILE ENHANCEMENTS
-- =======================

ALTER TABLE developers
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS mpesa_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS tech_stack TEXT[], -- Array of strings
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50) DEFAULT 'mid', -- junior, mid, senior
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS reliability_score DECIMAL(4,2) DEFAULT 5.00,
ADD COLUMN IF NOT EXISTS active_jobs_count INTEGER DEFAULT 0;

-- =======================
-- 4. PROJECT STATUS ALIGNMENT
-- =======================

-- Ensure project statuses match the client flow
-- We already have: 'lead', 'scoped', 'deposit_pending', 'active', 'in_review', 'completed', etc.
-- Adding a handy function to check guarantee eligibility

CREATE OR REPLACE FUNCTION is_guarantee_eligible(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Business logic: 110% guarantee applies if deposit paid and not yet completed/late
    RETURN TRUE; -- Simplified for demo
END;
$$ LANGUAGE plpgsql;
