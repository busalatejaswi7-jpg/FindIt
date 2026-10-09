import { Request, Response } from "express";
import { createInventory } from "../services/inventory.service.js";

export const createInventoryController = async (
  req: Request,
  res: Response
) => {
  const {
    shopId,
    productId,
    quantity,
  } = req.body;

  if (
    !shopId ||
    !productId ||
    quantity === undefined
  ) {
    return res.status(400).json({
      message: "ShopId, productId and quantity are required",
    });
  }

  if (Number(quantity) < 0) {
    return res.status(400).json({
      message: "Quantity cannot be negative",
    });
  }

  try {
    const inventory = await createInventory({
      shopId,
      productId,
      quantity: Number(quantity),
    });

    return res.status(201).json(inventory);
  } catch (error) {
    console.error("Create inventory error:", error);

    return res.status(500).json({
      message: "Failed to create inventory",
    });
  }
};