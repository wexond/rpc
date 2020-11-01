import { ipcRenderer } from 'electron';
import { tabChannel } from '~/shared/tabs';

const client = tabChannel.createClient(/* webContents */);

client.show(1);

ipcRenderer.sendSync();
ipcRenderer.send();

await ipcRenderer.invoke();
