import { metrics } from "@opentelemetry/api";
import {
  requestCounter,
  responseTimeHistogram,
} from "../otel/customMetrics.js";
import type { MiddlewareHandler } from "hono";

const meter = metrics.getMeter("http-server");

export const responseTimeMiddleware: MiddlewareHandler = async (c, next) => {
  const start = performance.now();
  await next(); // Continue to next middleware or handler
  const duration = performance.now() - start;
  requestCounter.add(1, {
    method: c.req.method,
    route: c.req.path, // `route` available if router matches
    status: c.res.status.toString(),
  });

  responseTimeHistogram.record(duration, {
    method: c.req.method,
    route: c.req.path,
  });
};
