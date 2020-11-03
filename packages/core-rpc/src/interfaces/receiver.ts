import { HandlerInvokerResponse } from '../communication';
import { ServiceCaller } from './rpc';

export type HandlerInvokerService = (
  caller: ServiceCaller,
) => HandlerInvokerResponse;
