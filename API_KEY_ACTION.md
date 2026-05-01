# ⚠️ ACTION REQUIRED: Unsend API Key Issue

**Date:** 2026-05-01  
**Status:** 🔴 BLOCKED - Invalid API Key

---

## 🚨 THE PROBLEM

The Unsend API key you provided is **INVALID** or **INACTIVE**:

```
API Key: un_23MMY1HH2KLZL5MIKW01Y2KHYYW0L5ZJ
Error: 403 Forbidden - "Invalid API token"
```

---

## ✅ WHAT'S ALREADY DONE

I've completed all the setup on our end:

1. ✅ **Environment Config** - `.env.local` updated
2. ✅ **Email Service** - `src/lib/unsend.ts` created
3. ✅ **Stripe Webhook** - Order confirmations wired up
4. ✅ **Ad Emails** - Migrated from Resend to Unsend
5. ✅ **Test Scripts** - Ready to verify when key works

**Everything is ready - we just need a valid API key!**

---

## 🔧 HOW TO FIX

### Option 1: Create New API Key (Recommended)

1. **Go to Unsend Dashboard**
   - https://app.unsend.dev

2. **Navigate to API Keys**
   - Settings → API Keys
   - Or: https://app.unsend.dev/settings/api-keys

3. **Create New Key**
   - Click "Create API Key"
   - Give it a name: "Web4City Production"
   - Ensure it has **send emails** permission
   - Copy the key (starts with `un_`)

4. **Update `.env.local`**
   ```bash
   UNSEND_API_KEY=un_your-new-key-here
   ```

5. **Test It**
   ```bash
   cd /Users/eduardomarques/web3-district-app
   export UNSEND_API_KEY=un_your-new-key
   npx tsx src/lib/verify-unsend-key.ts
   ```

### Option 2: Check Existing Key

If you already have a key in Unsend:

1. **Verify it's active** (not revoked)
2. **Check permissions** (needs "send emails")
3. **Copy it again** (maybe there was a typo)
4. **Update `.env.local`**

---

## 📋 VERIFICATION CHECKLIST

Once you have the new key:

- [ ] Add to `.env.local`
- [ ] Run verification script
- [ ] Check for success message
- [ ] Check your email for test message
- [ ] Deploy to production (Vercel env vars)

---

## 🧪 TEST COMMANDS

### Quick Verify
```bash
cd /Users/eduardomarques/web3-district-app
export UNSEND_API_KEY=un_your-key
npx tsx src/lib/verify-unsend-key.ts
```

### Full Test Suite
```bash
export TEST_EMAIL=your-email@gmail.com
npx tsx src/lib/test-unsend.ts
```

---

## 📧 WHAT EMAILS WE'LL SEND

Once the key is working:

| Trigger | Email | Recipient |
|---------|-------|-----------|
| **Shop Purchase** | Order Confirmation + Receipt | Buyer |
| **Ad Package Purchase** | Order Confirmation + Receipt | Advertiser |
| **Password Reset** | Reset Link | User |
| **Welcome** | Getting Started Guide | New user |
| **Ad Expiring (3 days)** | Warning Notification | Advertiser |
| **Ad Expired** | Campaign Summary | Advertiser |

---

## 🎯 NEXT STEPS

1. **🔑 Get valid API key** from Unsend dashboard
2. **✅ Test with verification script**
3. **🚀 Deploy to Vercel** (add env var there too)
4. **📧 Monitor first few emails** to ensure delivery

---

## 💡 ALTERNATIVE: Use Resend Temporarily

If Unsend is giving trouble, we can switch back to Resend temporarily:

1. Use existing Resend config in `.env.local`
2. Comment out Unsend imports
3. Switch back to `getResend()` in email functions

**But Unsend is the better long-term choice!** (open-source, privacy-focused, cost-effective)

---

## 📞 NEED HELP?

- **Unsend Docs:** https://docs.unsend.dev
- **Unsend Support:** Check their Discord or GitHub
- **Me (Pint0):** Just ping me in Telegram! 🐥

---

**Ready to roll as soon as you drop that new API key!** 🚀
