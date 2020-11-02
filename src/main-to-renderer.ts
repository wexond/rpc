import { WebContents } from 'electron';

import {
  RpcScaffold,
  RpcRendererHandler,
  RpcRendererObserver,
} from './interfaces';
import { RpcBase } from './rpc-base';
import { cacheIpcPossiblyInvalid, getIpcMain, getIpcRenderer } from './utils';
import { getNoHandlerError } from './utils/errors';

export class RpcMainToRenderer<T extends RpcScaffold<T>> extends RpcBase<
  T,
  RpcRendererHandler<T>,
  RpcRendererObserver<T>
> {
  constructor(name: string) {
    super(name);

    // Don't throw no ipcRenderer error if there's ipcMain available.
    if (cacheIpcPossiblyInvalid('ipcMain')) return;

    const ipcRenderer = getIpcRenderer();

    ipcRenderer.on(
      this.name,
      async (e, functionName: string, id: string, ...args) => {
        const caller = this.channel.createCaller(functionName, e, ...args);

        let error: any = undefined;
        let ret: any = undefined;

        try {
          if (!this.handler) throw getNoHandlerError(this.name, functionName);
          ret = await Promise.resolve(caller(this.handler));
        } catch (e) {
          error = e;
        }

        ipcRenderer.send(`${this.name}${functionName}${id}`, ret, error);

        for (const observer of this.observers) {
          caller(observer);
        }
      },
    );
  }

  public createInvoker(webContents: WebContents) {
    const ipcMain = getIpcMain();

    if (!webContents?.send) {
      throw new Error('Given webContents is invalid.');
    }

    return this.channel.createInvoker(
      (channelName, functionName) => (...args: any[]) => {
        return new Promise((resolve, reject) => {
          const id = '_' + Math.random().toString(36).substr(2, 9);
          ipcMain.once(`${this.name}${functionName}${id}`, (e, returnValue) => {
            resolve(returnValue);
          });

          webContents.send(channelName, functionName, id, ...args);
        });
      },
    );
  }
}
