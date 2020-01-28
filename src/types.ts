/* eslint-disable @typescript-eslint/no-explicit-any */
import {PubSubAsyncIterator} from './pubsub-async-iterator';

export type PubSubConfig = {
  host?: string;
  protocol?: string;
  username?: string;
  password?: string;
  // tslint:disable-next-line:no-any
  [key: string]: any;
};

export type Packet = {
  triggerName: string;
  payload: any;
};

export interface PubSubMetadata extends Packet {
  // parent: {path: string; method: string};
  options?: Object;
}

export interface PubSubConfigFn {
  (config?: Object): Promise<PubSubConfig | undefined>;
}

export interface PubSubPublishFn {
  (triggerName: string, payload: any): Promise<void>;
}

export interface PubSubSubscribeFn {
  (triggerName: string, onMessage: Function, options?: Object): Promise<number>;
}

export interface PubSubUnsubscribeFn {
  (subscriptionId: number): Promise<void>;
}

export interface PubSubIterableFn {
  (triggers: string | string[]): Promise<AsyncIterator<string | string[]>>;
}

// export type SubscriptionIterator = (
//   triggers: string | string[],
// ) => AsyncIterable<string | string[]>;

export abstract class PubSubEngine {
  public abstract publish(triggerName: string, payload: any): Promise<void>;
  public abstract subscribe(
    triggerName: string,
    onMessage: Function,
    options?: Object,
  ): Promise<number>;
  public abstract unsubscribe(subId: number): Promise<void>;
  public asyncIterator<T>(
    triggers: string | string[],
  ): AsyncIterator<T> | Promise<AsyncIterator<T>> {
    return new PubSubAsyncIterator<T>(this, triggers);
  }
}

export interface PubSubStrategy extends PubSubEngine {
  setConfig(config?: PubSubConfig): Promise<PubSubConfig | undefined>;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
