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

export const findInventoryByIdRepository = async (
  inventoryId: string,
) => {
  return await db.orm.public.Inventory
    .where({ id: inventoryId })
    .include("shop")
    .first();
};

export const updateInventoryQuantityRepository = async (data: {
  inventoryId: string;
  quantity: number;
  expectedQuantity: number;
}) => {
  return await db.orm.public.Inventory
    .where({ id: data.inventoryId })
    .where((item) => item.quantity.eq(data.expectedQuantity))
    .update({
      quantity: data.quantity,
    });
};
