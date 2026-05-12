# 🏳️‍🌈 Portugal Pride Pinkwashing Observatory - Setup Guide

## 🎯 What You're Building

A conversational AI assistant that helps people report pinkwashing situations via a web chat widget embedded in a landing page.

---

## 📋 STEP-BY-STEP SETUP

### **STEP 1: Create RetellAI Agent** (15 min)

1. **Login to RetellAI**: https://app.retell.ai
2. **Create New Agent**:
   - Type: **Web Chat** (NOT Voice)
   - Name: `Portugal Pride Observatory`
   - Language: `Portuguese (Portugal)`

3. **Paste System Prompt** (from conversation above):
   - Go to: Agent → Configuration → System Prompt
   - Copy the full prompt I provided

4. **Paste Conversation Flow**:
   - Go to: Agent → Conversation Flow
   - Copy the 7-question flow I provided

5. **Test the Agent**:
   - Use the "Test" button in Retell
   - Go through all 7 questions
   - Verify it feels right

6. **Get Widget Code**:
   - Go to: Agent → Embed
   - Copy the JavaScript widget code
   - **Save your Agent ID** (you'll need it)

---

### **STEP 2: Setup Database** (10 min)

1. **Go to Supabase**: https://supabase.com/dashboard
2. **Select your project** (web4city or new one)
3. **SQL Editor** → New Query
4. **Copy-paste** the contents of: `CREATE-PINKWATCHING-DB.sql`
5. **Run** the SQL
6. **Verify** tables were created

---

### **STEP 3: Configure Webhook in Retell** (5 min)

1. **In Retell Dashboard**: Settings → Webhooks
2. **Add Webhook**:
   ```
   URL: https://web4city.xyz/api/portugal-pride/save-report
   Method: POST
   Event: on_conversation_complete
   ```
3. **Add Authorization Header**:
   ```
   Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY
   ```

---

### **STEP 4: Deploy the Code** (10 min)

```bash
cd /Users/eduardomarques/web3-district-app

# Add environment variables if needed
# (Supabase keys should already be in .env.local)

# Push to GitHub
git add .
git commit -m "feat: Portugal Pride Pinkwashing Observatory 🏳️‍🌈"
git push origin main

# Wait for Vercel to deploy (~2 min)
```

---

### **STEP 5: Build Landing Page** (30 min)

Create a new page at `/Users/eduardomarques/web3-district-app/src/app/observatorio/page.tsx`:

```tsx
"use client";

export default function ObservatorioPage() {
  function openReporter() {
    // This will be available after Retell widget loads
    (window as any).RetellWebWidget?.open();
  }

  return (
    <div className="min-h-screen bg-[#1a1a24] text-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#FF007F] to-[#009933] py-20 text-center">
        <h1 className="mb-4 text-4xl font-bold">Observatório do Pinkwashing</h1>
        <p className="mb-8 text-xl">
          Tecnologia e IA para distinguir compromisso real de apropriação simbólica
        </p>
        <button
          onClick={openReporter}
          className="rounded-lg bg-white px-8 py-4 text-lg font-bold text-[#FF007F]"
        >
          🏳️‍🌈 Reportar uma Situação
        </button>
      </section>

      {/* Info sections here... */}
    </div>
  );
}
```

Then **paste the Retell widget code** in the page.

---

### **STEP 6: Test Full Flow** (15 min)

1. **Open landing page**: https://web4city.xyz/observatorio
2. **Click "Reportar"** button
3. **Chat widget opens**
4. **Go through all 7 questions**
5. **Submit**
6. **Check database**: Supabase → Table Editor → pinkwashing_reports
7. **Check dashboard**: https://web4city.xyz/admin/portugal-pride

---

## 🔐 SECURITY NOTES

### **API Keys**
- ⚠️ **NEVER commit API keys to Git**
- ✅ Store in `.env.local`:
  ```
  RETELL_API_KEY=key_xxxxx
  SUPABASE_SERVICE_ROLE_KEY=eyJxxxx
  ```

### **Webhook Security**
- Add signature verification in production
- Use HTTPS only
- Rotate keys periodically

### **Data Privacy (GDPR)**
- ✅ Anonymity option enabled
- ✅ Consent required before submit
- ✅ Right to deletion (add endpoint later)
- ✅ Data minimization (only collect what's needed)

---

## 📊 ACCESS POINTS

| Feature | URL |
|---------|-----|
| Landing Page | https://web4city.xyz/observatorio |
| Chat Widget | Embedded in landing page |
| Admin Dashboard | https://web4city.xyz/admin/portugal-pride |
| API Endpoint | https://web4city.xyz/api/portugal-pride/save-report |

---

## 🎨 CUSTOMIZATION

### **Widget Colors**
In the Retell widget config:
```javascript
theme: {
  primaryColor: '#FF007F', // Portugal Pride pink
  secondaryColor: '#009933', // Portugal green
}
```

### **Portuguese Voice/Tone**
- Already configured for PT-PT
- Uses "tu" (informal but respectful)
- Avoids Brazilian Portuguese expressions

---

## 🚀 LAUNCH CHECKLIST

- [ ] Retell agent created and tested
- [ ] Database tables created
- [ ] Webhook configured
- [ ] Code deployed to Vercel
- [ ] Landing page built
- [ ] Widget embedded
- [ ] Full flow tested end-to-end
- [ ] Dashboard accessible
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Team trained on dashboard

---

## 📞 SUPPORT

If something breaks:

1. **Check Retell logs**: Dashboard → Conversations
2. **Check API logs**: Vercel → Functions → Logs
3. **Check database**: Supabase → Table Editor
4. **Test webhook**: https://webhook.site (temporary URL for testing)

---

## 💰 COSTS

| Service | Estimated Cost |
|---------|---------------|
| RetellAI (Web Chat) | ~$50-100/month |
| Supabase | Free tier sufficient |
| Vercel | Free tier sufficient |
| **Total** | **~$50-100/month** |

---

## 🇵🇹 BOA SORTE!

Questions? Just ask boss! 🐥💛
