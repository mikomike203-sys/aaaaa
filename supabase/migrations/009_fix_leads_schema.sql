-- Migration 009: Fix Leads Schema
-- Add missing claimed_by and claimed_at columns if they don't exist

DO $$ 
BEGIN 
    -- Add claimed_by if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='claimed_by') THEN
        ALTER TABLE leads ADD COLUMN claimed_by UUID REFERENCES commissioners(id);
    END IF;

    -- Add claimed_at if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='claimed_at') THEN
        ALTER TABLE leads ADD COLUMN claimed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Index for claimed_by for faster lookups
    CREATE INDEX IF NOT EXISTS idx_leads_claimed_by ON leads(claimed_by);

END $$;
