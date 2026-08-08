import { createSolanaRpc, type Address, isAddress } from "@solana/kit";
import { fetchMint } from "@solana-program/token";
import { fetchMint as fetchMint2022 } from "@solana-program/token-2022";
import { envConfig } from "./config.js";
import { redis } from "./redis.js";
import { SolanaError } from "@solana/kit";
import { USDC_MINT } from "../utils/constants.js";

class TickerInfo {
  private static rpc = createSolanaRpc(envConfig.heliusRpcUrl);

  public async checkAddress(tickerMint: string): Promise<void> {
    try {
      // check if the addess is USDC mint address
      if (tickerMint === USDC_MINT) {
        throw new Error("USDC Mint", {
          cause: "Ticker mint cannot be USDC!",
        });
      }

      // check for address format
      if (!isAddress(tickerMint)) {
        throw new Error("Invalid Mint", {
          cause: "Invalid address format!",
        });
      }

      const mintAccount = await fetchMint(
        TickerInfo.rpc,
        tickerMint as Address,
      );
      if (mintAccount.data.isInitialized) {
        // store decimal to use in tracker for price calculation
        await redis.storeDecimals(tickerMint, mintAccount.data.decimals);
        return;
      }

      const mint2022Accout = await fetchMint2022(
        TickerInfo.rpc,
        tickerMint as Address,
      );
      if (mint2022Accout.data.isInitialized) {
        // store decimal to use in tracker for price calculation
        await redis.storeDecimals(tickerMint, mintAccount.data.decimals);
        return;
      }
    } catch (err) {
      if (err instanceof SolanaError) {
        throw new Error("Not Found", {
          cause: "Account not found!",
        });
      }

      throw err;
    }
  }
}

const tickerInfo = new TickerInfo();
export { tickerInfo };
