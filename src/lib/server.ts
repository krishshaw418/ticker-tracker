import express, { type Request, type Response, type Express } from "express";
// import { webhookCallback } from "grammy";
// import bot from "../bot/bot.js";
// import { envConfig } from "./config.js";

export const createServer = async (): Promise<Express> => {
  const app = express();

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "ok" });
  });

  // For produnction
  // attach the bot as a middleware
  // app.use(webhookCallback(bot, "express"));
  // await bot.api.setWebhook(envConfig.webhookUrl);

  return app;
};
