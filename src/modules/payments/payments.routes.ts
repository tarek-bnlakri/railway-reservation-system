import { Router } from "express";
import { PaymentController } from "./payments.controller.js";
import { requireAuth } from "../../shared/middlewares/auth.middleware.js";


const router = Router()
router.post('/',requireAuth,PaymentController.pay)

export default router