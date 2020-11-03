import { getNoHandlerError } from '../utils';
import { ServiceCaller, RpcScaffold } from '../interfaces';
import { Invoker } from './invoker';
import { HandlerInvokerResponse, Receiver } from './receiver';

export abstract class Channel<T extends RpcScaffold<T>, Handler, Observer> {
  protected handler: Handler;

  public abstract receiver: Receiver<Observer>;

  public abstract invoker: Invoker;

  constructor(public readonly name: string) {}

  public setup() {
    if (this.isReceiver()) this.setupReceiver();
    else this.setupInvoker();
  }

  public abstract isReceiver(): boolean;

  protected abstract setupInvoker(): void;

  protected abstract setupReceiver(): void;

  public setHandler(handler: Handler) {
    this.handler = handler;
  }

  protected invokeHandler = (caller: ServiceCaller): HandlerInvokerResponse => {
    let error: Error | undefined = undefined;
    let res: any | undefined = undefined;

    try {
      if (!this.handler) throw getNoHandlerError(this.name, caller.method);
      res = caller.cb(this.handler);
    } catch (e) {
      error = e;
    }

    return { res, error };
  };
}
