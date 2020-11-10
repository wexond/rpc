# RPC

[![Discord](https://discordapp.com/api/guilds/307605794680209409/widget.png?style=shield)](https://discord.gg/P7Vn4VX)

Type-safe communication between processes.
No more remembering channel names, parameters order and their types.
It was designed with compatibility for the following environments:

- [Electron](packages/rpc-electron),
- [Node.js](packages/rpc-node),
- or as [a standalone library](packages/rpc-core) for implementing custom communication handlers.

> NOTE: Although this package was made mainly for TypeScript, it can be used in JavaScript as well, but it makes no sense then.

## Getting started

Our RPC solution provides out-of-the-box support for [Electron](packages/rpc-node) and [Node.js](packages/rpc-node).
However, if that's not sufficient, you can use [rpc-core](packages/rpc-core) to implement your own solution for the platform of your choice.

Here's how to communicate with the main process from renderer using [rpc-electron](packages/rpc-electron):

- Install `npm install --save @wexond/rpc-electron @wexond/rpc-core`
- Create a file that is imported in both main and renderer processes, for example `ping-pong.ts`:

```ts
import { RendererToMainChannel } from '@wexond/rpc-electron';

export interface PingPongService {
  ping(): string;
}

export const pingPongChannel = new RendererToMainChannel<PingPongService>(
  'ping-pong',
);
```

- Code for the renderer process:

```ts
import { ipcRenderer } from 'electron';
import { pingPongChannel } from './ping-pong';

const pingPongService = pingPongChannel.getInvoker();

(async () => {
  console.log(await pingPongService.ping()); // Prints `pong`.
})();
```

- Code for the main process:

```ts
import { RpcMainHandler } from '@wexond/rpc-electron';
import { PingPongService, pingPongChannel } from './ping-pong';

// Equivalent of |ipcMain.handle|
class PingPongHandler implements RpcMainHandler<PingPongService> {
  ping(): string {
    return 'pong';
  }
}

pingPongChannel.getReceiver().handler = new PingPongHandler();
```

More examples can be found in the `README.md` files for each platform.

## Motivation

There was no viable solution for handling messaging between threads or processes with type safety in both Electron and Node.js.
It involved a lot of potential bugs, for instance in Electron the channel names or parameters order would not be the same, sometimes leading
to unnecessary time spent debugging why the message isn't handled properly. That's where our RPC solution comes in handy.
