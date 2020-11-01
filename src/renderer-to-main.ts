import { IpcMain, IpcRenderer } from 'electron';

import { Channel } from './channel';
import { IpcScaffold, IpcHandler } from './interfaces';

let globalIpcRenderer: IpcRenderer;
let globalIpcMain: IpcMain;

if (require) {
  const { ipcRenderer, ipcMain } = require('electron');
  globalIpcRenderer = ipcRenderer;
  globalIpcMain = ipcMain;
}

export class IpcRendererToMain<T extends IpcScaffold<T>> {
  private readonly channel: Channel<T>;

  constructor(
    public readonly name: string,
    public readonly syncFunctions?: (keyof T)[],
  ) {
    this.channel = new Channel(name);
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
