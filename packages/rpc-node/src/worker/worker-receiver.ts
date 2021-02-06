import { MessagePort, Worker } from 'worker_threads';
import { Receiver, RpcScaffold } from '@wexond/rpc-core';

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
  destroy(): void {
    this.port.removeListener('message', this.onMessage);
  }

  private onMessage = async (e: RpcWorkerRequest) => {
    if (this.name !== e.name) return;

    const caller = this.createCaller(e.method, e, ...e.args);

    const { res, error } = await this.invokeRemoteHandler(caller);

    this.port.postMessage({
      id: e.id,
      returnValue: res,
      error,
    } as RpcWorkerResponse);

    this.observers.notify(caller);
  };

  constructor(name: string, private port: MessagePort | Worker) {
    super(name);

    port.on('message', this.onMessage);
  }
}
