import "dotenv/config";
import { configSchema } from "../schemas/configSchema.js";

const envVariables = configSchema.parse(process.env);

export const config = {
  port: envVariables.PORT,
  botApiKey: envVariables.TG_BOT_API_KEY,
  jupApiKey: envVariables.JUPITER_API_KEY,
  pgConnectionString: envVariables.PG_CONNECTION_STRING,
  redisConnectionString: envVariables.REDIS_CONNECTION_STRING,
  heliusRpcUrl: envVariables.HELIUS_RPC_URL,
  webhookUrl: envVariables.SERVER_WEBHOOK_URL,
};
