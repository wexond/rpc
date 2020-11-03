import { EventEmitter } from 'events';

export const clearEvents = (emitter: EventEmitter, name: string) => {
  if (emitter.eventNames().includes(name)) {
    emitter.removeAllListeners(name);
  }
};
