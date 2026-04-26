# 🎯 Web4City - COMPLETE Setup Guide (GitCity Clone)

_Everything you need for a PERFECT clone of GitCity with all features working._

---

## 📊 STATUS OVERVIEW

| Service | Status | Priority |
|---------|--------|----------|
| **Supabase** | ✅ Configured | 🔴 CRITICAL |
| **GitHub OAuth** | ✅ Enabled | 🔴 CRITICAL |
| **PartyKit (Multiplayer)** | ❌ Not Setup | 🟡 HIGH |
| **Stripe (Payments)** | ❌ Not Setup | 🟡 HIGH |
| **Resend (Emails)** | ❌ Not Setup | 🟢 MEDIUM |
| **Himetrica (Analytics)** | ❌ Not Setup | 🟢 MEDIUM |
| **GitHub Token (API)** | ❌ Not Setup | 🟡 HIGH |
| **NowPayments (Crypto)** | ❌ Not Setup | 🟢 LOW |
| **AbacatePay (BRL)** | ❌ Not Setup | 🟢 LOW |

---

## 🔴 CRITICAL (App Won't Work Without)

### 1. **Supabase** ✅ DONE

**Status:** Configured  
**Project:** `rhppbqsuktyunxfwnddp`  
**URL:** `https://rhppbqsuktyunxfwnddp.supabase.co`

**What it does:**
- User authentication (GitHub OAuth)
- Database (developers, ads, drops, achievements)
- Real-time subscriptions
- File storage

**✅ Already configured:**
- Client ID: `Ov23liBVWyEY52Xl4rQX`
- Client Secret: `91f43f0426d8091de9e7cba6ee8f8099aeb0c411`
- GitHub OAuth enabled

**⚠️ Still needed:**
- [ ] Verify database tables exist (run migrations)
- [ ] Create storage bucket `city-data`

---

### 2. **GitHub OAuth App** ✅ DONE

**Status:** Created  
**App Name:** Web4City  
**Client ID:** `Ov23liBVWyEY52Xl4rQX`

**✅ Already configured:**
- Homepage: `https://web4city.xyz`
- Callback: `https://rhppbqsuktyunxfwnddp.supabase.co/auth/v1/callback`
- Connected to Supabase

---

### 3. **GitHub Personal Access Token** ❌ MISSING

**Priority:** HIGH (for fetching GitHub data)

**What it does:**
- Fetches GitHub user data (repos, stars, contributions)
- Creates buildings from GitHub profiles
- Required for city generation

**Setup:**

1. **Go to:** https://github.com/settings/tokens
2. **Click:** "Generate new token (classic)"
3. **Scopes needed:**
   - ✅ `public_repo`
   - ✅ `read:user`
   - ✅ `user:email`
4. **Copy token** (starts with `ghp_`)
5. **Add to `.env.local`:**
   ```bash
   GITHUB_TOKEN=ghp_your-token-here
   ```
6. **Restart server**

---

## 🟡 HIGH PRIORITY (Core Features)

### 4. **PartyKit** ❌ MISSING

**Priority:** HIGH (multiplayer features)

**What it does:**
- Real-time player presence (see other users online)
- Live player counts in arcade
- Multiplayer game rooms
- Real-time chat/effects

**Setup:**

1. **Sign up:** https://www.partykit.io/
2. **Create new app:**
   - Name: `web4city`
   - Region: Choose closest to you (Europe: `fra`)
3. **Get your Host URL:**
   - Dashboard → Your app → Copy host URL
   - Looks like: `web4city.yourusername.partykit.dev`

4. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_PARTYKIT_HOST=web4city.yourusername.partykit.dev
   ```

5. **Deploy PartyKit server:**
   ```bash
   cd /Users/eduardomarques/web3-district-app
   npm install -g partykit
   partykit dev
   ```

**Features that need PartyKit:**
- `/arcade` - Live player counts
- `/arcade/[slug]` - Multiplayer game rooms
- Real-time effects (pool_party, lightning_aura, etc.)
- User presence indicators

---

### 5. **Stripe** ❌ MISSING

**Priority:** HIGH (if you want payments)

**What it does:**
- Advertiser payments for campaigns
- Premium features (if any)
- Subscription billing

**Setup:**

1. **Sign up:** https://stripe.com
2. **Get API keys:**
   - Dashboard → Developers → API keys
   - Copy `Secret key` (starts with `sk_test_`)
   - Create webhook endpoint → Copy `Signing secret` (starts with `whsec_`)

3. **Add to `.env.local`:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_your-key-here
   STRIPE_WEBHOOK_SECRET=whsec_your-secret-here
   ```

