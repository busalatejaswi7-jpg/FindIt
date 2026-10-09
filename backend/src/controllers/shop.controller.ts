import { Request, Response } from "express";
import { createShop } from "../services/shop.service.js";
export const createShopController = async (
  req: Request,
  res: Response
) => {
  const {
    name,
    address,
    city,
    latitude,
    longitude,
    ownerId,
  } = req.body;

  if (
    !name ||
    !address ||
    !city ||
    latitude === undefined ||
    longitude === undefined ||
    !ownerId
  ) {
    return res.status(400).json({
      message:
        "Name, address, city, latitude, longitude and ownerId are required",
    });
  }

  try {
    const shop = await createShop({
      name,
      address,
      city,
      latitude: Number(latitude),
      longitude: Number(longitude),
      ownerId,
    });

    return res.status(201).json(shop);
  } catch (error) {
    console.error("Create shop error:", error);

    return res.status(500).json({
      message: "Failed to create shop",
    });
  }
};