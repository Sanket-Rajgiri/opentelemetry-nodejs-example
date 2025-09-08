import { metrics } from "@opentelemetry/api"
const meter = metrics.getMeter("http-server")

export const responseTimeHistogram = meter.createHistogram("http_request_latency_ms", {
  description: "Duration of HTTP responses in milliseconds",
  unit: "ms",
})

export const requestCounter = meter.createCounter("http_request_count", {
  description: "Total number of HTTP requests",
})
