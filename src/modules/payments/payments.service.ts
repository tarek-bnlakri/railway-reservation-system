import { prisma } from "../../config/prisma.js";
import { redis } from "../../config/redis.js";

const IDEMPOTENCY_TTL_SECONDS = 86400;
export const PaymentService ={
    processPayment:async(userId:string,bookingId:string,idempotencyKey:string)=>{
        const cacheKey  = `idempotency:${idempotencyKey}`
        const cashed = await redis.get(cacheKey)
        if(cashed){
            console.log(`Idempotency HIT for key ${idempotencyKey} — returning cached result`);
            return JSON.parse(cashed)
        }
        const booking = await prisma.booking.findUnique({where:{id:bookingId}})
        if(!booking){
            throw new Error("BOOKING_NOT_FOUND")
        }
        console.log("ffffffffffffffffffffffff",userId)
        if(booking.user_id!==userId){
            throw new Error("UNAUTHORIZED")
        }
        if (booking.status!=="PENDING"){
            throw new Error("BOOKING_NOT_PAYABLE")
        }

        const paymentToken = `mock_pay_${Date.now()}`

        const updateBooking = await prisma.booking.update({
            where:{id:bookingId},
            data:{
                status:"CONFIRMED",
                payment_token:paymentToken
            }
        
        })
        const result = {bookingId:updateBooking.id,status:updateBooking.status,paymentToken:paymentToken}

        await redis.set(cacheKey,JSON.stringify(result), 'EX', IDEMPOTENCY_TTL_SECONDS)
        return result;
    }
}