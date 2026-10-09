import { createInventoryRepository } from "../repositories/inventory.repository.js";

export const createInventory = async (data: {
  shopId: string;
  productId: string;
  quantity: number;
}) => {
  const inventory = await createInventoryRepository(data);

  return inventory;
};