import { envConfig } from "./config.js";
import { comparator } from "../utils/comparator.js";
import { redis } from "./redis.js";
import { USDC_MINT } from "../utils/constants.js";
import { type JupResponse } from "../types/types.js";

class Tracker {
  private static userRequests: Map<number, Map<string, NodeJS.Timeout>> =
    new Map<number, Map<string, NodeJS.Timeout>>(); // an in-memory map for storing userRequests of each userRequests per user

  public async startPolling(userId: number, tickerMint: string): Promise<void> {
    try {
      // Important note:
      // Since the decimals reading is outside the pollInterval it's only need fetched once from redis.
      // So, the stored decimal only needs to be saved for until pollInterval below is called,
      // hence just store the value in 'decimals' varaible and clear the key in redis.
      const decimals = await redis.readDecimals(tickerMint);
      await redis.clearDecimals(tickerMint);

      if (decimals === null || decimals === undefined) {
        throw new Error("[Redis Error]: Failed to read decimals!");
      }

      const pollInterval = setInterval(async () => {
        try {
          // fetch quote
          const JUP_BASE_URL = "https://api.jup.ag/swap/v2/order";
          const response = await fetch(
            `${JUP_BASE_URL}?inputMint=${tickerMint}&outputMint=${USDC_MINT}&amount=1000000`,
            {
              method: "GET",
              headers: {
                "x-api-key": envConfig.jupApiKey,
              },
            },
          );

          const data = (await response.json()) as JupResponse;

          // calculate price in USDC
          const currPrice =
            (Number(data.outAmount) /
            10 ** 6) /
            (Number(data.inAmount) / 10 ** decimals);
          await comparator(userId, tickerMint, currPrice);

          console.log(`${tickerMint}: $${currPrice}`);
        } catch (err) {
          console.error(err);
          return;
        }
      }, 30000);

      const userReqList = Tracker.userRequests.get(userId);

      if (userReqList !== undefined) {
        userReqList.set(tickerMint, pollInterval);
        console.log(`User-${userId} has ${userReqList.size} requests`);
      } else {
        const newReqList = new Map<string, NodeJS.Timeout>().set(
          tickerMint,
          pollInterval,
        );
        Tracker.userRequests.set(userId, newReqList);
      }
    } catch (err) {
      console.error(err);
      return;
    }
  }

  public stopPolling(userId: number, tickerMint: string): void {
    const userReqList = Tracker.userRequests.get(userId);
    if (userReqList !== undefined) {
      clearInterval(userReqList.get(tickerMint));
      userReqList.delete(tickerMint);

      if (userReqList.size == 0) {
        Tracker.userRequests.delete(userId);
      }
    }
    console.log("Number of req lists: ", Tracker.userRequests.size);
  }
}

const tracker = new Tracker();
export { tracker };
