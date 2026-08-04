import bot from "../bot/bot";
import { Tracker } from "../lib/tracker";
import { pgClient } from "../lib/db";

export const comparator = async (
  userId: number,
  tickerMint: string,
  currPrice: number,
): Promise<void> => {
  try {
    // Threshold will be fetched from the db/cache
    const request = await pgClient.readRequest(userId, tickerMint);
    const threshold = request.threshold;

    if (currPrice >= threshold) {
      await bot.api.sendMessage(
        userId,
        `<b>Price alert</b>:\n${tickerMint} crossed <b>$${threshold}</b>!\nCurrent Price: <b>$${currPrice}</b>`,
        {
          parse_mode: "HTML",
        },
      );

      const tracker = new Tracker();
      tracker.stopPolling(tickerMint);
      await pgClient.deleteRequest(userId, tickerMint);
    }
  } catch (err) {}
};
