import { routeSearchService } from "../route-search/route-search.service.js";
import { nlParcerService } from "./nl-parcer.service.js"
import { resolveStationByName } from "./station-resolver.js";

export const aiSearchService={
    searchFromNaturalLanguage:async(userMessage:string,userId:string)=>{
      const parsed = await nlParcerService.parseTripQuery(userMessage,userId)

      if (!parsed.source || !parsed.destination){
            return {
                needsClarification:true,
                message:"Could you specify both departure and destination staions",
                parsed
            }
      }
      const [sourceStation, destStation] = await Promise.all([
            resolveStationByName(parsed.source),
            resolveStationByName(parsed.destination)
        ]);
     if (!sourceStation || !destStation)
            return { 
                 needsClarification: true, 
                message: `Couldn't find a matching station for "${!sourceStation ? parsed.source : parsed.destination}"`, parsed 
    };

        const routeResult  = await routeSearchService.findCheapestPath(sourceStation.id, destStation.id)
        if(parsed.intent ==="search" || parsed.intent ==="unclear"){
            return {
                needsClarification:false,
                action:'search_results',
                ...routeResult 
            }
        }
        return { needsClarification: true,  action: 'confirm_booking',message: 'Found a route — please confirm which trip/seat to book.',routeResult};

    }
}