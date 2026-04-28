# 🧪 Stripe Integration - Test Checklist

**Date:** 2026-04-30  
**Feature:** Sky Ads Payment System  
**Status:** Ready for Testing

---

## 📋 PRE-FLIGHT CHECKS (5 min)

### 1. Environment Variables ✅
```bash
cd /Users/eduardomarques/web3-district-app
cat .env.local | grep STRIPE
```

**Expected output:**
```
STRIPE_SECRET_KEY=sk_test_51TRtyJE1Hih6JiEx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TRtyJE1Hih6JiEx...
STRIPE_WEBHOOK_SECRET=whsec_lh1hJJQuLIYVTX2Nnk8pWvqYKgZIiuHo
FOUNDATION_AD_PACKAGE_PRICE_ID=price_1TRuMRE1Hih6JiExGNqekfxJ
SKYLINE_AD_PACKAGE_PRICE_ID=price_1TRuMSE1Hih6JiExC8bfPJMn
```

❓ **If missing:** Run the setup script again:
```bash
npx tsx scripts/stripe-setup.ts
```

---

### 2. Database Tables ✅

Go to: **Supabase Dashboard → SQL Editor**

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ad_campaigns', 'ad_packages', 'ad_impressions');
```

**Expected:** 3 tables returned

❓ **If empty:** Run the migration:
```bash
# Copy contents of supabase/migrations/20260430_create_ad_tables.sql
# Paste into Supabase SQL Editor and Run
```

---

### 3. Stripe Products ✅

Go to: **Stripe Dashboard → Products**

**Expected to see:**
- ✅ Foundation Ad Package ($97.00/month)
- ✅ Skyline Ad Package ($197.00/month)

❓ **If missing:** Products weren't created - check script output

---

### 4. Webhook Endpoint ✅

Go to: **Stripe Dashboard → Developers → Webhooks**

**Expected to see:**
- ✅ Endpoint: `https://web4city.xyz/api/webhooks/stripe`
- ✅ Status: Enabled
- ✅ Events: 6 events listed

Click on the endpoint → Check **Events** tab

**Expected:** Should show recent events (may be empty if no test yet)

---

## 🧪 FUNCTIONAL TESTS (15 min)

### Test 1: Advertise Page Loads

**Steps:**
```bash
npm run dev
```
Visit: `http://localhost:3001/advertise`

**Expected:**
- ✅ Page loads without errors
- ✅ "Foundation Ad Package" visible
- ✅ "Skyline Ad Package" visible
- ✅ Pricing shows: $97/mo and $197/mo
- ✅ "Choose Package" buttons clickable

**❌ If broken:**
- Check console for errors
- Verify `/advertise/page.tsx` exists
- Check AdvertiseLanding.tsx copied correctly

---

### Test 2: Checkout Flow - Foundation Package

**Steps:**

1. **Click "Choose Package"** on Foundation

2. **Fill in the form:**
   ```
   Brand: Test Brand (optional)
   Ad Text: This is a test ad
   Text Color: #ffffff
   Background Color: #000000
   Website Link: https://example.com
   ```

3. **Click "Start Checkout"**

4. **Expected:**
   - ✅ Redirects to Stripe Checkout (stripe.com domain)
   - ✅ Shows "Foundation Ad Package"
   - ✅ Shows $97.00/month
   - ✅ Email field pre-filled (if logged in)

**❌ If broken:**
- Check browser console for errors
- Verify `/api/ads/checkout/package` endpoint exists
- Check API response in Network tab

---

### Test 3: Stripe Payment

**On Stripe Checkout page:**

**Fill in test card:**
```
Card number: 4242 4242 4242 4242
Expiry: 12/34 (any future date)
CVC: 123
ZIP: 12345
Country: United States
```

**Click "Pay"**

**Expected:**
- ✅ Payment processes successfully
- ✅ Redirects to: `http://localhost:3001/ads/dashboard?session_id=cs_...`
- ✅ Shows success message: "🎉 Payment successful!"

