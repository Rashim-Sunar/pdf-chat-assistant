import amqp from 'amqplib';

/* =================================
RabbitMQ Connection Utility
*/

const RABBITMQ_URL = 'amqp://admin:admin@localhost:5672';
export const QUEUE_NAME = 'pdf_upload_queue';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true
  });

  console.log('🐇 RabbitMQ connected');
};

export const publishToQueue = (message: object) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  channel.sendToQueue(
    QUEUE_NAME,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
};
