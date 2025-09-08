export const PORT = Number(process.env.PORT) || 3001;
export const DB_URL = process.env.DATABASE_URL || "mongodb://mongodb:27017/orders";
export const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://user-service:3004";
export const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://product-service:3003";
