
import { Router } from "express";
import { createShopController } from "../controllers/shop.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  requireRole("SHOP_OWNER"),
  createShopController
);

export default router;
