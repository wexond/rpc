import { Invoker } from '@wexond/rpc-core';

import { getIpcRenderer } from '../utils';

export class MainInvoker<T> extends Invoker {
  constructor(name: string, private readonly syncFunctions?: (keyof T)[]) {
    super(name);
  }

  public create() {
    const ipcRenderer = getIpcRenderer();
    const syncs = this.syncFunctions ?? [];

    // Validate the IpcRenderer object.

    // The user may have provided synchronous functions,
    // but the specified |ipcRenderer| does not contain |sendSync| nor |invoke| methods.
    if ((syncs.length > 0 && !ipcRenderer.sendSync) || !ipcRenderer.invoke) {
      throw new Error(`The given IpcRenderer object is invalid.`);
    }

    return this.createProxy<T>((method, ...args: any[]) => {
      let fn: (...args: any[]) => any = ipcRenderer.invoke;

      if (syncs.includes(method as keyof T)) {
        fn = ipcRenderer.sendSync;
      }

      return fn(this.channel, method, ...args);
    });
  }
}
