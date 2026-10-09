import { Request, Response } from "express";
import { createReservation, getReservationsByUser, } from "../services/reservation.service.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
export const createReservationController = async (
  req: Request,
  res: Response
) => {
  const {
    inventoryId,
    quantity,
  } = req.body;
const userId = (req as AuthenticatedRequest).user.userId;
  if (!inventoryId || quantity === undefined) {
    return res.status(400).json({
      message: "userId, inventoryId and quantity are required",
    });
  }

  const requestedQuantity = Number(quantity);

  if (
    !Number.isInteger(requestedQuantity) ||
    requestedQuantity <= 0
  ) {
    return res.status(400).json({
      message: "Quantity must be a positive integer",
    });
  }

  try {
    const reservation = await createReservation({
      userId,
      inventoryId,
      quantity: requestedQuantity,
    });

    return res.status(201).json(reservation);
  } catch (error) {
    console.error("Create reservation error:", error);

    if (error instanceof Error) {
      if (error.message === "Inventory not found") {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message === "Not enough inventory available" ||
        error.message ===
          "Inventory was already changed. Please try again."
      ) {
        return res.status(409).json({
          message: error.message,
        });
      }
    }

    return res.status(500).json({
      message: "Failed to create reservation",
    });
  }
};
export const getMyReservationsController = async (
  req: Request,
  res: Response
) => {
  const userId = (req as AuthenticatedRequest).user.userId;

  try {
    const reservations = await getReservationsByUser(userId);

    return res.json({
      reservations,
    });
  } catch (error) {
    console.error("Get reservations error:", error);

    return res.status(500).json({
      message: "Failed to get reservations",
    });
  }
};