import type { Context } from "hono";
import logger from "../logger.js";
import { withHandlerSpan } from "../otel/customSpans.js";
import { USER_SERVICE_URL } from "../config.js"; // move env/config out of server.ts

/**
 * Handler to fetch external users from User Service
 */
const externalHandler = async (c: Context) => {
  const externalUrl = `${USER_SERVICE_URL}/external/users`;

  try {
    logger.info(`Calling external service at ${externalUrl}`);

    const response = await fetch(externalUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch from external service: ${response.statusText}`
      );
    }

    const data = await response.json();
    return c.json(data);
  } catch (error: any) {
    logger.error({ error: error.message }, "Error fetching external data");
    return c.json(
      { message: "Failed to fetch external data", error: error.message },
      500
    );
  }
};

// Wrap with tracing span
export default withHandlerSpan(externalHandler, "externalHandler");
