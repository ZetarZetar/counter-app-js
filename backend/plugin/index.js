import dotenv from "dotenv";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { IncreaseNumber, DecreaseNumber, ResetNumber } from "./numberOperations.js";

// Prepare some predefined variables
const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${nodeEnv}` });

const appHost = process.env.APP_HOST || "127.0.0.1";
const appPort = process.env.APP_PORT || 3200;

const packageDefinition = protoLoader.loadSync("./protos/plugin.proto");
const { NumberService } = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(NumberService.service, {
  Increase: (call, callback) => {
    const newValue = IncreaseNumber(call.request.value);
    callback(null, { newValue });
  },
  Decrease: (call, callback) => {
    const newValue = DecreaseNumber(call.request.value);
    callback(null, { newValue });
  },
  Reset: (call, callback) => {
    const newValue = ResetNumber(call.request.value);
    callback(null, { newValue });
  }
});

// Start server
server.bindAsync(
  appHost + ":" + appPort,
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
  }
);
