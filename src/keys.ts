import {BindingKey, CoreBindings, MetadataAccessor} from '@loopback/core';
import {
  PubSubConfigFn,
  PubSubPublishFn,
  PubSubSubscribeFn,
  PubSubUnsubscribeFn,
  PubSubIterableFn,
  PubSubStrategy,
  PubSubMetadata,
} from './types';

export namespace PubSubBindings {
  export const PUBSUB_STRATEGY = BindingKey.create<PubSubStrategy | undefined>(
    'pubsub.strategy',
  );

  export const CONFIG = `${CoreBindings.APPLICATION_CONFIG}.pubsub`;

  export const PUBSUB_CONFIG = BindingKey.create<PubSubConfigFn | undefined>(
    'pubsub.options',
  );

  export const PUBSUB_CONFIG_ACTION = BindingKey.create<
    PubSubConfigFn | undefined
  >('pubsub.config');

  export const PUBSUB_PUBLISH = BindingKey.create<PubSubPublishFn | undefined>(
    'pubsub.publish',
  );

  export const PUBSUB_SUBSCRIBE = BindingKey.create<
    PubSubSubscribeFn | undefined
  >('pubsub.subscribe');

  export const PUBSUB_UNSUBSCRIBE = BindingKey.create<
    PubSubUnsubscribeFn | undefined
  >('pubsub.unsubscribe');

  export const PUBSUB_ASYNC_ITERATOR = BindingKey.create<PubSubIterableFn>(
    'pubsub.asyncIterator',
  );

  export const METADATA = BindingKey.create<PubSubMetadata | undefined>(
    'pubsub.operationMetadata',
  );
}

export const PUBSUB_METADATA_KEY = MetadataAccessor.create<
  PubSubMetadata,
  MethodDecorator
>('pubsub.operationsData');
