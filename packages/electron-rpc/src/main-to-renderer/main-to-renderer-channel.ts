import {
  ChannelWithSingleReceiver,
  createServiceProxy,
  makeRandomId,
  RpcScaffold,
} from '@wexond/rpc-core';

import { RendererReceiver } from './renderer-receiver';
import { cacheIpcPossiblyInvalid, getIpcMain } from '../utils';

export class MainToRendererChannel<
  T extends RpcScaffold<T>
> extends ChannelWithSingleReceiver<T> {
  public isReceiver() {
    return cacheIpcPossiblyInvalid('ipcRenderer') != null;
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

  protected createReceiver(): RendererReceiver<T> {
    return new RendererReceiver<T>(this.name);
  }

  public getReceiver(): RendererReceiver<T> {
    return super.getReceiver();
  }

  public getInvoker(webContents: Electron.WebContents): T {
    return super.getInvoker(webContents);
  }
}
