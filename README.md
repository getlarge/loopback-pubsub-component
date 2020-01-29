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

app.bind(PubSubBindings.CONFIG).to({
  eventEmitter: new EventEmitter(),
  // client: mqttClient
});
app.component(PubSubComponent);
app.bind(PubSubBindings.PUBSUB_STRATEGY).toProvider(PubSubStrategyProvider);

```

### Create a repository

Create a repository that implements your client/broker logic, here an example for a simple EventEmitter.
You could create several repositories, with MQTT client or other kinds of PubSub clients.

```typescript
import {inject} from '@loopback/core';
import {
  PubSubEngine,
  PubSubBindings,
  PubSubConfig,
  PubSubAsyncIterator,
} from 'loopback-pubsub-component';
import {EventEmitter} from 'events';

export class PubSubEERepository extends PubSubEngine {
  protected ee: EventEmitter;
  public subscriptions: {[subId: number]: [string, (...args: any[]) => void]};
  public subIdCounter: number;

  constructor(@inject(PubSubBindings.CONFIG) options: PubSubConfig) {
    super();
    if (options.eventEmitter) {
      this.ee = options.eventEmitter;
    } else {
      this.ee = new EventEmitter();
    }
    this.subscriptions = {};
    this.subIdCounter = 0;
  }

  public publish(triggerName: string, payload: any): Promise<void> {
    this.ee.emit(triggerName, payload);
    return Promise.resolve();
  }

  public subscribe(
    triggerName: string,
    onMessage: (...args: any[]) => void,
    options?: Object,
  ): Promise<number> {
    this.ee.addListener(triggerName, onMessage);
    this.subIdCounter = this.subIdCounter + 1;
    this.subscriptions[this.subIdCounter] = [triggerName, onMessage];
    return Promise.resolve(this.subIdCounter);
  }

  public unsubscribe(subIdOrTriggerName: number | string) {
    if (typeof subIdOrTriggerName === 'string') {
      return this.unsubscribeByName(subIdOrTriggerName);
    }
    return this.unsubscribeById(subIdOrTriggerName);
  }

  public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, triggers);
  }

  private unsubscribeById(subId: number) {
    const [triggerName, onMessage] = this.subscriptions[subId];
    delete this.subscriptions[subId];
    this.ee.removeListener(triggerName, onMessage);
    return Promise.resolve();
  }

  private unsubscribeByName(triggerName: string) {
    const subIds: number[] = Object.keys(this.subscriptions).map(Number);
    for (const subId of subIds) {
      if (this.subscriptions[subId][0] === triggerName) {
        const onMessage = this.subscriptions[subId][1];
        delete this.subscriptions[subId];
        this.ee.removeListener(triggerName, onMessage);
        break;
      }
    }
    return Promise.resolve();
  }
}
```

### Strategy provider

Create a strategy provider that implements your custom logic.
If you have several repositories, inject them and create a function to switch between repositories with trigerName filtering.

```typescript
import {inject, Provider, ValueOrPromise} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  PubSubBindings,
  PubSubConfig,
  PubSubStrategy,
  PubSubMetadata,
} from 'loopback-pubsub-component';
import {PubSubEERepository, PubSubMQTTRepository} from '../repositories';

export class PubSubStrategyProvider implements Provider<PubSubStrategy | undefined> {
  private engines: (PubSubEERepository | PubSubMQTTRepository)[];

  constructor(
    @inject(PubSubBindings.METADATA) private metadata: PubSubMetadata,
    @repository(PubSubEERepository) protected pubsubEERepo: PubSubEERepository,
    @repository(PubSubMQTTRepository) protected pubsubMQTTRepo: PubSubMQTTRepository,
  ) {
    this.engines = [this.pubsubEERepo, this.pubsubMQTTRepo];
  }

  selectRepository(triggerNames: string | string[]): PubSubEERepository | PubSubMQTTRepository {
    // filter triggerName or triggerNames[0]
    return this.engines[0];
  }

  value(): ValueOrPromise<PubSubStrategy | undefined> {
    const self = this;

    return {
      setConfig: async (config?: Object) => {
        const pubsubConf: PubSubConfig = {};
        return pubsubConf;
      },

      publish: async (triggerName: string, payload: any) => {
        const engine = this.selectRepository(triggerName);
        await engine.publish(triggerName, JSON.stringify(payload));
      },

      subscribe: (triggerName: string, onMessage: (...args: any[]) => void, options?: Object) => {
        const engine = this.selectRepository(triggerName);
        // return Promise.all([engines.map( engine => engine.subscribe(triggerName, onMessage, options))])
        return engine.subscribe(triggerName, onMessage, options);
      },

      unsubscribe: async (triggerName: string) => {
        const engine = this.selectRepository(triggerName);
        await engine.unsubscribe(triggerName);
      },

      asyncIterator(triggers: string | string[]) {
        const engine = self.selectRepository(triggers);
        return engine.asyncIterator(triggers);
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


## License

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
