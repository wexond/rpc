import { Receiver } from '~/lib/receiver';
import { tabChannel, TabService } from '~/shared/tabs';

class TabReceiver implements Receiver<TabService> {
  show(id: number): boolean {
    console.log('tab receiver - show', id);
    return true;
  }
}

tabChannel.createServer(new TabReceiver());
