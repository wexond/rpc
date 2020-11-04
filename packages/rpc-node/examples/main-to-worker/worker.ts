import { parentPort } from 'worker_threads';
import {
  RpcWorkerEvent,
  RpcWorkerHandler,
  RpcWorkerObserver,
} from '@wexond/rpc-node';

import { LoggerService, loggerChannel } from './shared';

class LoggerHandler implements RpcWorkerHandler<LoggerService> {
  // Equivalent of |parentPort.on('message')|
  log(e: RpcWorkerEvent, message: string): boolean {
    console.log('Logged', message);
    return true;
  }
}

class LoggerObserver implements RpcWorkerObserver<LoggerService> {
  constructor(private id: number) {}
  // Notice how RpcWorkerObserver transforms methods to not be able to return.
  // This behavior indicates that observers can only "observe".
  log(e: RpcWorkerEvent, message: string): void {
    console.log(`Received ${message}. Logged in observer of id ${this.id}`);
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
