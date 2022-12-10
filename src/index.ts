import { Context, HttpError, Next } from "koa";
interface Indexable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const HttpVerbs = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "head",
  "connect",
  "options",
  "trace",
] as const;

/**
 * Valid HTTP methods
 */
export type HttpVerb = typeof HttpVerbs[number];

/**
 * Valid HTTP status codes
 */
export type HttpStatusCode =
  | 100
  | 101
  | 102
  | 103
  | 104
  | 200
  | 201
  | 202
  | 203
  | 204
  | 205
  | 206
  | 207
  | 208
  | 209
  | 226
  | 227
  | 300
  | 301
  | 302
  | 303
  | 304
  | 305
  | 306
  | 307
  | 308
  | 309
  | 400
  | 401
  | 402
  | 403
  | 404
  | 405
  | 406
  | 407
  | 408
  | 409
  | 410
  | 411
  | 412
  | 413
  | 414
  | 415
  | 416
  | 417
  | 418
  | 419
  | 421
  | 422
  | 423
  | 424
  | 425
  | 426
  | 427
  | 428
  | 429
  | 430
  | 431
  | 432
  | 451
  | 452
  | 500
  | 501
  | 502
  | 503
  | 504
  | 505
  | 506
  | 507
  | 508
  | 509
  | 510
  | 511;

/**
 * Describes the expected interface of a Controller class
 * 
 * @TODO there's probably a clever way to declare the HTTP Verb methods with a single line from the `HttpVerb` type, but [K in HttpVerb] isn't it
 */
interface BaseCtl {
  /** Handles HTTP GET requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get?(ctx: Context): Promise<any>;
  /** Handles HTTP GET requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post?(ctx: Context): Promise<any>;
  /** Handles HTTP GET requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put?(ctx: Context): Promise<any>;
  /** Handles HTTP PUT requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch?(ctx: Context): Promise<any>;
  /** Handles HTTP DELETE requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete?(ctx: Context): Promise<any>;
  /** Handles HTTP HEAD requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  head?(ctx: Context): Promise<any>;
  /** Handles HTTP CONNECT requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connect?(ctx: Context): Promise<any>;
  /** Handles HTTP OPTIONS requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?(ctx: Context): Promise<any>;
  /** Handles HTTP TRACE requests */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trace?(ctx: Context): Promise<any>;
}

/**
 * `BaseCtl` is an abstract base class that can be extended to handle
 * requests for a given resource, based on requests. The constructor takes a
 * Koa `Context` object and the `dispatch` method invokes the appropriate
 * class method indicated by the context's `request` object.
 *
 * If a `next` function is passed to the constructor, it can be explicitly
 * called anywhere using the `next` method. Otherwise, it will be called
 * at the end of the `dispatch` method.
 *
 * *While not _technically_ abstract (to accommodate its static methods),
 * `BaseCtl` will throw an error if you try to instantiate it directly.
 */
class BaseCtl {
  /** The Koa `Context` object  */
  ctx: Context;
  /** The Koa middleware `next` callback */
  _next?: Next;
  /** Keeps track of whether or not the `next` function has been called */
  _nextCalled: boolean;

  constructor(ctx: Context, next?: Next) {
    if (this.constructor == BaseCtl) {
      throw new Error(
        "BaseCtl is an abstract class and should not be instantiated."
      );
    }
    this.ctx = ctx;
    if (next) this._next = next;
    this._nextCalled = false;
  }

  /**
   * Dispatches the controller method designated by the context request and sets the response
   * body accordingly.
   *
   * Because the most typical pattern is "call a method, send a response", methods return just the
   * body value, and any changes to the HTTP status code or headers are left up to the implementor.
   *
   * The default response status code is 200.
   *
   * @TODO might be nice to have an option to automagically parse POST request bodies without
   * needing to explicitly add `koa-bodyparse` to the middleware chain
   * (invoke koa-bodyparse directly inside dispatch()? Probably frowned upon)
   */
  async dispatch() {
    const methodName = this.ctx.request.method.toLowerCase() as HttpVerb;

    if (HttpVerbs.indexOf(methodName) === -1) {
      this.ctx.throw(
        400,
        `Invalid request method: ${methodName.toUpperCase()}`
      );
    }

    if (!(this as Indexable)[methodName]) {
      this.ctx.throw(501, `${methodName.toUpperCase()} method not implemented`);
    }

    try {
      // Hat-tip to Daniel W Strimpel for this solution
      // for making method names dynamically indexable. (https://stackoverflow.com/a/53194405)
      const body = await (this as Indexable)[methodName](this.ctx);
      this.setResponseBody(body);
      if (!this._nextCalled) {
        this.next();
      }
    } catch (error) {
      let message = "An error occurred";
      let code = 500;

      if (error instanceof Error) {
        message = error.message;
      }
      if (error instanceof HttpError) {
        code = error.code;
      }
      this.ctx.throw(code, message);
    }
  }

  /**
   * Invokes the middleware `next` function, if it's set (and if it has not already been run elsewhere.)
   */
  async next() {
    if (this._next && !this._nextCalled) {
      await this._next();
      this._nextCalled = true;
    } else if (this._next && this._nextCalled) {
      if (this._nextCalled) {
        console.warn(
          "The 'next' function was called, but it has already been run."
        );
      }
    }
  }

  /**
   * The `go` method returns a Koa middleware function that is the main entry point into the controller.
   *
   * It can be invoked directly within the Koa `use()` method.
   *
   * If you're familiar with Django, `go`() is like [`as_view()`](https://docs.djangoproject.com/en/4.1/ref/class-based-views/base/#django.views.generic.base.View.as_view).
   */
  static go() {
    return async (ctx: Context, next?: Next) => {
      const ctl = new this(ctx, next);
      await ctl.dispatch();
    };
  }


  /**
   * Sets the response HTTP status code
   * @param status_code
   */
  setResponseStatus(status_code: HttpStatusCode) {
    this.ctx.status = status_code;
  }

  /**
   * Merges custom headers with any existing context response headers
   * @param headers
   */
  setResponseHeaders(headers: { [key: string]: string | string[] }) {
    const keys = Object.keys(headers);
    for (let i = 0; i < keys.length; i++) {
      this.ctx.set(keys[i], headers[keys[i]]);
    }
  }

  /**
   * Sets the response body.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setResponseBody(body: any) {
    this.ctx.body = body;
  }

  /**
   * Throws an error using the context object.
   *
   * Note that these are user-level errors, and the message
   * may be exposed to the client.
   *
   * @param status_code
   * @param message
   */
  error(status_code: HttpStatusCode, message: string) {
    this.ctx.throw({
      code: status_code,
      message: message,
    });
  }
}

export default BaseCtl;
