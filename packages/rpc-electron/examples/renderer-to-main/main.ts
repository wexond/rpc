import {
  RpcMainHandler,
  RpcMainEvent,
  RpcMainObserver,
} from '@wexond/rpc-electron';

import { LoggerService, loggerChannel } from './shared';

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
      `Received ${message} from webContents of id ${e.sender.id}. Logged in observer of id ${this.id}`,
    );
  }
}

// There can be only one RPC functions handler.
// Handlers can return values and send them back to the caller.
const receiver = loggerChannel.getReceiver();

receiver.handler = new LoggerHandler();

// We can register multiple observers, though.
receiver.observers.add(new LoggerObserver(1));
receiver.observers.add(new LoggerObserver(2));
receiver.observers.add(new LoggerObserver(3));
