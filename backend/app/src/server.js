import express from "express";
import { config } from "./config.js";
import router from "./routes.js";

// Express server
const app = express();
app.use(express.json());
app.set("x-powered-by", false);
app.set("etag", false);
app.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);

// CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use(router);

app.listen(config.appPort, config.appHost, () => {
  console.log(`App listening at http://${config.appHost}:${config.appPort}`);
});
