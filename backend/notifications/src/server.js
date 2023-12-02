import http from "http";
import { WebSocketServer } from "ws";
import { getRabbitMQChannel } from "./rabbitMQClient.js";
import { config } from "./config.js";

// Creating an HTTP server instance
const server = http.createServer();

// Creating a WebSocket server instance, wrapping the HTTP server
const wss = new WebSocketServer({ server });

// Function to keep track of the 'alive' status of each WebSocket client
function heartbeat() {
  this.isAlive = true;
}

// Event listener for new WebSocket connections
wss.on("connection", function connection(ws) {
  // Setting the initial alive status of the WebSocket client
  ws.isAlive = true;

  // Error handler for each WebSocket client
  ws.on("error", console.error);

  // Handling pong responses from the client to keep the connection alive
  ws.on("pong", heartbeat);
});

// Function to broadcast updates to all connected WebSocket clients
const broadcastUpdate = (message) => {
  wss.clients.forEach((client) => {
    // Send the message to each client that is currently open
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

// Function to start listening for messages from RabbitMQ
const startRabbitMQListener = async () => {
  // Getting the RabbitMQ channel
  const channel = await getRabbitMQChannel();

  // Consuming messages from the "counterUpdates" queue in RabbitMQ
  await channel.consume("counterUpdates", (msg) => {
    if (msg) {
      console.log("Received message from RabbitMQ:", msg.content.toString());
      // Broadcasting the received message to all WebSocket clients
      broadcastUpdate(msg.content.toString());
      // Acknowledging the message was processed
      channel.ack(msg);
    }
  });
};

// Start listening for messages from RabbitMQ
startRabbitMQListener();

// Interval to check and ping active WebSocket clients
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    // Terminate any clients that have not responded to the previous ping
    if (ws.isAlive === false) return ws.terminate();

    // Marking the client as inactive and sending a ping
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Cleanup on WebSocket server close
wss.on("close", function close() {
  // Clearing the interval to stop pinging clients
  clearInterval(interval);
});

// Starting the HTTP server on the configured port and host
server.listen(config.appPort, config.appHost, () => {
  console.log(`App listening at http://${config.appHost}:${config.appPort}`);
});
