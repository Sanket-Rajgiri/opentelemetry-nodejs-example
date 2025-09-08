import "./otel/init.js";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { connectDB } from "./db.js";
import { PORT, DB_URL } from "./config.js";
import { ordersRoute } from "./routes/orders.js";
import logger from "./logger.js";
import { responseTimeMiddleware } from "./middleware/metricsMiddleware.js";
import externalHandler from "./handler/handler.js";

const app = new Hono();

app.use("*", responseTimeMiddleware);

app.get("/", (c) => c.json({ status: `Order Service running on http://localhost:${PORT}` }));

app.route("/orders", ordersRoute);

app.get("/external", externalHandler);

connectDB(DB_URL);

serve({ fetch: app.fetch, port: PORT });
logger.info(`🚀 Order Service running on http://localhost:${PORT}`);
