import "dotenv/config";
import { envConfigSchema } from "../schemas/configSchema.js";

const envVariables = envConfigSchema.parse(process.env);

export const envConfig = {
  port: envVariables.PORT,
  botApiKey: envVariables.TG_BOT_API_KEY,
  jupApiKey: envVariables.JUPITER_API_KEY,
  pgConnectionString: envVariables.PG_CONNECTION_STRING,
  redisConnectionString: envVariables.REDIS_CONNECTION_STRING,
  heliusRpcUrl: envVariables.HELIUS_RPC_URL,
  webhookUrl: envVariables.SERVER_WEBHOOK_URL,
};

export const pgPoolConfig = {
  connectionString: envConfig.pgConnectionString,
  max: 20, // max allowed client in the pool
  idleTimeoutMillis: 30000, // minimum time the client can sit idle in the pool before getting disconnected from the backend & discarded
  connectionTimeoutMillis: 2000, // minimum time before timing out the client connection
};

export const redisClientConfig = {
  url: envConfig.redisConnectionString,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        return new Error("Max retry attempts has reached");
      }

      return Math.min(Math.pow(2, retries) * 50, 2000);
    },
  },
};
