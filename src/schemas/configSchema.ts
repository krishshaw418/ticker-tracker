import z from "zod";

export const envConfigSchema = z.object({
  PORT: z.coerce.number(),
  TG_BOT_API_KEY: z.string(),
  JUPITER_API_KEY: z.string(),
  PG_CONNECTION_STRING: z.string(),
  REDIS_CONNECTION_STRING: z.string(),
  HELIUS_RPC_URL: z.url(),
  SERVER_WEBHOOK_URL: z.url(),
});
