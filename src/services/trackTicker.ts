import { Tracker } from "../lib/tracker";

// Todos:
// 1. Need to add a storage for alert request
// 2. Write a comparator & alert trigger service.
export const trackTicker = (tickerMint: string, threshold: number) => {
  const tracker = new Tracker();
  try {
    tracker.startPolling(tickerMint);
  } catch (err) {
    console.error(err);
    return;
  }
};
