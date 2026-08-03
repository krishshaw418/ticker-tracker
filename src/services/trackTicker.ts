import { Tracker } from "../lib/tracker";

// Todos:
// 1. Need to add a storage for alert requests
export const trackTicker = (
  userId: number,
  tickerMint: string,
  threshold: number,
) => {
  console.log(
    `userId: ${userId}\ttickerMint: ${tickerMint}\tthreshold: $${threshold}`,
  );
  const tracker = new Tracker();
  try {
    tracker.startPolling(userId, tickerMint);
  } catch (err) {
    console.error(err);
    return;
  }
};
