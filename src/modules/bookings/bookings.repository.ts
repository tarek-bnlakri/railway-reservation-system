import {prisma} from '../../config/prisma.js'

export const BookingRepository={
    createBookingWithLock:async (userId:string, seatId:string, tripId:string)=>{
        console.log("createBookingWithLock",userId,seatId,tripId)
        return prisma.$transaction(async(tx)=>{

            const seatRows:any  =await tx.$queryRaw`
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
            const expiresAt =  new Date(Date.now()+10*60*1000)

            return tx.booking.create({
                data:{
                    user_id:userId,
                    seat_id:seatId,
                    trip_id:tripId,
                    status:"PENDING",
                    expires_at:expiresAt
                }
            })


        })

    }
}