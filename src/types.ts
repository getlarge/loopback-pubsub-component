import {Request, Response} from '@loopback/rest';
import {PubSubAsyncIterator} from './pubsub-async-iterator';

export type PubSubConfig = {
  host?: string;
  protocol?: string;
  username?: string;
  password?: string;
  // tslint:disable-next-line:no-any
  [key: string]: any;
};

export type CallbackObject = {
  // instead of path add a runtime expression field,
  // to be evaluated when response is received ?
  path: string;
  method: string;
  name?: string;
  // requestBody
  // response
  // parameters
  // tslint:disable-next-line:no-any
  [key: string]: any;
};

export interface PubSubMetadata extends CallbackObject {
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

export interface PubSubCallbackFn {
  (request: Request, response: Response, config?: Object): Promise<
    CallbackObject | undefined
  >;
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
  checkCallback(
    request: Request,
    response: Response,
    options?: Object,
  ): Promise<CallbackObject | undefined>;
}
