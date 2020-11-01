import { ipcRendererToMain } from 'lib/channel-factory';

export interface TabService {
  show(id: number): boolean;
  getTabId(): number;
}

const tabChannel = ipcRendererToMain<TabService>('tabs', ['getTabId']);

export { tabChannel };
