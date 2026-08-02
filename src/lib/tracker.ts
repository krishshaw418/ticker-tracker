import { config } from "./config";

export class Tracker {
  private static pollIntervals: Map<string, NodeJS.Timeout>;

  constructor() {
    Tracker.pollIntervals = new Map<string, NodeJS.Timeout>();
  }

  public startPolling(tickerMint: string): void {
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
        const price = Number(data.outAmount) / 10 ** 6 / (Number(data.inAmount) / 10 ** 6);

        console.log(`$${price}`);
      } catch (err) {
        console.error(err);
        return;
      }
    }, 30000);

    Tracker.pollIntervals.set(tickerMint, pollInterval);
  }

  public stopPolling(tickerAddress: string) {
    clearInterval(Tracker.pollIntervals.get(tickerAddress));
  }
}
