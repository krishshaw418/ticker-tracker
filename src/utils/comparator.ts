import bot from "../bot/bot";
import { tracker } from "../lib/tracker";
import { db } from "../lib/db";
import { redis } from "../lib/redis";

export const comparator = async (
  userId: number,
  tickerMint: string,
  currPrice: number,
): Promise<void> => {
  try {
    // check cache before reading db
    let threshold = await redis.readCachedRequest(userId, tickerMint);
    // if request not found in cache then read db and cache it
    if (threshold === null || threshold === undefined) {
      const request = await db.readRequest(userId, tickerMint);
      await redis.cacheRequest(
        request.userId,
        request.tickerMint,
        request.threshold,
      );
      threshold = request.threshold;
    }

    if (currPrice >= threshold) {
      await bot.api.sendMessage(
        userId,
        `<b>Price alert</b>:\n${tickerMint} crossed <b>$${threshold}</b>!\nCurrent Price: <b>$${currPrice}</b>`,
        {
          parse_mode: "HTML",
        },
      );

      tracker.stopPolling(tickerMint);
      await db.deleteRequest(userId, tickerMint);
      await redis.clearCachedRequest(userId, tickerMint);
    }
  } catch (err) {
    console.error(err);
    return;
  }
};
