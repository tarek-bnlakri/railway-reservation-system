import { Router } from "express";
import { BookingController } from "./bookings.controller.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";

const router = Router()

router.post('/',requireAuth,BookingController.create)

export default router