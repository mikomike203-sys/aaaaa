
-- Add checklist column to project_milestones
ALTER TABLE project_milestones 
ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Update RLS if needed (Milestones usually inherit project access, checking policies)
-- Assuming existing RLS allows dev update.

COMMENT ON COLUMN project_milestones.checklist IS 'List of tasks for this milestone. Format: [{id, text, completed}]';
