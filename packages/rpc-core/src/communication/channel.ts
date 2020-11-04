import { RpcScaffold } from '../interfaces';

const channels: string[] = [];

export abstract class Channel<T extends RpcScaffold<T>> {
  constructor(public readonly name: string) {
    if (channels.includes(name))
      throw Error('The channel has already been registered.');
    channels.push(name);
  }

  protected abstract createReceiver(...args: any[]): any;

  protected abstract createInvoker(...args: any[]): T;

  public abstract getReceiver(...args: any[]): any;

  public abstract getInvoker(...args: any[]): T;
}
