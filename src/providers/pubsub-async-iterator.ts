import {inject, Provider, Getter} from '@loopback/core';
import {PubSubIterableFn, PubSubStrategy} from '../types';
import {PubSubBindings} from '../keys';

export class PubSubIterableProvider implements Provider<PubSubIterableFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubIterableFn {
    return triggers => this.action(triggers);
  }

  async action(
    triggers: string | string[],
  ): Promise<AsyncIterator<string | string[]>> {
    const pubsubStrategy = await this.getStoreStrategy();
    return pubsubStrategy.asyncIterator(triggers);
  }
}
