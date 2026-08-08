import { db } from "../lib/db.js";
import { tickerInfo } from "../lib/tickerInfo.js";
import { tracker } from "../lib/tracker.js";

export const trackReboot = async (): Promise<void> => {
  try {
    // fetch all pending requests and restart tracking
    const requests = await db.readAllRequest();

    if (requests.length === 0) {
      return;
    }

    requests.forEach(async (req) => {
      await tickerInfo.checkAddress(req.tickermint);
      tracker.startPolling(req.userid, req.tickermint);
    });
    return;
  } catch (err) {
    throw err;
  }
};
