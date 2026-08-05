import type { Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";
import { trackTicker } from "../services/trackTicker";

export const trackAssetHandler = async (
  conversation: Conversation,
  ctx: Context,
): Promise<void> => {
  await ctx.reply(
    "Please name the base58 ticker mint you want to track.\nFor example: <b>9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump</b>",
    {
      parse_mode: "HTML",
    },
  );

  const tickerCtx = await conversation.waitFor(":text", {
    otherwise: (ctx) => ctx.reply("Please enter a text message!"),
  });

  const tickerMint = tickerCtx.msg.text;

  await ctx.reply(`You entered: ${tickerMint}`);

  await ctx.reply(
    "Please enter the threshold price(in USD) to trigger alert.\nFor example: <b>0.25</b>",
    {
      parse_mode: "HTML",
    },
  );

  const priceCtx = await conversation.waitFor(":text", {
    otherwise: (ctx) => ctx.reply("Please enter a text message!"),
  });

  try {
    // typecast the string input to number. If it fails the conversation is halted with a response!
    const threshold = Number(priceCtx.msg.text);

    if (Number.isNaN(threshold)) {
      throw new Error("Parsing Error", {
        cause: "Invalid price entered!",
      });
    }

    await ctx.reply(`You entered: ${threshold}`);

    // call trackTicker service
    trackTicker(ctx.from?.id as number, tickerMint, threshold);

    await ctx.reply(
      `Congratulations! Your Ticker is now being monitored.\n<b>Ticker Tracker</b> will send you alerts when your ticker cross $${threshold}.`,
      { parse_mode: "HTML" },
    );
  } catch (err) {
    console.error(err);
    if (err instanceof Error && err.name === "Parsing Error") {
      ctx.reply("Invalid price entered!\nTap /trackasset to try again.");
    }
    if (err instanceof Error && err.name === "DB Error") {
      ctx.reply(
        "Something went wrong on our end!\nPlease try again after sometime.",
      );
    }
    await conversation.halt();
  }

  // Exiting the conversation
  await conversation.halt();
};
