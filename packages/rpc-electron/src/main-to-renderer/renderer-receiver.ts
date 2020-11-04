import { Receiver, RpcScaffold, clearEvents } from '@wexond/rpc-core';

import { RpcRendererHandler, RpcRendererObserver } from '../interfaces';
import { cacheIpcPossiblyInvalid, getIpcRenderer } from '../utils';

export class RendererReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcRendererHandler<T>,
  RpcRendererObserver<T>
> {
  constructor(name: string) {
    super(name);

    // Don't throw no ipcRenderer error if there's ipcMain available.
    if (cacheIpcPossiblyInvalid('ipcMain')) return;

    const ipcRenderer = getIpcRenderer();

    // Prevent EventEmitter leaks.
    clearEvents(getIpcRenderer(), this.name);

    ipcRenderer.on(
      this.name,
      async (e, method: string, id: string, ...args) => {
        const caller = this.createCaller(method, e, ...args);
        const { res, error } = this.invokeRemoteHandler(caller);

        ipcRenderer.send(`${this.name}${method}${id}`, res, error);

        this.observers.notify(caller);
      },
    );
  }
}
