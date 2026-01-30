# 🚀 Final Setup & Deployment Guide

To get your platform live on your new Supabase and Netlify, follow these 3 simple steps.

---

## 1. Initialize your Database (Supabase)
Since you have a brand new Supabase project, you need to create the tables and your first Admin account.

1.  Go to your [Supabase Dashboard](https://supabase.com).
2.  Open **SQL Editor** in the left sidebar.
3.  Click **"New Query"**.
4.  Copy and paste the entire content of [initial_schema.sql](file:///c:/Users/user/OneDrive/Desktop/agency/supabase/migrations/001_initial_schema.sql) and click **Run**.
5.  After that, paste and run this SQL to create your **Admin Account**:
    ```sql
    INSERT INTO users (email, name, role, verified)
    VALUES ('admin@techdevelopers.ke', 'Admin User', 'admin', true);
    ```
    *Note: Currently, the system allows login for any email that exists in the database. I will add password hashing in the next step!*

---

## 2. Get your Service Role Key
I still need one more key to make Admin functions work:
1.  Go to **Project Settings** > **API**.
2.  Find the key labeled **`service_role`** (it's secret, don't share publicly).
3.  Paste it here for me.

---

## 3. Quick Deploy to Netlify
Once the database is ready, run these commands in your terminal:

```bash
# 1. Install Netlify CLI if you haven't
npm install -g netlify-cli

# 2. Login to Netlify
netlify login

# 3. Deploy
netlify init
```

### 🔑 Your Credentials (Local)
*   **Login URL:** `http://localhost:3000/login`
*   **Admin Email:** `admin@techdevelopers.ke`
*   **Default Password:** *(Not required yet, just enter the email)*

---

> [!IMPORTANT]
> The reason you saw the "Sign Up" page is because the database was empty. Once you run the SQL above, you can log in as Admin!
