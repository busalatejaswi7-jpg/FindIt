import type { Request, Response } from "express";
import { createShop } from "../services/shop.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createShopController = async (req: Request, res: Response) => {
  const { name, address, city, latitude, longitude } = req.body;

  const ownerId = (req as AuthenticatedRequest).user.userId;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof address !== "string" ||
    !address.trim() ||
    typeof city !== "string" ||
    !city.trim() ||
    latitude === undefined ||
    longitude === undefined ||
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude)) ||
    latitude === "" ||
    longitude === ""
  ) {
    return res.status(400).json({
      message: "Valid name, address, city, latitude and longitude are required",
    });
  }

  try {
    const shop = await createShop({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
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
