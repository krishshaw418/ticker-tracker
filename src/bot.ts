import { Bot } from "grammy";
import { config } from "./config";

const bot = new Bot(config.botApiKey);

bot.command("start", (ctx) => {
  ctx.reply(
    "Welcome to Ticker-Tracker!\nTrack your favourite asset on Solana!",
  );
});

export default bot;
