import { Bot, GrammyError, HttpError, type Context } from "grammy";
import {
  conversations,
  createConversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { config } from "../lib/config";
import { trackAssetHandler } from "./handlers";

const bot = new Bot<ConversationFlavor<Context>>(config.botApiKey);
bot.use(
  conversations({
    // log enter & exit events for conversations for debugging.
    onEnter(convoName, ctx) {
      console.log(`Entered convo id: ${convoName}`);
    },
    onExit(convoName, ctx) {
      console.log(`Exit convo id: ${convoName}`);
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
})

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
