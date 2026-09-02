import type { Response } from "express";
import type { AuthenticatedRequest } from "../../shared/middlewares/auth.middleware.js";
import { WaitlistService } from "./waitlist.service.js";

export const waitlistController={
    join:async(req:AuthenticatedRequest, res:Response)=>{
        const {seatId} = req.body
        const userId = req.user!.userId
        await WaitlistService.joinWaitList(userId,seatId);
        const position = await WaitlistService.getWaitlistSize(seatId);
        res.status(200).json({message:"Joined waitlist ",position})

    }
}