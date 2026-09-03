import type { Response } from "express";
import type { AuthenticatedRequest } from "../../shared/middlewares/auth.middleware.js";
import { PaymentService } from "./payments.service.js";

export const PaymentController={
    pay:async(req:AuthenticatedRequest,res:Response)=>{
        try {
                const idempotencyKey = req.headers['idempotency-key'] as string;
                if(!idempotencyKey){
                    return res.status(400).json({error:"Idempotency key is required"})
                }

                const userId = req.user!.userId
                const {bookingId} = req.body 

                const result = await PaymentService.processPayment(userId,bookingId,idempotencyKey)
                return res.status(200).json(result)
        } catch (err: unknown) {
            if (err instanceof Error) {
                return res.status(400).json({ error: err.message });
            }
    
            return res.status(500).json({ error: "An unexpected error occurred" });
        }

    }
}