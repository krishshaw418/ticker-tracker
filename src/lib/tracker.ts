import { config } from "./config";
import { comparator } from "../utils/comparator";
import { redis } from "./redis";

class Tracker {
  private static pollIntervals: Map<string, NodeJS.Timeout> = new Map<
    string,
    NodeJS.Timeout
  >();

  public async startPolling(userId: number, tickerMint: string): Promise<void> {
    try {
      const decimals = await redis.readCachedDecimals(tickerMint);
      if (!decimals) {
        throw new Error("Failed to read decimals!");
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

          const data = await response.json();

          // calculate price in USDC
          const currPrice =
            Number(data.outAmount) /
            10 ** 6 /
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
