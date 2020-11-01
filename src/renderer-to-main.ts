import { IpcRenderer } from 'electron';

import { IpcScaffold, IpcHandler } from './interfaces';
import { IpcBase } from './ipc-base';
import { getGlobalIPC } from './utils';

const { globalIpcMain, globalIpcRenderer } = getGlobalIPC();

export class IpcRendererToMain<T extends IpcScaffold<T>> extends IpcBase<T> {
  constructor(name: string, private readonly syncFunctions?: (keyof T)[]) {
    super(name);
  }

  public createInvoker(ipcRenderer?: IpcRenderer) {
    const context: IpcRenderer | undefined = ipcRenderer ?? globalIpcRenderer;

    if (!context) {
      throw new Error('IpcRenderer could not be found in this context.');
    }

    const syncs = this.syncFunctions ?? [];

    // Validate the IpcRenderer object.

    // The user may have provided synchronous functions,
    // but the specified |ipcRenderer| does not contain |sendSync| nor |invoke| methods.
    if ((syncs.length > 0 && !context.sendSync) || !context.invoke) {
      throw new Error(`The given IpcRenderer object is invalid.`);
    }

    return this.channel.createInvoker(
      (channelName, functionName) => (...args: any[]) => {
        let fn: (...args: any[]) => any = context.invoke;

        if (syncs.includes(functionName)) {
          fn = context.sendSync;
        }

        return fn(channelName, functionName, ...args);
      },
    );
  }

  public registerHandler(handler: IpcHandler<T>) {
    if (!globalIpcMain) throw Error('Not in the main process.');

    const messageHandler = this.channel.createHandler<IpcHandler<T>>(handler);

    // Handle synchronous messages.
    globalIpcMain.on(this.name, (e, functionName: string, ...args) => {
      e.returnValue = messageHandler(functionName, ...args);
    });

    // Handle asynchronous messages.
    globalIpcMain.handle(this.name, (e, functionName: string, ...args) => {
      return messageHandler(functionName, ...args);
    });
  }
}
