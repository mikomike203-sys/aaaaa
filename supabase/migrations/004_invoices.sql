-- Migration 004: Invoices and Communications

-- =======================
-- INVOICES (Approval Workflow)
-- =======================

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'pending_approval', 'approved', 'paid', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  client_id UUID REFERENCES users(id), /* The user receiving the invoice */
  commissioner_id UUID REFERENCES commissioners(id), /* The creator */
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'KES',
  description TEXT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  status invoice_status DEFAULT 'draft',
  
  -- Metadata for Paystack
  paystack_reference VARCHAR(100),
  paystack_url TEXT,
  
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES users(id), /* Admin who approved it */
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);


-- =======================
-- MESSAGES (Communication Hub)
-- =======================
-- Ensuring the messages table exists (from 002, but reinforcing for new client features)

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID REFERENCES users(id), -- Null means "Project Broadcast" (everyone in project sees it)
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT FALSE, -- If true, hidden from client
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Enable Realtime for Messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
