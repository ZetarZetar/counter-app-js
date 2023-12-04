import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { config } from "./config.js";

let Plugin;
try {
  Plugin = new (grpc.loadPackageDefinition(
    protoLoader.loadSync("./protos/plugin.proto")
  ).NumberService)(
    `${config.pluginHost}:${config.pluginPort}`,
    grpc.credentials.createInsecure()
  );
} catch (error) {
  console.error("Error creating gRPC client:", error);
}

export default Plugin;
