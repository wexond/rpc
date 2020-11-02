import { WebContents } from 'electron';

import { RpcScaffold, RpcRendererHandler } from './interfaces';
import { RpcBase } from './ipc-base';
import { getIpcMain, getIpcRenderer } from './utils';

export class RpcMainToRenderer<T extends RpcScaffold<T>> extends RpcBase<T, RpcRendererHandler<T>> {
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

  public setHandler(handler: RpcRendererHandler<T> | undefined) {
    const ipcRenderer = getIpcRenderer();
    if (!ipcRenderer) throw Error('IpcRenderer not found.');

    if (!handler) {
      if (this.asyncHandler) {
        ipcRenderer.removeListener(this.name, this.asyncHandler);
        this.asyncHandler = undefined;
      }
      return;
    }

    const messageHandler = this.channel.createHandler<RpcRendererHandler<T>>(handler);

    // Handle asynchronous messages.
    this.asyncHandler = async (e, functionName: string, id: string, ...args) => {
      let res = Promise.resolve(messageHandler(functionName, e, ...args));
      ipcRenderer.send(`${this.name}${functionName}${id}`, await res);
    }
    ipcRenderer.on(this.name, this.asyncHandler);
  }
}
