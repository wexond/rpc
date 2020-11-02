import { RpcScaffold, RpcMainHandler, RpcMainObserver } from './interfaces';
import { RpcBase } from './rpc-base';
import { cacheIpcPossiblyInvalid, getIpcMain, getIpcRenderer } from './utils';
import { getNoHandlerError } from './utils/errors';

export class RpcRendererToMain<T extends RpcScaffold<T>> extends RpcBase<
  T,
  RpcMainHandler<T>,
  RpcMainObserver<T>
> {
  constructor(name: string, private readonly syncFunctions?: (keyof T)[]) {
    super(name);

    // Don't throw no ipcMain error if there's ipcRenderer available.
    if (cacheIpcPossiblyInvalid('ipcRenderer')) return;

    const ipcMain = getIpcMain();

    // Prevent ipcMain leaks.
    if (ipcMain.eventNames().includes(this.name)) {
      ipcMain.removeAllListeners(this.name);
    }

    ipcMain.on(this.name, async (e, functionName: string, ...args) => {
      const caller = this.channel.createCaller(functionName, e, ...args);

      for (const observer of this.observers) {
        caller(observer);
      }

      if (!this.handler && syncFunctions?.includes(functionName as keyof T)) {
        e.returnValue = undefined;
        throw getNoHandlerError(this.name, functionName);
      }

      e.returnValue = await Promise.resolve(caller(this.handler));
    });

    ipcMain.handle(this.name, (e, functionName: string, ...args) => {
      if (!this.handler) throw getNoHandlerError(this.name, functionName);
      return this.channel.createCaller(functionName, e, ...args)(this.handler);
    });
  }

  public createInvoker() {
    const ipcRenderer = getIpcRenderer();
    const syncs = this.syncFunctions ?? [];

    // Validate the IpcRenderer object.

    // The user may have provided synchronous functions,
    // but the specified |ipcRenderer| does not contain |sendSync| nor |invoke| methods.
    if ((syncs.length > 0 && !ipcRenderer.sendSync) || !ipcRenderer.invoke) {
      throw new Error(`The given IpcRenderer object is invalid.`);
    }

    return this.channel.createInvoker(
      (channelName, functionName) => (...args: any[]) => {
        let fn: (...args: any[]) => any = ipcRenderer.invoke;

        if (syncs.includes(functionName)) {
          fn = ipcRenderer.sendSync;
        }

        return fn(channelName, functionName, ...args);
      },
    );
  }
}
