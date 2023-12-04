import express from "express";
import redisClient from "./redisClient.js";
import { getRabbitMQChannel } from "./rabbitMQClient.js";
import Plugin from "./grpcClient.js";

const router = express.Router();

// Initialize number variable
const initializenumber = async () => {
  if ((await redisClient.get("number")) === null) {
    await redisClient.set("number", 0); // initialize variable "number" to be 0
  }
};

initializenumber();

// Ping route
router.get("/ping", (req, res) => {
  res.send("pong");
});

// Get number route
router.get("/api/v1/number", async (req, res) => {
  try {
    const numberValue = parseInt(await redisClient.get("number"));
    res.json({ n: numberValue });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Post number route
router.post("/api/v1/number", async (req, res) => {
  try {
    const { n } = req.body;
    let numberValue = parseInt(await redisClient.get("number"));
    const request = { value: numberValue };

    const callback = async (error, response) => {
      if (error) {
        console.error(error);
        res.status(500).send(error.toString());
        return;
      }
      await redisClient.set("number", response.newValue);

      try {
        const rabbitMQChannel = await getRabbitMQChannel();
        rabbitMQChannel.sendToQueue(
          "numberUpdates",
          Buffer.from(response.newValue.toString())
        );
      } catch (mqError) {
        console.error("Error sending message to RabbitMQ", mqError);
      }

      res.json({ n: response.newValue });
    };

    // Set the condition of increase, decrease, and reset number
    if (n === "increase") {
      Plugin.Increase(request, callback);
    } else if (n === "decrease") {
      Plugin.Decrease(request, callback);
    } else if (n === "reset") {
      Plugin.Reset(request, callback);
    } else {
      res.status(400).send("Invalid request");
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

export default router;
