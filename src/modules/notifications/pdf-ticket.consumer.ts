import { getChannel } from "../../config/rabbitmq.js";

const EXCHANGE_NAME = 'booking_events';
const QUEUE_NAME = 'pdf_ticket_generation'

export async function  startPdfTicketConsumer(){
    const channel  = getChannel()
    await channel.assertExchange(EXCHANGE_NAME,'fanout',{durable:true})
    const q = await channel.assertQueue(QUEUE_NAME,{durable:true})
    await channel.bindQueue(q.queue,EXCHANGE_NAME,'')

    channel.consume(q.queue,(msg)=>{
        if (!msg) return;

        const payload = JSON.parse(msg.content.toString())
        console.log(`🎫 [Mock PDF] Generating ticket PDF for booking ${payload.bookingId} — user ${payload.userId}, price: $${payload.finalPrice}`);
         channel.ack(msg)
    })
          console.log('PDF ticket consumer listening...');

}