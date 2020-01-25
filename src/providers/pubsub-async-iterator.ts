import {PubSubIterableFn, PubSubStrategy} from '../types';
import {inject, Provider, Getter} from '@loopback/core';
import {PubSubBindings} from '../keys';
import {PubSubAsyncIterator} from '../pubsub-async-iterator';

// export class PubSubIterableFnProvider
//   implements Provider<PubSubIterableFn> {
//   constructor(
//     @inject.getter(PubSubBindings.PUBSUB_STRATEGY)
//     readonly getStoreStrategy: Getter<PubSubStrategy>,
//   ) {}

//   value(): PubSubIterableFn {
//     return triggers => this.action(triggers);
//   }

//   action(triggers: string | string[]): Promise<AsyncIterable<string | string[]> | PubSubAsyncIterator<any>> {
//     return this.getStoreStrategy().then(
//       res => new PubSubAsyncIterator<any>(res, triggers),
//     );
//   }
// }
