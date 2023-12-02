import dotenv from "dotenv";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { incrementCounter, decrementCounter } from "./counterOperations.js";

// Prepare some predefined variables
const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${nodeEnv}` });

const appHost = process.env.APP_HOST || "127.0.0.1";
const appPort = process.env.APP_PORT || 3200;

const packageDefinition = protoLoader.loadSync("./protos/incdec.proto");
const { CounterService } = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(CounterService.service, {
  Increment: (call, callback) => {
    const newValue = incrementCounter(call.request.value);
    callback(null, { newValue });
  },
  Decrement: (call, callback) => {
    const newValue = decrementCounter(call.request.value);
    callback(null, { newValue });
  },
});

// Start server
server.bindAsync(
  appHost + ":" + appPort,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
  }
);
