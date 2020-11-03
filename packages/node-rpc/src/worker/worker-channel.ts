import { MessagePort, parentPort } from 'worker_threads';
import {
  ChannelWithMultipleReceivers,
  createServiceProxy,
  makeRandomId,
  RpcScaffold,
} from '@wexond/rpc-core';
import { WorkerReceiver } from './worker-receiver';
import { RpcWorkerRequest, RpcWorkerResponse } from '../interfaces';

export class WorkerChannel<
  T extends RpcScaffold<T>
> extends ChannelWithMultipleReceivers<T> {
  protected createInvoker(port?: MessagePort): T {
    if (!port && !parentPort) throw new Error('Invalid MessagePort.');

    return createServiceProxy<T>((method, ...args: any[]) => {
      return new Promise((resolve, reject) => {
        const req: RpcWorkerRequest = {
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

  protected createReceiver(port?: MessagePort): WorkerReceiver<T> {
    if (!port && !parentPort) throw new Error('Invalid MessagePort.');
    return new WorkerReceiver<T>(this.name, port ?? parentPort);
  }

  public getInvoker(port?: MessagePort): T {
    return super.getInvoker(port);
  }

  public getReceiver(port?: MessagePort): WorkerReceiver<T> {
    return super.getReceiver(port);
  }
}
