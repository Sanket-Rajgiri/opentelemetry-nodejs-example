import { trace, SpanStatusCode } from "@opentelemetry/api"
import type { Context, Next, MiddlewareHandler, Handler } from "hono"

export function withHandlerSpan(handler: Handler, name?: string): Handler {
  return async (c: Context, next: Next) => {
    const tracer = trace.getTracer("hono-handler")
    const spanName = name || handler.name || "anonymous-handler"
    return tracer.startActiveSpan(spanName, async (span) => {
      try {
        const result = await handler(c, next)
        span.setStatus({ code: SpanStatusCode.OK }) // 1 = OK
        return result
      } catch (err) {
        span.recordException(err as Error)
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) })
        throw err
      } finally {
        span.end()
      }
    })
  }
}

export function withMiddlewareSpan(middleware: MiddlewareHandler, name?: string): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const tracer = trace.getTracer("hono-middleware")
    const spanName = name || middleware.name || "anonymous-middleware"

    return tracer.startActiveSpan(spanName, async (span) => {
      try {
        await middleware(c, next)
        span.setStatus({ code: SpanStatusCode.OK })
      } catch (err) {
        span.recordException(err as Error)
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) })
        throw err
      } finally {
        span.end()
      }
    })
  }
}

export function withAsyncSpan<T extends (...args: any[]) => Promise<any>>(fn: T, spanName?: string): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const tracer = trace.getTracer("app-fn-span")
    const name = spanName || fn.name || "anonymous-fn"

    return await new Promise<ReturnType<T>>((resolve, reject) => {
      tracer.startActiveSpan(name, async (span) => {
        try {
          const result = await fn(...args)
          span.setStatus({ code: SpanStatusCode.OK })
          resolve(result)
        } catch (err) {
          span.recordException(err as Error)
          span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) })
          reject(err)
        } finally {
          span.end()
        }
      })
    })
  }) as T
}
