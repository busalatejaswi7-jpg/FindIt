import { db } from "../db.js";

export const createInventoryRepository = async (data: {
  shopId: string;
  productId: string;
  quantity: number;
}) => {
  return await db.orm.public.Inventory.create({
    shopId: data.shopId,
    productId: data.productId,
    quantity: data.quantity,
  });
};