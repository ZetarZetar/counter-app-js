import express from "express";
import redisClient from "./redisClient.js";
import { getRabbitMQChannel } from "./rabbitMQClient.js";
import incdecPlugin from "./grpcClient.js";

const router = express.Router();

// Initialize counter variable
const initializeCounter = async () => {
  if ((await redisClient.get("counter")) === null) {
    await redisClient.set("counter", 99);
  }
};

initializeCounter();

// Ping route
router.get("/ping", (req, res) => {
  res.send("pong");
});

// Get counter route
router.get("/api/v1/counter", async (req, res) => {
  try {
    const counterValue = parseInt(await redisClient.get("counter"));
    res.json({ c: counterValue });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Post counter route
router.post("/api/v1/counter", async (req, res) => {
  try {
    const { c } = req.body;
    let counterValue = parseInt(await redisClient.get("counter"));
    const request = { value: counterValue };

    const callback = async (error, response) => {
      if (error) {
        console.error(error);
        res.status(500).send(error.toString());
        return;
      }
      await redisClient.set("counter", response.newValue);

      try {
        const rabbitMQChannel = await getRabbitMQChannel();
        rabbitMQChannel.sendToQueue(
          "counterUpdates",
          Buffer.from(response.newValue.toString())
        );
      } catch (mqError) {
        console.error("Error sending message to RabbitMQ", mqError);
      }

      res.json({ c: response.newValue });
    };

    if (c === "i") {
      incdecPlugin.Increment(request, callback);
    } else if (c === "d") {
      incdecPlugin.Decrement(request, callback);
    } else {
      res.status(400).send("Invalid request");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

export default router;
