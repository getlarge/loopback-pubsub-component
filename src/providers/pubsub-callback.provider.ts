import {inject, Provider, Getter} from '@loopback/core';
import {Request, Response} from '@loopback/rest';
import {CallbackObject, PubSubCallbackFn, PubSubStrategy} from '../types';
import {PubSubBindings} from '../keys';

export class PubSubCallbackFnProvider implements Provider<PubSubCallbackFn> {
  constructor(
    @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
    readonly getStoreStrategy: Getter<PubSubStrategy>,
  ) {}

  value(): PubSubCallbackFn {
    return (request, response, options) =>
      this.action(request, response, options);
  }

  async action(
    request: Request,
    response: Response,
    options?: Object,
  ): Promise<CallbackObject | undefined> {
    const pubsubStrategy = await this.getStoreStrategy();
    if (!pubsubStrategy) {
      throw new Error('No valid strategy found for PubSubCallbackFn');
    }
    return pubsubStrategy.checkCallback(request, response, options);
  }
}
