# Consolidated Pending Tasks - Agency Platform

This document summarizes all unfinished or partially implemented plans from `implementation_plan.md`, `AVATAR_SYSTEM.md`, and `DEPLOYMENT.md`.

## 🛠️ 1. API & Backend Refinements

### Referral Logic Remediation
- [ ] **Cleanup `api/profile/route.ts`**: Remove `referral_code` from the commissioner select query (already dropped from the users table in migration 010).
- [ ] **Audit `api/auth/signup/route.ts`**: Ensure no residual referral logic remains in the signup flow.

### Feature Logic
- [ ] **Notification System implementation**: Complete the `TODO` in `api/auth/signup/route.ts` to send welcome/pending emails.
- [ ] **Profile API Expansion**: Update `api/profile/route.ts` to support the new fields added in migrations 006-009 (Bio, M-Pesa number, Portfolio URL, Github URL).

---

## 🖥️ 2. Frontend Development (Missing Pages)

### Core Missing Routes
- [ ] **Public Job Board**: Create `/app/jobs/page.tsx` to display open leads to the public/unauthenticated users.
- [ ] **Public User Profiles**: Create `/app/profile/[userId]/page.tsx` for shared project visibility.
- [ ] **Commissioner Profile**: Create `/app/commissioner/[userId]/page.tsx` specifically for showcasing commissioner track records.

### Contexts & State
- [ ] **Auth Context**: Create `contexts/AuthContext.tsx` to manage persistent session state and role-based redirect logic more reliably than raw `useSession`.

---

## 🎨 3. UI/UX & Component Integration

### Avatar System Integration
- [ ] **Integrate `UserAvatar` in TopBar**: Replace the letter-based initial display in `components/layout/topbar.tsx` with the `UserAvatar` component.
- [ ] **Integrate `UserAvatar` in Chat**: Update `components/dashboard/ProjectChat.tsx` and `MessageThread.tsx` to show sender avatars.
- [ ] **Profile Settings**: Ensure the `AvatarUpload` component is fully functional in `/dashboard/profile/page.tsx`.

### Navigation & Branding
- [ ] **Branding Audit**: Ensure "Nexus" branding is consistent across all dashboards (Sidebar says Nexus, Topbar says "Authorized User").
- [ ] **Link Validation**: Verify all routes in `components/layout/sidebar.tsx` exist (e.g., `dashboard/kb` leads to `dashboard/kb/page.tsx`).
- [ ] **Dark Mode Polish**: Verify contrast for the "card-soft" utility in `app/globals.css` for OLED displays.

---

## ✅ 4. Final Validation Items
- [ ] **Manual KYC Flow**: Verify that commissioners/developers cannot access projects until `verified` is TRUE (from `api/auth/signup` logic).
- [ ] **Project File Manager**: Verify that the `ProjectFileManager.tsx` component correctly connects to `/api/projects/[id]/files`.
