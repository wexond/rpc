// import { ipcMain, webContents } from 'electron';
import { Receiver } from './receiver';

export class ChannelFactory {
  public static create<T>(name: string) {
    return {
      createClient: (): T => {
        return {} as T;
      },
      createServer: (instance: Receiver<T>) => {
        // ipcMain.on('channel', (e) => {
        //   e.returnValue = 'chuj';
        // });
        // ipcMain.handle('cnahell', () => {});
      },
    };
  }
}
