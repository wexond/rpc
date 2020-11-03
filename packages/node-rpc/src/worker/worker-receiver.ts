import { MessagePort, parentPort } from 'worker_threads';
import { Receiver, RpcScaffold, clearEvents } from '@wexond/rpc-core';

import {
  RpcWorkerObserver,
  RpcWorkerRequest,
  RpcWorkerResponse,
} from '../interfaces';

export class WorkerReceiver<T extends RpcScaffold<T>> extends Receiver<
  RpcWorkerObserver<T>
> {
  public listen() {
    parentPort!.on('message', async (e: RpcWorkerRequest) => {
      const caller = this.createCaller(e.method, e, ...e.args);

      const { res, error } = this.handlerInvoker(caller);

      parentPort!.postMessage({
        id: e.id,
        returnValue: res,
        error,
      } as RpcWorkerResponse);

      this.observers.notify(caller);
    });
  }

  public clearEvents() {
    clearEvents(parentPort as MessagePort, this.channel);
  }
}
