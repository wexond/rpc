import {
  Receiver,
  RpcScaffold,
  clearEvents,
  getNoHandlerError,
} from '@wexond/rpc-core';

import { RpcMainHandler, RpcMainObserver } from '../interfaces';
import { cacheIpcPossiblyInvalid, getIpcMain } from '../utils';

export class MainReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcMainHandler<T>,
  RpcMainObserver<T>
> {
  constructor(name: string) {
    super(name);

    // Don't throw no ipcMain error if there's ipcRenderer available.
    if (cacheIpcPossiblyInvalid('ipcRenderer')) return;

    const ipcMain = getIpcMain();

    // Prevent EventEmitter leaks.
    clearEvents(ipcMain, this.name);

    ipcMain.on(this.name, async (e, method: string, ...args) => {
      const caller = this.createCaller(method, e, ...args);

      this.observers.notify(caller);

      if (!this.handler) {
        console.error(getNoHandlerError(this.name, method));
        e.returnValue = undefined;
        return;
      }

      e.returnValue = await Promise.resolve(caller.cb(this.handler));
    });

    ipcMain.handle(this.name, (e, method: string, ...args) => {
      if (!this.handler) throw getNoHandlerError(this.name, method);

      const caller = this.createCaller(method, e, ...args);

      this.observers.notify(caller);

      return caller.cb(this.handler);
    });
  }
}
