
'use strict'

/**
 * This module provides a partial implementation of a Koa context object for testing purposes.
 * Borrowed near-verbatim from the context test helper in the main Koa project at:
 * 
 *  https://github.com/koajs/koa/blob/master/test-helpers/context.js
 * 
 */

import Application, { Request, Response } from "koa";
import Stream from "stream";

module.exports = (req: Request, res: Response, app: Application) => {
  const socket = new Stream.Duplex()
  req = Object.assign({ headers: {}, socket }, Stream.Readable.prototype, req)
  res = Object.assign({ _headers: {}, socket }, Stream.Writable.prototype, res)
  // @ts-ignore
  req.socket.remoteAddress = req.socket.remoteAddress || '127.0.0.1'
  app = app || new Application()
  // @ts-ignore
  res.getHeader = k => res._headers[k.toLowerCase()]
  // @ts-ignore
  res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v }
  // @ts-ignore
  res.removeHeader = (k, v) => delete res._headers[k.toLowerCase()]
  // @ts-ignore
  return app.createContext(req, res)
}

module.exports.request = (req: Request, res: Response, app: Application) => module.exports(req, res, app).request

module.exports.response = (req: Request, res: Response, app: Application) => module.exports(req, res, app).response

/*
  
(The MIT License)

Copyright(c) 2019 Koa contributors

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files(the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and / or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/