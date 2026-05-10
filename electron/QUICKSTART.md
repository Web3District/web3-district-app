# 🦑 Web4City Admin App - Quick Start Guide

---

## ⚡ ONE-COMMAND BUILD

From project root:

```bash
./build-admin-app.sh
```

That's it! ~5 minutes and you'll have `Web4City Admin.app`!

---

## 📦 WHAT YOU GET

After build completes:

```
dist/Web4City Admin-1.0.0.dmg  ← Your installer
```

**Install:**
1. Open the `.dmg` file
2. Drag `Web4City Admin` to Applications folder
3. Launch from Applications

**First launch:**
- macOS will show a warning (normal for unsigned apps)
- Right-click the app → Open → Click "Open"
- Done! Never see warning again ✅

---

## 🎯 USING THE APP

### Login
- Opens to admin login page
- Sign in with GitHub (same as web)
- Credentials saved securely

### Navigation
- **Cmd+1** - City Dashboard
- **Cmd+2** - Ads Manager
- **Cmd+3** - Drops
- **Cmd+R** - Refresh page
- **Cmd+Q** - Quit app

### Features
- ✅ All admin pages from web version
- ✅ Native macOS window
- ✅ Menu bar integration
- ✅ Dock icon
- ✅ No localhost needed!
- ✅ Works offline (cached data)

---

## 🔄 UPDATING THE APP

When you push changes to GitHub:

```bash
# Rebuild app
./build-admin-app.sh

# Replace old app
rm -rf /Applications/Web4City\ Admin.app
cp -r dist/Web4City\ Admin.app /Applications/
```

**Future:** Auto-updates via GitHub Releases (optional)

---

## 🐛 TROUBLESHOOTING

### Build fails
```bash
# Clean and retry
rm -rf electron/node_modules dist out
cd electron && npm install
cd .. && ./build-admin-app.sh
```

### App shows white screen
- Make sure you're logged in
- Check Console.app for errors
- Try Cmd+R to refresh

### Can't open app
- Right-click → Open (first time only)
- Check System Preferences → Security

---

## 📊 TECH DETAILS

- **Framework:** Electron 30
- **Backend:** Next.js exported build
- **Size:** ~150MB (includes Chromium)
- **Startup:** ~2 seconds
- **Memory:** ~200MB typical

---

## 🎨 CUSTOMIZATION

Want to change the icon?
1. Replace `electron/icon.png` (512x512 PNG)
2. Rebuild: `./build-admin-app.sh`

Want to change app name?
1. Edit `electron/package.json` → `productName`
2. Rebuild

---

**Built with 🐥 by Pint0 for Eddie 🦑**

Questions? Just ask!
