import { Bot, GrammyError, HttpError, type Context } from "grammy";
import {
  conversations,
  createConversation,
  type ConversationFlavor,
  type Conversation,
} from "@grammyjs/conversations";
import { config } from "../config";
import { assetDetails } from "./handlers";

const bot = new Bot<ConversationFlavor<Context>>(config.botApiKey);
bot.use(conversations()); // using the conversation middleware
bot.use(createConversation(assetDetails)); // conversation builder

bot.command("start", async (ctx) => {
  await ctx.reply(
    "<b>Welcome to Ticker-Tracker!</b>\nTrack your favourite asset on Solana by selecting the /trackasset",
    { parse_mode: "HTML" },
  );
});

bot.command("trackasset", async (ctx) => {
  await ctx.conversation.enter("assetDetails");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update: ${ctx.update.update_id}: `);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

export default bot;
