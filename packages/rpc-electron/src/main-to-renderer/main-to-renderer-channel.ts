import {
  SingleReceiverChannel,
  createServiceProxy,
  makeRandomId,
  RpcScaffold,
} from '@wexond/rpc-core';

import { RendererReceiver } from './renderer-receiver';
import { checkIpcContext, getIpcMain } from '../utils';

export declare interface MainToRendererChannel<T> {
  getReceiver(): RendererReceiver<T>;
  getInvoker(webContents: Electron.WebContents): T;
}

export class MainToRendererChannel<
  T extends RpcScaffold<T>
> extends SingleReceiverChannel<T> {
  public isReceiver() {
    return checkIpcContext() === 'renderer';
  }

  protected createInvoker(webContents: Electron.WebContents): T {
    const ipcMain = getIpcMain();

    if (!webContents?.send) {
      throw new Error('Given webContents is invalid.');
    }

    return createServiceProxy<T>((method, ...args: any[]) => {
      return new Promise((resolve) => {
        const id = makeRandomId();

        ipcMain.once(`${this.name}${method}${id}`, (e, returnValue) => {
          resolve(returnValue);
        });

        webContents.send(this.name, method, id, ...args);
      });
    });
  }

  protected createReceiver() {
    return new RendererReceiver<T>(this.name);
  }
}
