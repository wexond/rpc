import { parentPort } from 'worker_threads';
import { Channel, RpcScaffold } from '@wexond/rpc-core';

import { WorkerInvoker } from './worker-invoker';
import { WorkerReceiver } from './worker-receiver';
import { RpcWorkerHandler, RpcWorkerObserver } from '../interfaces';

export class WorkerChannel<T extends RpcScaffold<T>> extends Channel<
  T,
  RpcWorkerHandler<T>,
  RpcWorkerObserver<T>
> {
  public invoker: WorkerInvoker<T>;

  public receiver: WorkerReceiver<RpcWorkerObserver<T>>;

  constructor(name: string) {
    super(name);

    this.setup();
  }

  public isReceiver() {
    return parentPort != null;
  }

  protected setupInvoker() {
    this.invoker = new WorkerInvoker(this.name);
  }

  protected setupReceiver() {
    this.receiver = new WorkerReceiver(this.name, this.invokeHandler);

    this.receiver.clearEvents();
    this.receiver.listen();
  }
}
