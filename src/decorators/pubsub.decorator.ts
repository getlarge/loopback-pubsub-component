import {
  MethodDecoratorFactory,
  Constructor,
  MetadataInspector,
} from '@loopback/core';
import {PUBSUB_METADATA_KEY} from '../keys';
import {PubSubMetadata} from '../types';

export function callback(path: string, method: string, options?: Object) {
  return MethodDecoratorFactory.createDecorator<PubSubMetadata>(
    PUBSUB_METADATA_KEY,
    {
      path,
      method,
      options: options || {},
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
