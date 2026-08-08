import { config } from "./config.js";
import { comparator } from "../utils/comparator.js";
import { redis } from "./redis.js";

class Tracker {
  private static pollIntervals: Map<string, NodeJS.Timeout> = new Map<
    string,
    NodeJS.Timeout
  >();

  public async startPolling(userId: number, tickerMint: string): Promise<void> {
    try {
      // Important note:
      // Since the decimals reading is outside the pollInterval it's only need fetched once from redis.
      // So, the stored decimal only needs to be saved for until pollInterval below is called,
      // hence just store the value in 'decimals' varaible and clear the key in redis.
      const decimals = await redis.readDecimals(tickerMint);
      await redis.clearDecimals(tickerMint);

      console.log(decimals);
      if (decimals === null || decimals === undefined) {
        throw new Error("[Redis Error]: Failed to read decimals!");
      }

      const pollInterval = setInterval(async () => {
        try {
          // fetch quote
          const JUP_BASE_URL = "https://api.jup.ag/swap/v2/order";
          const response = await fetch(
            `${JUP_BASE_URL}?inputMint=${tickerMint}&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=1000000`,
            {
              method: "GET",
              headers: {
                "x-api-key": config.jupApiKey,
              },
            },
          );

          const data = (await response.json()) as {
            inAmount: number;
            outAmount: number;
          };

          // calculate price in USDC
          const currPrice =
            (Number(data.outAmount) /
            10 ** 6) /
            (Number(data.inAmount) / 10 ** decimals);
          await comparator(userId, tickerMint, currPrice);

          console.log(`$${currPrice}`);
        } catch (err) {
          console.error(err);
          return;
        }
      }, 30000);

      Tracker.pollIntervals.set(tickerMint, pollInterval);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  public stopPolling(tickerMint: string) {
    // console.log(typeof Tracker.pollIntervals.get(tickerMint));
    clearInterval(Tracker.pollIntervals.get(tickerMint));
    Tracker.pollIntervals.delete(tickerMint);
  }
}

const tracker = new Tracker();
export { tracker };
