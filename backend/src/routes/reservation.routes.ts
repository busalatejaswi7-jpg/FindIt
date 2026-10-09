import { Router } from "express";
import {
  createReservationController,getMyReservationsController,
} from "../controllers/reservation.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/",authenticate,getMyReservationsController,);
router.post("/", authenticate,createReservationController);

export default router;