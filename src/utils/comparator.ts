import bot from "../bot/bot";
import { Tracker } from "../lib/tracker";

export const comparator = async (userId: number, currPrice: number) => {
  // Threshold will be fetched from the db/cache
  const threshold = 0.203;
  const tickerMint = "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump";

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
  }
};
