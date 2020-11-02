import { WebContents } from 'electron';

import { IpcScaffold, IpcHandler } from './interfaces';
import { IpcBase } from './ipc-base';
import { getIPCContexts } from './utils/electron';

const { ipcMain, ipcRenderer } = getIPCContexts();

export class IpcMainToRenderer<T extends IpcScaffold<T>> extends IpcBase<T> {
  public createInvoker(webContents: WebContents) {
    if (!ipcMain) throw Error('Not in the main process.');

    if (!webContents?.send) {
      throw new Error('Given webContents is invalid.');
    }

    return this.channel.createInvoker(
      (channelName, functionName) => (...args: any[]) => {
        return new Promise((resolve, reject) => {
          const id = '_' + Math.random().toString(36).substr(2, 9);
          ipcMain.once(
            `${this.name}${functionName}${id}`,
            (e, returnValue) => {
              resolve(returnValue);
            },
          );

          webContents.send(channelName, functionName, id, ...args);
        });
      },
    );
  }

  public registerHandler(handler: IpcHandler<T>) {
    if (!ipcRenderer) throw Error('Not in the renderer process.');

    const messageHandler = this.channel.createHandler<IpcHandler<T>>(handler);

    // Handle asynchronous messages.
    ipcRenderer.on(
      this.name,
      async (e, functionName: string, id: string, ...args) => {
        let res = Promise.resolve(messageHandler(functionName, {}, ...args));

        ipcRenderer.send(`${this.name}${functionName}${id}`, await res);
      },
    );
  }
}
