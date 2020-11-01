import { WebContents } from 'electron';

import { AnyFunction } from './utils';

export type IpcScaffold<T> = {
  [K in keyof T]: AnyFunction;
};

export type IpcHandler<T extends IpcScaffold<T>> = {
  [K in keyof T]: IpcHandlerMethod<T[K]>;
};

export type IpcHandlerMethod<T extends AnyFunction> = (
  e: IpcEvent,
  ...args: Parameters<T>
) => ReturnType<T>;

export interface IpcEvent {
  channel?: string;
  webContents?: WebContents;
}
