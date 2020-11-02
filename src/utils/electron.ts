let ipcCache: {
  ipcRenderer?: Electron.IpcRenderer;
  ipcMain?: Electron.IpcMain;
} = {};

export const cacheIpcPossiblyInvalid = (
  key: 'ipcRenderer' | 'ipcMain',
  val?: any,
): any => {
  if (!ipcCache[key]) ipcCache[key] = val ? val : require?.('electron')?.[key];
  return ipcCache[key];
};

const cacheIpc = (key: 'ipcRenderer' | 'ipcMain', val?: any): any => {
  const ipc = cacheIpcPossiblyInvalid(key, val);
  if (!ipc) {
    throw Error(`${key} not found.`);
  }
  return ipc;
};

export const getIpcRenderer = (): Electron.IpcRenderer => {
  return cacheIpc('ipcRenderer');
};

export const getIpcMain = (): Electron.IpcMain => {
  return cacheIpc('ipcMain');
};

export const setIpcRenderer = (ipcRenderer: Electron.IpcRenderer) => {
  cacheIpc('ipcRenderer', ipcRenderer);
};

export const setIpcMain = (ipcMain: Electron.IpcMain) => {
  cacheIpc('ipcMain', ipcMain);
};
