import { metrics } from "@opentelemetry/api";
import { requestCounter,responseTimeHistogram } from "../otel/customMetrics.js";

const meter = metrics.getMeter("http-server")


export const responseTimeMiddleware = async (c, next) => {
    const start = performance.now()
    await next(); // Continue to next middleware or handler
    const duration = performance.now() - start;
    requestCounter.add(
      1, {
      method: c.req.method,
      route: c.req.routePath,
      status: c.res.status.toString(),
    }
    )
    responseTimeHistogram.record(duration, {
    method: c.req.method,
    route: c.req.path,
  })
  }

