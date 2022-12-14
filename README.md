# koa-ctl

## Class-based Controller Middleware for [Koa](https://koajs.com)

koa-ctl lets you organize handlers for multiple types of HTTP requests into one class, which is often conceptually and organizationally helpful when you need to handle different operations on the same type of resource.

If you're familiar with Django's [class-based views](https://docs.djangoproject.com/en/4.1/topics/class-based-views/) then `koa-ctl` should feel familiar.

## TypeScript Example

```TypeScript
import Koa, {Context, Next} from "koa";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
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
const router = new Router();
router.all('/foo', FooCtl.go());

app.use(bodyParser());
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000);
```

## Installation

```Bash
# yarn
yarn add koa-ctl

# npm
npm install koa-ctl
```

## TypeScript

`koa-ctl` is written in TypeScript from the ground up and includes its own type definitions.

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
