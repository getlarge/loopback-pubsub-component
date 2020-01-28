import {
  MethodDecoratorFactory,
  Constructor,
  MetadataInspector,
} from '@loopback/core';
import {PUBSUB_METADATA_KEY} from '../keys';
import {PubSubMetadata} from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function publish(triggerName: string, payload: any, options?: Object) {
  return MethodDecoratorFactory.createDecorator<PubSubMetadata>(
    PUBSUB_METADATA_KEY,
    {
      triggerName,
      payload,
      options: options ?? {},
    },
  );
}

export function getPubSubMetadata(
  controllerClass: Constructor<{}>,
  methodName: string,
): PubSubMetadata | undefined {
  return MetadataInspector.getMethodMetadata<PubSubMetadata>(
    PUBSUB_METADATA_KEY,
    controllerClass.prototype,
    methodName,
  );
}
