import { Channel, RpcScaffold } from '@wexond/rpc-core';

import { RpcRendererHandler, RpcRendererObserver } from '../interfaces';
import { RendererReceiver } from './renderer-receiver';
import { RendererInvoker } from './renderer-invoker';
import { cacheIpcPossiblyInvalid } from '../utils';

export class RendererChannel<T extends RpcScaffold<T>> extends Channel<
  T,
  RpcRendererHandler<T>,
  RpcRendererObserver<T>
> {
  public invoker: RendererInvoker<T>;

  public receiver: RendererReceiver<RpcRendererObserver<T>>;

  constructor(name: string) {
    super(name);

    this.setup();
  }

  public isReceiver() {
    return cacheIpcPossiblyInvalid('ipcRenderer') != null;
  }

  protected setupInvoker() {
    this.invoker = new RendererInvoker(this.name);
  }

  protected setupReceiver() {
    this.receiver = new RendererReceiver(this.name, this.invokeHandler);

    this.receiver.clearEvents();
    this.receiver.listen();
  }
}
