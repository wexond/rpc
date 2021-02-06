let cachedIpcRenderer: Electron.IpcRenderer | undefined;
let cachedIpcMain: Electron.IpcMain | undefined;

export const checkIpcContext = (): 'main' | 'renderer' => {
  if (cachedIpcRenderer) return 'renderer';
  if (cachedIpcMain) return 'main';
  throw new Error('Neither ipcMain nor ipcRenderer has been set.');
}

export const getIpcRenderer = (): Electron.IpcRenderer | undefined => {
  return cachedIpcRenderer;
};

export const getIpcMain = (): Electron.IpcMain | undefined => {
  return cachedIpcMain;
};

export const setIpcRenderer = (ipcRenderer: Electron.IpcRenderer) => {
  cachedIpcRenderer = ipcRenderer;
};

export const setIpcMain = (ipcMain: Electron.IpcMain) => {
  cachedIpcMain = ipcMain;
};
