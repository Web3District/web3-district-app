# 🔐 Web4City - Full API Access & Orchestration

**Created:** 2026-05-10 by 🐥
**Purpose:** Direct API access for Pint0 to manage all services without UI interaction

---

## 🎯 Services Overview

| Service | Purpose | Access Level | Status |
|---------|---------|--------------|--------|
| **GitHub** | Code, deployments, webhooks | ✅ Full (PAT) | Active |
| **Supabase** | Database, auth, storage | ✅ Full (Service Role) | Active |
| **Vercel** | Hosting, deployments, env vars | ✅ Full (API Token) | Active |
| **Stripe** | Payments, subscriptions | ✅ Full (Secret Keys) | Test Mode |
| **PartyKit** | Multiplayer, lobbies | ✅ Full (API) | Active |
| **Telegram** | Bot, notifications | ✅ Full (Bot Token) | Active |
| **Resend** | Email delivery | ✅ Full (API Key) | Active |
| **Himetrica** | Analytics | ✅ Full (API Key) | Active |
| **AbacatePay** | Payments (backup) | ✅ Full (API Key) | Active |

---

## 🔑 Credentials & API Access

### 1. GitHub
**Purpose:** Code management, PR automation, deployment triggers

- **Personal Access Token (PAT):** Store in `.env` as `GITHUB_TOKEN`
- **Admin Logins:** `eddiezebra` (owner), `web3district` (org)
- **Org:** https://github.com/Web3District
- **Repo:** https://github.com/Web3District/web3-district-app
- **API Endpoint:** `https://api.github.com`

**Capabilities:**
- ✅ Push/pull code
- ✅ Create branches, PRs
- ✅ Manage issues, labels
- ✅ Trigger deployments
- ✅ Manage webhooks
- ✅ Access GitHub Actions

**API Example:**
```bash
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/Web3District/web3-district-app
```

---

### 2. Supabase
**Purpose:** Database, authentication, storage, realtime

- **Project ID:** `rhppbqsuktyunxfwnddp`
- **URL:** `https://rhppbqsuktyunxfwnddp.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTMyODcsImV4cCI6MjA5MjY4OTI4N30.9RvTGhTF3h1npf7F9cj_4-i0ifOKjg1atbryI_b81rU`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocHBicXN1a3R5dW54ZnduZGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzExMzI4NywiZXhwIjoyMDkyNjg5Mjg3fQ.H0MMEVmK17T-2Jub0SlpTjaXdq6NVECXtSbJodjPBak`

**Capabilities:**
- ✅ Full database CRUD (bypass RLS with service role)
- ✅ User management
- ✅ Storage bucket access
- ✅ Realtime subscriptions
- ✅ Edge function triggers

**API Example:**
```bash
# Get all ads
curl "https://rhppbqsuktyunxfwnddp.supabase.co/rest/v1/sky_ads" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

# Insert ad
curl -X POST "https://rhppbqsuktyunxfwnddp.supabase.co/rest/v1/sky_ads" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"id":"test-ad","brand":"Test","text":"Test Ad","vehicle":"plane","active":true}'
```

**Key Tables:**
- `sky_ads` - Advertisement campaigns
- `ads` - Legacy ad table (deprecated)
- `developers` - User profiles
- `buildings` - Claimed buildings
- `advertiser_accounts` - Advertiser management

---

### 3. Vercel
**Purpose:** Deployments, environment variables, project settings

- **Team:** `eddies-projects-217ba8e5`
- **Project:** `web3-district-app`
- **Project ID:** `prj_HLG6S3OFcFvVQxzs3OcITs4SyZXh`
- **API Token:** Generate at https://vercel.com/account/tokens
- **Domain:** `web4city.xyz`

**Capabilities:**
- ✅ Trigger deployments
- ✅ Manage environment variables
- ✅ View deployment logs
- ✅ Configure domains
- ✅ Manage previews

**API Example:**
```bash
# Create deployment
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"web3-district-app","project":"prj_HLG6S3OFcFvVQxzs3OcITs4SyZXh"}'

# Get env vars
curl "https://api.vercel.com/v9/projects/prj_HLG6S3OFcFvVQxzs3OcITs4SyZXh/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

**Note:** Vercel OIDC tokens are short-lived. Use long-lived API tokens for automation.

---

### 4. Stripe
**Purpose:** Payments, subscriptions, webhooks

- **Mode:** TEST (switch to live when ready)
- **Publishable Key:** `pk_test_51TRtyJE1Hih6JiExShx5adWK4zUr3c4ZBVC4LTB3MkJl8KEZRfU46SKx7Abeg6yoxmJw27Q8lMFhC9635Ou2fBcj00S0Sr0dRQ`
- **Secret Key:** `sk_test_51TRtyJE1Hih6JiExoU87MKZG5GScq94UpJLj8U38dVvwQ8mFqppuSzhOzEsnFYV9L1p5pXUWnMqME7g0UYg27qJa00sklog300`
- **Webhook Secret:** `whsec_lh1hJJQuLIYVTX2Nnk8pWvqYKgZIiuHo`

