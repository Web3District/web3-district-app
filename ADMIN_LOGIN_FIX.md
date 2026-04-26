# 🔧 Admin Login Fix - OAuth Redirect URLs

## ❌ THE PROBLEM

After GitHub OAuth login, you're redirected back to `/admin/login` instead of `/admin/ads`.

**Why:** Supabase needs to know which URLs are allowed for OAuth redirects.

---

## ✅ THE FIX

### **Step 1: Add Redirect URLs in Supabase**

1. **Go to:** https://supabase.com/dashboard/project/rhppbqsuktyunxfwnddp/auth/url-configuration

2. **Add these Site URLs:**
   ```
   http://localhost:3002
   https://web4city.xyz
   ```

3. **Add these Redirect URLs:**
   ```
   http://localhost:3002/auth/callback
   http://localhost:3002/auth/callback?next=/admin/ads
   http://localhost:3002/auth/callback?next=/shop
   https://web4city.xyz/auth/callback
   https://web4city.xyz/auth/callback?next=/admin/ads
   ```

4. **Click "Save"**

---

### **Step 2: Verify GitHub OAuth App**

1. **Go to:** https://github.com/settings/developers → Web4City

2. **Verify Authorization callback URL:**
   ```
   https://rhppbqsuktyunxfwnddp.supabase.co/auth/v1/callback
   ```
   ✅ This should already be correct

---

### **Step 3: Clear Browser Cache**

1. **Open DevTools** (F12 or Cmd+Option+I)
2. **Go to:** Application → Storage
3. **Click:** "Clear site data"
4. **Or:** Hard refresh (Cmd+Shift+R)

---

### **Step 4: Test Again**

1. **Go to:** http://localhost:3002/admin/login
2. **Click:** "Sign in with GitHub"
3. **Authorize** the app
4. **Should redirect to:** `/admin/ads` ✅

---

## 🐛 STILL NOT WORKING?

### **Check Your GitHub Username**

The admin check looks for `eddiezebra` exactly.

**In browser console (F12):**
```javascript
// After login, check your username
const supabase = createBrowserSupabase();
supabase.auth.getUser().then(({ data }) => {
  console.log("GitHub username:", data.user.user_metadata.user_name);
  console.log("Expected:", "eddiezebra");
});
```

If it shows a different username, update `.env.local`:
```bash
ADMIN_GITHUB_LOGINS=eddiezebra,your-actual-username
```

---

## 🎨 THEME ISSUE (Blue vs Lime Green)

If the theme changed to blue, check:

1. **GlobalRadio component** - theme selector might be stuck
2. **localStorage** - clear it:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

3. **Or add to `.env.local`:**
   ```bash
   NEXT_PUBLIC_DEFAULT_THEME=lime
   ```

---

## ✅ EXPECTED FLOW

1. Visit `/admin/login` → See login page
2. Click "Sign in with GitHub" → Redirect to GitHub
3. Authorize → Redirect back to `/auth/callback`
4. Callback creates session → Redirect to `/admin/ads`
5. See admin dashboard with ads table ✅

---

**Do Step 1 (add redirect URLs in Supabase), then test again!** 🚀
