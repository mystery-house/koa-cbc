# Class-based Controller Middleware for [Koa](https://koajs.com)

-----

koa-ctl lets you collect HTTP methods related to a single resource into one class, which is often conceptually and organizationally helpful.

If you're familiar with Django's [class-based views](https://docs.djangoproject.com/en/4.1/topics/class-based-views/) then `koa-ctl` should feel familiar!

## TypeScript Example

(With koa-router, koa-bodyparser, @types/koa, @types/koa-bodyparser and @types/koa-router installed)

```TypeScript
import Koa, {Context, Next} from "koa";
import bodyParser from "koa-bodyparser";
import router from "koa-router";
import BaseCtl from "koa-ctl";

class FooCtl extends BaseCtl {
  constructor(ctx: Controller, next?: Next ) {
    super(ctx, next);
  }

  async get(ctx: Context, next?: Next) {
    if (ctx.request.query.foo.toLowerCase() == 'foo') {
      return "bar";
    }
    else {
      return "No bar for you";
    }
  }

  async post(ctx: Context, next?: Next) {
    // (POST request data will have been parsed by koa-bodyparser)
    if (ctx.request.body.bar.toLowerCase() == 'bar') {
      return "bat";
    }
    else {
      return "no bat for you";
    }
  }
}

const app = new Koa();
app.use(bodyParser());
app.use(route.all("/foo", FooCtl.go()));
app.listen(3000);
```

## Installation

```Bash
# yarn
yarn add koa-cdc

# npm
npm install koa-cdc
```

## TypeScript

`koa-cdc` is written in TypeScript from the ground up and includes its own type definitions.

## Dependencies

If you do plan to use TypeScript, you'll want to include the [@types/koa](https://www.npmjs.com/package/@types/koa) package as a dev dependency for your project:

```Bash
# yarn
yarn add -D @types/koa
# npm
npm install --save-dev @types/koa
```

## Development

```bash
# Clone the repository:
git clone https://github.com/mystery-house/koa-ctl.git

# Install dependencies
cd koa-ctl
yarn install

# Run tests
yarn test

# Build
yarn build
```

## Caveat

This project has not been heavily used yet and will likely undergo multiple changes on its way to a stable release.
