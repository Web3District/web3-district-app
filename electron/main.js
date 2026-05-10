const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;

// App metadata
const APP_NAME = 'Web4City Admin';
const ADMIN_URL = isDev 
  ? 'http://localhost:3000/admin/login' 
  : `file://${path.join(__dirname, '../out/admin/login.html')}`;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    titleBarStyle: 'hiddenInset', // Native macOS title bar
    vibrancy: 'sidebar', // macOS translucency
    visualEffectState: 'active',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false, // Don't show until ready
  });

  // Load the admin dashboard
  if (isDev) {
    // Development mode - load from localhost
    mainWindow.loadURL('http://localhost:3000/admin/login');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load exported Next.js build
    mainWindow.loadFile(path.join(__dirname, '../out/admin/login/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create menu
  createMenu();
}

// Create native menu bar
function createMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        {
          label: 'About Web4City Admin',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Web4City Admin',
              message: 'Web4City Admin Dashboard',
              detail: 'Version 1.0.0\nBuilt with Electron\n\nManage your Web4City platform with full control.',
            });
          },
        },
        { type: 'separator' },
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(isDev ? 'http://localhost:3000/admin/city' : `file://${path.join(__dirname, '../out/admin/city/index.html')}`);
            }
          },
        },
        {
          label: 'Ads Manager',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(isDev ? 'http://localhost:3000/admin/ads' : `file://${path.join(__dirname, '../out/admin/ads/index.html')}`);
            }
          },
        },
        {
          label: 'Drops',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.loadURL(isDev ? 'http://localhost:3000/admin/drops' : `file://${path.join(__dirname, '../out/admin/drops/index.html')}`);
            }
          },
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        {
          label: 'Open Developer Tools',
          accelerator: 'Alt+CmdOrCtrl+I',
          click: () => {
            if (mainWindow) mainWindow.webContents.openDevTools();
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://docs.web4city.xyz');
          },
        },
        {
          label: 'Report Issue',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/Web3District/web3-district-app/issues');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(createWindow);

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // Re-create window when dock icon is clicked (macOS)
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Security: Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Allow navigation within the app
    if (isDev && parsedUrl.origin !== 'http://localhost:3000') {
      event.preventDefault();
    } else if (!isDev && parsedUrl.protocol !== 'file:') {
      event.preventDefault();
    }
  });
});
