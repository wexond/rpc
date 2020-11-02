export const getIPCContexts = () => {
  if (require && process?.kill) {
    const { ipcRenderer, ipcMain } = require('electron');
    return { ipcRenderer, ipcMain };
  }

  return {};
};