**❌ If payment fails:**
- Use exact test card: `4242 4242 4242 4242`
- Check Stripe Dashboard → Payments for declined attempts
- Verify test mode is enabled in Stripe

---

### Test 4: Dashboard Display

**After successful payment:**

Visit: `http://localhost:3001/ads/dashboard`

**Expected:**
- ✅ Dashboard loads
- ✅ Success message visible (if just completed checkout)
- ✅ Stats cards show:
  - Active Campaigns: 1
  - Total Campaigns: 1
- ✅ Campaign table shows:
  - Package: Foundation
  - Status: active (or pending)
  - Brand: Test Brand
  - Impressions: 0
  - Clicks: 0

**❌ If empty:**
- Check if logged in with same GitHub account used for checkout
- Check Supabase → ad_campaigns table for record
- Verify webhook processed the payment

---

### Test 5: Database Records

Go to: **Supabase Dashboard → Table Editor**

**Query 1 - Check ad_campaigns:**
```sql
SELECT * FROM ad_campaigns ORDER BY created_at DESC LIMIT 1;
```

**Expected:**
- ✅ 1 record with your test campaign
- ✅ `status` = 'active' or 'pending'
- ✅ `stripe_session_id` = starts with `cs_`
- ✅ `brand` = "Test Brand"
- ✅ `text` = "This is a test ad"

**Query 2 - Check ad_packages:**
```sql
SELECT * FROM ad_packages;
```

**Expected:**
- ✅ 2 records (foundation, skyline)
- ✅ Correct Price IDs

**❌ If missing:**
- Webhook may not have processed
- Check Stripe webhook events
- Verify webhook secret in .env.local

---

### Test 6: Webhook Events

Go to: **Stripe Dashboard → Developers → Webhooks → [Your Endpoint] → Events**

**Expected to see:**
- ✅ `checkout.session.completed` event
- ✅ Status: Success (green checkmark)
- ✅ Click to view details
- ✅ Should show your session ID

**Click on the event → View raw JSON**

**Expected payload includes:**
```json
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_...",
      "metadata": {
        "user_id": "...",
        "package_id": "foundation",
        "package_type": "ad_package"
      }
    }
  }
}
```

**❌ If no events:**
- Webhook endpoint may be wrong URL
- Check webhook secret matches .env.local
- Test webhook manually (see Troubleshooting below)

---

### Test 7: Subscription Created

Go to: **Stripe Dashboard → Billing → Subscriptions**

**Expected:**
- ✅ 1 active subscription
- ✅ Customer: (test email)
- ✅ Plan: Foundation Ad Package
- ✅ Amount: $97.00/month
- ✅ Status: Active

**Click on subscription:**
- ✅ Next billing date: ~30 days from now
- ✅ Payment method: Visa (test card)

**❌ If missing:**
- Product may be one-time instead of recurring
- Check product configuration in Stripe
- Verify `mode: 'subscription'` in checkout API

---

### Test 8: Second Package (Skyline)

**Repeat Test 2-3 with Skyline package:**

1. Visit `/advertise`
2. Choose Skyline ($197/mo)
3. Fill different ad details
4. Complete payment with test card

**Expected:**
- ✅ Second campaign created
- ✅ Dashboard shows 2 campaigns
- ✅ Second subscription in Stripe ($197/mo)

---

## 🔒 SECURITY TESTS (5 min)

### Test 9: Authentication Required

**Steps:**

1. **Logout** from the app
2. **Try to access:** `http://localhost:3001/ads/dashboard`

**Expected:**
- ✅ Redirects to login page
- ✅ Cannot view campaigns without auth

**❌ If accessible:**
- Auth check missing in dashboard page
- Fix: Add `createClientComponentClient().auth.getUser()` check

---

### Test 10: User Data Isolation

**Steps:**

