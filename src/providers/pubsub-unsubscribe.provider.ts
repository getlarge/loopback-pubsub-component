import {inject, Provider, Getter} from '@loopback/core';
import {PubSubUnsubscribeFn, PubSubStrategy} from '../types';
import {PubSubBindings} from '../keys';

export class PubSubUnsubscribeFnProvider
  implements Provider<PubSubUnsubscribeFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubUnsubscribeFn {
    return triggerName => this.action(triggerName);
  }

  async action(triggerName: string): Promise<void> {
    const pubsubStrategy = await this.getStoreStrategy();
    if (!pubsubStrategy) {
      throw new Error('No valid strategy found for PubSubUnsubscribeFn');
    }
    await pubsubStrategy.unsubscribe(triggerName);
  }
}
