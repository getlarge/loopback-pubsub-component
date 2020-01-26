import {CoreBindings} from '@loopback/core';
import {Constructor, Provider, inject} from '@loopback/context';
import {getPubSubMetadata} from '../decorators';
import {PubSubMetadata} from '../types';

export class PubSubMetadataProvider
  implements Provider<PubSubMetadata | undefined> {
  constructor(
    @inject(CoreBindings.CONTROLLER_CLASS, {optional: true})
    private readonly controllerClass: Constructor<{}>,
    @inject(CoreBindings.CONTROLLER_METHOD_NAME, {optional: true})
    private readonly methodName: string,
  ) {}

  value(): PubSubMetadata | undefined {
    if (!this.controllerClass || !this.methodName) return;
    return getPubSubMetadata(this.controllerClass, this.methodName);
  }
}
