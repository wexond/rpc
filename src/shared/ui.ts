import { ipcMainToRenderer } from 'lib/channel-factory';

export interface UIService {
  showButton: () => number;
}

const uiChannel = ipcMainToRenderer<UIService>('ui');

export { uiChannel };
