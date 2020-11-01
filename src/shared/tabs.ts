import { ChannelFactory } from 'lib/channel-factory';

export interface TabService {
  show(id: number): boolean;
}

const tabChannel = ChannelFactory.create<TabService>('tabs', {
  show: 'sync',
});

export { tabChannel };
