# 🔑 Unsend API Key Troubleshooting

**Date**: 2026-05-01  
**Issue**: API keys returning 403 Forbidden

---

## ❌ TESTED KEYS (Both Failed)

1. `un_23MMY1HH2KLZL5MIKW01Y2KHYYW0L5ZJ` → 403 Forbidden
2. `un_Z4YLK5WYH3Z0YJXJ4J3Z1204MH31LWZ0` → 403 Forbidden

---

## ✅ WHAT WE VERIFIED

- ✅ API endpoint is reachable: `https://app.unsend.dev/api/v1/send`
- ✅ SSL certificate is valid
- ✅ Network connectivity works
- ✅ Request format is correct
- ❌ **API keys are invalid/inactive**

---

## 🔍 POSSIBLE CAUSES

### 1. **Key Not Activated**
Newly created API keys might need:
- Email verification
- Account activation
- Domain verification first

### 2. **Wrong Permissions**
The API key might be created but lacks:
- "Send emails" permission
- Correct scope/role

### 3. **Account Issues**
- Account not fully verified
- Email domain not verified
- Account in sandbox/test mode

### 4. **Key Format**
- Key might be truncated when copied
- Extra spaces or characters
- Wrong key type (some services have multiple key types)

---

## 🎯 STEP-BY-STEP FIX

### Step 1: Verify Account Status

1. Go to https://app.unsend.dev
2. Log in to your account
3. Check for any:
   - ⚠️ Verification pending notices
   - ⚠️ Domain verification required
   - ⚠️ Account activation needed

### Step 2: Check/Create API Key

1. Go to **Settings** → **API Keys** (or **Dev Settings** → **API Keys**)
2. Look at existing keys:
   - Is the key **active** (not revoked)?
   - Does it have **"send emails"** permission?
   - When was it created?

3. **Create a NEW key**:
   - Click "Create API Key"
   - Name: `Web4City Production`
   - **Grant ALL permissions** (for testing)
   - Copy the ENTIRE key
   - Save it securely

### Step 3: Verify Domain (If Required)

Some email services require domain verification before sending:

1. Go to **Domains** or **Settings** → **Domains**
2. Add `web4city.xyz`
3. Add DNS records to your domain registrar:
   - TXT record for verification
   - MX records (if using their email routing)
   - SPF/DKIM records
4. Wait for verification (can take minutes to hours)

**For testing**, most services allow sending from their default domain:
- `onboarding@resend.dev` (Resend)
- Check what Unsend provides

### Step 4: Test the Key

```bash
cd /Users/eduardomarques/web3-district-app

# Update .env.local with new key
# Then test:

export UNSEND_API_KEY=un_your-new-key
npx tsx src/lib/verify-unsend-key.ts
```

### Step 5: Check API Response Details

If still failing, check the full response:

```bash
curl -v -X POST https://app.unsend.dev/api/v1/send \
  -H "Authorization: Bearer un_your-key" \
  -H "Content-Type: application/json" \
  -d '{"from":"Test <test@example.com>","to":["eddiezebra@gmail.com"],"subject":"Test","html":"<h1>Test</h1>"}'
```

Look for:
- Specific error codes
- Error messages
- Required headers

---

## 💡 ALTERNATIVES TO TRY

### Option A: Use Resend (Already Configured)

You already have Resend config in `.env.local`:

```bash
# Comment out Unsend
# UNSEND_API_KEY=un_...

# Uncomment Resend
RESEND_API_KEY=re_your-resend-key
```

Then temporarily switch code back to Resend.

### Option B: Try Unsend SDK

Instead of direct API calls, try their official SDK:

```bash
npm install unsend
```

```typescript
import { Unsend } from 'unsend';

const unsend = Unsend('un_Z4YLK5WYH3Z0YJXJ4J3Z1204MH31LWZ0');

await unsend.emails.send({
  from: 'Web4City <hello@web4city.xyz>',
  to: ['eddiezebra@gmail.com'],
  subject: 'Test',
  html: '<h1>Test</h1>',
});
```

### Option C: Contact Unsend Support

If nothing works:
- GitHub: https://github.com/unsend-dev/unsend
- Discord: Check their docs for community link
- Email: support@unsend.dev (if available)

---

## 📋 CHECKLIST

Before the key will work, ensure:

- [ ] Account is fully verified (email confirmed)
- [ ] API key is created and active
- [ ] API key has "send emails" permission
- [ ] Domain is verified OR using default domain
- [ ] Key is copied correctly (no truncation)
- [ ] No extra spaces in `.env.local`
- [ ] Correct API endpoint URL

---

## 🎯 WHAT TO SEND ME

Once you have a working key or figure out the issue, let me know:

1. **Is the key working?**
2. **Did you need to verify domain?**
3. **Any special setup steps?**
4. **Or should we switch to Resend temporarily?**

---

**I'm standing by to test as soon as you have updates!** 🐥⚡
