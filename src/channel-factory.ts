import { IpcRenderer, IpcMain, WebContents } from 'electron';

import { IpcHandler, IpcScaffold } from './interfaces';

let globalIpcRenderer: IpcRenderer;
let globalIpcMain: IpcMain;

if (require) {
  const { ipcRenderer, ipcMain } = require('electron');
  globalIpcRenderer = ipcRenderer;
  globalIpcMain = ipcMain;
}

export function createChannel<T>(name: string) {
  return {
    createInvoker: (
      sendFunction: (
        channelName: string,
        functionName: keyof T,
      ) => (...args: any[]) => any,
    ): T => {
      // Create a proxy object which automatically creates functions sending IPC messages.
      const proxy = new Proxy(
        {},
        {
          get: (obj, prop) => {
            return (...args) => {
              return sendFunction(name, prop as keyof T)(...args);
            };
          },
        },
      );

      return proxy as T;
    },
    createHandler: <K>(obj: K) => (functionName: string, ...args: any[]) => {
      return obj[functionName](...args);
    },
  };
}

export function ipcRendererToMain<T extends IpcScaffold<T>>(
  name: string,
  syncFunctions?: (keyof T)[],
) {
  const channel = createChannel<T>(name);

  return {
    createInvoker: (ipcRenderer?: IpcRenderer) => {
      const context: IpcRenderer | undefined = ipcRenderer ?? globalIpcRenderer;

      if (!context) {
        throw new Error('IpcRenderer could not be found in this context.');
      }

      const syncs = syncFunctions ?? [];

      // Validate the IpcRenderer object.

      // The user may have provided synchronous functions,
      // but the specified |ipcRenderer| does not contain |sendSync| nor |invoke| methods.
      if ((syncs.length > 0 && !context.sendSync) || !context.invoke) {
        throw new Error(`The given IpcRenderer object is invalid.`);
      }

      return channel.createInvoker(
        (channelName, functionName) => (...args: any[]) => {
          let fn: (...args: any[]) => any = context.invoke;

          if (syncs.includes(functionName)) {
            fn = context.sendSync;
          }

          return fn(channelName, functionName, ...args);
        },
      );
    },
    registerHandler: (handler: IpcHandler<T>) => {
      if (!globalIpcMain) throw Error('Not in the main process.');

      const messageHandler = channel.createHandler<IpcHandler<T>>(handler);

      // Handle synchronous messages.
      globalIpcMain.on(name, (e, functionName: string, ...args) => {
        e.returnValue = messageHandler(functionName, ...args);
      });

      // Handle asynchronous messages.
      globalIpcMain.handle(name, (e, functionName: string, ...args) => {
        return messageHandler(functionName, ...args);
      });
    },
  };
}

export function ipcMainToRenderer<T extends IpcScaffold<T>>(name: string) {
  const channel = createChannel<T>(name);

  return {
    createInvoker: (webContents: WebContents) => {
      if (!webContents?.send) {
        throw new Error('Given webContents is invalid.');
      }

      return channel.createInvoker(
        (channelName, functionName) => (...args: any[]) => {
          return new Promise((resolve, reject) => {
            const id = '_' + Math.random().toString(36).substr(2, 9);
            globalIpcMain.once(
              `${name}${functionName}${id}`,
              (e, returnValue) => {
                resolve(returnValue);
              },
            );

            webContents.send(channelName, functionName, id, ...args);
          });
        },
      );
    },
    registerHandler: (handler: IpcHandler<T>) => {
      if (!globalIpcRenderer) throw Error('Not in the renderer process.');

      const messageHandler = channel.createHandler<IpcHandler<T>>(handler);

      // Handle asynchronous messages.
      globalIpcRenderer.on(
        name,
        async (e, functionName: string, id: string, ...args) => {
          let ret = Promise.resolve(messageHandler(functionName, ...args));
          globalIpcRenderer.send(`${name}${functionName}${id}`, await ret);
        },
      );
    },
  };
}
