import amqp from "amqplib";
import { config } from "./config.js";

let rabbitMQChannel;
let isRabbitMQConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10; // Approximately 30 seconds (10 attempts * 3 seconds)

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const connectRabbitMQ = async () => {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error("Failed to connect to RabbitMQ after multiple attempts.");
    return;
  }

  try {
    const connStr = `amqp://${config.rabbitMQUser}:${config.rabbitMQPassword}@${config.rabbitMQHost}`;
    const connection = await amqp.connect(connStr);

    connection.on("error", async (error) => {
      console.error("RabbitMQ Connection Error:", error);
      isRabbitMQConnected = false;
      await wait(3000); // Wait for 3 seconds before reconnecting
      reconnectAttempts++;
      connectRabbitMQ();
    });

    connection.on("close", async () => {
      console.log("RabbitMQ Connection Closed");
      isRabbitMQConnected = false;
      await wait(3000); // Wait for 3 seconds before reconnecting
      reconnectAttempts++;
      connectRabbitMQ();
    });

    rabbitMQChannel = await connection.createChannel();
    await rabbitMQChannel.assertQueue("numberUpdates", { durable: false });

    isRabbitMQConnected = true;
    reconnectAttempts = 0; // Reset the attempts after successful connection
  } catch (error) {
    console.error("Error connecting to RabbitMQ", error);
    await wait(3000); // Wait for 3 seconds before reconnecting
    reconnectAttempts++;
    connectRabbitMQ();
  }
};

export const getRabbitMQChannel = async () => {
  if (!isRabbitMQConnected) {
    await connectRabbitMQ();
  }
  return rabbitMQChannel;
};

// Start the initial connection attempt
connectRabbitMQ();
