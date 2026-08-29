import type { Response } from "express";
import type{AuthenticatedRequest} from "../../shared/middlewares/auth.middleware.js";
import { BookingService } from "./bookings.service.js";

export const BookingController={
    create:async(req:AuthenticatedRequest,res:Response)=>{
        try {
                const {trip_id,seat_id}= req.body
                console.log("BookingController.create",seat_id,trip_id)
                const userId = req.user?.userId
                
                if (!userId){
                     return res.status(401).json({ error: "UNAUTHORIZED" });
                }
                
                const booking = await BookingService.createBooking(userId,seat_id,trip_id)
                res.status(201).json(booking)

        } catch (error) {
            const err = error as Error
            const status = err.message === 'SEAT_ALREADY_BOOKED'?409:400;
            res.status(status).json({error:err.message});
        }
    }
}