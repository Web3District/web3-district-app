# 🖥️ Web4City Admin - Mac App Features

**Version:** 1.0.0
**Platform:** macOS (Apple Silicon)
**Location:** `/Applications/Web4City Admin.app`

---

## 📋 ALL ADMIN PAGES INCLUDED

| # | Page | Shortcut | Description |
|---|------|----------|-------------|
| **1** | **Dashboard** | `Cmd+1` | Main admin panel with overview |
| **2** | **Ads Manager** | `Cmd+2` | Manage ad campaigns, track impressions/clicks |
| **3** | **Drops** | `Cmd+3` | Manage building drops and rewards |
| **4** | **Email Monitoring** | `Cmd+4` | Monitor email verification status |
| **5** | **Jobs** | `Cmd+5` | Manage job listings |
| **6** | **Landmarks** | `Cmd+6` | Manage city landmarks |

---

## 🎯 PAGE DETAILS

### 1. Dashboard (`/admin`)
**Purpose:** Main admin control panel
**Features:**
- Admin authentication check
- Overview of all admin features
- Quick links to all pages
- Sign out option

---

### 2. Ads Manager (`/admin/ads`)
**Purpose:** Full ad campaign management
**Features:**
- ✅ Create/Edit/Delete ads
- ✅ Set vehicle type (plane, blimp, billboard, rooftop_sign, led_wrap)
- ✅ Configure colors, priority, active status
- ✅ Track impressions, clicks, CTR
- ✅ Filter by status, vehicle, source
- ✅ Batch operations (pause, resume, delete)
- ✅ Real-time analytics

**Database:** `sky_ads` table

---

### 3. Drops (`/admin/drops`)
**Purpose:** Manage building drops and rewards
**Features:**
- Create/edit/delete drops
- Configure drop rates
- Set rarity levels
- Track drop statistics
- Manage reward pools

---

### 4. Email Monitoring (`/admin/email-monitoring`)
**Purpose:** Monitor email verification status
**Features:**
- View pending verifications
- Check email delivery status
- Monitor bounce rates
- Resend verification emails
- Track email engagement

---

### 5. Jobs (`/admin/jobs`)
**Purpose:** Manage job listings
**Features:**
- Post new jobs
- Edit existing listings
- Track applications
- Manage job categories
- Set job status (active/closed)

---

### 6. Landmarks (`/admin/landmarks`)
**Purpose:** Manage city landmarks
**Features:**
- Create/edit/delete landmarks
- Set landmark positions
- Configure landmark benefits
- Manage landmark ownership
- Track landmark usage

---

## 🔐 AUTHENTICATION

**Method:** GitHub OAuth
**Admin Users:** Configured in `NEXT_PUBLIC_ADMIN_GITHUB_LOGINS`
**Default:** `eddiezebra`

**Login Flow:**
1. Open app → redirects to `/admin/login`
2. Click "Login with GitHub"
3. Authorize app
4. Redirects to dashboard
5. Access all admin pages

---

## 🎨 UI/UX

**Theme:** Web4City Neon (Pink #ed0584)
**Style:** Dark mode, pixel font
**Layout:** Responsive grid
**Navigation:** 
- Menu bar (Cmd+1-6)
- Dashboard links
- Breadcrumb navigation

---

## 🚀 TECHNICAL DETAILS

**Framework:** Electron 30 + Next.js
**Backend:** Supabase (PostgreSQL)
**Auth:** Supabase Auth (GitHub OAuth)
**Deployment:** Vercel (production)
**Local Dev:** `npm run dev` (port 3002)

**App Structure:**
```
/Applications/Web4City Admin.app/
└── Contents/
    ├── MacOS/
    ├── Frameworks/
    └── Resources/
        ├── app.asar
        ├── icon.png
        └── main.js
```

---

## 📊 ADMIN CAPABILITIES

| Feature | Status |
|---------|--------|
| **Ads Management** | ✅ Full CRUD |
| **Drops Management** | ✅ Full CRUD |
| **Email Monitoring** | ✅ Read + Actions |
| **Jobs Management** | ✅ Full CRUD |
| **Landmarks Management** | ✅ Full CRUD |
| **User Analytics** | ✅ Via Supabase |
| **Database Access** | ✅ Service Role |
| **API Orchestration** | ✅ Full Access |

---

## 🔧 QUICK ACTIONS

### Create Ad (API)
```bash
curl -X POST "https://rhppbqsuktyunxfwnddp.supabase.co/rest/v1/sky_ads" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"my-ad","brand":"Brand","text":"Ad Text","vehicle":"plane","active":true}'
```

### Check Ads in DB
```bash
curl "https://rhppbqsuktyunxfwnddp.supabase.co/rest/v1/sky_ads?select=id,brand,text,vehicle,active" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY"
```

---

## 📝 NOTES

- All pages require admin authentication
- Changes reflect in city within 60 seconds (auto-refresh)
- Ads are cached for reliability
- Service Role key bypasses RLS for admin operations
- API Access document: `shared/API-ACCESS.md`

---

**Last Updated:** 2026-05-10
**Maintained By:** 🐥 Pint0
**App Version:** 1.0.0 (macOS ARM64)
