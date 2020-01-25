# loopback-pubsub-component

A PubSub component for LoopBack 4.

Not working yet...

## Installation

Run the following command to install `loopback-pubsub-component`:

```npm
npm i -s loopback-pubsub-component
```

## Usage

When the `loopback-pubsub-component` package is installed, bind it to your application with `app.component()`

```typescript
import {RestApplication} from '@loopback/rest';
import {PubSubComponent} from 'loopback-pubsub-component';

const app = new RestApplication();
// Keep in mind that some extra configuration is required
// as shown in the following steps, (coming soon)
app.component(PubSubComponent);
```

### License

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)
