import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getShopDashboard } from "../services/shop-dashboard.service.js";

export const getShopDashboardController = async (
  req: Request,
  res: Response,
) => {
  const ownerId = (req as AuthenticatedRequest).user.userId;

  try {
    const shops = await getShopDashboard(ownerId);

    return res.status(200).json({ shops });
  } catch (error) {
    console.error("Shop dashboard error:", error);

    return res.status(500).json({
      message: "Failed to load shop dashboard",
    });
  }
};
