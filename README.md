# @wexond/electron-rpc

A better way to communicate between processes in Electron apps. Created mainly for typescript.

[![NPM](https://img.shields.io/npm/v/@wexond/electron-rpc.svg?style=flat-square)](https://www.npmjs.com/package/@wexond/electron-rpc)
[![NPM](https://img.shields.io/npm/dm/@wexond/electron-rpc?style=flat-square)](https://www.npmjs.com/package/@wexond/electron-rpc)
[![Discord](https://discordapp.com/api/guilds/307605794680209409/widget.png?style=shield)](https://discord.gg/P7Vn4VX)

## Installation

```bash
$ npm install @wexond/electron-rpc
```

## Example

**Shared**

```ts
import { IpcRendererToMain } from '@wexond/electron-rpc';

export interface LoggerService {
  log(message: string): boolean;
}

export const loggerChannel = new IpcRendererToMain<TabService>();
```

**Main**

```ts
import { IpcHandler } from '@wexond/electron-rpc';

import { LoggerService, loggerChannel } from 'shared';

class LoggerHandler implements IpcHandler<LoggerService> {
  log(e: IpcEvent, message: string): boolean {
    console.log('Logged', message);
    return true;
  }
}

loggerChannel.registerHandler(new LoggerHandler());
```

**Renderer**

```ts
import { loggerChannel } from 'shared';

const loggerService = loggerChannel.createInvoker();

await loggerService.log('hello there');
```

## Documentation

WIP