4. **Create webhook endpoint:**
   - URL: `https://web4city.xyz/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `customer.subscription.*`

**Features that need Stripe:**
- `/ads` - Advertiser campaign payments
- Premium building upgrades (if implemented)

---

## 🟢 MEDIUM PRIORITY (Nice to Have)

### 6. **Resend** ❌ MISSING

**Priority:** MEDIUM (email notifications)

**What it does:**
- Email notifications (ad expiry, achievements)
- Password reset emails
- Welcome emails

**Setup:**

1. **Sign up:** https://resend.com
2. **Get API key:** Dashboard → API Keys
3. **Add domain** (for sending from your domain)
4. **Add to `.env.local`:**
   ```bash
   RESEND_API_KEY=re_your-key-here
   RESEND_WEBHOOK_SECRET=your-secret
   ```

**Features that need Resend:**
- Ad expiry notifications
- Achievement emails
- Referral notifications

---

### 7. **Himetrica** ❌ MISSING

**Priority:** MEDIUM (analytics)

**What it does:**
- Anonymous usage analytics
- Performance monitoring
- Error tracking

**Setup:**

1. **Sign up:** https://himetrica.com (or check if it's self-hosted)
2. **Get API key**
3. **Add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_HIMETRICA_API_KEY=hm_your-key-here
   ```

**Features that need Himetrica:**
- Usage analytics
- Performance vitals
- Error tracking

---

## 🟢 LOW PRIORITY (Optional Payments)

### 8. **NowPayments** ❌ MISSING

**Priority:** LOW (crypto payments alternative)

**What it does:**
- Crypto payment processing
- Alternative to Stripe for international users

**Setup:**

1. **Sign up:** https://nowpayments.io
2. **Get API key** from dashboard
3. **Add to `.env.local`:**
   ```bash
   NOWPAYMENTS_API_KEY=your-api-key
   NOWPAYMENTS_IPN_SECRET=your-ipn-secret
   NOWPAYMENTS_SANDBOX=true
   ```

---

### 9. **AbacatePay** ❌ MISSING

**Priority:** LOW (BRL payments for Brazil)

**What it does:**
- Brazilian Real (BRL) payment processing
- PIX payments

**Setup:**

1. **Sign up:** https://abacatepay.com.br (or similar)
2. **Get API key**
3. **Add to `.env.local`:**
   ```bash
   ABACATEPAY_API_KEY=abc_dev_your-key
   ABACATEPAY_WEBHOOK_SECRET=your-secret
   ```

---

## 📋 COMPLETE .env.local TEMPLATE

```bash
# === APP ===
NEXT_PUBLIC_BASE_URL=http://localhost:3002
NEXT_PUBLIC_APP_URL=https://web4city.xyz
NEXT_PUBLIC_SITE_URL=https://web4city.xyz

# === SUPABASE (CRITICAL) ✅ DONE ===
NEXT_PUBLIC_SUPABASE_URL=https://rhppbqsuktyunxfwnddp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTMyODcsImV4cCI6MjA5MjY4OTI4N30.9RvTGhTF3h1npf7F9cj_4-i0ifOKjg1atbryI_b81rU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak

# === GITHUB (CRITICAL) ❌ MISSING ===
GITHUB_TOKEN=ghp_your-personal-access-token-here
ADMIN_GITHUB_LOGINS=eddiezebra

# === PARTYKIT (HIGH) ❌ MISSING ===
NEXT_PUBLIC_PARTYKIT_HOST=web4city.yourusername.partykit.dev

# === STRIPE (HIGH) ❌ MISSING ===
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# === RESEND (MEDIUM) ❌ MISSING ===
RESEND_API_KEY=re_your-resend-key
RESEND_WEBHOOK_SECRET=your-webhook-secret

# === HIMETRICA (MEDIUM) ❌ MISSING ===
NEXT_PUBLIC_HIMETRICA_API_KEY=hm_your-api-key

# === NOWPAYMENTS (LOW) ❌ MISSING ===
NOWPAYMENTS_API_KEY=your-api-key
NOWPAYMENTS_IPN_SECRET=your-ipn-secret
NOWPAYMENTS_SANDBOX=true

# === ABACATEPAY (LOW) ❌ MISSING ===
ABACATEPAY_API_KEY=abc_dev_your-key
ABACATEPAY_WEBHOOK_SECRET=your-webhook-secret

# === CRON & SECURITY ❌ MISSING ===
CRON_SECRET=your-cron-secret-here
UNSUBSCRIBE_HMAC_SECRET=your-unsubscribe-secret
ARCADE_ADMIN_KEY=your-arcade-admin-key

# === OPTIONAL ===
MOCK_GITHUB=1  # Set to skip real GitHub API calls (testing)
```

