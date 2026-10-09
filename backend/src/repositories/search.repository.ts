import { db } from "../db.js";
import { or } from "@prisma/orm-postgres/orm-client";

export const searchProductsRepository = async (query: string) => {
  const products = await db.orm.public.Product
    .where((product) =>
      or(
        product.name.ilike(`%${query}%`),
        product.category.ilike(`%${query}%`),
        product.description.ilike(`%${query}%`)
      )
    )
    .all();
  if (products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.id);

  const inventory = await db.orm.public.Inventory
    .where((item) => item.productId.in(productIds))
    .include("product")
    .include("shop")
    .all();

 return inventory.map((item) => ({
  productId: item.product.id,
  inventoryId:item.id,
  productName: item.product.name,
  category: item.product.category,
  description: item.product.description,

  shopId: item.shop.id,
  shopName: item.shop.name,
  address: item.shop.address,
  city: item.shop.city,

  quantity: item.quantity,
  updatedAt: item.updatedAt,
}));
};