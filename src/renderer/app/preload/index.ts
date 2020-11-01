import { contextBridge } from 'electron';
import { IpcHandler } from '~/lib/receiver';
import { tabChannel } from '~/shared/tabs';
import { uiChannel, UIService } from '~/shared/ui';

contextBridge.exposeInMainWorld('api', {
  tabChannel
});

const tabService = tabChannel.createInvoker();

class UIHandler implements IpcHandler<UIService> {
  showButton() {
    return 5; 
  }
};

uiChannel.registerHandler(new UIHandler());

window.onload = async () => {
  console.log('Tab Service')
  console.log(tabService.getTabId());
  console.log(await tabService.show(1));
}
