import type { Response } from "express";
import { aiSearchService } from "./ai-search.service.js";
import type { AuthenticatedRequest } from "../../shared/middlewares/auth.middleware.js";

export const aiSearchController={
    search:async(req:AuthenticatedRequest,res:Response)=>{
        try {
            const {message} = req.body;
            const userId = req.user!.userId
            if (!message){
                return res.status(400).json({error:"MISSING_MESSAGE"})
            }
             if (!userId){
                     return res.status(401).json({ error: "UNAUTHORIZED" });
            }
            const result = await aiSearchService.searchFromNaturalLanguage(message,userId)
            return res.status(200).json(result)
            
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
            res.status(500).json({error: errorMessage})
        }
    }
}