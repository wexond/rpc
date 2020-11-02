import { IpcScaffold, IpcHandler } from './interfaces';
import { IpcBase } from './ipc-base';
import { getIpcMain, getIpcRenderer } from './utils';

export class IpcRendererToMain<T extends IpcScaffold<T>> extends IpcBase<T> {
  private syncHandler: ((...args: any[]) => void) | undefined;

  constructor(name: string, private readonly syncFunctions?: (keyof T)[]) {
    super(name);
  }

  public createInvoker() {
    const ipcRenderer = getIpcRenderer();

    if (!ipcRenderer) {
      throw new Error('IpcRenderer could not be found in this context.');
    }

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

  public setHandler(handler: IpcHandler<T> | undefined) {
    const ipcMain = getIpcMain();
    if (!ipcMain) throw Error('Not in the main process.');

    if (!handler) {
      if (this.syncHandler) {
        ipcMain.removeHandler(this.name);
        ipcMain.removeListener(this.name, this.syncHandler);
        this.syncHandler = undefined;
      }
      return;
    }

    const messageHandler = this.channel.createHandler<IpcHandler<T>>(handler);

    // Handle synchronous messages.
    this.syncHandler = async (e, functionName: string, ...args) => {
      e.returnValue = await Promise.resolve(messageHandler(
        functionName,
        { webContents: e.sender },
        ...args,
      ));
    };
    ipcMain.on(this.name, this.syncHandler);

    // Handle asynchronous messages.
    ipcMain.handle(this.name, (e, functionName: string, ...args) => {
      return messageHandler(functionName, { webContents: e.sender }, ...args);
    });
  }
}
