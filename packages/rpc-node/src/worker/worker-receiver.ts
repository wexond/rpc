import { MessagePort, Worker } from 'worker_threads';
import { clearEvents, Receiver, RpcScaffold } from '@wexond/rpc-core';

import {
  RpcWorkerHandler,
  RpcWorkerObserver,
  RpcWorkerRequest,
  RpcWorkerResponse,
} from '../interfaces';

export class WorkerReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcWorkerHandler<T>,
  RpcWorkerObserver<T>
> {
  constructor(name: string, private readonly port: MessagePort | Worker) {
    super(name);

    this.port.on('message', this.onMessage);
  }

  private onMessage = async (e: RpcWorkerRequest) => {
    const caller = this.createCaller(e.method, e, ...e.args);

    const { res, error } = await this.invokeRemoteHandler(caller);

    this.port.postMessage({
      id: e.id,
      returnValue: res,
      error,
    } as RpcWorkerResponse);

    this.observers.notify(caller);
  };

  public destroy() {
    this.port.removeListener('message', this.onMessage);
  }
}
