/**
 * Electron Main Process
 * 
 * This is the entry point for the Electron application.
 * It creates and manages the browser window that displays the Next.js app.
 * 
 * Usage:
 *   1. First run `npm run build` to build the Next.js app
 *   2. Then run `npm run electron:dev` to start Electron
 * 
 * For development, you can run Next.js dev server separately and
 * point Electron to http://localhost:3002
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'Cycling Network Platform',
    backgroundColor: '#f8fafc',
  });

  // In development, load from dev server
  // In production, load from built files
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3002');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
