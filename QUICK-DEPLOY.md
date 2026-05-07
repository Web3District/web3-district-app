# 🚀 Quick Deploy Reference

## One Command Deploy
```bash
cd /Users/eduardomarques/web3-district-app && ./scripts/deploy.sh "Your message"
```

## Verify Deployment
```bash
./scripts/verify-deploy.sh
```

## Check What's Live
```bash
curl -s https://web4city.xyz | grep -o 'placeholder="[^"]*"'
```

## Hard Refresh (Clear Cache)
- **Mac:** `Cmd + Shift + R`
- **Windows:** `Ctrl + Shift + R`

## Vercel Dashboard
https://vercel.com/web3district/web3-district-app/deployments

---

## If Changes Don't Show:

1. ✅ Check git pushed: `git log -1`
2. ✅ Check Vercel deploying: Open dashboard
3. ✅ Wait 2-5 minutes
4. ✅ Hard refresh browser
5. ✅ Run verify script

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Old text showing | Hard refresh + wait |
| Vercel not building | Check GitHub push succeeded |
| Build error | Check Vercel logs |
| Still stuck | `git commit --allow-empty -m "redeploy" && git push` |

---

_Save this file for quick reference!_
