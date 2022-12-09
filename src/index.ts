import { Context, HttpError, Next } from "koa";
interface Indexable {
  [key: string]: any;
}

export const HttpMethods = ["get", "post", "put", "patch", "delete", "head", "connect", "options", "trace"] as const

/**
 * Valid HTTP methods
 */
export type HttpMethod = typeof HttpMethods[number]

/** 
 * Valid HTTP status codes 
 */
export type HttpStatusCode = 100 | 101 | 102 | 103 | 104 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 226 | 227 | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 309 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 419 | 421 | 422 | 423 | 424 | 425 | 426 | 427 | 428 | 429 | 430 | 431 | 432 | 451 | 452 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 509 | 510 | 511

/**
 * Describes the expected interface of a Controller class
 */
interface BaseController {
  /** Handles HTTP GET requests */
  get?(): Promise<any>;
  post?(): Promise<any>;
  put?(): Promise<any>;
  patch?(): Promise<any>;
  delete?(): Promise<any>;
  head?(): Promise<any>;
  connect?(): Promise<any>;
  options?(): Promise<any>;
  trace?(): Promise<any>;
}

/**
 * `BaseController` is an abstract base class that can be extended to handle
 * requests for a given resource, based on requests. The constructor takes a
 * Koa `Context` object and the `dispatch` method invokes the appropriate 
 * class method indicated by the context's `request` object.
 * 
 * If a `next` function is passed to the constructor, it can be explicitly 
 * called internally by using the private `_next` method. Otherwise, it will
 * be called at the end of the `dispatch` method.
 */
abstract class BaseController {

  /** The Koa `Context` object  */
  ctx: Context;
  _next?: Next;
  _nextCalled: boolean = false;

  constructor(ctx: Context, next?: Next) {
    if (this.constructor == BaseController) {
      throw new Error(
        "Controller is an abstract class and should not be instantiated."
      );
    }
    this.ctx = ctx;
    if (next) this._next = next;
  }

  /**
   * Dispatches the controller method designated by the context request and sets the response
   * body accordingly.
   * 
   * Because the most typical pattern is "call a method, send a response", methods return just the
   * body value, and any changes to the HTTP status code or headers are left up to the implementor.
   * 
   * The default response status code is 200.
   */
  async dispatch() {
    const methodName = this.ctx.request.method.toLowerCase() as HttpMethod;

    if (HttpMethods.indexOf(methodName) === -1) {
      this.ctx.throw(400, `Invalid request method: ${methodName.toUpperCase()}`)
    }

    if (!(this as Indexable)[methodName]) {
      this.ctx.throw(501, `${methodName.toUpperCase()} method not implemented`)
    }

    try {
      // Hat-tip to Daniel W Strimpel for this solution
      // for making method names dynamically indexable. (https://stackoverflow.com/a/53194405)
      const body = await (this as Indexable)[methodName]();
      this.setResponseBody(body);
      this.next();
    }
    catch (error) {
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
   * Invokes the middleware `next` function, if set.
   */
  async next() {
    if (this._next) {
      await this._next();
      this._nextCalled = true;
    }
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
  setResponseBody(body: any) {
    this.ctx.body = body
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
      message: message
    });
  }
}

export default BaseController;