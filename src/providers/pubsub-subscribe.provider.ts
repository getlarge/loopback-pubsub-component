import {inject, Provider, Getter} from '@loopback/core';
import {PubSubSubscribeFn, PubSubStrategy} from '../types';
import {PubSubBindings} from '../keys';

export class PubSubSubscribeFnProvider implements Provider<PubSubSubscribeFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubSubscribeFn {
    return (triggerName, onMessage, options?) =>
      this.action(triggerName, onMessage, options);
  }

  async action(
    triggerName: string,
    onMessage: Function,
    options?: Object,
  ): Promise<number> {
    const pubsubStrategy = await this.getStoreStrategy();
    if (!pubsubStrategy) {
      throw new Error('No valid strategy found for PubSubSubscribeFn');
    }
    return pubsubStrategy.subscribe(triggerName, onMessage, options);
  }
}
