/**
 * Electron Preload Script
 * 
 * This script runs before the renderer process loads.
 * It can expose safe APIs to the renderer process.
 * 
 * For security, we use contextIsolation and only expose
 * specific APIs through contextBridge.
 */

const { contextBridge } = require('electron');

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
