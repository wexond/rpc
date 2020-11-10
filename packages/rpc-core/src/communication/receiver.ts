import { getNoHandlerError } from '..';
import { ServiceCaller } from '../interfaces';
import { ObserverManager } from './observer-manager';

export interface HandlerInvokerResponse {
  res?: any;
  error?: Error;
}

export abstract class Receiver<Handler, Observer> {
  public observers = new ObserverManager<Observer>();

  public handler: Handler;

  constructor(protected name: string) {}

  protected createCaller = (
    method: string,
    e: any,
    ...args: any[]
  ): ServiceCaller => {
    return {
      cb: (obj) => {
        return Promise.resolve(
          obj[method]({ ...e, channel: this.name }, ...args),
        );
      },
      method,
    };
  };

  protected invokeRemoteHandler = async (
    caller: ServiceCaller,
  ): Promise<HandlerInvokerResponse> => {
    let error: Error | undefined = undefined;
    let res: any | undefined = undefined;

    try {
      if (!this.handler) throw getNoHandlerError(this.name, caller.method);
      res = await caller.cb(this.handler);
    } catch (e) {
      error = e;
    }

    return { res, error };
  };

  public abstract destroy(): void;
}
