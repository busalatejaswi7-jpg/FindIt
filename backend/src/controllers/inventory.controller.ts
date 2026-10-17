import type { Request, Response } from "express";
import {
  createInventory,
  updateInventoryQuantity,
} from "../services/inventory.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const createInventoryController = async (
  req: Request,
  res: Response,
) => {
  const { shopId, productId, quantity } = req.body;
  const ownerId = (req as AuthenticatedRequest).user.userId;

  if (
    typeof shopId !== "string" ||
    !shopId.trim() ||
    typeof productId !== "string" ||
    !productId.trim() ||
    quantity === undefined ||
    quantity === null ||
    quantity === ""
  ) {
    return res.status(400).json({
      message: "ShopId, productId and quantity are required",
    });
  }

  const parsedQuantity = Number(quantity);

  if (!Number.isSafeInteger(parsedQuantity) || parsedQuantity < 0) {
    return res.status(400).json({
      message: "Quantity must be a non-negative integer",
    });
  }

  try {
    const inventory = await createInventory({
      shopId: shopId.trim(),
      productId: productId.trim(),
      quantity: parsedQuantity,
      ownerId,
    });

    return res.status(201).json(inventory);
  } catch (error) {
    console.error("Create inventory error:", error);

    if (error instanceof Error) {
      if (error.message === "Shop not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (error.message === "You do not own this shop") {
        return res.status(403).json({
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      message: "Failed to create inventory",
    });
  }
};

export const updateInventoryQuantityController = async (
  req: Request,
  res: Response,
) => {
  const inventoryId = req.params.inventoryId;
  const { quantity } = req.body;
  const ownerId = (req as AuthenticatedRequest).user.userId;

  if (
    typeof inventoryId !== "string" ||
    !inventoryId.trim() ||
    quantity === undefined ||
    quantity === null ||
    quantity === ""
  ) {
    return res.status(400).json({
      message: "Inventory ID and quantity are required",
    });
  }

  const parsedQuantity = Number(quantity);

  if (!Number.isSafeInteger(parsedQuantity) || parsedQuantity < 0) {
    return res.status(400).json({
      message: "Quantity must be a non-negative integer",
    });
  }

  try {
    const inventory = await updateInventoryQuantity({
      inventoryId: inventoryId.trim(),
      quantity: parsedQuantity,
      ownerId,
    });

    return res.status(200).json(inventory);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Inventory not found") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "You do not own this shop") {
        return res.status(403).json({ message: error.message });
      }

      if (
        error.message ===
        "Inventory was already changed. Please refresh and try again."
      ) {
        return res.status(409).json({ message: error.message });
      }
    }

    console.error("Update inventory quantity error:", error);

    return res.status(500).json({
      message: "Failed to update inventory quantity",
    });
  }
};
