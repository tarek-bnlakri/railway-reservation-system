import {prisma} from '../../config/prisma.js'
import {Redis} from 'ioredis'
import { WaitlistService } from './waitlist.service.js'

const subscriber = new Redis(process.env.REDISE_URL as string) 


export function startBookingExpiryLisitner(){
    subscriber.psubscribe('__keyevent@0__:expired')

    subscriber.on('pmessage', async(_pattern,_channel,expiredKey:string)=>{
        if (!expiredKey.startsWith("booking-hold:")) return 

        const bookingId = expiredKey.replace('booking-hold:','')
        console.log("Booking Hold Expired:",bookingId,",  cancelling...")

        try {
            await prisma.booking.updateMany({
                where:{
                    id:bookingId,
                    status:"PENDING"
                },
                data:{
                    status:"CANCELLED"
                }
            })
            const cancelled = await prisma.booking.findUnique({where:{id:bookingId}})
            if (cancelled){
                const nextUserId = await WaitlistService.getNextInLine(cancelled.seat_id)
                if(nextUserId){
                    console.log(`Offering seat ${cancelled.seat_id} to waitlisted user ${nextUserId}`);
                    await WaitlistService.removeFromWaitList(cancelled.seat_id,nextUserId)
                    console.log("Notify User")
                }
            }

        } catch (error) {
            console.error("Failled to cancel expired booking", error)
        }
    })
     console.log('Booking expiry listener started');
}