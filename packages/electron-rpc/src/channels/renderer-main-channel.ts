import { Channel, RpcScaffold } from '@wexond/rpc-core';

import { RpcMainHandler, RpcMainObserver } from '../interfaces';
import { MainReceiver } from '../main/main-receiver';
import { MainInvoker } from '../main/main-invoker';
import { cacheIpcPossiblyInvalid } from '../utils';

export class RendererToMainChannel<T extends RpcScaffold<T>> extends Channel<
  T,
  RpcMainHandler<T>,
  RpcMainObserver<T>
> {
  public invoker: MainInvoker<T>;

  public receiver: MainReceiver<RpcMainObserver<T>>;

  constructor(name: string) {
    super(name);

    this.setup();
  }

  public isReceiver() {
    return cacheIpcPossiblyInvalid('ipcMain') != null;
  }

  protected setupInvoker() {
    this.invoker = new MainInvoker(this.name);
  }

  protected setupReceiver() {
    this.receiver = new MainReceiver(this.name, this.invokeHandler);

    this.receiver.clearEvents();
    this.receiver.listen();
  }
}
