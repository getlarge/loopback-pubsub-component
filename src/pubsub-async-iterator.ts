/* eslint-disable @typescript-eslint/no-explicit-any */
import {$$asyncIterator} from 'iterall';
import {PubSubEngine} from './types';

export class PubSubAsyncIterator<T> implements AsyncIterator<T> {
  // private pullQueue: Function[];
  // private pullQueue: ((value: IteratorResult<T>) => void)[];
  private pullQueue: any[];
  // private pushQueue: any[];
  private pushQueue: T[];
  private eventsArray: string[];
  private subscriptionIds: Promise<number[]> | undefined;
  private listening: boolean;
  private pubsub: PubSubEngine;
  // private pubsub: PubSubStrategy | PromiseLike<PubSubStrategy>;
  private options: Object | undefined;

  constructor(
    pubsub: PubSubEngine,
    // pubsub: PubSubStrategy,
    eventNames: string | string[],
    options?: Object,
  ) {
    this.pubsub = pubsub;
    this.options = options;
    this.pullQueue = [];
    this.pushQueue = [];
    this.listening = true;
    this.eventsArray =
      typeof eventNames === 'string' ? [eventNames] : eventNames;
  }

  // public isPubSubStrategy(
  //   pubsub: PubSubStrategy | PromiseLike<PubSubStrategy>,
  // ): pubsub is PubSubStrategy {
  //   return <PubSubStrategy>pubsub.publish !== undefined;
  // }

  public async next(): Promise<IteratorResult<T>> {
    await this.subscribeAll();
    return this.listening ? this.pullValue() : this.return();
  }

  public async return(): Promise<IteratorResult<T>> {
    await this.emptyQueue();
    return {value: undefined, done: true};
  }

  public async throw(error: Error) {
    await this.emptyQueue();
    return Promise.reject(error);
  }

  public [$$asyncIterator]() {
    return this;
  }

  private async pushValue(event: T) {
    await this.subscribeAll();
    if (this.pullQueue.length !== 0) {
      this.pullQueue.shift()({value: event, done: false});
    } else {
      this.pushQueue.push(event);
    }
  }

  private pullValue(): Promise<IteratorResult<any>> {
    return new Promise(resolve => {
      if (this.pushQueue.length !== 0) {
        resolve({value: this.pushQueue.shift(), done: false});
      } else {
        this.pullQueue.push(resolve);
      }
    });
  }

  private async emptyQueue() {
    if (this.listening) {
      this.listening = false;
      if (this.subscriptionIds) {
        // this.unsubscribeAll(await this.subscriptionIds);
        await this.unsubscribeAll(await this.subscriptionIds);
      }
      this.pullQueue.forEach(resolve =>
        resolve({value: undefined, done: true}),
      );
      this.pullQueue.length = 0;
      this.pushQueue.length = 0;
    }
  }

  private subscribeAll() {
    if (!this.subscriptionIds) {
      this.subscriptionIds = Promise.all(
        this.eventsArray.map(eventName =>
          this.pubsub.subscribe(
            eventName,
            this.pushValue.bind(this),
            this.options,
          ),
        ),
      );
    }
    return this.subscriptionIds;
  }

  private unsubscribeAll(subscriptionIds: number[]) {
    for (const subscriptionId of subscriptionIds) {
      // this.pubsub.unsubscribe(subscriptionId);
      return this.pubsub.unsubscribe(subscriptionId);
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */
