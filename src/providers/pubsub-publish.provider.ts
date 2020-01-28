import {inject, Provider, Getter} from '@loopback/core';
import {PubSubPublishFn, PubSubStrategy} from '../types';
import {PubSubBindings} from '../keys';

export class PubSubPublishFnProvider implements Provider<PubSubPublishFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubPublishFn {
    return (triggerName, payload) => this.action(triggerName, payload);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async action(triggerName: string, payload: any): Promise<void> {
    const pubsubStrategy = await this.getStoreStrategy();
    if (!pubsubStrategy) {
      throw new Error('No valid strategy found for PubSubPublishFn');
    }
    await pubsubStrategy.publish(triggerName, payload);
  }
}
