# Tech Developers — Kenya & East Africa

Complete marketplace platform connecting clients, commissioners, and verified developers with escrow-protected payments.

## 🚀 What's Been Built

### ✅ Database & Schema
- **17 comprehensive tables** in PostgreSQL (Supabase)
- Full migration file: `supabase/migrations/001_initial_schema.sql`
- Seed data with demo users, commissioners, developers
- Audit logging, escrow ledger, payment tracking

### ✅ Payment Integrations
- **Stripe** (Visa/Mastercard with 3D Secure)
- **Flutterwave** (M-Pesa + local cards)
- **Coinbase Commerce** (Crypto: USDT, USDC, BTC, ETH)
- All with webhook verification and fraud checks

### ✅ Escrow Engine
- 43% deposit held in platform escrow
- Admin verification workflow
- Commission calculation (25-30% to commissioner, 5% referral override, 10% platform fee, 1.5% reserve)
- 110% refund guarantee system
- Release on milestone approval

### ✅ API Endpoints
- `POST /api/leads` - Create lead & generate intake link
- `GET /api/intake/[token]` - Fetch intake page data
- `POST /api/payments/checkout` - Multi-method payment
- `POST /webhooks/stripe` - Stripe webhooks
- `POST /api/admin/payments/[id]/verify` - Admin verify deposit

### ✅ Frontend Pages
- **Home** page with hero, trust signals, how-it-works
- **Intake** page (mobile-first, payment selection)
- Commissioner, client, admin dashboards (in progress)

### ✅ Communication
- Email templates (Resend) for receipts, milestones, intake links
- SMS ready (Twilio/Africa's Talking)
- In-app notifications

## 📁 Project Structure

```
agency/
├── app/
│   ├── page.tsx                    # Home page
│   ├── intake/[token]/page.tsx     # Client intake page
│   └── api/
│       ├── leads/route.ts          # Create & list leads
│       ├── intake/[token]/route.ts # Intake data
│       ├── payments/checkout/route.ts # Payment init
│       ├── webhooks/stripe/route.ts   # Stripe events
│       └── admin/payments/[id]/verify/route.ts # Admin verify
├── lib/
│   ├── db.ts                       # Database queries
│   ├── escrow.ts                   # Escrow & calculations
│   ├── email.ts                    # Email templates
│   └── payments/
│       ├── stripe.ts
│       ├── flutterwave.ts
│       └── coinbase.ts
├── types/index.ts                  # TypeScript definitions
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   └── seed.sql
└── .env.example                    # Environment variables template
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Run the migration:
   ```sql
   -- Copy contents of supabase/migrations/001_initial_schema.sql
   -- Paste into Supabase SQL Editor and run
   ```
3. Run seed data (optional):
   ```sql
   -- Copy contents of supabase/seed.sql
   -- Paste into SQL Editor and run
   ```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your credentials (see `.env.example` for full list)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Core Business Rules

| Rule | Value |
|------|-------|
| Deposit | 43% upfront |
| Platform Fee | 10% |
| Reserve | 1.5% |
| Commissioner Commission | 25-30% (tier-based) |
| Referral Override | 5% |
| Refund Guarantee | 110% |

## 🎯 How It Works

1. **Commissioner creates lead** → generates unique intake link
2. **Client opens intake link** → sees project summary, commissioner info
3. **Client pays 43% deposit** → via Stripe, Flutterwave (M-Pesa), or Coinbase (crypto)
4. **Payment webhook fires** → creates payment record with `pending_verification`
5. **Admin verifies payment** → creates escrow hold, activates project
6. **Developer delivers milestones** → client approves in dashboard
7. **On completion** → escrow releases, commission auto-calculated and paid out

## 🚧 To-Do / Next Steps

### High Priority
- [ ] Client dashboard (view projects, approve milestones)
- [ ] Commissioner dashboard (leads, pipeline, earnings)
- [ ] Admin dashboard (pending verifications, escrow viewer, disputes)
- [ ] Developer dashboard (project queue, deliverables upload)
- [ ] Authentication (NextAuth.js or Supabase Auth)

### Medium Priority
- [ ] Google Calendar integration
- [ ] SMS notifications
- [ ] Referral tree visualization
- [ ] Dispute resolution workflow
- [ ] Company CRM/HR modules

## 📄 License

Proprietary - Tech Developers Kenya & East Africa
