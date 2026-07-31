import z from "zod";

export const configSchema = z.object({
  PORT: z.coerce.number(),
  TG_BOT_API_KEY: z.string(),
});
