import {prisma} from '../../config/prisma.js'
import type { Seat } from '@prisma/client';
import { redis } from '../../config/redis.js';
import { pricingService } from '../pricing/pricing.service.js';


export const BookingRepository={
    createBookingWithLock:async (userId:string, seatId:string, tripId:string)=>{
        console.log("createBookingWithLock",userId,seatId,tripId)
        return prisma.$transaction(async(tx)=>{
            const seatRows  =await tx.$queryRaw<Seat[]>`
            SELECT * FROM "Seat" Where id = ${seatId} FOR UPDATE
            `;

            if (seatRows.length === 0){
                    throw new Error("SEAT_NOT_FOUND");
            }

            const existing = await tx.booking.findFirst({
                where:{
                    seat_id:seatId,
                    trip_id:tripId,
                    status:{in:["PENDING","CONFIRMED"]}
                }

            })
            if (existing)
                    throw new Error("SEAT_ALREADY_BOOKED")

            const trip = await tx.trip.findUnique({
                where:{
                    id:tripId
                },
                include:{
                    train:true,
                    route:true
                }
            })
            if (!trip) throw new Error('TRIP_NOT_FOUND')
            const totalSeats = await tx.seat.count({where:{train_id:trip!.train.id}})
            const totalBookedSeats = await tx.booking.count({where:{trip_id:tripId,status:{in:["CONFIRMED","PENDING"]}}})
            
            const OcupencyPrice = totalSeats === 0 ? 0: totalBookedSeats/totalSeats*100
            const houresBeforeDeparture = (trip!.departure_time.getTime()! - Date.now()) /(1000*60*60)

            const finalPrice = pricingService.calculatePrice({
                basePrice:Number(trip?.route.base_price),
                occupancyPercent:OcupencyPrice,
                hoursUntilDeparture:houresBeforeDeparture
            })
            
            const expiresAt =  new Date(Date.now()+10*60*1000)

            const booking= await tx.booking.create({
                data:{
                    user_id:userId,
                    seat_id:seatId,
                    trip_id:tripId,
                    final_price:finalPrice,
                    status:"PENDING",
                    expires_at:expiresAt
                }
            })

            await redis.set(`booking-hold:${booking.id}`,seatId,"EX", 600)

            return booking


        })

    },
  

}