# @wexond/electron-rpc

Type-safe communication between Electron processes.
No more remembering IPC channel names, parameters order and their types.

> NOTE: Although this package was made mainly for TypeScript, it can be used in JavaScript as well, but it makes no sense then.

[![NPM](https://img.shields.io/npm/v/@wexond/electron-rpc.svg?style=flat-square)](https://www.npmjs.com/package/@wexond/electron-rpc)
[![NPM](https://img.shields.io/npm/dm/@wexond/electron-rpc?style=flat-square)](https://www.npmjs.com/package/@wexond/electron-rpc)
[![Discord](https://discordapp.com/api/guilds/307605794680209409/widget.png?style=shield)](https://discord.gg/P7Vn4VX)

## Installation

```bash
$ npm install @wexond/electron-rpc
```

## Example

**Shared**
Shared is a common file imported by both main process and renderers.

```ts
import { RpcRendererToMain } from '@wexond/electron-rpc';

export interface LoggerService {
  log(message: string): boolean;
}

export const loggerChannel = new RpcRendererToMain<LoggerService>('logger');
```

**Main**

```ts
import { IpcHandler } from '@wexond/electron-rpc';

import { LoggerService, loggerChannel } from 'shared';

class LoggerHandler implements RpcMainHandler<LoggerService> {
  // Equivalent of |ipcMain.handle|
  log(e: RpcMainEvent, message: string): boolean {
    console.log('Logged', message);
    return true;
  }
}

class LoggerObserver implements RpcMainObserver<LoggerService> {
  constructor(private id: number) {}
  // Notice how RpcMainObserver transforms methods to not be able to return.
  // This behavior indicates that observers can only "observe".
  // Equivalent of |ipcMain.on|
  log(e: RpcMainEvent, message: string): void {
    console.log(
      `Received ${message} from webContents of id ${e.senderId}. Logged in observer of id ${this.id}`,
    );
  }
}

// There can be only one RPC functions handler.
// Handlers can return values and send them back to the caller.
loggerChannel.handler = new LoggerHandler();

// We can register multiple observers, though.
loggerChannel.addObserver(new LoggerObserver(1));
loggerChannel.addObserver(new LoggerObserver(2));
loggerChannel.addObserver(new LoggerObserver(3));
```

**Preload**

```ts
import { contextBridge, ipcRenderer } from 'electron';
// Expose ipcRenderer to the main world.

contextBridge.exposeInMainWorld('api', {
  ipcRenderer,
});
```

**Renderer**

```ts
// Optionally you can use |setIpcRenderer| to set a custom ipcRenderer.
// This can be useful if your webContents has |contextIsolation| set to true,
// which implies that `require('electron').ipcRenderer` would not work.
// Though, channels could be exposed using |contextBridge| also.
import { setIpcRenderer } from '@wexond/electron-rpc';
setIpcRenderer(api.ipcRenderer);

import { loggerChannel } from 'shared';

const loggerService = loggerChannel.createInvoker();

console.log(await loggerService.log('hello there')); // Prints `true`.
```

## Documentation

WIP
