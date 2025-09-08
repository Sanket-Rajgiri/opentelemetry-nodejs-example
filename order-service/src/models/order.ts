import { Schema, model, Document } from "mongoose";

export interface IOrder extends Document {
    _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  products: { productId: Schema.Types.ObjectId; quantity: number }[];
  orderDate: Date;
  status: "awaiting payment" | "paid" | "cancelled" | "shipped" | "completed";
}

const OrderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  products: [{ productId: { type: Schema.Types.ObjectId }, quantity: Number }],
  orderDate: { type: Date, default: Date.now },
  status: {
    type: String,
    default: "awaiting payment",
    enum: ["awaiting payment", "paid", "cancelled", "shipped", "completed"],
  },
});

export const Order = model<IOrder>("Order", OrderSchema);
