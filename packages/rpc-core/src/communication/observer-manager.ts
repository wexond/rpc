import { ServiceCaller } from '../interfaces';

export class ObserverManager<T> {
  protected readonly list: T[] = [];

  public add(observer: T) {
    this.list.push(observer);
  }

  public remove(observer: T) {
    this.list.splice(this.list.indexOf(observer), 1);
  }

  public notify(caller: ServiceCaller) {
    for (const observer of this.list) {
      caller.cb(observer);
    }
  }
}
