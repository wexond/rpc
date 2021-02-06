import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as deasync from 'deasync';
import {
  RendererToMainChannel,
  RpcMainHandler,
  setIpcRenderer,
  setIpcMain,
  RpcMainObserver,
  MainToRendererChannel,
  RpcRendererHandler,
  RpcRendererObserver,
} from '@wexond/rpc-electron';

process.env.TEST = 'true';

let mainChannelToCallbackMap: Map<string, any[]> = new Map();
let rendererChannelToCallbackMap: Map<string, any[]> = new Map();
let ipcMainHandleCallback: any;

const addCallbackToListenerMap = (
  map: Map<any, any>,
  channel: string,
  callback: any,
  once = false,
) => {
  const callbacks = map.get(channel) ?? [];
  if (once) callback.once = true;
  callbacks.push(callback);
  map.set(channel, callbacks);
};

const executeCallbacks = (callbacks: any[], ...args: any[]) => {
  for (const arg of args) {
    if (Promise.resolve(arg) === arg)
      throw new Error('An object could not be cloned.');
  }

  let calledAny = false;

  callbacks = callbacks ?? [];
  for (const callback of callbacks) {
    if (!callback) continue;
    callback(...args);
    if (callback.once) callbacks.splice(callbacks.indexOf(callback), 1);
    calledAny = true;
  }

  return calledAny;
};

const ipcMain: any = {
  eventNames: (): string[] => [],

  handle: (channel: string, callback: any) => {
    ipcMainHandleCallback = callback;
  },

  removeHandler: (channel: string) => {
    ipcMainHandleCallback = undefined;
  },

  on: (channel: string, callback: any) =>
    addCallbackToListenerMap(mainChannelToCallbackMap, channel, callback),
  once: (channel: string, callback: any) =>
    addCallbackToListenerMap(mainChannelToCallbackMap, channel, callback, true),
};

const ipcRenderer: any = {
  eventNames: (): string[] => [],

  invoke: (channel: string, ...args: any[]): Promise<any> => {
    if (!ipcMainHandleCallback)
      throw new Error(
        `No handler registered for ${channel} - ipcRenderer.invoke`,
      );
    return Promise.resolve(ipcMainHandleCallback?.({}, ...args));
  },

  send: (channel: string, ...args: any[]) => {
    executeCallbacks(mainChannelToCallbackMap.get(channel), {}, ...args);
  },

  sendSync: (channel: string, ...args: any[]): Promise<any> => {
    const e: any = {
      returnValue: undefined,
    };

    if (
      !executeCallbacks(
        [mainChannelToCallbackMap.get(channel)?.[0]],
        e,
        ...args,
      )
    )
      throw new Error('Sync handler is not registered');

    deasync.loopWhile(() => !e.returnValue);

    if (Promise.resolve(e.returnValue) === e.returnValue)
      throw new Error('An object could not be cloned.');

    return e.returnValue;
  },

  on: (channel: string, callback: any) =>
    addCallbackToListenerMap(rendererChannelToCallbackMap, channel, callback),
  once: (channel: string, callback: any) =>
    addCallbackToListenerMap(
      rendererChannelToCallbackMap,
      channel,
      callback,
      true,
    ),
};

setIpcMain(ipcMain);
setIpcRenderer(ipcRenderer);

const getWebContentsStub = (): Electron.WebContents => {
  return {
    send: (channel: string, ...args: any[]) => {
      executeCallbacks(rendererChannelToCallbackMap.get(channel), {}, ...args);
    },
  } as Electron.WebContents;
};

let testChannel: any;

interface MathService {
  add(num1: number, num2: number): Promise<number>;
}

interface TestService {
  test(): void;
}

describe('Electron RPC', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
    testChannel?.destroy();
  });

  describe('Renderer to Main', () => {
    it('should handle a function call', async () => {
      const channel = new RendererToMainChannel<MathService>('test');
      testChannel = channel;

      channel.getReceiver().handler = new (class
        implements RpcMainHandler<MathService> {
        async add(e: any, num1: number, num2: number): Promise<number> {
          return num1 + num2;
        }
      })();

      expect(await channel.getInvoker().add(2, 2)).to.be.equal(4);
    });

    it('should trigger all observers', async (done) => {
      const channel = new RendererToMainChannel<TestService>('test');
      const receiver = channel.getReceiver();

      testChannel = channel;

      let count = 0;

      class TestObserver implements RpcMainObserver<TestService> {
        test(): void {
          count++;
          if (count === 3) done();
        }
      }

      receiver.observers.add(new TestObserver());
      receiver.observers.add(new TestObserver());
      receiver.observers.add(new TestObserver());

      channel.getInvoker().test();
    });

    it('should handle a sync function call', async () => {
      const channel = new RendererToMainChannel<MathService>('test', ['add']);
      testChannel = channel;

      channel.getReceiver().handler = new (class
        implements RpcMainHandler<MathService> {
        async add(e: any, num1: number, num2: number): Promise<number> {
          return num1 + num2;
        }
      })();

      expect(channel.getInvoker().add(2, 2)).to.be.equal(4);
    });
  });

  describe('Main to Renderer', () => {
    it('should handle a function call', async () => {
      const channel = new MainToRendererChannel<MathService>('test');
      testChannel = channel;

      channel.getReceiver().handler = new (class
        implements RpcRendererHandler<MathService> {
        async add(e: any, num1: number, num2: number): Promise<number> {
          return num1 + num2;
        }
      })();

      expect(
        await channel.getInvoker(getWebContentsStub()).add(2, 2),
      ).to.be.equal(4);
    });

    it('should trigger all observers', (): Promise<void> => {
      return new Promise(async (resolve) => {
        const channel = new MainToRendererChannel<TestService>('test');
        const receiver = channel.getReceiver();
  
        testChannel = channel;
  
        let count = 0;
  
        class TestObserver implements RpcRendererObserver<TestService> {
          test(): void {
            count++;
            if (count === 3) resolve();
          }
        }
  
        receiver.observers.add(new TestObserver());
        receiver.observers.add(new TestObserver());
        receiver.observers.add(new TestObserver());
  
        channel.getInvoker(getWebContentsStub()).test();
      });
    });
  });
});
