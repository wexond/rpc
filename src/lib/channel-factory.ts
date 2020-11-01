// import { ipcMain, webContents } from 'electron';
import { Receiver } from './receiver';

type Manifest<T> = {
  [K in keyof T]?: 'sync' | 'async';
};

export class ChannelFactory {
  public static create<T>(name?: string, manifest?: Manifest<T>) {
    return {
      createClient: (): T => {
        const proxy = new Proxy(
          {},
          {
            get: (obj, prop) => {
              return (...args) => {
                console.log(obj, prop, args);
                return 2;
              };
            },
          },
        );

        return proxy as T;
      },
      createServer: (instance: Receiver<T>) => {
        // const ctx: 'main' | 'renderer'
        // ipcMain.on('channel', (e) => {
        //   e.returnValue = 'chuj';
        // });
        // ipcMain.handle('cnahell', () => {});
      },
    };
  }
}
