import {BindingKey, CoreBindings, MetadataAccessor} from '@loopback/core';
import {
  PubSubPublishFn,
  PubSubSubscribeFn,
  PubSubUnsubscribeFn,
  PubSubStrategy,
} from './types';
// import {PubSubMetadata} from './decorators/pubsub.decorator';
import {PubSubAsyncIterator} from './pubsub-async-iterator';

export namespace PubSubBindings {
  export const PUBSUB_STRATEGY = BindingKey.create<PubSubStrategy | undefined>(
    'pubsub.strategy',
  );

  // export const PUBSUB_CONFIG = `${CoreBindings.APPLICATION_CONFIG}.pubsub`;
  export const PUBSUB_CONFIG = BindingKey.create<PubSubPublishFn>(
    'pubsub.config',
  );

  export const PUBSUB_PUBLISH_ACTION = BindingKey.create<PubSubPublishFn>(
    'pubsub.publish',
  );

  export const PUBSUB_SUBSCRIBE_ACTION = BindingKey.create<PubSubSubscribeFn>(
    'pubsub.subscribe',
  );

  export const PUBSUB_UNSUBSCRIBE_ACTION = BindingKey.create<
    PubSubUnsubscribeFn
  >('pubsub.unsubscribe');

  export const PUBSUB_ASYNC_ITERATOR = BindingKey.create<
    PubSubAsyncIterator<'trigger'>
  >('pubsub.asyncIterator');

  // export const METADATA = BindingKey.create<PubSubMetadata | undefined>(
  //   'pubsub.operationMetadata',
  // );
}

// export const PUBSUB_METADATA_KEY = MetadataAccessor.create<
//   PubSubMetadata,
//   ClassDecorator
// >('pubsub');
