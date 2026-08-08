import express, { type Request, type Response, type Express } from "express";
import { webhookCallback } from "grammy";
import bot from "../bot/bot.js";
import { config } from "./config.js";

export const createServer = async (): Promise<Express> => {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.status(200).json({ message: "ok" });
  });

  // For produnction
  // attach the bot as a middleware
  app.use(webhookCallback(bot, "express"));
  await bot.api.setWebhook(config.webhookUrl);
  
  return app;
};
