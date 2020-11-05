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
  constructor(name: string, port: MessagePort | Worker) {
    super(name);

    port.on('message', async (e: RpcWorkerRequest) => {
      const caller = this.createCaller(e.method, e, ...e.args);

      const { res, error } = await this.invokeRemoteHandler(caller);

      port.postMessage({
        id: e.id,
        returnValue: res,
        error,
      } as RpcWorkerResponse);

      this.observers.notify(caller);
    });
  }
}
