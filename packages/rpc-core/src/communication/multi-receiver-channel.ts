import { PromiseScaffold, RpcScaffold } from '..';
import { Channel } from './channel';

export abstract class MultiReceiverChannel<
  T extends RpcScaffold<T>
> extends Channel<T> {
  private receivers: Map<any[], any> = new Map();

  public getReceiver(...args: any[]): any {
    if (!this.receivers.has(args))
      this.receivers.set(args, this.createReceiver(...args));
    return this.receivers.get(args);
  }

  public getInvoker(...args: any[]): PromiseScaffold<T> {
    return this.createInvoker(...args);
  }

  public destroy() {
    super.destroy();
    this.receivers.forEach((v, k) => {
      v?.destroy?.();
      this.receivers.delete(k);
    });
  }
}
