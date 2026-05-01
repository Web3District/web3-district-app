# 📧 Web4City Email Setup - Unsend

This document covers the email integration for Web4City using **Unsend**.

---

## 🎯 What We Send

| Email Type | Trigger | Recipient |
|------------|---------|-----------|
| **Order Confirmation** | Ad/Shop purchase | Buyer |
| **Payment Receipt** | Successful payment | Buyer |
| **Password Reset** | Reset request | User |
| **Welcome Email** | New user signup | New user |
| **Ad Expiring** | 3 days before expiry | Advertiser |
| **Ad Expired** | Campaign ended | Advertiser |

---

## 🔑 Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Unsend (transactional emails)
UNSEND_API_KEY=un_your-api-key-here
UNSEND_FROM_EMAIL=hello@web4city.xyz
UNSEND_FROM_NAME=Web4City

# Optional: Test email address
TEST_EMAIL=your-email@gmail.com
```

### Get Your API Key

1. Go to https://app.unsend.dev
2. Sign up / Login
3. Navigate to **Settings → API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `un_`)

---

## 📁 File Structure

```
src/lib/
├── unsend.ts           # Main Unsend client & email functions
├── ad-emails.ts        # Ad-specific emails (expiring/expired)
├── email-template.ts   # Base HTML email template
├── test-unsend.ts      # Test script (run to verify setup)
└── resend.ts           # Legacy Resend client (can be removed)
```

---

## 🧪 Testing

### Run the Test Suite

```bash
cd /Users/eduardomarques/web3-district-app

# Set test email (optional - defaults to eddiezebra@gmail.com)
export TEST_EMAIL=your-email@gmail.com

# Run tests
npx tsx src/lib/test-unsend.ts
```

### Expected Output

```
🐥 Testing Unsend Email Integration...

✅ UNSEND_API_KEY configured
   From: hello@web4city.xyz
   Name: Web4City

📧 Test 1: Sending basic test email...
✅ Basic email sent successfully
   Message ID: msg_xxxxx

🛒 Test 2: Sending order confirmation...
✅ Order confirmation sent successfully

🔑 Test 3: Sending password reset...
✅ Password reset email sent successfully

🎉 Test 4: Sending welcome email...
✅ Welcome email sent successfully

───
📊 Test Summary:
   4/4 tests passed

🎉 All tests passed! Unsend is ready to use!
```

---

## 💻 Usage Examples

### Send Order Confirmation

```typescript
import { sendOrderConfirmationEmail } from "@/lib/unsend";

await sendOrderConfirmationEmail("customer@example.com", {
  orderId: "ORD-12345",
  items: [
    { name: "Skyline Ad Package", quantity: 1, price: 197.00 },
  ],
  total: 197.00,
  date: new Date().toLocaleDateString(),
});
```

### Send Password Reset

```typescript
import { sendPasswordResetEmail } from "@/lib/unsend";

await sendPasswordResetEmail(
  "user@example.com",
  "https://web4city.xyz/reset-password?token=abc123"
);
```

### Send Welcome Email

```typescript
import { sendWelcomeEmail } from "@/lib/unsend";

await sendWelcomeEmail("newuser@example.com", "JohnDoe");
```

### Send Ad Expiring Notification

```typescript
import { sendAdExpiringEmail } from "@/lib/ad-emails";

await sendAdExpiringEmail(
  "advertiser@example.com",
  "My Awesome Project",
  3, // days left
  "https://web4city.xyz/dashboard/ads/123"
);
```

### Send Custom Email

```typescript
import { sendEmail } from "@/lib/unsend";

await sendEmail({
  to: "recipient@example.com",
  subject: "Your Subject",
  html: "<h1>Hello!</h1><p>Your custom HTML content</p>",
  text: "Plain text version (optional)",
  replyTo: "support@web4city.xyz",
});
```

---

## 🎨 Email Templates

All emails use the base template from `email-template.ts` which includes:

- ✅ Web4City branding (logo, colors)
- ✅ Responsive design (mobile-friendly)
- ✅ Silkscreen font (retro gaming style)
- ✅ Professional footer with unsubscribe link
- ✅ Web4City branding and links

### Template Features

- **Logo**: Auto-loads from `/icon-512.png`
- **Colors**: Black (#111111) and white (#ffffff) theme
- **Font**: Silkscreen for headings, Helvetica for body
- **Buttons**: Black background, white text, rounded corners
- **Footer**: Site URL, unsubscribe link (when applicable)

---

## 🔧 Integration Points

### Checkout Flow

Wire up order confirmation emails in your Stripe webhook handler:

```typescript
// src/app/api/webhooks/stripe/route.ts
import { sendOrderConfirmationEmail } from "@/lib/unsend";

// After successful payment...
await sendOrderConfirmationEmail(customerEmail, {
  orderId: session.id,
  items: lineItems,
  total: amountTotal / 100,
  date: new Date().toLocaleDateString(),
});
```

### Authentication Flow

Send password reset emails from your auth API:

```typescript
// src/app/api/auth/reset-password/route.ts
import { sendPasswordResetEmail } from "@/lib/unsend";

await sendPasswordResetEmail(userEmail, resetUrl);
```

### User Onboarding

Send welcome emails after signup:

```typescript
// After user creation
await sendWelcomeEmail(user.email, user.username);
```

---

## 🐛 Troubleshooting

### Email Not Sending

1. **Check API Key**: Ensure `UNSEND_API_KEY` is set in `.env.local`
2. **Check Console**: Look for `[Unsend]` logs in server output
3. **Verify Domain**: If using custom domain, ensure DNS records are set
4. **Test Mode**: Unsend may have a test/sandbox mode - check their docs

### API Errors

- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: API key lacks permissions
- **429 Rate Limited**: Too many requests - add delays
- **500 Server Error**: Unsend service issue - retry later

### Testing Locally

- Emails will send to real addresses (Unsend doesn't have a local mock mode)
- Use a test email address you control
- Check spam folder if emails don't appear in inbox

---

## 📚 Resources

- **Unsend Docs**: https://docs.unsend.dev
- **Unsend Dashboard**: https://app.unsend.dev
- **Email Templates**: `src/lib/email-template.ts`
- **Test Script**: `src/lib/test-unsend.ts`

---

## 🚀 Next Steps

1. ✅ **Test email sending** - Run the test script
2. ⏳ **Wire up checkout flow** - Add order confirmations to Stripe webhook
3. ⏳ **Add password reset** - Integrate with auth system
4. ⏳ **Set up welcome emails** - Trigger on new user signup
5. ⏳ **Configure ad expiry cron** - Schedule expiring/expired notifications

---

**Last Updated**: 2026-05-01  
**Status**: ✅ Ready for testing
