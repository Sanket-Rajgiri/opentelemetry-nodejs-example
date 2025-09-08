import mongoose from "mongoose";
import logger from "./logger.js";

export const connectDB = async (dbUrl: string) => {
  try {
    await mongoose.connect(dbUrl, {
      dbName: "orders",
    });
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error({ err }, "Failed to connect to MongoDB");
    process.exit(1);
  }
};
