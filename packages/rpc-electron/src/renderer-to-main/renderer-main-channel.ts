import {
  SingleReceiverChannel,
  createServiceProxy,
  RpcScaffold,
} from '@wexond/rpc-core';

import { MainReceiver } from './main-receiver';
import { checkIpcContext, getIpcRenderer } from '../utils';

export declare interface RendererToMainChannel<T> {
  getReceiver(): MainReceiver<T>;
  getInvoker(): T;
}

export class RendererToMainChannel<
  T extends RpcScaffold<T>
> extends SingleReceiverChannel<T> {
  constructor(name: string, private readonly syncFunctions?: (keyof T)[]) {
    super(name);
  }

  public isReceiver() {
    return checkIpcContext() === 'main';
  }

  protected createInvoker(): T {
    const ipcRenderer = getIpcRenderer();
    const syncs = this.syncFunctions ?? [];

    // Validate the IpcRenderer object.

    // The user may have provided synchronous functions,
    // but the specified |ipcRenderer| does not contain |sendSync| nor |invoke| methods.
    if ((syncs.length > 0 && !ipcRenderer.sendSync) || !ipcRenderer.invoke) {
      throw new Error(`The given IpcRenderer object is invalid.`);
    }

    return createServiceProxy<T>((method, ...args: any[]) => {
      let fn: (...args: any[]) => any = ipcRenderer.invoke;

      if (syncs.includes(method as keyof T)) {
        fn = ipcRenderer.sendSync;
      }

      return fn(this.name, method, ...args);
    });
  }

  protected createReceiver(): MainReceiver<T> {
    return new MainReceiver<T>(this.name);
  }
}
