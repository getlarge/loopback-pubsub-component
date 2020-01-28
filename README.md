# loopback-pubsub-component

A PubSub component for LoopBack 4, trying to follow [GraphQL specs](https://github.com/graphql/graphql-spec/blob/master/rfcs/Subscriptions.md) and inspired by [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions)

This is a generic component that can wraps "any" PubSub client/broker in your own repository and strategy provider.

## Installation

Run the following command to install `loopback-pubsub-component`:

```npm
npm i -s loopback-pubsub-component
```

## Usage

### Import component 

When the `loopback-pubsub-component` package is installed, bind it to your application with `app.component()`

```typescript
import {RestApplication} from '@loopback/rest';
import {PubSubBindings, PubSubComponent, PubSubStrategyProvider} from 'loopback-pubsub-component';

const app = new RestApplication();
// Keep in mind that some extra configuration is required
// as shown in the following steps
app.component(PubSubComponent);
app.bind(PubSubBindings.PUBSUB_STRATEGY).toProvider(PubSubStrategyProvider);

```

### Create a repository

Create a repository that implements your client/broker logic, here an example for a simple EventEmitter :

```typescript

import {inject} from '@loopback/core';
import {PubSubEngine, PubSubAsyncIterator} from 'loopback-pubsub-component';
import {EventEmitter} from 'events';

export interface PubSubOptions {
  eventEmitter?: EventEmitter;
}

export class PubSubRepository extends PubSubEngine {
  protected ee: EventEmitter;
  public subscriptions: {[key: string]: [string, (...args: any[]) => void]};
  public subIdCounter: number;

  constructor(options: PubSubOptions = {}) {
    super();
    this.ee = options.eventEmitter || new EventEmitter();
    this.subscriptions = {};
    this.subIdCounter = 0;
  }

  public publish(triggerName: string, payload: any): Promise<void> {
    this.ee.emit(triggerName, payload);
    console.log('PubSubRepository publish', triggerName, payload);
    return Promise.resolve();
  }

  public subscribe(
    triggerName: string,
    onMessage: (...args: any[]) => void,
    options?: Object,
  ): Promise<number> {
    console.log('PubSubRepository subscribe', triggerName);
    this.ee.addListener(triggerName, onMessage);
    this.subIdCounter = this.subIdCounter + 1;
    this.subscriptions[this.subIdCounter] = [triggerName, onMessage];
    return Promise.resolve(this.subIdCounter);
  }

  public unsubscribe(subId: number) {
    const [triggerName, onMessage] = this.subscriptions[subId];
    delete this.subscriptions[subId];
    this.ee.removeListener(triggerName, onMessage);
    return Promise.resolve();
  }

  public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, triggers);
  }
}

```

### Strategy provider

Create a strategy provider that implements your custom logic :

```typescript
import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {Request, Response} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {
  PubSubBindings,
  PubSubConfig,
  PubSubStrategy,
  PubSubMetadata,
} from 'loopback-pubsub-component';
import {PubSubRepository} from '../repositories';

export class PubSubStrategyProvider implements Provider<PubSubStrategy | undefined> {
  constructor(
    @inject(PubSubBindings.METADATA) private metadata: PubSubMetadata,
    @repository(PubSubRepository) protected pubsubRepo: PubSubRepository,
  ) {}

  value(): ValueOrPromise<PubSubStrategy | undefined> {

    const self = this;

    return {
      setConfig: async (config?: Object) => {
        const pubsubConf: PubSubConfig = {};
        return pubsubConf;
      },

      publish: async (triggerName: string, payload: any) => {
        await this.pubsubRepo.publish(triggerName, JSON.stringify(payload));
      },

      subscribe: (triggerName: string, onMessage: (...args: any[]) => void, options?: Object) => {
        return this.pubsubRepo.subscribe(triggerName, onMessage, options);
      },

      unsubscribe: async (subscriptionId: number) => {
        await this.pubsubRepo.unsubscribe(subscriptionId);
      },

      asyncIterator(triggers: string | string[]) {
        return self.pubsubRepo.asyncIterator(triggers);
      },

    };
  }
}

```

### Use in a controller

Inject the bindings, to make available PubSubStrategy provider functions.

```typescript
import {inject} from '@loopback/context';
import {repository} from '@loopback/repository';
import {
  post,
  param,
  get,
  patch,
  put,
  Request,
  requestBody,
  RestBindings,
} from '@loopback/rest';
import {PubSubBindings} from 'loopback-pubsub-component';
import {Device} from '../models';
import {DeviceApi, devicesApiEndPoint} from '../services';
import {getToken} from '../utils';

const security = [
  {
    Authorization: [],
  },
];

export class DeviceController {
  constructor(
    @inject('services.DeviceApi') protected deviceApi: DeviceApi,
    @inject(RestBindings.Http.REQUEST) public request: Request,
    @inject(PubSubBindings.publish) public publish: PubSubPublishFn,
  ) {}

  @post(`/${devicesApiEndPoint}`, {
    operationId: 'createDevice',
    security,
    responses: {
      '200': {
        description: 'Device instance',
        content: {'application/json': {schema: {'x-ts-type': Device}}},
      },
    },
    // callbacks: <callbackName>
  })
  async create(@requestBody() device: Device): Promise<Device> {
    const token = getToken(this.request);
    const result = await this.deviceApi.create(token, device);
    await this.publish(this.request.path, result)
    return result;
  }

}

```

## TODO 

- Adding decorator to use it like a router in a Controller ( @publish, @subscribe ... ) and control access ( when using broker )

- Using multiple PuSub engines


## License

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
