# Database & Email Setup Guide

## 📊 Database Setup (Supabase)

Your database schema is already created in `supabase/migrations/001_initial_schema.sql` with **17 tables**!

### Step-by-Step Supabase Setup:

#### 1. Create Supabase Project

1. Go to **https://supabase.com**
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Fill in:
   - **Name:** Tech Developers Kenya
   - **Database Password:** (choose a strong password - save it!)
   - **Region:** Choose closest to Kenya (e.g., "Singapore" or "Frankfurt")
6. Click "Create new project" (takes 1-2 minutes)

#### 2. Run Database Migrations

Once your project is ready:

**Option A: Using Supabase Dashboard (Easiest)**

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy **ALL content** from `c:\Users\user\OneDrive\Desktop\agency\supabase\migrations\001_initial_schema.sql`
4. Paste into the SQL editor
5. Click "Run" (bottom right)
6. ✅ All 17 tables will be created!

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

#### 3. Add Seed Data (Demo Users)

1. In Supabase SQL Editor, click "New query"
2. Copy content from `c:\Users\user\OneDrive\Desktop\agency\supabase\seed.sql`
3. Paste and click "Run"
4. ✅ Demo users created (admin, commissioners, developers, clients)

#### 4. Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key
   - **service_role** key (secret)

#### 5. Update Your `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1..."
```

---

## 📧 Email Collection & Admin Features

### How Email Collection Works

#### 1. **Commissioner Creates Lead**

When a commissioner creates a lead in `/dashboard/commissioner`, they enter:
- Client Name
- **Client Email** ✅ (collected here!)
- Client Phone
- Project Summary
- Budget

**Code:** `app/api/leads/route.ts` - POST endpoint

**Database:** Saves to `leads` table with all client info

#### 2. **Automatic Email Sent**

The system automatically:
1. Generates a unique intake link (e.g., `/intake/abc123xyz`)
2. **Sends email to client** via Resend API with:
   - Project details
   - Commissioner info
   - Link to pay deposit

**Code:** `lib/email.ts` → `sendIntakeEmail()`

#### 3. **Client Opens Link & Pays**

Client receives email → clicks link → lands on intake page → pays with Paystack

#### 4. **Admin Gets Notified**

Once payment completes:
1. Webhook fires (`/api/webhooks/paystack`)
2. Payment record created (status: `pending_verification`)
3. **Admin receives email notification** via `sendPaymentReceiptEmail()`

---

## 🔧 Admin Features - How to Access

### 1. **Create Admin User**

**Option A: Use Seed Data**
The seed file already creates an admin user:
- Email: `admin@techdevelopers.ke`
- Password: You need to set this via Supabase Auth

**Option B: Manual Creation**

1. Go to Supabase → **Authentication** → **Users**
2. Click "Add user"
3. Enter:
   - Email: your-email@example.com
   - Password: (auto-generated or set your own)
4. Click "Create user"
5. Go to **Table Editor** → `users` table
6. Find your user
7. Edit the row:
   - Set `role` = `'admin'`
   - Set `verified` = `true`
8. Save

### 2. **Login as Admin**

1. Go to http://localhost:3000/login
2. Use email/password (or Google OAuth)
3. After login, navigate to: **http://localhost:3000/dashboard/admin**

### 3. **Admin Dashboard Features**

#### Payment Verification Panel
- See all **pending deposit verifications**
- View transaction details (ID, gateway, amount, client)
- **Verify** button → Creates escrow hold, activates project
- **Reject** button → Refund client

#### Escrow Ledger
- Track all escrow transactions:
  - HOLD (deposit verified)
  - RELEASE (milestone approved)
  - REFUND (cancellation)

#### Stats Overview
- Pending verifications count
- Active projects
- Total funds in escrow
- Platform revenue

---

## 📬 Email Configuration (Resend)

### Setup Resend API

1. Go to **https://resend.com**
2. Sign up/login
3. Go to **API Keys**
4. Click "Create API Key"
5. Copy the key (starts with `re_`)

### Add to `.env.local`

```bash
RESEND_API_KEY="re_your_api_key_here"
```

### Email Templates Already Created

All templates are in `lib/email.ts`:

1. **sendIntakeEmail()** - Send intake link to client
2. **sendPaymentReceiptEmail()** - Notify admin of new payment
3. **sendDepositVerifiedEmail()** - Notify client deposit is verified
4. **sendMilestoneReadyEmail()** - Notify client to approve milestone

---

## 🗄️ Database Tables (17 Total)

| Table | Purpose |
|-------|---------|
| `users` | All users (admin, commissioner, developer, client) |
| `companies` | Developer companies |
| `commissioners` | Commissioner profiles with tiers |
| `commissioner_referrals` | Referral tree (upline/downline) |
| `leads` | Leads created by commissioners |
| `projects` | Active projects with status |
| `milestones` | Project milestones (% and deliverables) |
| `payments` | All payment transactions |
| `escrow_ledger` | Immutable escrow transaction log |
| `commissions` | Commission payouts |
| `disputes` | Dispute cases |
| `meeting_requests` | Google Calendar meetings |
| `sms_logs` | SMS notification log |
| `email_logs` | Email notification log |
| `kyc_documents` | KYC uploads |
| `payout_schedules` | Developer payout scheduling |
| `audit_logs` | System-wide audit trail |

---

## 🚀 Quick Start Checklist

- [ ] Create Supabase project
- [ ] Run database migration (001_initial_schema.sql)
- [ ] Run seed data (seed.sql)
- [ ] Copy Supabase API keys to `.env.local`
- [ ] Sign up for Resend API
- [ ] Add Resend API key to `.env.local`
- [ ] Create admin user in Supabase Auth
- [ ] Set user role to 'admin' in users table
- [ ] Login at http://localhost:3000/login
- [ ] Access admin dashboard at http://localhost:3000/dashboard/admin

---

## 💡 Testing Email Collection

### Test Flow:

1. **Login as Commissioner** (use seed data or create one)
2. Go to http://localhost:3000/dashboard/commissioner
3. Click "Create Lead"
4. Fill form with:
   - Client Name: "Test Client"
   - **Client Email: your-email@gmail.com** ✅
   - Phone: "+254712345678"
   - Project: "Test Project"
   - Budget: "100000"
5. Click "Create & Get Link"
6. **Check your email!** You'll receive:
   - Subject: "Your Tech Developers Quote"
   - Body: Project details + intake link
7. Click link → land on intake page
8. Select payment method → pay via Paystack
9. **Admin gets email** with payment notification
10. **Login as admin** → verify payment

---

## 📊 Viewing Collected Emails in Admin

### Option 1: Supabase Dashboard

1. Go to Supabase → **Table Editor**
2. Click `leads` table
3. See all columns including `client_email`
4. Click `email_logs` table to see all sent emails

### Option 2: Admin Dashboard (Future Enhancement)

You can add a "Leads List" view to admin dashboard showing:
- All leads created
- Client emails
- Status (viewed, paid, active)
- Export to CSV

Would you like me to create this feature?

---

Need help with any step? Let me know! 🚀
