import { RpcScaffold } from '..';
import { Channel } from './channel';

export abstract class SingleReceiverChannel<
  T extends RpcScaffold<T>
> extends Channel<T> {
  private receiverSingleton: any;

  constructor(name: string) {
    super(name);
    if (this.isReceiver()) this.getReceiver();
  }

  public getReceiver(): any {
    if (!this.isReceiver() && process?.env?.TEST !== 'true') throw new Error('This context is not a receiver.');
    if (!this.receiverSingleton) this.receiverSingleton = this.createReceiver();
    return this.receiverSingleton;
  }

  public getInvoker(...args: any[]): T {
    if (this.isReceiver() && process?.env?.TEST !== 'true')
      throw new Error('This context cannot invoke remote methods.');
    return this.createInvoker(...args) as T;
  }

  public abstract isReceiver(): boolean;

  public destroy() {
    super.destroy();
    this.receiverSingleton?.destroy?.();
    this.receiverSingleton = undefined;
  }
}
