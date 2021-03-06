import dotenv = require("dotenv");
import IConfig from "./IConfig";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

const config: IConfig = {
  apiPrefix: process.env.API_PREFIX,
  corsOrigin: process.env.CORS_ORIGIN,
  mongoUrl: process.env.MONGO_URL,
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  serviceName: process.env.SERVICE_NAME,
  swagger: {
    definition: {
      basePath: "/api",
      info: {
        description: "ABC API with Swagger",
        title: "ABC documentation",
        version: ""
      }
    },
    url: "/_docs"
  }
};

console.log(":::::: INITIAL CONFIGURATIONS ::::::");
console.log(JSON.stringify(config, null, 2));

export default config;

// docker run -d --name ylz-identity-manager --network ylz -p 10000:9000 -e "PORT=9000" graphql-api-server
