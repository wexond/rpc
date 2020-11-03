import { Receiver, RpcScaffold, clearEvents } from '@wexond/rpc-core';

import { RpcRendererObserver } from '../interfaces';
import { cacheIpcPossiblyInvalid, getIpcRenderer } from '../utils';

export class RendererReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcRendererObserver<T>
> {
  public listen() {
    // Don't throw no ipcRenderer error if there's ipcMain available.
    if (cacheIpcPossiblyInvalid('ipcMain')) return;

    const ipcRenderer = getIpcRenderer();

    ipcRenderer.on(
      this.channelName,
      async (e, method: string, id: string, ...args) => {
        const caller = this.createCaller(method, e, ...args);

        const { res, error } = this.handlerInvoker(caller);

        ipcRenderer.send(`${this.channelName}${method}${id}`, res, error);

        this.observers.notify(caller);
      },
    );
  }

  public clearEvents() {
    clearEvents(getIpcRenderer(), this.channelName);
  }
}
