import { authService } from "./auth.service.js";
import type { Request,Response } from "express";

export const authController={
    register:async(req:Request,res:Response)=>{
        try {
            const {name,email,password} = req.body;

            const user = await authService.register(name,email,password);

            res.status(201).json(user);

        } catch (err:any) {
            res.status(400).json({error:err.message});
        };
    },
    login:async(req:Request,res:Response)=>{
            try {
                const {email,password} = req.body;

                const result = await authService.login(email,password);
                res.status(200).json(result);

            } catch (err:any) {
                res.status(401).json({error:err.message});
            };
    }
}