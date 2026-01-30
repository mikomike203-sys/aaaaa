-- Migration 006: Simplify Leads to Message-Based System
-- Remove requirement for intake_token and intake_link

-- Make intake_token and intake_link nullable (optional)
ALTER TABLE leads 
  ALTER COLUMN intake_token DROP NOT NULL,
  ALTER COLUMN intake_link DROP NOT NULL;

-- Add a note field for internal commissioner notes
ALTER TABLE leads 
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update existing leads to have NULL for these fields if they're just placeholders
UPDATE leads 
SET intake_token = NULL, intake_link = NULL 
WHERE status = 'created' AND client_email IS NULL;
