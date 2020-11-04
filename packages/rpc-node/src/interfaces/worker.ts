import {
  RpcEventBase,
  RpcHandler,
  RpcObserver,
  RpcScaffold,
} from '@wexond/rpc-core';

export type RpcWorkerHandler<T extends RpcScaffold<T>> = RpcHandler<
  T,
  RpcWorkerEvent
>;

export type RpcWorkerObserver<T extends RpcScaffold<T>> = RpcObserver<
  T,
  RpcWorkerEvent
>;

export type RpcWorkerEvent = RpcEventBase;

export interface RpcWorkerRequest {
  id: string;
  method: string;
  args: any[];
}

export interface RpcWorkerResponse {
  id: string;
  returnValue: any;
  error: Error;
}
