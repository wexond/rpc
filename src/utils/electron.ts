import { IpcRenderer, IpcMain } from 'electron';

export const getGlobalIPC = () => {
  let globalIpcRenderer: IpcRenderer | undefined = undefined;
  let globalIpcMain: IpcMain | undefined = undefined;

  if (require) {
    const { ipcRenderer, ipcMain } = require('electron');
    globalIpcRenderer = ipcRenderer;
    globalIpcMain = ipcMain;
  }

  return { globalIpcRenderer, globalIpcMain };
};
