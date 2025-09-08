import "./otel/init.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import usersRoute from "./routes/users-route.js";
import logger from "./logger.js";
import { responseTimeMiddleware } from "./middleware/metricsMiddleware.js";

const app = new Hono();
app.use("*", responseTimeMiddleware);

app.get("/", (c) => {
  logger.info("Received request at /");
  return c.text("Hello Hono!");
});

// add users route to app
app.route("/users", usersRoute);

// set port
const port = 3000;
// serve app
serve({
  fetch: app.fetch,
  port,
});

console.log(`Server is running on http://localhost:${port}`);
