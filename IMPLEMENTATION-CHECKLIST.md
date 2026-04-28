# 🏗️ Web4City - Complete Implementation Checklist

**Goal:** Replicate GitCity's full business model  
**Current Status:** 41% complete  
**Target:** 100% feature parity + Web3 enhancements

---

## 📊 CURRENT STATUS OVERVIEW

| Category | Complete | Missing | Total | % |
|----------|----------|---------|-------|---|
| Admin Pages | 7 | 0 | 7 | ✅ 100% |
| Public Pages | 11 | 13 | 24 | 46% |
| Monetization | 1 | 7 | 8 | 13% |
| Backend APIs | 6 | 15 | 21 | 29% |
| Database Tables | 8 | 12 | 20 | 40% |
| Integrations | 2 | 4 | 6 | 33% |
| **OVERALL** | **35** | **51** | **86** | **41%** |

---

## 🔴 PHASE 1: CORE MONETIZATION (Weeks 1-4)

### 1.1 📢 Sky Ads Platform (Self-Serve Advertising)

**Priority:** 🔴 CRITICAL | **Effort:** 3 days | **Revenue Impact:** HIGH

#### Frontend Pages:
- [ ] `/advertise` - Landing page with pricing
- [ ] `/business/login` - Business advertiser login
- [ ] `/ads/dashboard` - Advertiser dashboard
- [ ] `/ads/create` - Create new ad campaign
- [ ] `/ads/[id]/edit` - Edit existing ad

#### Backend APIs:
- [ ] `POST /api/ads/checkout/package` - Stripe checkout session
- [ ] `GET /api/ads/stats` - Ad performance stats
- [ ] `PATCH /api/ads/[id]` - Update ad content
- [ ] `DELETE /api/ads/[id]` - Cancel ad
- [ ] `GET /api/ads/inventory` - Available ad slots

#### Database Tables:
```sql
-- Already have: ads table
-- Need to add:
CREATE TABLE ad_packages (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL, -- foundation, skyline, landmark
  price_usd_cents INTEGER NOT NULL,
  price_brl_cents INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ad_impressions (
  id UUID PRIMARY KEY,
  ad_id UUID REFERENCES ads(id),
  impression_type TEXT, -- view, click, hover
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE ad_campaigns (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  package_id UUID REFERENCES ad_packages(id),
  stripe_session_id TEXT,
  status TEXT, -- active, paused, cancelled, expired
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  total_impressions INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Integrations:
- [ ] **Stripe** - Payment processing
  - [ ] Create Stripe account
  - [ ] Set up products (Foundation, Skyline, Landmark)
  - [ ] Configure webhooks (`payment_intent.succeeded`, `customer.subscription.deleted`)
  - [ ] Add Stripe secret key to env

- [ ] **Himetrica/Analytics** - Impression tracking
  - [ ] Install tracking library
  - [ ] Add impression events
  - [ ] Add click events
  - [ ] Create analytics dashboard

#### Files to Create/Copy:
```
src/app/advertise/
  ├── page.tsx ✅ (copy from git-city)
  ├── AdvertiseLanding.tsx ✅ (copy from git-city)
  ├── tracking.tsx
  └── preview/
      └── page.tsx

src/app/business/
  └── login/
      └── page.tsx

src/app/ads/
  └── dashboard/
      └── page.tsx

src/lib/ads/
  ├── constants.ts
  ├── types.ts
  └── helpers.ts

src/pages/api/ads/
  ├── checkout/
  │   └── package.ts
  ├── stats.ts
  └── [id].ts
