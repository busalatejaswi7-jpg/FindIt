import { db } from "../db.js";

export const getShopDashboardRepository = async (ownerId: string) => {
  // Find only shops belonging to this owner.
  const shops = await db.orm.public.Shop.where((shop) =>
    shop.ownerId.eq(ownerId),
  ).all();

  if (shops.length === 0) {
    return [];
  }

  // Fetch real inventory for those shops.
  const shopIds = shops.map((shop) => shop.id);

  const inventoryItems = await db.orm.public.Inventory.where((item) =>
    item.shopId.in(shopIds),
  )
    .include("product")
    .all();

  // Group each inventory item under its shop.
  return shops.map((shop) => ({
    id: shop.id,
    name: shop.name,
    address: shop.address,
    city: shop.city,
    latitude: shop.latitude,
    longitude: shop.longitude,

    inventory: inventoryItems
      .filter((item) => item.shopId === shop.id)
      .map((item) => ({
        inventoryId: item.id,
        productId: item.product.id,
        productName: item.product.name,
        category: item.product.category,
        description: item.product.description,
        quantity: item.quantity,
        updatedAt: item.updatedAt,
      })),
  }));
};
