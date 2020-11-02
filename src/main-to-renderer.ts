import { WebContents } from 'electron';

import { IpcScaffold, IpcHandler } from './interfaces';
import { IpcBase } from './ipc-base';
import { getIpcMain, getIpcRenderer } from './utils';

export class IpcMainToRenderer<T extends IpcScaffold<T>> extends IpcBase<T> {
  private asyncHandler: ((...args: any[]) => void) | undefined;

  public createInvoker(webContents: WebContents) {
    const ipcMain = getIpcMain();
    if (!ipcMain) throw Error('IpcMain not found.');

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

  public setHandler(handler: IpcHandler<T> | undefined) {
    const ipcRenderer = getIpcRenderer();
    if (!ipcRenderer) throw Error('IpcRenderer not found.');

    if (!handler) {
      if (this.asyncHandler) {
        ipcRenderer.removeListener(this.name, this.asyncHandler);
        this.asyncHandler = undefined;
      }
      return;
    }

    const messageHandler = this.channel.createHandler<IpcHandler<T>>(handler);

    // Handle asynchronous messages.
    this.asyncHandler = async (e, functionName: string, id: string, ...args) => {
      let res = Promise.resolve(messageHandler(functionName, {}, ...args));
      ipcRenderer.send(`${this.name}${functionName}${id}`, await res);
    }
    ipcRenderer.on(this.name, this.asyncHandler);
  }
}
