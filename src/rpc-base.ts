import { Channel } from './channel';
import { RpcScaffold } from './interfaces';

export abstract class RpcBase<T extends RpcScaffold<T>, Handler, Observer> {
  protected readonly channel: Channel<T>;

  protected readonly observers: Observer[] = [];

  public handler: Handler | undefined;

  constructor(public readonly name: string) {
    this.channel = new Channel(name);
  }

  public abstract createInvoker(...args: any[]): T;

  public addObserver(observer: Observer) {
    this.observers.push(observer);
  }

  public removeObserver(observer: Observer) {
    this.observers.splice(this.observers.indexOf(observer), 1);
  }
}
