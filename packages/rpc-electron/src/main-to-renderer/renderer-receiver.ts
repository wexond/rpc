import { Receiver, RpcScaffold, clearEvents } from '@wexond/rpc-core';

import { RpcRendererHandler, RpcRendererObserver } from '../interfaces';
import { checkIpcContext, getIpcRenderer } from '../utils';

export class RendererReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcRendererHandler<T>,
  RpcRendererObserver<T>
> {
  constructor(name: string) {
    super(name);

    checkIpcContext();

    const ipcRenderer = getIpcRenderer();
    if (!ipcRenderer) return;

    // Prevent EventEmitter leaks.
    clearEvents(ipcRenderer, this.name);

    ipcRenderer.on(
      this.name,
      async (e, method: string, id: string, ...args) => {
        const caller = this.createCaller(method, e, ...args);
        const { res, error } = await this.invokeRemoteHandler(caller);

        ipcRenderer.send(`${this.name}${method}${id}`, res, error);

        this.observers.notify(caller);
      },
    );
  }

  public destroy() {
    clearEvents(getIpcRenderer(), this.name);
  }
}
