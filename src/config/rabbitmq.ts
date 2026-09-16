import amqp from 'amqplib';
import type { Channel } from 'amqplib';

let channel:Channel;
export async  function connectToRabbitMQ():Promise<Channel>{
    const connection = await amqp.connect(process.env.RABBITMQ_URL as string);
     channel = await connection.createChannel()
    console.log('Connected to RabbitMQ');
    return  channel 
}
export function getChannel(): Channel {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
}


