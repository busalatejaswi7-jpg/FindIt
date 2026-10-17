
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import {
  getShopDashboardController,
} from "../controllers/shop-dashboard.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  requireRole("SHOP_OWNER"),
  getShopDashboardController
);

export default router;
