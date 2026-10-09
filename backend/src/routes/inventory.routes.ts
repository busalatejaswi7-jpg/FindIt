import { Router } from "express";
import { createInventoryController } from "../controllers/inventory.controller.js";

const router = Router();

router.post("/", createInventoryController);

export default router;