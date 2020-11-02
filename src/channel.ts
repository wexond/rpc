import { RpcEventBase, RpcScaffold } from './interfaces';

export class Channel<T extends RpcScaffold<T>> {
  constructor(public readonly name) {}

  public createInvoker(
    sendFunction: (
      channelName: string,
      functionName: keyof T,
    ) => (...args: any[]) => any,
  ): T {
    const instance = {};

    // Create a proxy object which automatically creates functions sending IPC messages.
    const proxy = new Proxy(instance, {
      get: (obj, prop) => {
        return (...args) => sendFunction(this.name, prop as keyof T)(...args);
      },
    });

    return proxy as T;
  }

  public createHandler = <K>(obj: K) => (
    functionName: string,
    e: Omit<RpcEventBase, 'channel'>,
    ...args: any[]
  ) => {
    return obj[functionName](
      { ...e, channel: this.name } as RpcEventBase,
      ...args,
    );
  };
}
