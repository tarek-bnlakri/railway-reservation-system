import {prisma} from '../../config/prisma.js'

export const tripRepository={
    search:(sourceId:string,destinationId:string,date:Date)=>{
        const startOfDay = new Date(date.setHours(0,0,0,0));
        const endOfDay = new Date(date.setHours(0,0,0,0));

        return prisma.trip.findMany({
        where:{
            departure_time:{gte:startOfDay, lte:endOfDay},
            route:{
                source_id:sourceId,
                destination_id:destinationId
            }
        },
        include:{
            route:true,
            train:true
        }
    })

    }
}