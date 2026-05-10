// Preload script - runs in a privileged context
// Exposes safe APIs to the renderer process

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Platform info
  platform: process.platform,
  
  // Send messages to main process
  send: (channel, data) => {
    const validChannels = ['navigate', 'refresh', 'open-external'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Receive messages from main process
  receive: (channel, func) => {
    const validChannels = ['app-update', 'notification'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // Open external URLs safely
  openExternal: (url) => {
    ipcRenderer.invoke('open-external', url);
  },
});

// Log that preload is loaded (for debugging)
console.log('[Web4City Admin] Preload script loaded');
