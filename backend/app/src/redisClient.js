import { createClient } from "redis";
import { config } from "./config.js";

let redisClient;

const reconnectRedis = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  connectRedis();
};

const connectRedis = async () => {
  redisClient = createClient({
    url: `redis://${config.redisHost}:${config.redisPort}`,
  });

  redisClient.on("error", (err) => {
    console.log("Redis Connection Error", err);
    reconnectRedis();
  });

  redisClient.on("end", () => {
    console.log("Redis Connection Closed");
    reconnectRedis();
  });

  await redisClient.connect();
};

connectRedis();

export default redisClient;
