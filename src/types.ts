// import {PubSubAsyncIterator} from './pubsub-async-iterator';

export type PubSubConfig = {
  host: string;
  protocol: string;
  username?: string;
  password?: string;
  // tslint:disable-next-line:no-any
  [key: string]: any;
};

export interface PubSubPublishFn {
  (triggerName: string, payload: any): Promise<void>;
}

export interface PubSubSubscribeFn {
  (triggerName: string, onMessage: Function, options?: Object): Promise<number>;
}

export interface PubSubUnsubscribeFn {
  (subscriptionId: number): Promise<void>;
}

export interface PubSubStrategy {
  publish(triggerName: string, payload: any): Promise<void>;
  subscribe(
    triggerName: string,
    onMessage: Function,
    options?: Object,
  ): Promise<number>;
  unsubscribe(subscriptionId: number): Promise<void>;
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
  // asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
  //   return new PubSubAsyncIterator<T>(this, triggers);
  // }
}
