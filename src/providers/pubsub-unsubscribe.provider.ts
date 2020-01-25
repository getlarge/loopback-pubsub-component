import {PubSubUnsubscribeFn, PubSubStrategy} from '../types';
import {inject, Provider, Getter} from '@loopback/core';
import {PubSubBindings} from '../keys';

export class PubSubUnsubscribeFnProvider
  implements Provider<PubSubUnsubscribeFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubUnsubscribeFn {
    return (subscriptionId: number) => this.action(subscriptionId);
  }

  async action(subscriptionId: number): Promise<void> {
    const pubsubStrategy = await this.getStoreStrategy();
    if (!pubsubStrategy) {
      throw new Error('No valid strategy found for PubSubUnsubscribeFn');
    }
    pubsubStrategy.unsubscribe(subscriptionId);
  }
}
