# @wexond/rpc-node

Type-safe communication between message ports from Node.js worker_threads module.

[![NPM](https://img.shields.io/npm/v/@wexond/rpc-node.svg?style=flat-square)](https://www.npmjs.com/package/@wexond/rpc-node)
[![NPM](https://img.shields.io/npm/dm/@wexond/rpc-node?style=flat-square)](https://www.npmjs.com/package/@wexond/rpc-node)

## Installation

```bash
$ npm install --save @wexond/rpc-node @wexond/rpc-core
```

## Quick start

Here's an example of communication from the main thread to a `worker_thread`:

- Create a file that is imported in both the `worker_thread` and the main thread, for example `ping-pong.ts`:

```ts
import { WorkerChannel } from '@wexond/rpc-node';

export interface PingPongService {
  ping(): string;
}

export const pingPongChannel = new WorkerChannel<PingPongService>('ping-pong');
```

- Code for your `worker_thread`:

```ts
import { RpcWorkerHandler } from '@wexond/rpc-node';
import { PingPongService, pingPongChannel } from './ping-pong';

class PingPongHandler implements RpcWorkerHandler<PingPongService> {
  // Equivalent of |parentPort.on('message')|
  ping(): string {
    return 'pong';
  }
}

// |parentPort| is the default value for the |messagePort| parameter in |getReceiver|.
pingPongChannel.getReceiver().handler = new PingPongHandler();
```

- Code for the main thread:

```ts
import { resolve } from 'path';
import { Worker } from 'worker_threads';

import { pingPongChannel } from './ping-pong';

const worker = new Worker('path/to/worker.js');
const pingPongService = pingPongChannel.getInvoker(worker);

(async () => {
  console.log(await pingPongService.ping()); // Prints `pong`.
})();
```

### More examples

- [Main to Worker](examples/main-to-worker)

## Documentation

WIP
