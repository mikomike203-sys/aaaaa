# Deployment Guide - Netlify

## Quick Deploy to Netlify

### Option 1: Netlify CLI (Recommended for Quick Preview)

1. Install Netlify CLI globally:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy from project directory:
```bash
cd c:\Users\user\OneDrive\Desktop\agency
netlify deploy
```

4. For production deploy:
```bash
netlify deploy --prod
```

### Option 2: Netlify UI (For GitHub Integration)

1. Push your code to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/agency.git
git push -u origin main
```

2. Go to https://app.netlify.com

3. Click "Add new site" → "Import an existing project"

4. Select GitHub and choose your repository

5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** (leave empty)

6. Add environment variables in Netlify dashboard under "Site settings" → "Environment variables":
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-site.netlify.app
PAYSTACK_SECRET_KEY=your-paystack-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key
RESEND_API_KEY=your-resend-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

7. Click "Deploy site"

### Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Update NEXTAUTH_URL to your Netlify URL
- [ ] Update Google OAuth redirect URLs to include Netlify domain
- [ ] Update Paystack webhook URL to point to your Netlify domain
- [ ] Test login with Google OAuth
- [ ] Test payment flow
- [ ] Verify database connectivity

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Your Preview Link

Once deployed, your preview link will be:
`https://[site-name].netlify.app`

Share this link with stakeholders for review!
