import { Router } from "express";
import {
	createInventoryController,
	updateInventoryQuantityController,
} from "../controllers/inventory.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(
	"/",
	authenticate,
	requireRole("SHOP_OWNER"),
	createInventoryController,
);

router.patch(
	"/:inventoryId",
	authenticate,
	requireRole("SHOP_OWNER"),
	updateInventoryQuantityController,
);

export default router;