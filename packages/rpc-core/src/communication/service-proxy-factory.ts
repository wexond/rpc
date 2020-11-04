import { InvokerCallback } from '../interfaces';

export const createServiceProxy = <T>(cb: InvokerCallback): T => {
  // Create a proxy object which automatically creates functions calling the specified callback.
  const proxy = new Proxy(
    {},
    {
      get: (obj, prop: string) => {
        return (...args: any[]) => cb(prop, ...args);
      },
    },
  );

  return proxy as T;
}