---

## 🎮 FEATURES THAT NEED EACH SERVICE

### **Supabase Only (Minimum Viable):**
- ✅ User login (GitHub OAuth)
- ✅ View city/buildings
- ✅ Admin dashboard
- ✅ Basic profile pages

### **+ PartyKit:**
- ✅ Live player counts
- ✅ Multiplayer arcade games
- ✅ Real-time effects
- ✅ User presence indicators

### **+ Stripe:**
- ✅ Advertiser payments
- ✅ Premium features
- ✅ Subscription billing

### **+ Resend:**
- ✅ Email notifications
- ✅ Ad expiry alerts
- ✅ Welcome emails

### **+ All Services:**
- ✅ Full GitCity experience
- ✅ All monetization options
- ✅ Complete analytics
- ✅ Multiplayer features

---

## 🚀 SETUP ORDER (Recommended)

### **Phase 1: Core (Do Now)**
1. ✅ Supabase + GitHub OAuth (DONE!)
2. ❌ GitHub Personal Access Token (5 min)
3. ❌ Verify database tables exist (10 min)

**Test:** Login works, admin dashboard loads

---

### **Phase 2: Multiplayer (Next)**
4. ❌ PartyKit setup (15 min)
5. ❌ Deploy PartyKit server (10 min)

**Test:** `/arcade` shows live player counts

---

### **Phase 3: Monetization (When Ready)**
6. ❌ Stripe setup (20 min)
7. ❌ Resend setup (15 min)

**Test:** Can create paid ad campaigns

---

### **Phase 4: Polish (Optional)**
8. ❌ Himetrica analytics
9. ❌ NowPayments crypto
10. ❌ AbacatePay BRL

---

## 🧪 TESTING CHECKLIST

After setup, verify:

- [ ] Login with GitHub works
- [ ] Admin dashboard loads (`/admin/ads`)
- [ ] Can create/edit ads
- [ ] Can create drops
- [ ] City page loads with buildings
- [ ] Arcade shows player counts (PartyKit)
- [ ] Multiplayer rooms work
- [ ] Email notifications send (Resend)
- [ ] Payments process (Stripe)

---

## 📁 ORIGINAL GITCITY DESIGN

**To match original GitCity exactly:**

1. **Check original repo:** https://github.com/srizzon/git-city
2. **Compare these files:**
   - `src/app/page.tsx` (main city view)
   - `src/components/` (UI components)
   - `src/lib/` (business logic)
   - `public/` (assets, logos)
   - `src/app/globals.css` (styling)

3. **Key design elements:**
   - Pixel art font (Silkscreen)
   - Lime green accent color
   - 3D building rendering (Three.js)
   - Arcade games section
   - Admin dashboard layout

**⚠️ Your current app is already based on GitCity code!** Just need to enable all features.

---

## 🎯 NEXT STEPS FOR YOU

**Right now, do this:**

1. **GitHub Token (5 min):**
   - https://github.com/settings/tokens
   - Create token with `public_repo`, `read:user`, `user:email`
   - Add to `.env.local`

2. **PartyKit (15 min):**
   - https://www.partykit.io
   - Sign up, create app
   - Add host to `.env.local`

3. **Test login:**
   - http://localhost:3002/admin/login
   - Should work perfectly!

---

**Ready to continue, boss? Start with GitHub Token!** 🚀🐥
