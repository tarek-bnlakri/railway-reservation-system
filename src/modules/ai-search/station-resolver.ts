import { prisma } from "../../config/prisma.js";

export const resolveStationByName=async(station_name:string)=>{
    const station =await prisma.station.findFirst({where:{
        name:{contains:station_name,mode:"insensitive"}
    }})
    return station 
}