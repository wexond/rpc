import { resolve } from 'path';
import { Worker } from 'worker_threads';

import { loggerChannel } from './shared';

const worker = new Worker(resolve(__dirname, 'worker.js'));

const loggerService = loggerChannel.getInvoker(worker);

async function main() {
  console.log(await loggerService.log('hello there')); // Prints `true`.
}

main();
