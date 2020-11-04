import { ipcRenderer } from 'electron';

// Optionally you can use |setIpcRenderer| to set a custom ipcRenderer.
// This can be useful if your webContents has |contextIsolation| set to true,
// which implies that `require('electron').ipcRenderer` would not work.
// Though, channels could be exposed using |contextBridge| also.
import { setIpcRenderer } from '@wexond/rpc-electron';
setIpcRenderer(ipcRenderer);

import { loggerChannel } from './shared';

const loggerService = loggerChannel.getInvoker();

async function main() {
  console.log(await loggerService.log('hello there')); // Prints `true`.
}

main();
