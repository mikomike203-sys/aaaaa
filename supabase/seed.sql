-- Seed Data for Tech Developers Kenya & East Africa
-- Demo/Test Data

-- =======================
-- USERS
-- =======================

INSERT INTO users (id, email, name, phone, role, verified, password_hash) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@techdev.ke', 'Admin User', '+254700000001', 'admin', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000002', 'esther@commissions.ke', 'Esther Njeri', '+254700000002', 'commissioner', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000003', 'paul@commissions.ke', 'Paul Kimani', '+254700000003', 'commissioner', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000004', 'grace@commissions.ke', 'Grace Wanjiku', '+254700000004', 'commissioner', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000005', 'aisha@devteam.co', 'Aisha Dube', '+254700000005', 'developer', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000006', 'james@devteam.co', 'James Omondi', '+254700000006', 'developer', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000007', 'client1@greenschool.ke', 'Green School Ltd', '+254700000007', 'client', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea'),
('00000000-0000-0000-0000-000000000008', 'client2@retailcorp.ke', 'Retail Corp', '+254700000008', 'client', true, 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea');

-- =======================
-- COMPANIES
-- =======================

INSERT INTO companies (id, name, type, tax_id) VALUES
('10000000-0000-0000-0000-000000000001', 'DevTeam Solutions', 'software_development', 'KE123456789'),
('10000000-0000-0000-0000-000000000002', 'CodeCraft Africa', 'software_development', 'KE987654321');

-- =======================
-- COMMISSIONERS
-- =======================

INSERT INTO commissioners (user_id, tier, rate_percent, referral_code, parent_commissioner_id, kyc_status) VALUES
('00000000-0000-0000-0000-000000000002', 'tier1', 25.00, 'ESTHER2024', NULL, 'approved'),
('00000000-0000-0000-0000-000000000003', 'tier2', 27.00, 'PAUL2024', NULL, 'approved'),
('00000000-0000-0000-0000-000000000004', 'tier1', 25.00, 'GRACE2024', '00000000-0000-0000-0000-000000000002', 'approved');

-- =======================
-- DEVELOPERS
-- =======================

INSERT INTO developers (user_id, company_id, roles, hourly_rate, verified, kyc_status) VALUES
('00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 
'["frontend", "crm", "ui_ux"]'::jsonb, 50.00, true, 'approved'),
('00000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', 
'["backend", "mobile", "payment_integration"]'::jsonb, 60.00, true, 'approved');

-- =======================
-- CLIENTS
-- =======================

INSERT INTO clients (user_id, company_name, contact_person) VALUES
('00000000-0000-0000-0000-000000000007', 'Green School Limited', 'John Kamau'),
('00000000-0000-0000-0000-000000000008', 'Retail Corp Kenya', 'Mary Akinyi');

-- =======================
-- REFERRALS
-- =======================

INSERT INTO referrals (referrer_id, referee_id, override_percent) VALUES
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 5.00);

-- =======================
-- AUDIT LOGS (sample)
-- =======================

INSERT INTO audit_logs (actor_id, actor_role, action, details) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'system_initialized', '{"message": "Test data seeded"}'::jsonb);
