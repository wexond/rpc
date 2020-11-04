# @wexond/rpc-node

Type-safe communication between message ports from Node.js worker_threads module.

> NOTE: Although this package was made mainly for TypeScript, it can be used in JavaScript as well, but it makes no sense then.

[![NPM](https://img.shields.io/npm/v/@wexond/rpc-node.svg?style=flat-square)](https://www.npmjs.com/package/@wexond/rpc-node)
[![NPM](https://img.shields.io/npm/dm/@wexond/rpc-node?style=flat-square)](https://www.npmjs.com/package/@wexond/rpc-node)
[![Discord](https://discordapp.com/api/guilds/307605794680209409/widget.png?style=shield)](https://discord.gg/P7Vn4VX)

## Installation

```bash
$ npm install @wexond/rpc-node @wexond/rpc-core
```

## Example

**Shared**
Shared is a common file imported by both parent process and worker.

```ts
import { WorkerChannel } from '@wexond/rpc-node';

export interface LoggerService {
  log(message: string): boolean;
}

export const loggerChannel = new WorkerChannel<LoggerService>('logger');
```

**Worker**

```ts
import { parentPort } from 'worker_threads';
import { RpcWorkerEvent, RpcWorkerHandler } from '@wexond/rpc-node';

import { LoggerService, loggerChannel } from '~/shared';

class LoggerHandler implements RpcWorkerHandler<LoggerService> {
  // Equivalent of |parentPort.on('message')|
  log(e: RpcMainEvent, message: string): boolean {
    console.log('Logged', message);
    return true;
  }
}

class LoggerObserver implements RpcWorkerObserver<LoggerService> {
  constructor(private id: number) {}
  // Notice how RpcWorkerObserver transforms methods to not be able to return.
  // This behavior indicates that observers can only "observe".
  log(e: RpcMainEvent, message: string): void {
    console.log(
      `Received ${message} from webContents of id ${e.senderId}. Logged in observer of id ${this.id}`,
    );
  }
}

// There can be only one RPC functions handler.
// Handlers can return values and send them back to the caller.
const receiver = loggerChannel.getReceiver(parentPort); // default

receiver.handler = new LoggerHandler();

// We can register multiple observers, though.
receiver.observers.add(new LoggerObserver(1));
receiver.observers.add(new LoggerObserver(2));
receiver.observers.add(new LoggerObserver(3));
```

**Parent**

```ts
import { resolve } from 'path';
import { MessagePort, Worker } from 'worker_threads';

import { loggerChannel } from '~/shared';

const worker = new Worker(resolve(__dirname, 'worker.js'));

const loggerService = loggerChannel.getInvoker(worker);

console.log(await loggerService.log('hello there')); // Prints `true`.
```

## Documentation

WIP
