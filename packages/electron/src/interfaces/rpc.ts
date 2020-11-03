import { AnyFunction } from './utils';

export type RpcScaffold<T> = {
  [K in keyof T]: AnyFunction;
};

export type RpcHandler<T extends RpcScaffold<T>, N> = {
  [K in keyof T]: RpcHandlerMethod<T[K], N>;
};

export type RpcObserver<T extends RpcScaffold<T>, N> = {
  [K in keyof T]: RpcObserverMethod<T[K], N>;
};

export type RpcMainHandler<T extends RpcScaffold<T>> = RpcHandler<
  T,
  RpcMainEvent
>;

export type RpcRendererHandler<T extends RpcScaffold<T>> = RpcHandler<
  T,
  RpcRendererEvent
>;

export type RpcMainObserver<T extends RpcScaffold<T>> = RpcObserver<
  T,
  RpcMainEvent
>;

export type RpcRendererObserver<T extends RpcScaffold<T>> = RpcObserver<
  T,
  RpcRendererEvent
>;

type RpcMethod<T extends AnyFunction, K, R> = (
  e: K,
  ...args: Parameters<T>
) => R;

type RpcHandlerMethod<T extends AnyFunction, K> = RpcMethod<
  T,
  K,
  ReturnType<T>
>;

type RpcObserverMethod<T extends AnyFunction, K> = RpcMethod<T, K, void>;

export interface RpcEventBase {
  channel: string;
}

export type RpcMainEvent = Electron.IpcMainEvent & RpcEventBase;
export type RpcRendererEvent = Electron.IpcRendererEvent & RpcEventBase;
