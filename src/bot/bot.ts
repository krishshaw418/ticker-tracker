import { Bot, GrammyError, HttpError, type Context } from "grammy";
import {
  conversations,
  createConversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { envConfig } from "../lib/config.js";
import { trackAssetHandler } from "./handlers.js";

const bot = new Bot<ConversationFlavor<Context>>(envConfig.botApiKey);

bot.use(
  conversations({
    // log enter & exit events for conversations for debugging.
    onEnter(convoName, _ctx) {
      console.log(`Entered convo: ${convoName}`);
    },
    onExit(convoName, _ctx) {
      console.log(`Exit convo: ${convoName}`);
    },
  }),
); // using the conversation middleware
bot.use(createConversation(trackAssetHandler, "assetDetails")); // conversation builder

bot.command("start", async (ctx) => {
  await ctx.reply(
    "<b>Welcome to Ticker-Tracker!</b>\nTrack your favourite asset on Solana by selecting /trackasset cmd.",
    { parse_mode: "HTML" },
  );
});

bot.command("trackasset", async (ctx) => {
  await ctx.conversation.enter("assetDetails");
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "<b>Available Options</b>:\n/start - Introduction\n/trackasset - Track a ticker on Solana",
    { parse_mode: "HTML" },
  );
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

export { bot };
