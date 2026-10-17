import {
  createInventoryRepository,
  findInventoryByIdRepository,
  updateInventoryQuantityRepository,
} from "../repositories/inventory.repository.js";
import { findShopByIdRepository } from "../repositories/shop.repository.js";

export const createInventory = async (data: {
  shopId: string;
  productId: string;
  quantity: number;
  ownerId: string;
}) => {
  const shop = await findShopByIdRepository(data.shopId);

  if (!shop) {
    throw new Error("Shop not found");
  }

  if (shop.ownerId !== data.ownerId) {
    throw new Error("You do not own this shop");
  }

  return await createInventoryRepository({
    shopId: data.shopId,
    productId: data.productId,
    quantity: data.quantity,
  });
};

export const updateInventoryQuantity = async (data: {
  inventoryId: string;
  quantity: number;
  ownerId: string;
}) => {
  const inventory = await findInventoryByIdRepository(data.inventoryId);

  if (!inventory) {
    throw new Error("Inventory not found");
  }

  if (inventory.shop.ownerId !== data.ownerId) {
    throw new Error("You do not own this shop");
  }

  const updated = await updateInventoryQuantityRepository({
    inventoryId: data.inventoryId,
    quantity: data.quantity,
    expectedQuantity: inventory.quantity,
  });

  if (!updated) {
    throw new Error(
      "Inventory was already changed. Please refresh and try again.",
    );
  }

  return updated;
};
