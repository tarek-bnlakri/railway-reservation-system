import { getChannel } from "../../config/rabbitmq.js";

const EXCHANGE_NAME = 'booking_events';
const QUEUE_NAME = 'email_notifications';

export async function startEmailConsumer() {
  const channel = getChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
  const q = await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(q.queue, EXCHANGE_NAME, '');

  channel.consume(q.queue, (msg) => {
    if (!msg) return;
    const payload = JSON.parse(msg.content.toString());
    console.log(`📧 [Mock Email] Sending confirmation to user ${payload.userId} for booking ${payload.bookingId}, price: $${payload.finalPrice}`);
    channel.ack(msg); 
  });

  console.log('Email consumer listening...');
}