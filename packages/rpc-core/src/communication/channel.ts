import { PromiseScaffold, RpcScaffold } from '../interfaces';

const channels: string[] = [];

export abstract class Channel<T extends RpcScaffold<T>> {
  constructor(public readonly name: string) {
    if (channels.includes(name))
      throw new Error('The channel has already been registered.');
    channels.push(name);
  }

  protected abstract createReceiver(...args: any[]): any;

  protected abstract createInvoker(...args: any[]): T | PromiseScaffold<T>;

  public abstract getReceiver(...args: any[]): any;

  public destroy() {
    channels.splice(channels.indexOf(this.name), 1);
  }

  public abstract getInvoker(...args: any[]): T | PromiseScaffold<T>;
}
