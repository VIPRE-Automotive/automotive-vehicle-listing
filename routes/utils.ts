import { Request, Response, NextFunction } from 'express';
import mcache from 'memory-cache';
import dotenv from 'dotenv';

dotenv.config();

interface CustomResponse extends Response {
  sendResponse: CallableFunction;
}

/**
 * A simple Express cache middleware
 *
 * @see https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
 * @param {number} duration cache in seconds
 * @returns {CallableFunction}
 */
export const cache: CallableFunction = (duration: number) => {
  return (req: Request, res: CustomResponse, next: NextFunction) => {
    const key = '__express__' + req.originalUrl || req.url;
    const cache = mcache.get(key);

    if (cache && process.env.NODE_ENV === "production") {
      res.status(304).send(cache);
    } else {
      res.set("Cache-Control", "public, max-age=" + duration);
      res.sendResponse = res.send;
      // @ts-ignore
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  }
};
