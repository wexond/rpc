import {
  Receiver,
  RpcScaffold,
  clearEvents,
  getNoHandlerError,
} from '@wexond/rpc-core';

import { RpcMainHandler, RpcMainObserver } from '../interfaces';
import { checkIpcContext, getIpcMain } from '../utils';

export class MainReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcMainHandler<T>,
  RpcMainObserver<T>
> {
  constructor(name: string) {
    super(name);
    
    checkIpcContext();

    const ipcMain = getIpcMain();
    if (!ipcMain) return;

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
      const caller = this.createCaller(method, e, ...args);

      this.observers.notify(caller);

      if (!this.handler) throw getNoHandlerError(this.name, method);
      return caller.cb(this.handler);
    });
  }

  public destroy() {
    clearEvents(getIpcMain(), this.name);
    getIpcMain().removeHandler(this.name);
  }
}
