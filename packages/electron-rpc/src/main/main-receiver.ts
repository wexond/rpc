import {
  Receiver,
  RpcScaffold,
  clearEvents,
  HandlerInvokerService,
  getNoHandlerError,
} from '@wexond/rpc-core';

import { RpcMainObserver } from '../interfaces';
import { cacheIpcPossiblyInvalid, getIpcMain, getIpcRenderer } from '../utils';

export class MainReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcMainObserver<T>
> {
  constructor(
    channel: string,
    handlerInvoker: HandlerInvokerService,
    private readonly syncFunctions?: (keyof T)[],
  ) {
    super(channel, handlerInvoker);
  }

  public listen() {
    // Don't throw no ipcMain error if there's ipcRenderer available.
    if (cacheIpcPossiblyInvalid('ipcRenderer')) return;

    const ipcMain = getIpcMain();

    ipcMain.on(this.channel, async (e, method: string, ...args) => {
      const caller = this.createCaller(method, e, ...args);

      this.observers.notify(caller);

      if (
        !this.handlerInvoker &&
        this.syncFunctions?.includes(method as keyof T)
      ) {
        e.returnValue = undefined;
        throw getNoHandlerError(this.channel, method);
      }

      e.returnValue = await Promise.resolve(caller.cb(this.handlerInvoker));
    });

    ipcMain.handle(this.channel, (e, method: string, ...args) => {
      if (!this.handlerInvoker) throw getNoHandlerError(this.channel, method);
      return this.createCaller(method, e, ...args).cb(this.handlerInvoker);
    });
  }

  public clearEvents() {
    clearEvents(getIpcMain(), this.channel);
  }
}
