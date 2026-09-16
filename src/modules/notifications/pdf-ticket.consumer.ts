import { getChannel } from "../../config/rabbitmq.js";

const EXCHANGE_NAME = 'booking_events';
const QUEUE_NAME = 'pdf_ticket_generation'

const DLX_NAME = 'booking_events.dlx'
const DLQ_NAME = 'pdf_notifications.failed'
const DLX_ROUTING_KEY = 'pdf.failed';


export async function  startPdfTicketConsumer(){
    const channel  = getChannel()
    await channel.assertExchange(EXCHANGE_NAME,'fanout',{durable:true})

     await channel.assertExchange(DLX_NAME, 'direct',{durable:true})
      await channel.assertQueue(DLQ_NAME, {durable:true})
     await channel.bindQueue(DLQ_NAME, DLX_NAME,DLX_ROUTING_KEY);

  const q = await channel.assertQueue(QUEUE_NAME, { durable: true,arguments: {'x-dead-letter-exchange':DLX_NAME, 'x-dead-letter-routing-key': DLX_ROUTING_KEY}});
    await channel.bindQueue(q.queue,EXCHANGE_NAME,'')

    channel.consume(q.queue,(msg)=>{
        if (!msg) return;
        try {
            const payload = JSON.parse(msg.content.toString());
            
             console.log(`🎫 [Mock PDF] Generating ticket PDF for booking ${payload.bookingId} — user ${payload.userId}, price: $${payload.finalPrice}`);
         channel.ack(msg)

        } catch (error) {
             console.error('PDF ticket consumer failed to process message',error);
                channel.nack(msg, false, false);
        }
       
    })
          console.log('PDF ticket consumer listening...');

}