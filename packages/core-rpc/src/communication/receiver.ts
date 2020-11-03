import {
  HandlerInvokerService,
  RpcEventBase,
  ServiceCaller,
} from '../interfaces';
import { ObserverManager } from './observer-manager';

export interface HandlerInvokerResponse {
  res?: any;
  error?: Error;
}

export abstract class Receiver<Observer> {
  public observers = new ObserverManager<Observer>();

  constructor(
    protected channel: string,
    protected handlerInvoker: HandlerInvokerService,
  ) {}

  public abstract listen(): void;

  public abstract clearEvents(): void;

  protected createCaller = (
    method: string,
    e: Omit<RpcEventBase, 'channel'>,
    ...args: any[]
  ): ServiceCaller => {
    return {
      cb: (obj: any): ServiceCaller => {
        return obj[method](
          { ...e, channel: this.channel } as RpcEventBase,
          ...args,
        );
      },
      method,
    };
  };
}
