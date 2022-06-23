import remove from 'lodash/remove';

export type AsyncListener<T, R = any> = (arg: T) => Promise<R>;
export type SyncListener<T, R = any> = (arg: T) => R;
export type Listener<T, R = any> = AsyncListener<T, R> | SyncListener<T, R>;

export class EventEmitter<T> {
  listeners: Listener<T>[] = [];

  on = (listener: Listener<T>) => this.listeners.push(listener);
  off = (listener: Listener<T>) => this.listeners = remove(this.listeners, (l) => l === listener);

  emitsa = (data: T) => this.listeners.reduce((acc, l) => acc.then(($data) => Promise.resolve(l($data))), Promise.resolve(data));
  emitss = (data: T) => this.listeners.reduce((acc, l) => l(acc), data);

  emitpa = (data: T) => Promise.all(this.listeners.map((l) => Promise.resolve(l(data))));
  emitps = (data: T) => this.listeners.map((l) => l(data));
};
