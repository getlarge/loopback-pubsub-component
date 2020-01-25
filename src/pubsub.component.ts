import {
  Component,
  ProviderMap,
  CoreBindings,
  Application,
  Server,
} from '@loopback/core';
import {inject, Constructor} from '@loopback/context';
import {PubSubBindings} from './keys';
import {PubSubConfig} from './types';
import {
  PubSubPublishFnProvider,
  PubSubSubscribeFnProvider,
  PubSubUnsubscribeFnProvider,
} from './providers';

export class PubSubComponent implements Component {
  providers?: ProviderMap;

  constructor(@inject(PubSubBindings.PUBSUB_CONFIG) public config: PubSubConfig) {
    // this.sanityCheck();

    this.providers = {
      [PubSubBindings.PUBSUB_PUBLISH_ACTION.key]: PubSubPublishFnProvider,
      [PubSubBindings.PUBSUB_SUBSCRIBE_ACTION.key]: PubSubSubscribeFnProvider,
      [PubSubBindings.PUBSUB_UNSUBSCRIBE_ACTION
        .key]: PubSubUnsubscribeFnProvider,
      // [PubSubBindings.PUBSUB_ASYNC_ITERATOR.key]: PubSubAsyncIteratorProvider,
      // [PubSubBindings.METADATA.key]: CacheMetadataProvider,
    };
  }

  // sanityCheck() {
    // this.config...
  // }
}
