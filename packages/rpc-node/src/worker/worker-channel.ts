import { MessagePort, parentPort, Worker } from 'worker_threads';
import {
  MultiReceiverChannel,
  createServiceProxy,
  makeRandomId,
  RpcScaffold,
} from '@wexond/rpc-core';
import { WorkerReceiver } from './worker-receiver';
import { RpcWorkerRequest, RpcWorkerResponse } from '../interfaces';

export declare interface WorkerChannel<T> {
  getReceiver(port?: MessagePort | Worker): WorkerReceiver<T>;
  getInvoker(port?: MessagePort | Worker): T;
}
export class WorkerChannel<
  T extends RpcScaffold<T>
> extends MultiReceiverChannel<T> {
  protected createInvoker(port: MessagePort | Worker): T {
    if (!port) throw new Error('Invalid MessagePort.');

    return createServiceProxy<T>((method, ...args: any[]) => {
      return new Promise((resolve, reject) => {
        const req: RpcWorkerRequest = {
          name: this.name,
          id: makeRandomId(),
          method,
          args,
        };

        const listener = (e: RpcWorkerResponse) => {
          if (e.id === req.id) {
            port.removeListener('message', listener);

            if (e.error) return reject(e.error);
            resolve(e.returnValue);
          }
        };

        port.addListener('message', listener);
        port.postMessage(req);
      });
    });
  }

  protected createReceiver(port: MessagePort | Worker): WorkerReceiver<T> {
    if (!port && !parentPort) throw new Error('Invalid MessagePort.');
    return new WorkerReceiver<T>(this.name, port ?? parentPort);
  }
}
