# 🛠️ Web4City Admin Dashboard Setup

## ✅ Admin Pages Available

The following admin dashboards are **already built** in your Web4City codebase:

### 1. **Ads Dashboard** (`/admin/ads`)
- Manage all advertiser campaigns
- Approve/reject/edit ads
- View impressions, clicks, CTR, conversions
- Batch operations (pause, delete, export)
- Revenue tracking

### 2. **Drops Dashboard** (`/admin/drops`)
- Create Creator Drops on buildings
- Set rarity (common, rare, epic, legendary)
- Configure duration and max pulls
- Track active drops and pull counts

---

## 🔐 Access Control

Admin pages are **protected** and only accessible to GitHub users listed in `.env.local`:

```bash
# Edit your .env.local file
ADMIN_GITHUB_LOGINS=eddiezebra
```

**To add multiple admins:**
```bash
ADMIN_GITHUB_LOGINS=eddiezebra,your-admin-2,another-admin
```

---

## ⚙️ Required Setup

### 1. **Configure `.env.local`**

You need these minimum variables for admin to work:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Access (REQUIRED)
ADMIN_GITHUB_LOGINS=eddiezebra

# GitHub API (REQUIRED for data fetching)
GITHUB_TOKEN=ghp_your-github-token
```

### 2. **Apply Supabase Migrations**

The admin dashboard requires these database tables:

```bash
# In your Supabase SQL Editor, run migrations from:
# supabase/migrations/*.sql
```

**Key tables needed:**
- `sky_ads` - Ad campaigns
- `advertiser_accounts` - Advertiser profiles
- `ad_events` - Impressions, clicks, conversions
- `creator_drops` - Drop rewards on buildings
- `developers` - Developer profiles (buildings)

### 3. **Login via GitHub OAuth**

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3002`
3. Click **"Sign in with GitHub"** (top right)
4. Authorize the app
5. Navigate to `http://localhost:3002/admin/ads`

**⚠️ Important:** Your GitHub username must match `ADMIN_GITHUB_LOGINS` exactly, or you'll be redirected to the homepage.

---

## 🎨 Branding (Web4City vs GitCity)

The admin dashboard is **already branded as Web4City** in your codebase:

- ✅ Title tags: "Web4City Admin"
- ✅ Logo references: Web4City
- ✅ Color scheme: Your theme (lime green accent)
- ✅ No GitCity branding visible

**Files checked:**
- `src/app/admin/ads/page.tsx`
- `src/app/admin/ads/_components/ads-dashboard.tsx`
- `src/app/admin/drops/page.tsx`
- `src/lib/admin.ts`

**No changes needed** — it's already Web4City branded! 🎉

---

## 🚀 Quick Start (Test Mode)

If you want to **test without Supabase** (mock data):

```bash
# Add to .env.local
MOCK_GITHUB=1
```

**⚠️ Warning:** Admin dashboard requires Supabase for auth and data. Mock mode only works for the main city view.

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Ads Dashboard** | ✅ Built | Needs Supabase + admin login |
| **Drops Dashboard** | ✅ Built | Needs Supabase + admin login |
| **Admin Auth** | ✅ Working | GitHub OAuth + whitelist |
| **API Routes** | ✅ Ready | `/api/admin/*` endpoints |
| **Branding** | ✅ Web4City | No GitCity references |

---

## 🐛 Troubleshooting

### "500 Error" on `/admin/ads`
**Cause:** Supabase not configured or missing tables  
**Fix:** Add Supabase credentials to `.env.local` and apply migrations

### "Redirected to homepage"
**Cause:** Your GitHub username not in `ADMIN_GITHUB_LOGINS`  
**Fix:** Add your username: `ADMIN_GITHUB_LOGINS=your-username`

### "No ads showing"
**Cause:** Database is empty (expected for fresh install)  
**Fix:** Create test ads via API or wait for advertisers to sign up

### "Missing tables" error
**Cause:** Supabase migrations not applied  
**Fix:** Run SQL migrations from `supabase/migrations/`

---

## 📁 File Locations

```
src/app/admin/
├── ads/
│   ├── page.tsx              # Main ads dashboard
│   ├── layout.tsx            # Admin auth guard
│   └── _components/          # Dashboard UI components
│       ├── ads-dashboard.tsx
│       ├── ad-table.tsx
│       ├── ad-filters.tsx
│       ├── summary-cards.tsx
│       └── ...
└── drops/
    ├── page.tsx              # Drops management
    └── layout.tsx            # Admin auth guard

src/app/api/admin/
├── ads/
│   └── ...                   # Ads CRUD endpoints
├── drops/
│   ├── route.ts              # Create/list drops
│   └── [id]/route.ts         # Delete drop
└── ...

src/lib/
└── admin.ts                  # Admin auth helpers
```

---

## ✅ Next Steps

1. **Add your GitHub username** to `ADMIN_GITHUB_LOGINS` in `.env.local`
2. **Configure Supabase** credentials in `.env.local`
3. **Apply Supabase migrations** (if not done)
4. **Restart dev server**: `npm run dev`
5. **Login** via GitHub OAuth at `http://localhost:3002`
6. **Access admin**: `http://localhost:3002/admin/ads`

---

**Ready to go, boss! Just need your Supabase credentials and you're in!** 🚀🐥
