import {
  OptionalPromiseScaffold,
  PromiseScaffold,
  RpcEventBase,
  RpcHandler,
  RpcObserver,
  RpcScaffold,
  SyncScaffold,
} from '@wexond/rpc-core';

export type RpcWorkerHandler<T extends RpcScaffold<T>> = RpcHandler<
  OptionalPromiseScaffold<T>,
  RpcWorkerEvent
>;

export type RpcWorkerObserver<T extends RpcScaffold<T>> = RpcObserver<
  T,
  RpcWorkerEvent
>;

export type RpcWorkerEvent = RpcEventBase;

export interface RpcWorkerRequest {
  name: string;
  id: string;
  method: string;
  args: any[];
}

export interface RpcWorkerResponse {
  id: string;
  returnValue: any;
  error: Error;
}
