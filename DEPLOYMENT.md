# 🚀 Web4City Deployment Guide

**Never lose changes to Vercel cache/deployment issues again!**

---

## 📋 Quick Start

### Deploy Changes (Recommended)
```bash
cd /Users/eduardomarques/web3-district-app
./scripts/deploy.sh "Your commit message here"
```

This script will:
1. ✅ Check for uncommitted changes
2. ✅ Pull latest from GitHub
3. ✅ Create deployment commit
4. ✅ Push to GitHub (triggers Vercel)
5. ✅ **Automatically verify** the deployment succeeded

### Just Verify Deployment
```bash
./scripts/verify-deploy.sh
```

---

## 🔧 Why Deployments Fail

### Common Issues:

| Issue | Cause | Solution |
|-------|-------|----------|
| **Old content showing** | Browser cache | Hard refresh: `Cmd+Shift+R` |
| **Vercel didn't deploy** | No git push | Use `./scripts/deploy.sh` |
| **Build error** | Code error | Check Vercel dashboard logs |
| **CDN cache** | Vercel edge cache | Wait 2-5 min, add `?nocache=1` |

---

## 📊 Deployment Checklist

Before deploying:
- [ ] Code changes committed
- [ ] Tested locally (`npm run dev`)
- [ ] No TypeScript errors

After deploying:
- [ ] Run `./scripts/verify-deploy.sh`
- [ ] Hard refresh browser (`Cmd+Shift+R`)
- [ ] Check key pages load correctly

---

## 🚨 Troubleshooting

### "Changes not showing after deploy"

1. **Hard refresh the page:**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **Clear browser cache:**
   - Chrome: `Cmd+Shift+Delete` → Clear cached images
   - Or use Incognito mode to test

3. **Add cache-busting param:**
   ```
   https://web4city.xyz?nocache=123456
   ```

4. **Check Vercel deployment status:**
   ```bash
   # Open Vercel dashboard
   open https://vercel.com/web3district/web3-district-app/deployments
   ```

5. **Verify latest commit is deployed:**
   ```bash
   git log -1 --oneline
   # Compare with Vercel dashboard
   ```

### "Vercel build failed"

1. Check build logs:
   ```bash
   open https://vercel.com/web3district/web3-district-app
   ```

2. Common build errors:
   - TypeScript errors → Fix and redeploy
   - Missing dependencies → Run `npm install` and commit `package-lock.json`
   - Environment variables → Check Vercel project settings

### "Need to force redeploy"

```bash
# Create empty commit to trigger Vercel
git commit --allow-empty -m "Trigger redeploy"
git push origin main

# Verify
./scripts/verify-deploy.sh
```

---

## 🔔 Monitoring

### Health Check Script
Runs every 6 hours via cron (if configured):
```bash
./scripts/check-site-health.sh
```

Checks:
- ✅ Site is reachable
- ✅ Expected content exists
- ✅ Search placeholder is correct
- ✅ No build errors

### Manual Health Check
```bash
curl -s https://web4city.xyz | grep -o 'placeholder="[^"]*"'
# Should show: placeholder="USE YOUR GITHUB TO CLAIM YOUR LAND"
```

---

## 📱 Vercel Notifications

### Setup Deployment Alerts (One-time)

1. Go to Vercel Dashboard
2. Project Settings → Notifications
3. Add Telegram/Discord/Email webhook
4. Configure for:
   - ✅ Deployment created
   - ✅ Deployment failed
   - ✅ Deployment succeeded

### GitHub Integration
Vercel auto-deploys on push to `main` branch. No manual action needed!

---

## 🛠️ Scripts Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy.sh` | Full deploy + verify | `./scripts/deploy.sh "message"` |
| `verify-deploy.sh` | Check if deploy succeeded | `./scripts/verify-deploy.sh` |
| `check-site-health.sh` | Monitor site health | `./scripts/check-site-health.sh` |

---

## 💡 Pro Tips

1. **Always use the deploy script** - It verifies automatically
2. **Wait 2-5 minutes** after push before checking
3. **Hard refresh** - Browser cache is the #1 culprit
4. **Check Vercel dashboard** when in doubt
5. **Test in incognito** to rule out cache issues

---

## 📞 When All Else Fails

1. Check Vercel deployment logs
2. Check GitHub Actions (if any)
3. Try local build: `npm run build`
4. Contact Vercel support if platform issue

---

_Last updated: 2026-05-07 by 🐥 Pint0_
