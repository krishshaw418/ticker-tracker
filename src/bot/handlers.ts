import type { Context } from "grammy";
import type { Conversation } from "@grammyjs/conversations";

export const assetDetails = async (
  conversation: Conversation,
  ctx: Context,
) => {
  await ctx.reply(
    "Please name the ticker you want to track.\nFor example: <b>ETH</b>, <b>SOL</b> etc.",
    {
      parse_mode: "HTML",
    },
  );
  const tickerCtx = await conversation.waitFor(":text", {
    otherwise: (ctx) => ctx.reply("Please enter a text message!"),
  });
  await ctx.reply(`You entered: ${tickerCtx.msg.text}`);

  await ctx.reply(
    "Please enter the threshold price to trigger alert.\nFor example: <b>$2000</b>",
    {
      parse_mode: "HTML",
    },
  );
  const priceCtx = await conversation.waitFor(":text", {
    otherwise: (ctx) => ctx.reply("Please enter a text message!"),
  });

  await ctx.reply(`You entered: ${priceCtx.msg.text}`);
  // Exiting the conversation
  await conversation.halt();
};
