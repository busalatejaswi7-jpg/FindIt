import { Router } from "express";
import { createShopController } from "../controllers/shop.controller.js";
const router = Router();

router.post("/", createShopController);

export default router;