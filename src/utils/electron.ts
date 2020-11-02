let cacheIpc: {
  ipcRenderer?: Electron.IpcRenderer,
  ipcMain?: Electron.IpcMain,
} = {};

const cacheModule = (key: 'ipcRenderer' | 'ipcMain', val?: any): any => {
  if (!cacheIpc[key]) cacheIpc[key] = val ? val : require?.('electron')?.[key];
  return cacheIpc[key];
}

export const getIpcRenderer = (): Electron.IpcRenderer | undefined => {
  return cacheModule('ipcRenderer');
}

export const getIpcMain = (): Electron.IpcMain | undefined => {
  return cacheModule('ipcMain');
}

export const setIpcRenderer = (ipcRenderer: Electron.IpcRenderer) => {
  cacheModule('ipcRenderer', ipcRenderer);
}

export const setIpcMain = (ipcMain: Electron.IpcMain) => {
  cacheModule('ipcMain', ipcMain);
}