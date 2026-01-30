# Quick Reference: Email & Admin Flow

## 📧 How Emails Are Collected

```
Commissioner Dashboard
        ↓
"Create Lead" Button
        ↓
Form appears with fields:
  - Client Name
  - Client Email ← COLLECTED HERE ✅
  - Client Phone
  - Project Summary
  - Budget
        ↓
Click "Create & Get Link"
        ↓
System does 3 things:
  1. Saves to database (`leads` table)
  2. Generates unique link (e.g., /intake/abc123)
  3. Sends email to client via Resend API
        ↓
Client receives email with:
  - Project details
  - Commissioner info
  - Payment link
        ↓
Client clicks link → Pays with Paystack
        ↓
Admin gets notification email
        ↓
Admin verifies in dashboard
```

## 🔐 Admin Access - Quick Steps

### Step 1: Setup Database
```bash
1. Go to https://supabase.com
2. Create new project
3. Copy SQL from: supabase/migrations/001_initial_schema.sql
4. Paste in Supabase SQL Editor
5. Click "Run"
✅ 17 tables created!
```

### Step 2: Create Admin User
```bash
1. In Supabase → Authentication → Users
2. Click "Add user"
3. Enter your email + password
4. Go to Table Editor → users table
5. Find your user → Edit
6. Change: role = 'admin'
7. Save
```

### Step 3: Login
```bash
1. Go to: http://localhost:3000/login
2. Enter your email/password
3. Navigate to: http://localhost:3000/dashboard/admin
```

## 📊 Where Emails Are Stored

### Database Tables:

1. **`leads` table** - All client info
   - `client_name`
   - `client_email` ← Email stored here
   - `client_phone`
   - `project_summary`
   - `budget`

2. **`email_logs` table** - Sent emails
   - `recipient_email`
   - `subject`
   - `template_type`
   - `sent_at`
   - `status`

3. **`users` table** - All registered users
   - `email` ← When users sign up
   - `role` (admin, commissioner, developer, client)

## 🎯 Admin Dashboard Features

### What You'll See:

```
┌─────────────────────────────────────────┐
│         ADMIN DASHBOARD                 │
├─────────────────────────────────────────┤
│                                         │
│  [5] Pending Verifications              │
│  [28] Active Projects                   │
│  [KES 2.1M] Total in Escrow            │
│  [KES 450K] Platform Revenue            │
│                                         │
├─────────────────────────────────────────┤
│  PAYMENTS PENDING VERIFICATION          │
├─────────────────────────────────────────┤
│  Green School Ltd - Deposit             │
│  KES 215,000 (43% deposit)             │
│  Transaction: PST_abc123               │
│  Client: client@greenschool.ke         │
│                                         │
│  [Verify & Create Escrow]  [Reject]    │
├─────────────────────────────────────────┤
│  ESCROW LEDGER                          │
├─────────────────────────────────────────┤
│  ✅ Hold Created - KES 215,000          │
│  💰 Funds Released - KES 120,000        │
│  ⚠️ Refund Issued - KES 165,000         │
└─────────────────────────────────────────┘
```

## 🔑 Environment Variables Needed

Copy to your `.env.local`:

```bash
# Already set:
PAYSTACK_SECRET_KEY="your-paystack-live-secret-key"
PAYSTACK_PUBLIC_KEY="your-paystack-live-public-key"

# You need to add:
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-key"
RESEND_API_KEY="re_your_key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## ⚡ Next Steps

1. ✅ Your site is running: http://localhost:3000
2. ⏱️ Setup Supabase (5 minutes)
3. ⏱️ Get Resend API key (2 minutes)
4. ⏱️ Create admin user (1 minute)
5. ✅ Start testing!

**Full guide:** See `DATABASE_SETUP.md`