```

---

### 1.2 💼 Job Board System

**Priority:** 🔴 CRITICAL | **Effort:** 5 days | **Revenue Impact:** HIGH

#### Frontend Pages:
- [ ] `/jobs` - Public job board
- [ ] `/jobs/[id]` - Individual job posting
- [ ] `/jobs/post` - Create job posting
- [ ] `/jobs/company/[companyId]` - Company profile
- [ ] `/hire` - Hire developers page (recruiter focus)

#### Backend APIs:
- [ ] `GET /api/jobs` - List jobs (with filters)
- [ ] `GET /api/jobs/[id]` - Get job details
- [ ] `POST /api/jobs` - Create job posting
- [ ] `PATCH /api/jobs/[id]` - Update job
- [ ] `DELETE /api/jobs/[id]` - Delete job
- [ ] `POST /api/jobs/[id]/approve` - Admin approve
- [ ] `POST /api/jobs/[id]/reject` - Admin reject
- [ ] `POST /api/jobs/[id]/apply` - Submit application
- [ ] `GET /api/admin/jobs` - Admin job list
- [ ] `GET /api/admin/companies` - Admin company list
- [ ] `POST /api/jobs/[id]/payment` - Stripe checkout

#### Database Tables:
```sql
CREATE TABLE job_listings (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT DEFAULT 'free', -- free, standard, featured, premium
  status TEXT DEFAULT 'pending_review', -- pending_review, active, paused, rejected, expired
  role_type TEXT, -- frontend, backend, fullstack, etc.
  seniority TEXT, -- intern, junior, mid, senior, etc.
  contract_type TEXT, -- fulltime, parttime, contract, etc.
  salary_min INTEGER,
  salary_max INTEGER,
  salary_period TEXT, -- monthly, annual
  currency TEXT DEFAULT 'USD',
  location_type TEXT, -- remote, hybrid, onsite
  location_restriction TEXT, -- worldwide, americas, europe, etc.
  location_city TEXT,
  location_country TEXT,
  web_type TEXT, -- web2, web3, both
  benefits JSONB,
  skills JSONB,
  application_url TEXT,
  application_email TEXT,
  stripe_session_id TEXT,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  apply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  company_size TEXT, -- 1-10, 11-50, 51-200, etc.
  industry TEXT,
  github_org TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  contact_email TEXT,
  contact_name TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE job_applications (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES job_listings(id),
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_linkedin TEXT,
  applicant_github TEXT,
  applicant_portfolio TEXT,
  cover_letter TEXT,
  resume_url TEXT,
  status TEXT DEFAULT 'new', -- new, viewed, contacted, interviewed, offered, rejected
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON job_listings(status);
CREATE INDEX idx_jobs_tier ON job_listings(tier);
CREATE INDEX idx_jobs_created ON job_listings(created_at DESC);
```

#### Files to Create/Copy:
```
src/app/jobs/
  ├── page.tsx (job board listing)
  ├── [id]/
  │   └── page.tsx (individual job)
  ├── post/
  │   └── page.tsx (create job)
  └── company/
      └── [companyId]/
          └── page.tsx

src/app/hire/
  └── page.tsx

src/app/admin/jobs/
  ├── page.tsx ✅ (already added)
  └── _components/
      ├── jobs-dashboard.tsx (copy from git-city)
      ├── job-table.tsx
      ├── job-row.tsx
      ├── job-form.tsx
      ├── job-filters.tsx
      ├── company-dashboard.tsx
      ├── summary-cards.tsx
      ├── confirm-dialog.tsx
      └── toast.tsx

src/lib/jobs/
  ├── types.ts
  ├── constants.ts
  └── helpers.ts

src/pages/api/
  ├── jobs/
  │   ├── route.ts
  │   ├── [id]/
  │   │   ├── route.ts
  │   │   ├── approve/
  │   │   │   └── route.ts
  │   │   ├── reject/
  │   │   │   └── route.ts
  │   │   └── apply/
  │   │       └── route.ts
  │   └── payment/
  │       └── route.ts
  └── admin/
      ├── jobs/
      │   └── route.ts
      └── companies/
          └── route.ts
```

---

### 1.3 📧 Email Service Integration

**Priority:** 🔴 CRITICAL | **Effort:** 2 days | **Revenue Impact:** MEDIUM

#### Setup:
- [ ] Choose provider: **Resend** (recommended) or SendGrid
- [ ] Create account
- [ ] Verify domain
- [ ] Get API key
- [ ] Add to env: `RESEND_API_KEY`, `EMAIL_FROM`

#### Backend APIs:
- [ ] `GET /api/admin/email-monitoring` - Email stats
- [ ] `POST /api/email/send` - Send transactional email
- [ ] `POST /api/email/bulk` - Send bulk email
- [ ] `GET /api/email/templates` - List templates
- [ ] `POST /api/advertise/landmark-contact` - Contact form (from sponsorship page)

#### Database Tables:
```sql
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_id UUID REFERENCES email_templates(id),
  status TEXT DEFAULT 'draft', -- draft, scheduled, sending, completed, failed
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_recipients (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES email_campaigns(id),
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, sent, delivered, bounced, opened, clicked
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounce_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE email_suppressions (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT, -- bounce, complaint, manual
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_recipients_campaign ON email_recipients(campaign_id);
CREATE INDEX idx_email_suppressions_email ON email_suppressions(email);
```

#### Email Templates:
- [ ] Job application confirmation
- [ ] Job approval/rejection notification
- [ ] Ad campaign confirmation
- [ ] Weekly digest (new jobs, featured devs)
- [ ] Welcome email (new users)
- [ ] Password reset
- [ ] Sponsorship inquiry confirmation

#### Files to Create:
```
src/lib/email/
  ├── client.ts (Resend/SendGrid client)
  ├── templates/
  │   ├── welcome.tsx
  │   ├── job-applied.tsx
  │   ├── job-approved.tsx
  │   ├── ad-confirmed.tsx
  │   └── weekly-digest.tsx
  └── helpers.ts

src/pages/api/
  ├── admin/
  │   └── email-monitoring/
  │       └── route.ts
  ├── email/
  │   ├── send/
  │   │   └── route.ts
  │   └── bulk/
  │       └── route.ts
  └── advertise/
      └── landmark-contact/
          └── route.ts
```

---

## 🟡 PHASE 2: USER ENGAGEMENT (Weeks 5-8)

### 2.1 🛍️ Shop System

**Priority:** 🟡 HIGH | **Effort:** 4 days | **Revenue Impact:** HIGH

#### Frontend Pages:
- [ ] `/shop` - Shop landing (unclaimed users)
- [ ] `/shop/[username]` - Personal shop (claimed buildings)
- [ ] `/shop/[username]/inventory` - User's purchased items
- [ ] `/shop/[username]/gift` - Gift items to others

#### Backend APIs:
- [ ] `GET /api/shop/items` - List shop items
- [ ] `GET /api/shop/items/[id]` - Get item details
- [ ] `POST /api/shop/purchase` - Buy item
- [ ] `GET /api/shop/inventory/[userId]` - User's inventory
- [ ] `POST /api/shop/gift` - Gift item to another user
- [ ] `POST /api/shop/equip` - Equip/unequip item

#### Database Tables:
```sql
CREATE TABLE shop_items (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- effects, structures, identity, face, seasonal
  subtype TEXT, -- aura, crown, antenna, etc.
  price_usd_cents INTEGER NOT NULL,
  price_brl_cents INTEGER NOT NULL,
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  is_limited BOOLEAN DEFAULT FALSE,
  is_seasonal BOOLEAN DEFAULT FALSE,
  season TEXT,
  max_quantity INTEGER, -- null = unlimited
  sold_quantity INTEGER DEFAULT 0,
  preview_url TEXT,
  model_url TEXT, -- 3D model URL
  texture_url TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_inventory (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  item_id UUID REFERENCES shop_items(id),
  quantity INTEGER DEFAULT 1,
  acquired_via TEXT DEFAULT 'purchase', -- purchase, gift, achievement, referral
  source_id UUID, -- job_id, achievement_id, etc.
  is_equipped BOOLEAN DEFAULT FALSE,
  gifted_by UUID REFERENCES auth.users(id),
  gift_message TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shop_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  item_id UUID REFERENCES shop_items(id),
  amount_usd_cents INTEGER NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, refunded, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_user ON user_inventory(user_id);
CREATE INDEX idx_items_category ON shop_items(category);
CREATE INDEX idx_items_enabled ON shop_items(enabled);
```

#### Stripe Integration:
- [ ] Create shop products in Stripe
- [ ] Set up webhook for `checkout.session.completed`
- [ ] Handle inventory updates on payment success

#### Files to Create:
```
src/app/shop/
  ├── page.tsx ✅ (copy from git-city)
  ├── [username]/
  │   ├── page.tsx
  │   ├── inventory/
  │   │   └── page.tsx
  │   └── gift/
  │       └── page.tsx
  └── item/
      └── [itemId]/
          └── page.tsx

src/lib/shop/
  ├── types.ts
  ├── constants.ts
  └── helpers.ts

src/pages/api/
  └── shop/
      ├── items/
      │   ├── route.ts
      │   └── [id]/
      │       └── route.ts
      ├── purchase/
      │   └── route.ts
      ├── inventory/
      │   └── [userId]/
      │       └── route.ts
      ├── gift/
      │   └── route.ts
      └── equip/
          └── route.ts
```

---

### 2.2 📊 User Comparison Page

**Priority:** 🟡 HIGH | **Effort:** 2 days | **Revenue Impact:** MEDIUM (viral growth)

#### Frontend Pages:
- [ ] `/compare/[userA]/[userB]` - Side-by-side comparison

#### Features:
- [ ] Building height comparison
- [ ] Stats comparison (contributions, repos, stars)
- [ ] Achievement comparison
- [ ] Share button (generates image card)
- [ ] Random comparison button

#### Files to Create:
```
src/app/compare/
  └── [userA]/
      └── [userB]/
          └── page.tsx

src/lib/compare/
  └── helpers.ts
```

---

### 2.3 ⚙️ User Settings

**Priority:** 🟡 HIGH | **Effort:** 2 days | **Revenue Impact:** LOW (UX)

#### Frontend Pages:
- [ ] `/settings` - User settings
- [ ] `/settings/profile` - Profile settings
- [ ] `/settings/notifications` - Email preferences
- [ ] `/settings/privacy` - Privacy settings
- [ ] `/settings/building` - Building customization

#### Database Tables:
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  job_alerts BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  public_profile BOOLEAN DEFAULT TRUE,
  public_building BOOLEAN DEFAULT TRUE,
  show_contributions BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Files to Create:
```
src/app/settings/
  ├── page.tsx
  ├── profile/
  │   └── page.tsx
  ├── notifications/
  │   └── page.tsx
  ├── privacy/
  │   └── page.tsx
  └── building/
      └── page.tsx
```

---

### 2.4 🏆 Achievement System

**Priority:** 🟡 MEDIUM | **Effort:** 3 days | **Revenue Impact:** MEDIUM (engagement)

#### Database Tables:
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT, -- contributions, social, spending, special
  difficulty TEXT, -- easy, medium, hard, legendary
  points INTEGER DEFAULT 10,
  requirement_type TEXT, -- count, threshold, action
  requirement_value INTEGER,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  claimed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, achievement_id)
);

-- Pre-populate achievements:
-- - "First Commit" - Make first contribution
-- - "Centurion" - 100 contributions
-- - "Millennium" - 1,000 contributions
-- - "Star Gazer" - 100 stars on repos
-- - "Social Butterfly" - Send 10 kudos
-- - "Early Adopter" - Join in first month
-- - "Big Spender" - Spend $100+ in shop
-- - "Recruiter" - Refer 5 friends
```

#### Files to Create:
```
src/app/achievements/
  └── page.tsx

src/lib/achievements/
  ├── constants.ts
  ├── tracker.ts
  └── helpers.ts
```

---

## 🟢 PHASE 3: ADVANCED FEATURES (Weeks 9-12)

### 3.1 🏆 Sponsorship Program

**Priority:** 🟢 MEDIUM | **Effort:** 3 days | **Revenue Impact:** HIGH

#### Frontend Pages:
- [ ] `/sponsorship` - Sponsorship landing page
- [ ] `/sponsorship/form` - Contact form

#### Backend APIs:
- [ ] `POST /api/sponsorship/contact` - Submit inquiry
- [ ] `GET /api/sponsors` - List current sponsors

#### Database Tables:
```sql
CREATE TABLE sponsors (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  website TEXT,
  tier TEXT, -- landmark, themed_week, annual, pixel_drop
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  contact_name TEXT,
  contact_email TEXT,
  total_spend_usd_cents INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sponsorship_inquiries (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  website TEXT,
  format_interest TEXT, -- landmark, themed_week, annual, pixel_drop
  budget TEXT,
  message TEXT,
  status TEXT DEFAULT 'new', -- new, contacted, proposal_sent, closed_won, closed_lost
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Files to Create/Copy:
```
src/app/sponsorship/
  ├── page.tsx ✅ (copy from git-city)
  ├── SponsorshipLanding.tsx ✅ (copy from git-city)
  └── tracking.tsx

src/pages/api/
  └── sponsorship/
      ├── contact/
      │   └── route.ts
      └── sponsors/
          └── route.ts

src/lib/sponsors/
  ├── registry.ts
  └── types.ts
```

---

### 3.2 💎 Premium Subscription

**Priority:** 🟢 MEDIUM | **Effort:** 3 days | **Revenue Impact:** MEDIUM

#### Database Tables:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  tier TEXT DEFAULT 'pro', -- pro
  status TEXT DEFAULT 'active', -- active, cancelled, past_due, trialing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

#### Backend APIs:
- [ ] `POST /api/subscription/create` - Create checkout session
- [ ] `POST /api/subscription/portal` - Customer portal
- [ ] `POST /api/subscription/cancel` - Cancel subscription
- [ ] `GET /api/subscription/status` - Get user's subscription status

#### Webhooks:
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.payment_succeeded`
- [ ] `invoice.payment_failed`

#### Files to Create:
```
src/app/premium/
  └── page.tsx

src/pages/api/
  └── subscription/
      ├── create/
      │   └── route.ts
      ├── portal/
      │   └── route.ts
      ├── cancel/
      │   └── route.ts
      └── status/
          └── route.ts

src/lib/subscription/
  ├── types.ts
  └── helpers.ts
```

---

### 3.3 🎁 Gifting System

**Priority:** 🟢 LOW | **Effort:** 2 days | **Revenue Impact:** LOW

#### Backend APIs:
- [ ] `POST /api/gift/send` - Send gift
- [ ] `GET /api/gift/received` - List received gifts
- [ ] `GET /api/gift/sent` - List sent gifts

#### Files to Create:
```
src/pages/api/
  └── gift/
      ├── send/
      │   └── route.ts
      ├── received/
      │   └── route.ts
      └── sent/
          └── route.ts
```

---

### 3.4 📧 Email Marketing System

**Priority:** 🟢 LOW | **Effort:** 2 days | **Revenue Impact:** MEDIUM

#### Frontend Pages:
- [ ] `/newsletter` - Newsletter signup
- [ ] `/unsubscribe/[token]` - Unsubscribe page

#### Backend APIs:
- [ ] `POST /api/newsletter/subscribe` - Subscribe
- [ ] `POST /api/newsletter/unsubscribe` - Unsubscribe
- [ ] `POST /api/admin/email/campaign` - Create campaign
- [ ] `POST /api/admin/email/send` - Send campaign

#### Files to Create:
```
src/app/newsletter/
  ├── page.tsx
  └── unsubscribe/
      └── [token]/
          └── page.tsx

src/pages/api/
  ├── newsletter/
  │   ├── subscribe/
  │   │   └── route.ts
  │   └── unsubscribe/
  │       └── route.ts
  └── admin/
      └── email/
          ├── campaign/
          │   └── route.ts
          └── send/
              └── route.ts
```

---

## 🔵 PHASE 4: POLISH & OPTIMIZATION (Weeks 13-16)

### 4.1 📊 Advanced Analytics

**Priority:** 🔵 LOW | **Effort:** 3 days

#### Dashboard Features:
- [ ] User growth chart
- [ ] Revenue breakdown by stream
- [ ] Ad performance metrics
- [ ] Job board metrics
- [ ] Shop sales metrics
- [ ] Email campaign metrics

#### Files to Create:
```
src/app/admin/analytics/
  └── page.tsx

src/lib/analytics/
  ├── dashboard.ts
  └── queries.ts
```

---

### 4.2 🎮 Gamification Enhancements

**Priority:** 🔵 LOW | **Effort:** 2 days

#### Features:
- [ ] Daily challenges
- [ ] Streak tracking
- [ ] Leaderboard improvements
- [ ] Seasonal events
- [ ] Limited-time items

---

### 4.3 📱 Mobile Optimization

**Priority:** 🔵 MEDIUM | **Effort:** 3 days

#### Tasks:
- [ ] Responsive design audit
- [ ] Mobile navigation
- [ ] Touch-friendly controls
- [ ] PWA support
- [ ] Mobile app (future consideration)

---

### 4.4 🌐 Internationalization

**Priority:** 🔵 LOW | **Effort:** 4 days

#### Languages:
- [ ] English (default)
- [ ] Portuguese (Brazil)
- [ ] Spanish
- [ ] Hindi
- [ ] Chinese

#### Files to Create:
```
src/i18n/
  ├── config.ts
  ├── locales/
  │   ├── en.json
  │   ├── pt-BR.json
  │   ├── es.json
  │   ├── hi.json
  │   └── zh.json
  └── hooks.ts
```

---

## 🔧 INFRASTRUCTURE & DEVOPS

### Environment Variables to Add:

```bash
# .env.local

# Supabase (already have)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub OAuth (already have)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe (NEW)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email - Resend (NEW)
RESEND_API_KEY=
EMAIL_FROM=noreply@web4city.xyz

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=

# Admin
ADMIN_GITHUB_LOGINS=eddiezebra

# App
NEXT_PUBLIC_APP_URL=https://web4city.xyz
```

---

### Stripe Webhook Endpoints:

```typescript
// src/pages/api/webhooks/stripe/route.ts

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook Error', { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful payment
      break;
    case 'customer.subscription.created':
      // Handle new subscription
      break;
    case 'customer.subscription.updated':
      // Handle subscription update
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
    case 'invoice.payment_succeeded':
      // Handle successful invoice payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
  }

  return new Response('OK', { status: 200 });
}
```

---

### Database Migrations:

Create migration files in `supabase/migrations/`:

```bash
supabase/migrations/
├── 20260430_create_ad_packages.sql
├── 20260430_create_ad_impressions.sql
├── 20260430_create_job_listings.sql
├── 20260430_create_companies.sql
├── 20260430_create_job_applications.sql
├── 20260430_create_email_campaigns.sql
├── 20260430_create_email_suppressions.sql
├── 20260430_create_shop_items.sql
├── 20260430_create_user_inventory.sql
├── 20260430_create_achievements.sql
├── 20260430_create_subscriptions.sql
└── 20260430_create_sponsors.sql
```

---

## 📋 TESTING CHECKLIST

### Before Launch:

- [ ] Test all Stripe payment flows
- [ ] Test email delivery
- [ ] Test admin approval workflows
- [ ] Test mobile responsiveness
- [ ] Load test with 1,000 concurrent users
- [ ] Security audit (OWASP Top 10)
- [ ] GDPR compliance check
- [ ] Accessibility audit (WCAG 2.1)
- [ ] SEO audit
- [ ] Performance audit (Lighthouse score >90)

---

## 🚀 LAUNCH CHECKLIST

### Soft Launch (Week 4):
- [ ] Sky Ads platform live
- [ ] First 10 beta advertisers onboarded
- [ ] Email system operational
- [ ] Analytics tracking working

### Phase 1 Launch (Week 8):
- [ ] Job board live
- [ ] Shop system live
- [ ] First job postings published
- [ ] First shop sales

### Full Launch (Week 12):
- [ ] All monetization features live
- [ ] Sponsorship program announced
- [ ] Marketing campaign started
- [ ] Press release distributed

---

## 📊 SUCCESS METRICS

### Month 1-3 Targets:
- [ ] 10 paying advertisers
- [ ] 20 job postings
- [ ] 100 shop purchases
- [ ] $5,000 MRR

### Month 4-6 Targets:
- [ ] 50 paying advertisers
- [ ] 100 job postings
- [ ] 500 shop purchases
- [ ] 1,000 premium subscribers
- [ ] $25,000 MRR

### Month 7-12 Targets:
- [ ] 200 paying advertisers
- [ ] 300 job postings
- [ ] 2,000 shop purchases/day
- [ ] 5,000 premium subscribers
- [ ] 5 landmark sponsors
- [ ] $100,000+ MRR

---

## 🎯 IMMEDIATE NEXT STEPS (This Week)

1. **Set up Stripe account** (30 min)
2. **Set up Resend account** (30 min)
3. **Add environment variables** (15 min)
4. **Copy Sky Ads frontend from GitCity** (2 hours)
5. **Create Stripe products** (1 hour)
6. **Build checkout API endpoint** (3 hours)
7. **Test payment flow end-to-end** (2 hours)

**Total: ~10 hours to first revenue feature!**

---

**_Last updated: 2026-04-30 by 🐥 Pint0_**

**Ready to build, boss! Which feature should we start with?** 🚀
