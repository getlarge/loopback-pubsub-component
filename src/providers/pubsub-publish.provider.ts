import {PubSubPublishFn, PubSubStrategy} from '../types';
import {inject, Provider, Getter} from '@loopback/core';
import {PubSubBindings} from '../keys';

export class PubSubPublishFnProvider implements Provider<PubSubPublishFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubPublishFn {
    return (triggerName: string, payload: any) =>
      this.action(triggerName, payload);
  }

  async action(triggerName: string, payload: any): Promise<void> {
    const pubsubStrategy = await this.getStoreStrategy();
    if (!pubsubStrategy) {
      throw new Error('No valid strategy found for PubSubPublishFn');
    }
    return pubsubStrategy.publish(triggerName, payload);
  }
}
