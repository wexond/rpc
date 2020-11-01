import { WebContents } from 'electron';

import { IpcScaffold, IpcHandler } from './interfaces';
import { IpcBase } from './ipc-base';
import { getGlobalIPC } from './utils';

const { globalIpcMain, globalIpcRenderer } = getGlobalIPC();

export class IpcMainToRenderer<T extends IpcScaffold<T>> extends IpcBase<T> {
  public createInvoker(webContents: WebContents) {
    if (!globalIpcMain) throw Error('Not in the main process.');

    if (!webContents?.send) {
      throw new Error('Given webContents is invalid.');
    }

    return this.channel.createInvoker(
      (channelName, functionName) => (...args: any[]) => {
        return new Promise((resolve, reject) => {
          const id = '_' + Math.random().toString(36).substr(2, 9);
          globalIpcMain.once(
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
    if (!globalIpcRenderer) throw Error('Not in the renderer process.');

    const messageHandler = this.channel.createHandler<IpcHandler<T>>(handler);

    // Handle asynchronous messages.
    globalIpcRenderer.on(
      this.name,
      async (e, functionName: string, id: string, ...args) => {
        let ret = Promise.resolve(messageHandler(functionName, ...args));
        globalIpcRenderer.send(`${this.name}${functionName}${id}`, await ret);
      },
    );
  }
}
