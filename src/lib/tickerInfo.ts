import { createSolanaRpc, type Address, isAddress } from "@solana/kit";
import { fetchMint } from "@solana-program/token";
import { fetchMint as fetchMint2022 } from "@solana-program/token-2022";
import { config } from "./config";
import { redis } from "./redis";
import { SolanaError } from "@solana/kit";

class TickerInfo {
  private static rpc = createSolanaRpc(config.heliusRpcUrl);

  public async checkAddress(tickerMint: string): Promise<void> {
    try {
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
        await redis.storeDecimals(tickerMint, mintAccount.data.decimals);
        return;
      }

      const mint2022Accout = await fetchMint2022(
        TickerInfo.rpc,
        tickerMint as Address,
      );
      if (mint2022Accout.data.isInitialized) {
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
