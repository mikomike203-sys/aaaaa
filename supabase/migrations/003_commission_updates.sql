-- Migration 003: Commission System Updates

-- 1. Update Commissioner Tiers
-- We need to alter the enum. Postgres doesn't support ALTER TYPE ... ADD VALUE IF NOT EXISTS easily for replacing values.
-- Strategy: Rename check constraint or create new type and cast. 
-- Since this is a dev/prototype phase, we can try to just add the new values.
-- But 'tier1' -> 'bronze' mapping is needed.

ALTER TYPE commissioner_tier ADD VALUE IF NOT EXISTS 'bronze';
ALTER TYPE commissioner_tier ADD VALUE IF NOT EXISTS 'silver';
ALTER TYPE commissioner_tier ADD VALUE IF NOT EXISTS 'gold';

-- Update existing data mapping (Assumption: tier1=bronze, tier2=silver, tier3=gold)
UPDATE commissioners SET tier = 'bronze' WHERE tier::text = 'tier1';
UPDATE commissioners SET tier = 'silver' WHERE tier::text = 'tier2';
UPDATE commissioners SET tier = 'gold' WHERE tier::text = 'tier3';

-- 2. Update Leads Table to support Open Source (Public) leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE leads ALTER COLUMN commissioner_id DROP NOT NULL;

-- 3. Update Payouts for better tracking (if needed)
-- Add status 'rejected' to payout_status
ALTER TYPE payout_status ADD VALUE IF NOT EXISTS 'rejected';

-- 4. Add 'commission_cap_hit' flag to Payments or projects if we want to track it
-- For now, we'll calculate it on the fly, but let's add a note field to commissions
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS note TEXT;
