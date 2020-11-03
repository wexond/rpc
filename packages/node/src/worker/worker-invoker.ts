import { Worker } from 'worker_threads';
import { Invoker, makeRandomId } from '@wexond/rpc-core';

import { RpcWorkerRequest, RpcWorkerResponse } from '../interfaces';

export class WorkerInvoker<T> extends Invoker {
  public create(worker: Worker) {
    if (!worker) {
      throw new Error('Given worker is invalid.');
    }

    return this.createProxy<T>((method, ...args: any[]) => {
      return new Promise((resolve, reject) => {
        const req: RpcWorkerRequest = {
          id: makeRandomId(),
          method,
          args,
        };

        const listener = (e: RpcWorkerResponse) => {
          if (e.id === req.id) {
            worker.removeListener('message', listener);

            if (e.error) return reject(e.error);
            resolve(e.returnValue);
          }
        };

        worker.addListener('message', listener);
        worker.postMessage(req);
      });
    });
  }
}
