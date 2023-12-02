import amqp from "amqplib";
import { config } from "./config.js";

let rabbitMQChannel;
let isRabbitMQConnected = false;

// Function to attempt reconnection to RabbitMQ after a delay
const reconnectRabbitMQ = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  connectRabbitMQ();
};

// Function to establish a connection with RabbitMQ
export const connectRabbitMQ = async () => {
  try {
    // Construct the connection string using credentials from config
    const connStr = `amqp://${config.rabbitMQUser}:${config.rabbitMQPassword}@${config.rabbitMQHost}`;
    // Establish a connection to RabbitMQ
    const connection = await amqp.connect(connStr);

    // Error handler for RabbitMQ connection
    connection.on("error", (error) => {
      console.error("RabbitMQ Connection Error:", error);
      isRabbitMQConnected = false;
      reconnectRabbitMQ();
    });

    // Handler for RabbitMQ connection closure
    connection.on("close", () => {
      console.log("RabbitMQ Connection Closed");
      // Set connection flag to false and attempt reconnection
      isRabbitMQConnected = false;
      reconnectRabbitMQ();
    });

    // Create a channel on the RabbitMQ connection
    rabbitMQChannel = await connection.createChannel();

    // Check if the queue already exists before asserting
    if (!(await rabbitMQChannel.checkQueue("counterUpdates"))) {
      await rabbitMQChannel.assertQueue("counterUpdates", { durable: false });
    }

    isRabbitMQConnected = true;
  } catch (error) {
    console.error("Error connecting to RabbitMQ", error);
    reconnectRabbitMQ();
  }
};

export const getRabbitMQChannel = async () => {
  if (!isRabbitMQConnected) {
    await connectRabbitMQ();
  }
  return rabbitMQChannel;
};
 