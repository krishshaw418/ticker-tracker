import { tracker } from "../lib/tracker.js";
import { redis } from "../lib/redis.js";
import { db } from "../lib/db.js";

export const trackTicker = async (
  userId: number,
  tickerMint: string,
  threshold: number,
): Promise<void> => {
  // log the request
  console.log(
    `userId: ${userId}\ttickerMint: ${tickerMint}\tthreshold: $${threshold}`,
  );
  try {
    await db.insertNewRequest(userId, tickerMint, threshold);
    tracker.startPolling(userId, tickerMint);
    await redis.cacheRequest(userId, tickerMint, threshold);
  } catch (err) {
    throw new Error("DB Error", {
      cause:
        "Duplicate key value violates unique constraint 'request_userid_tickermint_key'",
    });
  }
};
