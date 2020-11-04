import { IpcMainEvent } from 'electron';
import {
  RpcScaffold,
  RpcHandler,
  RpcEventBase,
  RpcObserver,
} from '@wexond/rpc-core';

export type RpcMainHandler<T extends RpcScaffold<T>> = RpcHandler<
  T,
  RpcMainEvent
>;

export type RpcMainObserver<T extends RpcScaffold<T>> = RpcObserver<
  T,
  RpcMainEvent
>;

export type RpcMainEvent = IpcMainEvent & RpcEventBase;
