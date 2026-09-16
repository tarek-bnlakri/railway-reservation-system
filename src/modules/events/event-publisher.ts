import { getChannel } from "../../config/rabbitmq.js";
const EXCHANGE_NAME = 'booking_events';

export async function setupExchange(){
    const channel = getChannel()
    await channel.assertExchange(EXCHANGE_NAME,'fanout',{durable:true})
}

export async function publishBookingConfirmed  (payload:{bookingId:string, userId:string, finalPrice:number}){
   
    const channel = getChannel()
    const message = Buffer.from(JSON.stringify(payload));
    channel.publish(EXCHANGE_NAME, '', message);

    console.log(`Published BOOKING_CONFIRMED event for booking ${payload.bookingId}`);

}