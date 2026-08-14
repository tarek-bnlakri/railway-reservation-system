import { tripRepository } from "./trips.repository.js"

export const tripService={

    search:async(sourceId:string,destination_id:string,date:string)=>{
        if(!sourceId || !destination_id || !date){
            throw new Error("MISSING_SEARCH_PARAMS")
        }
        const parsedDate =new Date(date);

        return tripRepository.search(sourceId,destination_id,parsedDate)         
    }
}