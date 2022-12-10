/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Context, Next } from "koa";
import BaseCtl from "../src";
import Koa from "koa";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const context = require("./helpers/context");
import { HttpVerbs } from "../src/index";

// https://medium.com/hackernoon/async-testing-koa-with-jest-1b6e84521b71

describe("BaseCtl", () => {
  let ctx: Context;

  beforeEach(() => {
    ctx = context() as Context;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should prevent itself from being instantiated", () => {
    // @ts-ignore
    expect(() => {
      const c = new BaseCtl(ctx);
    }).toThrow("BaseCtl is an abstract class and should not be instantiated.");
  });

  it("should throw a 501 error when attempting to dispatch an unimplemented HTTP method", async () => {
    class StubCtl extends BaseCtl {
      constructor(ctx: Context) {
        super(ctx);
      }
    }

    for (let i = 0; i < HttpVerbs.length; i++) {
      ctx.request.method = HttpVerbs[i].toUpperCase();

      ctx.request.method = "GET";
      const stub = new StubCtl(ctx);
      //https://stackoverflow.com/questions/47144187/can-you-write-async-tests-that-expect-tothrow
      await expect(stub.dispatch()).rejects.toThrow(
        "GET method not implemented"
      );
    }
  });

  it("should throw a 400 error when attempting to dispatch an invalid HTTP method", async () => {
    class StubCtl extends BaseCtl {
      constructor(ctx: Context) {
        super(ctx);
      }
    }

    ctx.request.method = "FOO";
    const stub = new StubCtl(ctx);
    //https://stackoverflow.com/questions/47144187/can-you-write-async-tests-that-expect-tothrow
    await expect(stub.dispatch()).rejects.toThrow(
      "Invalid request method: FOO"
    );
  });

  it("should throw an error from the error method", async () => {
    class ErrorTestCtl extends BaseCtl {
      constructor(ctx: Context) {
        super(ctx);
      }

      async post(ctx: Context) {
        this.error(418, "I'm a teapot");
      }
    }
    ctx.method = "POST";
    // ctx.request.method = 'POST';
    const stub = new ErrorTestCtl(ctx);

    try {
      await stub.dispatch();
      fail("Post method should have thrown an error.");
    } catch (error) {
      // console.error(error);
      expect(error instanceof Error).toBe(true);
      // @ts-ignore
      expect(error.status).toEqual(418);
      // @ts-ignore
      expect(error.message).toEqual("I'm a teapot");
    }
  });

  it("should set the response status and body on a successful request", async () => {
    class SuccessTest extends BaseCtl {
      constructor(ctx: Context) {
        super(ctx);
      }
      async get(ctx: Context) {
        return { foo: "bar" };
      }
    }

    ctx.request.method = "GET";
    const stub = new SuccessTest(ctx);

    await stub.dispatch();

    expect(ctx.status).toBe(200);
    expect(ctx.body).toEqual({ foo: "bar" });
  });

  it("should set response status", async () => {
    class StatusTest extends BaseCtl {
      constructor(ctx: Context) {
        super(ctx);
      }
    }

    ctx.request.method = "GET";
    const stub = new StatusTest(ctx);

    stub.setResponseStatus(418);

    expect(ctx.status).toBe(418);
  });

  it("should set response headers", async () => {
    class HeadersTest extends BaseCtl {
      constructor(ctx: Context) {
        super(ctx);
      }
    }

    ctx.request.method = "GET";
    const stub = new HeadersTest(ctx);

    stub.setResponseHeaders({
      "X-Foo": "Bar",
    });

    // @NOTE ctx.set transforms header names to lower-case!
    expect(ctx.response.headers["x-foo"]).toEqual("Bar");
  });

  it("should call the 'next' function, if set", async () => {
    ctx.method = "GET";

    class NextTest extends BaseCtl {
      constructor(ctx: Context, next: Next) {
        super(ctx, next);
      }

      async get(ctx: Context) {
        return "A box of biscuits, box of mixed biscuits, a box of biscuits mixed.";
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = jest.fn(async (): Promise<any> => {
      () => {
        /* noop */
      };
    });

    const test = new NextTest(ctx, next);
    expect(test._nextCalled).toBe(false);
    await test.dispatch();
    expect(test._nextCalled).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should not call next at the end of the dispatch method if it gets called elsewhere sooner", async () => {
    ctx.method = "GET";

    class NextTest extends BaseCtl {
      constructor(ctx: Context, next: Next) {
        super(ctx, next);
      }

      async get(ctx: Context) {
        await this.next();
        return ctx.body + "After";
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = jest.fn(async (): Promise<any> => {
      ctx.body = "Before\n";
    });

    const test = new NextTest(ctx, next);
    expect(test._nextCalled).toBe(false);
    await test.dispatch();
    expect(test._nextCalled).toBe(true);
    // ..It should still have been called exactly once
    expect(next).toHaveBeenCalledTimes(1);

    expect(test.ctx.body).toEqual("Before\nAfter");
  });

  it("should log a warning if the 'next' method is called more than once", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {
      /* noop */
    });
    ctx.method = "GET";

    class NextTest extends BaseCtl {
      constructor(ctx: Context, next: Next) {
        super(ctx, next);
      }

      async get(ctx: Context) {
        await this.next();
        await this.next();
        return ctx.body + "After";
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const next = jest.fn(async (): Promise<any> => {
      ctx.body = "Before\n";
    });

    const test = new NextTest(ctx, next);
    await test.dispatch();

    expect(warn).toBeCalledWith(
      "The 'next' function was called, but it has already been run."
    );

    warn.mockReset();
  });

  it("should return a Koa middleware function when the static `go` method is called.", () => {
    class GoTest extends BaseCtl {}

    expect(typeof GoTest.go()).toEqual("function");
    // @TODO pass GoTest.go() to koa.use() and assert the args it was called with
  });

  it("should call the 'setup' method from the middleware function returned by the 'go' method", async () => {
    ctx.method = "GET";

    class SetupTest extends BaseCtl {
      async get(ctx: Context) {
        return "OK";
      }
    }

    const setupMock = jest.spyOn(SetupTest, "setup");
    await SetupTest.go()(ctx);
    expect(setupMock).toHaveBeenCalled();
  });

  it("should call the 'dispatch' method from the middleware function returned by the 'go' method", async () => {
    ctx.method = "GET";

    class DispatchTest extends BaseCtl {
      async get(ctx: Context) {
        return "OK";
      }
    }

    const dispatchMock = jest.spyOn(DispatchTest.prototype, "dispatch");
    await DispatchTest.go()(ctx);
    expect(dispatchMock).toHaveBeenCalled();
  });

  it("should always return the same instance of the controller class from the 'setup' method", () => {
    class SingletonTest extends BaseCtl {}

    const s1 = SingletonTest.setup(ctx);
    const s2 = SingletonTest.setup(ctx);
    const s3 = SingletonTest.setup(ctx);

    expect(s1).toEqual(s2);
    expect(s1).toEqual(s3);
  });
});
