import { Tracker } from "../lib/tracker";
import { pgClient } from "../lib/db";

export const trackTicker = async (
  userId: number,
  tickerMint: string,
  threshold: number,
): Promise<void> => {
  console.log(
    `userId: ${userId}\ttickerMint: ${tickerMint}\tthreshold: $${threshold}`,
  );
  try {
    await pgClient.insertNewRequest(userId, tickerMint, threshold);
    const tracker = new Tracker();
    tracker.startPolling(userId, tickerMint);
  } catch (err) {
    console.error(err);
    return;
  }
};
