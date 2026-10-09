import { createShopRepository } from "../repositories/shop.repository.js";

export const createShop = async (data: {
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  ownerId: string;
}) => {
  const shop = await createShopRepository(data);

  return shop;
};