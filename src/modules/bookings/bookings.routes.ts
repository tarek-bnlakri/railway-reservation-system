import { Router } from "express";
import { BookingController } from "./bookings.controller.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";
import { waitlistController } from "./waitlist.controller.js";

const router = Router()

router.post('/',requireAuth,BookingController.create)
router.post('/waitlist', requireAuth, waitlistController.join);

export default router