import { app, BrowserWindow, ipcMain } from 'electron';
import { resolve } from 'path';
import { IpcHandler } from '~/lib/receiver';
import { tabChannel, TabService } from '~/shared/tabs';
import { uiChannel } from '~/shared/ui';

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

class TabHandler implements IpcHandler<TabService> {
  show(id: number): boolean {
    return true;
  }
  getTabId(): number {
    return -1;
  }
}

(async () => {
  await app.whenReady();

  const handler = new TabHandler();
  tabChannel.registerHandler(handler);

  const window = createWindow();

  window.webContents.on('dom-ready', async () => {
    console.log('UI Service')
    const uiService = uiChannel.createInvoker(window.webContents);
    console.log(await uiService.showButton());
  });

})();
