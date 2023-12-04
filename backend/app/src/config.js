import dotenv from "dotenv";

const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${nodeEnv}` });

export const config = {
  appHost: process.env.APP_HOST,
  appPort: process.env.APP_PORT,
  redisHost: process.env.REDIS_HOST,
  redisPort: process.env.REDIS_PORT,
  pluginHost: process.env.PLUGIN_HOST,
  pluginPort: process.env.PLUGIN_PORT,
  rabbitMQHost: process.env.RABBITMQ_HOST,
  rabbitMQUser: process.env.RABBITMQ_USER,
  rabbitMQPassword: process.env.RABBITMQ_PASSWORD,
};
