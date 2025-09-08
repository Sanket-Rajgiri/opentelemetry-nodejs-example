import { Hono } from "hono";
import fetch from "node-fetch";
import { Order } from "../models/order.js";
import { validateOrder } from "../services/validateOrder.js";
import logger from "../logger.js";
import { USER_SERVICE_URL } from "../config.js";

export const ordersRoute = new Hono();

// GET all orders
ordersRoute.get("/", async (c) => {
  const orders = await Order.find();
  const withUsers = await Promise.all(
    orders.map(async (o) => {
      const res = await fetch(`${USER_SERVICE_URL}/users/${o.userId}`);
      const user = await res.json();
      return { ...o.toObject(), user };
    })
  );
  return c.json(withUsers);
});

// CREATE order
ordersRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const order = new Order(body);
    await validateOrder(order);
    await order.save();
    return c.json(order, 201);
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to create order");
    return c.json({ message: err.message }, 500);
  }
});

// GET order by ID
ordersRoute.get("/:id", async (c) => {
  const id = c.req.param("id");
  const order = await Order.findById(id);
  if (!order) return c.json({ message: "Order not found" }, 404);

  const res = await fetch(`${USER_SERVICE_URL}/users/${order.userId}`);
  const user = await res.json();
  return c.json({ ...order.toObject(), user });
});

// PATCH order (status)
ordersRoute.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const { status } = await c.req.json();
  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!updated) return c.json({ message: "Order not found" }, 404);
  return c.json(updated);
});
