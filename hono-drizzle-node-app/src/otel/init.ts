import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import * as opentelemetry from "@opentelemetry/sdk-node"

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4317"
const sdk = new opentelemetry.NodeSDK({
  metricReader: new opentelemetry.metrics.PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: otlpEndpoint+ "/v1/metrics",
    }),
    exportIntervalMillis: 60000,
  }),
  spanProcessors: [
    new opentelemetry.tracing.BatchSpanProcessor(
      new OTLPTraceExporter({
        url: otlpEndpoint + "/v1/traces",
      }),
    ),
  ],
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-aws-sdk": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-grpc": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-undici": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-pg": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-amqplib": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-aws-lambda": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-bunyan": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-cassandra-driver": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-connect": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-cucumber": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-dataloader": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-dns": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-express": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-fastify": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-generic-pool": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-graphql": {
        enabled: false,
      },

      "@opentelemetry/instrumentation-hapi": {
        enabled: false,
      },

      "@opentelemetry/instrumentation-ioredis": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-kafkajs": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-knex": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-koa": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-lru-memoizer": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-memcached": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-mongodb": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-mongoose": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-mysql": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-mysql2": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-nestjs-core": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-net": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-oracledb": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-pino": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-redis": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-restify": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-runtime-node": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-socket.io": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-winston": {
        enabled: false,
      },
    }),
  ],
})

async function initSDK() {
  try {
    await sdk.start()
    console.log("✅ OpenTelemetry SDK started")
  } catch (err) {
    console.error("❌ Error starting OpenTelemetry SDK", err)
  }

  process.on("SIGTERM", async () => {
    try {
      await sdk.shutdown()
      console.log("🛑 OpenTelemetry SDK shut down")
    } catch (err) {
      console.error("❌ Error shutting down OpenTelemetry SDK", err)
    }
  })
}

initSDK()
