# Web4City Admin - Native macOS App 🦑⚡

Central Admin Dashboard for Web4City platform - built with Electron.

---

## 🚀 Quick Start

### Development Mode

```bash
# 1. Install dependencies
cd electron
npm install

# 2. Start Next.js dev server (in root)
cd ..
npm run dev

# 3. Start Electron app (in another terminal)
cd electron
npm start
```

### Build Production App

```bash
# 1. Install dependencies
cd electron
npm install

# 2. Build the .app file
npm run dist

# 3. Find your app in dist/ folder
open dist/Web4City\ Admin-1.0.0.dmg
```

---

## 📦 What's Included

- **Native macOS app** (.dmg installer)
- **Menu bar integration** with shortcuts
- **Dock icon** with bounce on notifications
- **Auto-updates** (when configured with GitHub Releases)
- **Dark mode support**
- **Keyboard shortcuts**:
  - `Cmd+1` - City Dashboard
  - `Cmd+2` - Ads Manager
  - `Cmd+3` - Drops
  - `Cmd+R` - Refresh
  - `Cmd+Q` - Quit

---

## 🎯 Features

### Admin Dashboard Access
- City Analytics
- User Management
- Ad Management
- Drops Configuration
- Shop Items Editor
- Custom Colors Manager
- Database Viewer

### Native Features
- No localhost needed (after build)
- Persistent window state
- Native file dialogs
- System tray integration (optional)
- Global shortcuts (optional)

---

## 🔧 Configuration

### App Metadata
Edit `electron/package.json`:
- `productName` - App name
- `version` - App version
- `author` - Your info

### Build Settings
Edit `electron/package.json` → `build`:
- `appId` - Bundle identifier
- `mac.category` - App Store category
- `dmg.title` - Installer window title

---

## 📝 Notes

### First Launch
On first launch, macOS will show a warning:
> "Web4City Admin.app can't be opened because Apple cannot check it for malicious software."

**Fix:**
1. Right-click the app
2. Click **Open**
3. Click **Open** again

This is normal for unsigned apps - won't show again!

### Auto-Updates
To enable auto-updates:
1. Publish releases on GitHub
2. Configure `electron-updater`
3. App will check for updates on launch

---

## 🐛 Troubleshooting

### App won't start
```bash
# Check logs
Console.app → Search "Web4City Admin"
```

### White screen
- Make sure Next.js dev server is running (dev mode)
- Check browser console (Cmd+Alt+I)

### Build fails
```bash
# Clear cache
rm -rf node_modules dist out
npm install
npm run dist
```

---

## 📄 License

MIT - Web3District

---

**Built with ❤️ by Pint0 🐥**
