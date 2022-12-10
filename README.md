# Class-based Controller Middleware for [Koa](https://koajs.com)

## Note 
2022-12-09: This does not actually work yet... somewhere between 'poc' and 'make all the tests green', something broke.

-----

If you're familiar with Django's [class-based views](https://docs.djangoproject.com/en/4.1/topics/class-based-views/) then `koa-cbc` should feel familiar. It lets you organize different HTTP operations related to a given resource into one class, which is often conceptually and organizationally helpful.

## TypeScript Example

(With @types/koa installed)

```TypeScript
import Koa, {Context, Next} from "koa";
import bodyParser from "koa-bodyparser";
import BaseCtl from "koa-cdc";

class FooCtl extends BaseCtl {
  constructor(ctx: Controller, next?: Next ) {
    super(ctx, next);
  }

  async get() {
    const userId = this.ctx.request.query.id;
    // [...look up user...]
    if (this.ctx.request.query.foo.toLowerCase() == 'foo') {
      return "bar";
    }
    else {
      return "No bar for you";
    }
  }

  async post() {
    // (POST request data will have been parsed by koa-bodyparser)
    if (this.ctx.request.body.bar.toLowerCase() == 'bar') {
      return "bat";
    }
    else {
      return "no bat for you";
    }
  }
}

const app = new Koa();
app.use(bodyParser());
app.use(FooCtl.go())
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
git clone https://github.com/mystery-house/koa-cbc.git

# Install dependencies
cd koa-cbc
yarn install

# Run tests
yarn test

# Build
yarn build
```

## Caveat

This project has not been heavily used yet and will likely undergo multiple changes on its way to a stable release.
