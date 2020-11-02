import { Channel } from './channel';
import { IpcHandler, IpcScaffold } from './interfaces';

export abstract class IpcBase<T extends IpcScaffold<T>> {
  protected readonly channel: Channel<T>;

  constructor(public readonly name: string) {
    this.channel = new Channel(name);
  }

  public abstract createInvoker(...args: any[]): T;

  public abstract setHandler(handler: IpcHandler<T> | undefined): void;
}
