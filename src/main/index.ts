import { app, BrowserWindow, ipcMain } from 'electron';
import { resolve } from 'path';

const createWindow = () => {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      sandbox: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: resolve(app.getAppPath(), 'build', 'appPreload.bundle.js'),
    },
  });

  window.webContents.openDevTools({ mode: 'right' });

  window.once('ready-to-show', () => {
    window.show();
  });

  window.loadURL('http://localhost:4444/app.html');

  return window;
};

(async () => {
  await app.whenReady();
  createWindow();
})();