1. **Login as User A** (your main account)
2. **Create a campaign**
3. **Logout**
4. **Login as User B** (different GitHub account)
5. **Visit dashboard**

**Expected:**
- ✅ User B sees ONLY their campaigns (0 if none)
- ✅ Cannot see User A's campaigns

**❌ If User B sees User A's data:**
- RLS policies not working
- Check Supabase RLS policies on ad_campaigns table

---

## 📊 PERFORMANCE TESTS (Optional - 10 min)

### Test 11: Load Time

**Steps:**

1. Open Chrome DevTools → Network tab
2. Visit `/advertise`
3. Check load time

**Expected:**
- ✅ Page loads in < 2 seconds
- ✅ No failed network requests

---

### Test 12: Mobile Responsiveness

**Steps:**

1. Open Chrome DevTools
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Test on:
   - iPhone 12 Pro (390x844)
   - iPhone SE (375x667)
   - iPad Air (820x1180)

**Expected:**
- ✅ Page is readable on all sizes
- ✅ Buttons are clickable
- ✅ No horizontal scrolling

---

## 🐛 TROUBLESHOOTING GUIDE

### Issue: "Failed to create checkout session"

**Check:**
1. API endpoint exists: `/api/ads/checkout/package/route.ts`
2. Stripe keys correct in .env.local
3. Price IDs exist in Stripe Dashboard

**Fix:**
```bash
# Restart dev server
npm run dev

# Check API logs in terminal
```

---

### Issue: "Webhook not received"

**Test webhook manually:**

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

Forward webhooks locally:
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

In another terminal, trigger test event:
```bash
stripe trigger checkout.session.completed
```

**Expected:** See webhook hit your local endpoint

---

### Issue: "Payment succeeds but campaign stays pending"

**Check:**
1. Webhook secret matches .env.local
2. Webhook endpoint URL correct in Stripe
3. Supabase service role key has permissions

**Fix:**
```sql
-- Check webhook was received
SELECT * FROM ad_campaigns WHERE status = 'pending';

-- Manually activate (temporary fix)
UPDATE ad_campaigns 
SET status = 'active', start_date = NOW() 
WHERE stripe_session_id = 'cs_...';
```

---

### Issue: "Database error when creating campaign"

**Check:**
1. Tables exist in Supabase
2. RLS policies allow inserts
3. User is authenticated

**Fix:**
```sql
-- Verify tables
\dt ad_*

-- Check RLS
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Temporarily disable RLS for testing
ALTER TABLE ad_campaigns DISABLE ROW LEVEL SECURITY;
```

---

## ✅ SUCCESS CRITERIA

**All tests pass if:**

- ✅ Can access `/advertise` page
- ✅ Can select package and fill form
- ✅ Stripe checkout completes successfully
- ✅ Redirects to dashboard with success message
- ✅ Campaign appears in dashboard
- ✅ Database record created in `ad_campaigns`
- ✅ Subscription created in Stripe
- ✅ Webhook events show "Success"
- ✅ Auth required for dashboard
- ✅ User data isolated correctly

---

## 📈 METRICS TO TRACK

After testing, note these baseline metrics:

| Metric | Target | Actual |
|--------|--------|--------|
| Page load time | < 2s | ___ |
| Checkout flow time | < 3 min | ___ |
| Webhook delivery | < 5s | ___ |
| Database insert | < 1s | ___ |

---

## 🚀 NEXT STEPS AFTER TESTING

Once all tests pass:

1. ✅ Document any bugs found
2. ✅ Fix issues
3. ✅ Re-test
4. ✅ Deploy to production (Vercel)
5. ✅ Switch to live Stripe keys
6. ✅ Announce launch!

---

**Ready to test, boss!** 🧪🐥

Start with **Pre-Flight Checks** (5 min), then **Functional Tests** (15 min).

Let me know if anything fails and I'll fix it immediately! 💪
