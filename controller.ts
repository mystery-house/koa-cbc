import { Context, Request, Response } from "koa";

interface Indexable {
  [key: string]: any;
}

/**
 * An error object conforming to the
 * [JSend](https://github.com/omniti-labs/jsend) specification
 */
type JSendError = {
  code?: number;
  status: "error" | "fail";
  message: string;
  data?: unknown;
}

/** 
 * Valid HTTP status codes 
 */
export type HttpStatusCode = 100 | 101 | 102 | 103 | 104 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 226 | 227 | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 309 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 419 | 421 | 422 | 423 | 424 | 425 | 426 | 427 | 428 | 429 | 430 | 431 | 432 | 451 | 452 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 509 | 510 | 511

/**
 * Describes the expected interface of a Controller class
 */
export interface ControllerInterface {
  ctx: Context
  dispatch: () => void;
  get?: () => void;
  post?: () => void;
  put?: () => void;
  patch?: () => void;
  delete?: () => void;
  head?: () => void;
  connect?: () => void;
  options?: () => void;
  trace?: () => void;
}

/**
 * Valid HTTP methods
 */
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "connect" | "options" | "trace"

/**
 * `Controller` is an abstract base class that can be extended to handle
 * requests for a given resource, based on requests. The constructor takes a
 * Koa `Context` object and the `dispatch` method invokes the appropriate 
 * class method indicated by the context's `request` object.
 */
export default abstract class Controller implements ControllerInterface {

  /** The Koa `Context` object  */
  ctx: Context

  constructor(ctx: Context) {
    if (this.constructor == Controller) {
      throw new Error(
        "Controller is an abstract class and cannot be instantiated."
      );
    }
    this.ctx = ctx;
    const method = ctx.request.method.toLowerCase();

  }

  /**
   * Dispatches the controller method designated by the context request.
   */
  dispatch() {
    const methodName = this.ctx.request.method.toLowerCase() as HttpMethod;
    try {
      // Hat-tip to Daniel W Strimpel for this solution
      // for making method names dynamically indexable. (https://stackoverflow.com/a/53194405)
      (this as Indexable)[methodName]()
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(501, `Could not dispatch ${methodName.toUpperCase()}: ${message}`)
    }
  }

  /**
   * Handles HTTP `GET` requests.
   */
  get() {
    throw new Error("Method not implemented");
  }

  /**
   * Handles HTTP `POST` requests.
   */
  post() {
    throw new Error("Method not implemented");
  }

  /**
   * Handles HTTP `PUT` requests.
   */
  put() {
    throw new Error("Method not implemented");
  }

  /**
   * Handles HTTP `PATCH` requests.
   */
  patch() {
    this.put();
  }

  /**
   * Handles HTTP `DELETE` requests.
   */
  delete() {
    throw new Error("Method not implemented");
  }

  /**
   * Handles HTTP `HEAD` requests.
   */
  head() {
    throw new Error("Method not implemented");
  }

  /**
   * Handles HTTP `CONNECT` requests.
   */
  connect() {
    throw new Error("Method not implemented");
  }

  /**
   * Handles HTTP `OPTIONS` requests.
   */
  options() {
    throw new Error("Method not implemented");
  }

  /**
   * Sets the context response status code and message. The message is formatted as a
   * [JSEND](https://github.com/omniti-labs/jsend) response.
   *
   * @param status_code 
   * @param message 
   */
  private error(status_code: HttpStatusCode, message: string) {
    this.ctx.status = status_code;
    this.ctx.body = {
      code: status_code,
      status: "error",
      message: message,
    } as JSendError;
  }
}