**Products:**
- **Foundation:** `prod_UQluV89C423P9s` → `price_1TRuMRE1Hih6JiExGNqekfxJ` ($97/mo)
- **Skyline:** `prod_UQluWiKjIqL7FQ` → `price_1TRuMSE1Hih6JiExC8bfPJMn` ($197/mo)

**Capabilities:**
- ✅ Create/manage products & prices
- ✅ Create checkout sessions
- ✅ Manage subscriptions
- ✅ Process refunds
- ✅ Handle webhooks

**API Example:**
```bash
# Create checkout session
curl https://api.stripe.com/v1/checkout/sessions \
  -u $STRIPE_SECRET_KEY: \
  -d "mode=subscription" \
  -d "success_url=https://web4city.xyz/success" \
  -d "cancel_url=https://web4city.xyz/cancel" \
  -d "line_items[0][price]=price_1TRuMRE1Hih6JiExGNqekfxJ" \
  -d "line_items[0][quantity]=1"
```

---

### 5. PartyKit
**Purpose:** Multiplayer lobbies, realtime sync

- **Host:** `git-city-arcade.web3district.partykit.dev`
- **Project:** Web4City Arcade
- **API:** REST + WebSocket

**Capabilities:**
- ✅ Manage lobbies
- ✅ Realtime player sync
- ✅ Game state management

---

### 6. Telegram
**Purpose:** Bot notifications, user communication

- **@pintzero_bot:** Main bot (Pint0)
- **@squid0o_bot:** Local bot (Squid)
- **Token:** `8676622226:AAGSjZiRD8tLBT10EZo82PwCX9ZNrXk2oDY`
- **User:** @eddiezebra (490551578)

**Capabilities:**
- ✅ Send messages
- ✅ Send notifications
- ✅ Handle commands
- ✅ Group management

**API Example:**
```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -d "chat_id=490551578" \
  -d "text=Deployment complete! ✅"
```

---

### 7. Resend
**Purpose:** Transactional emails

- **API Key:** Store in `.env` as `RESEND_API_KEY`
- **Domain:** web4city.xyz

**Capabilities:**
- ✅ Send emails
- ✅ Manage templates
- ✅ Track opens/clicks

---

### 8. Himetrica
**Purpose:** Analytics, tracking

- **API Key:** Store in `.env` as `NEXT_PUBLIC_HIMETRICA_API_KEY`
- **Endpoint:** Configured in app

---

### 9. AbacatePay
**Purpose:** Backup payment processor

- **API Key:** Store in `.env` as `ABACATEPAY_API_KEY`
- **Webhook Secret:** `ABACATEPAY_WEBHOOK_SECRET`

---

## 🤖 Automation Scripts

### Deploy to Production
```bash
#!/bin/bash
cd /Users/eduardomarques/web3-district-app
git push origin main
# Vercel auto-deploys on push
```

### Create Ad via API
```bash
curl -X POST "https://rhppbqsuktyunxfwnddp.supabase.co/rest/v1/sky_ads" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "id":"my-ad-123",
    "brand":"My Brand",
    "text":"Awesome Ad",
    "vehicle":"plane",
    "active":true,
    "priority":50
  }'
```

### Trigger Vercel Deployment
```bash
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project":"prj_HLG6S3OFcFvVQxzs3OcITs4SyZXh",
    "branch":"main"
  }'
```

### Send Telegram Notification
```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
  -d "chat_id=490551578" \
  -d "text=🐥 Web4City deployment complete! ✅" \
  -d "parse_mode=HTML"
```

---

## 🔒 Security Notes

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Service Role Key = Admin Access** - Bypasses RLS, use carefully
3. **Rotate tokens periodically** - Especially if exposed
4. **Use test mode for Stripe** - Until ready for production
5. **Vercel tokens** - Use short-lived for CI, long-lived for automation

---

## 📊 Monitoring & Health Checks

### Check Supabase Connection
```bash
curl "https://rhppbqsuktyunxfwnddp.supabase.co/rest/v1/sky_ads?limit=1" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

### Check Vercel Deployment Status
```bash
curl "https://api.vercel.com/v13/deployments?projectId=prj_HLG6S3OFcFvVQxzs3OcITs4SyZXh" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

### Check Site Health
```bash
curl -I https://web4city.xyz
```

---

## 🎯 Orchestration Workflows

### Full Deploy Pipeline
1. ✅ Commit code to GitHub
2. ✅ Vercel auto-deploys
3. ✅ Wait for deployment success
4. ✅ Send Telegram notification
5. ✅ Verify site health

### Create Ad Campaign
1. ✅ Insert ad to Supabase `sky_ads` table
2. ✅ Set `active: true`
3. ✅ Verify via API
4. ✅ Notify user via Telegram

### Emergency Rollback
1. ✅ Identify last good commit
2. ✅ Revert via GitHub API
3. ✅ Trigger Vercel deployment
4. ✅ Monitor deployment
5. ✅ Notify on completion

---

**Last Updated:** 2026-05-10
**Maintained By:** 🐥 Pint0
**Access Level:** FULL API ORCHESTRATION ✅
