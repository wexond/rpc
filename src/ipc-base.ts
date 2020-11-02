import { Channel } from './channel';
import { RpcScaffold } from './interfaces';

export abstract class RpcBase<T extends RpcScaffold<T>, Handler> {
  protected readonly channel: Channel<T>;

  constructor(public readonly name: string) {
    this.channel = new Channel(name);
  }

  public abstract createInvoker(...args: any[]): T;

  public abstract setHandler(handler: Handler | undefined): void;
}
