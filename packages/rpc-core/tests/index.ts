import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  Channel
} from '@wexond/rpc-core';

process.env.TEST = 'true';

class TestChannel extends Channel<any> {
  protected createReceiver(...args: any[]) {
    throw new Error('Method not implemented.');
  }
  protected createInvoker(...args: any[]) {
    throw new Error('Method not implemented.');
  }
  getReceiver(...args: any[]) {
    throw new Error('Method not implemented.');
  }
  getInvoker(...args: any[]) {
    throw new Error('Method not implemented.');
  }
}

describe('RPC Core', () => {
  const sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  describe('Channel', () => {
    it('should prevent from creating multiple channels with the same name', async () => {
      const fn = () => {
        new TestChannel('test');
        new TestChannel('test');
      };

      expect(fn).to.throw(Error, 'The channel has already been registered.');
    });
  });
});
