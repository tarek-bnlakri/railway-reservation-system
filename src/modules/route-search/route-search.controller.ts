import type { Request, Response } from 'express';
import { routeSearchService } from './route-search.service.js';

export const routeSearchController = {
  findPath:async(req:Request,res:Response)=>{
    try {
          const {source,destination} = req.query as {source:string, destination:string};

          if (!source || ! destination)
              return res.status(400).json({error:"MISSING_PARAMS"})
          const result = await routeSearchService.findCheapestPath(source,destination)

          return res.status(200).json(result)
    } 

   catch (err: unknown) {
    if (err instanceof Error) {
        const status = err.message === "NO_ROUTE_FOUND" ? 404 : 400;
        return res.status(status).json({ error: err.message });
    }
    
    return res.status(500).json({ error: "An unexpected error occurred" });
}


  }
};