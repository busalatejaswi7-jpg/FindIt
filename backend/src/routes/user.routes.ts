import { Router } from "express";
import {
  createUserController,
  findUserByEmailController,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/", createUserController);

router.get("/", findUserByEmailController);

export default router;