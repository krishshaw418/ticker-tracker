import { tracker } from "../lib/tracker";
import { redis } from "../lib/redis";
import { db } from "../lib/db";

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
      cause: "Something went wrong!",
    });
  }
};
