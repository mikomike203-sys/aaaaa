-- Tech Developers Kenya & East Africa - CRM & Messaging Extensions
-- Migration 002: CRM Messaging & Project Notes

-- =======================
-- MESSAGING SYSTEM
-- =======================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- If true, only admins/developers see it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =======================
-- CRM EXTENSIONS
-- =======================

-- Internal notes for CRM tracking
CREATE TABLE IF NOT EXISTS internal_project_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_project ON internal_project_notes(project_id);

-- Add lead_source and expected_closing_date to leads if not present
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='lead_source') THEN
        ALTER TABLE leads ADD COLUMN lead_source VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='expected_closing_date') THEN
        ALTER TABLE leads ADD COLUMN expected_closing_date DATE;
    END IF;
END $$;
