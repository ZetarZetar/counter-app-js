import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { config } from "./config.js";

let incdecPlugin;
try {
  incdecPlugin = new (grpc.loadPackageDefinition(
    protoLoader.loadSync("./protos/incdec.proto")
  ).CounterService)(
    `${config.incdecPluginHost}:${config.incdecPluginPort}`,
    grpc.credentials.createInsecure()
  );
} catch (error) {
  console.error("Error creating gRPC client:", error);
}

export default incdecPlugin;
