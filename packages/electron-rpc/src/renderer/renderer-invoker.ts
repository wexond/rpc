import { WebContents } from 'electron';
import { Invoker, makeRandomId } from '@wexond/rpc-core';

import { getIpcMain } from '../utils';

export class RendererInvoker<T> extends Invoker {
  public create(webContents: WebContents) {
    const ipcMain = getIpcMain();

    if (!webContents?.send) {
      throw new Error('Given webContents is invalid.');
    }

    return this.createProxy<T>((method, ...args: any[]) => {
      return new Promise((resolve, reject) => {
        const id = makeRandomId();

        ipcMain.once(`${this.channelName}${method}${id}`, (e, returnValue) => {
          resolve(returnValue);
        });

        webContents.send(this.channelName, method, id, ...args);
      });
    });
  }
}
