import { IpcRendererEvent } from 'electron';
import {
  RpcScaffold,
  RpcHandler,
  RpcEventBase,
  RpcObserver,
} from '@wexond/rpc-core';

export type RpcRendererHandler<T extends RpcScaffold<T>> = RpcHandler<
  T,
  RpcRendererEvent
>;

export type RpcRendererObserver<T extends RpcScaffold<T>> = RpcObserver<
  T,
  RpcRendererEvent
>;

export type RpcRendererEvent = IpcRendererEvent & RpcEventBase;
