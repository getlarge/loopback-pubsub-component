import {PubSubConfig, PubSubConfigFn, PubSubStrategy} from '../types';
import {inject, Provider, Getter} from '@loopback/core';
import {PubSubBindings} from '../keys';

export class PubSubConfigFnProvider implements Provider<PubSubConfigFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubConfigFn {
    return config => this.action(config);
  }

  async action(config?: Object): Promise<PubSubConfig | undefined> {
    const pubsubStrategy = await this.getStoreStrategy();
    if (!pubsubStrategy) {
      throw new Error('No valid strategy found for PubSubConfigFn');
    }
    return pubsubStrategy.setConfig(config);
  }
}
