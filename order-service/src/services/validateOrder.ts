import fetch from "node-fetch";
import { performance } from "perf_hooks";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { orderValidationDurationHistogram } from "../otel/customMetrics.js";
import type { IOrder } from "../models/order.js";
import { PRODUCT_SERVICE_URL } from "../config.js";
import logger from "../logger.js";

const tracer = trace.getTracer("order-service");

export async function validateOrder(order: IOrder): Promise<void> {
  const startTime = performance.now();
  logger.info({ orderId: order._id.toString() }, "Starting order validation");

  return tracer.startActiveSpan("validate-order", async (span) => {
    try {
      span.addEvent("Order validation started");
      span.setAttribute("order.id", order._id.toString());

      let total = 0;

      for (const item of order.products) {
        const productResponse = await fetch(
          `${PRODUCT_SERVICE_URL}/products/${item.productId}`
        );
        const product = (await productResponse.json()) as {
          _id: string;
          name: string;
          price: number;
          stock: number;
        };

        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Product ${item.productId} is out of stock or does not exist.`
          );
        }

        const updateResponse = await fetch(
          `${PRODUCT_SERVICE_URL}/products/${item.productId}/decrement-stock`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ decrementBy: item.quantity }),
          }
        );

        if (!updateResponse.ok) {
          throw new Error(
            `Failed to update stock for Product ${item.productId}.`
          );
        }

        total += product.price * item.quantity;
      }

      span.setAttribute("order.total", total);
      span.addEvent("Order validation completed");

      const duration = performance.now() - startTime;
      orderValidationDurationHistogram.record(duration, {
        "order.id": order._id.toString(),
        status: "validated",
      });

      span.setStatus({ code: SpanStatusCode.OK });
      logger.info(
        { orderId: order._id.toString(), duration },
        "Order validation completed"
      );
    } catch (err: any) {
      logger.error(
        { orderId: order._id.toString(), error: err.message },
        "Order validation failed"
      );
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      span.recordException(err);
      throw err;
    } finally {
      span.end();
    }
  });
}
