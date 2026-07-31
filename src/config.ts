import "dotenv/config";
import { configSchema } from "./schemas/configSchema";

const envVariables = configSchema.parse(process.env);

export const config = {
  port: envVariables.PORT,
  botApiKey: envVariables.TG_BOT_API_KEY,
};
