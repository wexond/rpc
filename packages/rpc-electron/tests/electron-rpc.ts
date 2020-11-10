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
} from '@wexond/rpc-electron';

process.env.TEST = 'true';

let mainChannelToCallbackMap: Map<string, any> = new Map();
let rendererChannelToCallbackMap: Map<string, any> = new Map();
let ipcMainHandleCallback: any;
  
const ipcMain: any = {
  eventNames: (): string[] => [],
  handle: (channel: string, callback: any) => {
    ipcMainHandleCallback = callback;
  },
  removeHandler: (channel: string) => {
    ipcMainHandleCallback = undefined;
  },
  on: (channel: string, callback: any) => {
    mainChannelToCallbackMap.set(channel, callback);
  }
};

const ipcRenderer: any = {
  eventNames: (): string[] => [],
  invoke: (channel: string, ...args: any[]): Promise<any> => {
    return Promise.resolve(ipcMainHandleCallback?.({}, ...args));
  },
  send: (channel: string, ...args: any[]) => {
    mainChannelToCallbackMap.get(channel)?.({}, ...args);
  },
  sendSync: (channel: string, ...args: any[]): Promise<any> => {
    const e: any = {
      returnValue: undefined,
    };

    mainChannelToCallbackMap.get(channel)?.(e, ...args);

    deasync.loopWhile(() => !e.returnValue);

    if (Promise.resolve(e.returnValue) === e.returnValue) throw new Error('An object could not be cloned.');

    return e.returnValue;
  },
  on: (channel: string, callback: any) => {
    rendererChannelToCallbackMap.set(channel, callback);
  }
};

setIpcMain(ipcMain);
setIpcRenderer(ipcRenderer);

const getWebContentsStub = () => {
  return {
    send: (channel: string, ...args: any[]) => {
      for (const arg of args) {
        if (Promise.resolve(arg) === arg) throw new Error('An object could not be cloned.');
      }

      rendererChannelToCallbackMap?.get(channel)?.({}, ...args);
    }
  }
};

let testChannel: any;

describe('Electron RPC', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
    testChannel?.destroy();
  });

  describe('Renderer to Main', () => {
    it('should handle a function call', async () => {
      interface TestService {
        add(num1: number, num2: number): Promise<number>;
      }

      const channel = new RendererToMainChannel<TestService>('test');
      testChannel = channel;

      channel.getReceiver().handler = new (class
        implements RpcMainHandler<TestService> {
        async add(e: any, num1: number, num2: number): Promise<number> {
          return num1 + num2;
        }
      })();

      expect(await channel.getInvoker().add(2, 2)).to.be.equal(4);
    });

    it('should prevent from creating multiple channels with the same name', async () => {
      const fn = () => {
        new RendererToMainChannel('test');
        new RendererToMainChannel('test');
      }
      
      expect(fn).to.throw(Error, 'The channel has already been registered.');
    });

    it('should trigger all observers in main', async (done) => {
      interface TestService {
        test(): void;
      }

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
    
    it('should handle a sync function call and deal with a Promise as the return value', async () => {
      interface TestService {
        add(num1: number, num2: number): Promise<number>;
      }

      const channel = new RendererToMainChannel<TestService>('test', ['add']);
      testChannel = channel;

      channel.getReceiver().handler = new (class
        implements RpcMainHandler<TestService> {
        async add(e: any, num1: number, num2: number): Promise<number> {
          return num1 + num2;
        }
      })();

      expect(channel.getInvoker().add(2, 2)).to.be.equal(4);
    });
  });
});
