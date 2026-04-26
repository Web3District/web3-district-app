# 🛠️ Web4City - Complete Setup Checklist

_Your Supabase project needs these configurations to work properly._

---

## ✅ COMPLETED

- [x] **Supabase credentials added to `.env.local`**
  - Project: `rhppbqsuktyunxfwnddp`
  - URL: `https://rhppbqsuktyunxfwnddp.supabase.co`
  - Anon Key: ✅ Added
  - Service Role Key: ✅ Added

- [x] **Admin access configured**
  - `ADMIN_GITHUB_LOGINS=eddiezebra`
  - Admin login page created: `/admin/login`

- [x] **Server running**
  - Port: 3002
  - Status: ✅ Online

---

## ❌ MISSING / NEEDS SETUP

### 1. **GitHub OAuth in Supabase** ⚠️ **BLOCKING**

**Error:** `{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}`

**Fix:** Enable GitHub OAuth in Supabase

#### Steps:

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/auth/providers
   ```

2. **Enable GitHub Provider:**
   - Click **GitHub** → Toggle **Enable**
   - Fill in:
     - **Client ID:** (from GitHub OAuth App - see below)
     - **Client Secret:** (from GitHub OAuth App - see below)
   - Click **Save**

3. **Create GitHub OAuth App:**
   - Go to: https://github.com/settings/developers
   - Click **"New OAuth App"**
   - Fill in:
     ```
     Application name: Web4City
     Homepage URL: http://localhost:3002
     Authorization callback URL: https://rhppbqsuktyunxfwnddp.supabase.co/auth/v1/callback
     ```
   - Click **Register application**
   - Copy **Client ID** and generate **Client Secret**
   - Paste both into Supabase GitHub provider settings

4. **Test:**
   - Go to http://localhost:3002/admin/login
   - Click "Sign in with GitHub"
   - Should redirect to GitHub OAuth → Success! ✅

---

### 2. **Supabase Database Tables** ⚠️ **REQUIRED**

**Check if tables exist:**

```
https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/editor
```

**Required tables:**

| Table | Purpose |
|-------|---------|
| `developers` | GitHub profiles as buildings |
| `sky_ads` | Advertiser campaigns |
| `advertiser_accounts` | Advertiser profiles |
| `ad_events` | Impressions, clicks, conversions |
| `creator_drops` | Drop rewards on buildings |
| `achievements` | User achievements |
| `notifications` | User notifications |
| `referrals` | Referral tracking |

**If tables are missing:**

1. Go to: https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/sql
2. Run migrations from: `supabase/migrations/*.sql` (if they exist in repo)
3. Or check if there's a `schema.sql` file in the repo root

---

### 3. **GitHub Token (for API calls)** ⚠️ **RECOMMENDED**

**For fetching GitHub data (repos, stars, contributions):**

1. **Create Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click **"Generate new token (classic)"**
   - Scopes: `public_repo`, `read:user`, `user:email`
   - Copy token

2. **Add to `.env.local`:**
   ```bash
   GITHUB_TOKEN=ghp_your-token-here
   ```

3. **Restart server**

---

### 4. **Storage Bucket (for uploads)** ⚠️ **OPTIONAL**

**For user avatars, ad creatives, etc:**

1. **Create bucket in Supabase:**
   ```
   https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/storage
   ```
2. Click **"New bucket"**
3. Name: `city-data` (or check code for exact name)
4. Set to **Public** (if needed)

5. **Add storage policies:**
   ```sql
   -- Allow public read
   CREATE POLICY "Public Read" ON storage.objects
   FOR SELECT USING (true);
   
   -- Allow authenticated upload
   CREATE POLICY "Authenticated Upload" ON storage.objects
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

---

### 5. **Environment Variables Review**

**Check `.env.local` has all required:**

```bash
# ✅ Required
NEXT_PUBLIC_SUPABASE_URL=https://rhppbqsuktyunxfwnddp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (full key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (full key)
ADMIN_GITHUB_LOGINS=eddiezebra

# ⚠️ Recommended
GITHUB_TOKEN=ghp_... (for GitHub API)

# ❌ Optional (add if needed)
STRIPE_SECRET_KEY=sk_test_... (payments)
RESEND_API_KEY=re_... (emails)
OPENAI_API_KEY=sk-... (AI features)
```

---

### 6. **Test Authentication Flow**

**After enabling GitHub OAuth:**

1. **Clear browser cache/cookies** (old failed attempts)
2. **Go to:** http://localhost:3002/admin/login
3. **Click:** "Sign in with GitHub"
4. **Authorize** the app
5. **Should redirect to:** http://localhost:3002/admin/ads
6. **See:** Dashboard with ads table (may be empty)

---

### 7. **Seed Data (Optional)**

**If database is empty:**

Check if there's a seed script:

```bash
cd /Users/eduardomarques/web3-district-app
npm run seed
# or
npx tsx scripts/seed.ts
```

Or manually add test data via Supabase dashboard.

---

## 🚀 QUICK START (Priority Order)

**Do these IN ORDER:**

1. **Enable GitHub OAuth in Supabase** (10 min)
   - Create GitHub OAuth App
   - Add credentials to Supabase
   - Test login

2. **Check database tables exist** (5 min)
   - Go to Supabase editor
   - Verify tables from section 2

3. **Add GitHub token** (2 min)
   - Create personal access token
   - Add to `.env.local`
   - Restart server

4. **Test admin dashboard** (2 min)
   - Login via GitHub
   - Check ads/drops pages load

---

## 📁 File Locations

```
/Users/eduardomarques/web3-district-app/
├── .env.local                    ← Environment variables
├── package.json                  ← Scripts & deps
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── ads/              ← Ads dashboard
│   │   │   ├── drops/            ← Drops dashboard
│   │   │   └── login/            ← Login page (NEW!)
│   │   ├── auth/
│   │   │   └── callback/         ← OAuth callback
│   │   └── api/
│   │       ├── auth/             ← Auth endpoints
│   │       └── admin/            ← Admin APIs
│   └── lib/
│       ├── supabase.ts           ← Supabase client
│       ├── supabase-server.ts    ← Server Supabase
│       ├── admin.ts              ← Admin auth helpers
│       └── github-api.ts         ← GitHub API calls
└── supabase/
    └── migrations/               ← SQL migrations (if any)
```

---

## 🐛 Troubleshooting

### "Provider is not enabled"
→ Enable GitHub OAuth in Supabase (section 1)

### "Table does not exist"
→ Run migrations or create tables manually

### "Cannot read properties of null"
→ Database is empty → seed data or add manually

### "Redirect loop"
→ Clear browser cookies, check `ADMIN_GITHUB_LOGINS`

### "500 Internal Server Error"
→ Check server logs in terminal, verify Supabase keys

---

## ✅ Done When...

- [ ] GitHub OAuth enabled in Supabase
- [ ] Login works (no "provider not enabled" error)
- [ ] Admin dashboard loads at `/admin/ads`
- [ ] Can see/create ads and drops
- [ ] Main city page shows buildings (http://localhost:3002)

---

**Ready to tackle this, boss? Start with GitHub OAuth (section 1)!** 🚀🐥
