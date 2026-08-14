import type { Response, Request} from "express";
import { tripService } from "./trips.service.js";

export const tripController = {
    search:async(req:Request,res:Response)=>{
        try {
                const {source, destination, date} = req.query as{
                    source:string,
                    destination:string,
                    date:string
                }
            const trips = await tripService.search(source,destination,date)
            res.status(200).json(trips)
        } catch (error) {
            const err  =error as Error
            res.status(400).json({error:err.message})
            
        }

    }
}