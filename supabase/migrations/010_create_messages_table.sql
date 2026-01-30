-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can read messages if they are part of the project
CREATE POLICY "Users can read project messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = messages.project_id
    AND (
      p.client_id = (SELECT id FROM clients WHERE user_id = auth.uid()) OR
      p.commissioner_id = (SELECT id FROM commissioners WHERE user_id = auth.uid()) OR
      p.developer_id = (SELECT id FROM developers WHERE user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    )
  )
);

-- Create Policy: Users can insert messages if they are part of the project
CREATE POLICY "Users can insert project messages"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = messages.project_id
    AND (
      p.client_id = (SELECT id FROM clients WHERE user_id = auth.uid()) OR
      p.commissioner_id = (SELECT id FROM commissioners WHERE user_id = auth.uid()) OR
      p.developer_id = (SELECT id FROM developers WHERE user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin')
    )
  )
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
