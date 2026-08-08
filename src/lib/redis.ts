import { createClient, type RedisClientType } from "redis";
import { redisClientConfig } from "./config.js";

class Cache {
  private static redisClient: RedisClientType<{}, {}, {}, 3, {}> = createClient(
    redisClientConfig,
  )
    .on("error", (err) => {
      console.log("[Redis Error]: ", err);
      return;
    })
    .on("end", (err) => {
      console.log("[Redis Error]: ", err);
      return;
    });

  public async init(): Promise<void> {
    try {
      await Cache.redisClient.connect();
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async storeDecimals(
    tickerMint: string,
    decimals: number,
  ): Promise<void> {
    try {
      // set the mint-decimal key pair only if it does not already exists
      await Cache.redisClient.set(tickerMint, decimals, {
        condition: "NX",
      });
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async readDecimals(
    tickerMint: string,
  ): Promise<number | null | undefined> {
    try {
      const decimals = await Cache.redisClient.get(tickerMint);
      if (decimals) {
        return Number(decimals);
      } else {
        return null;
      }
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async clearDecimals(tickerMint: string): Promise<void> {
    try {
      await Cache.redisClient.del(tickerMint);
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async cacheRequest(
    userId: number,
    tickerMint: string,
    threshold: number,
  ): Promise<void> {
    try {
      // cache request
      await Cache.redisClient.hSet(userId.toString(), tickerMint, threshold);
      // set expiry to cached req
      await Cache.redisClient.hExpire(userId.toString(), tickerMint, 120);
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async readCachedRequest(
    userId: number,
    tickerMint: string,
  ): Promise<number | null | undefined> {
    try {
      const threshold = await Cache.redisClient.hGet(
        userId.toString(),
        tickerMint,
      );
      if (threshold) {
        console.log("Cache Hit!");
        return Number(threshold);
      } else {
        console.log("Cache Missed!");
        return null;
      }
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async clearCachedRequest(
    userId: number,
    tickerMint: string,
  ): Promise<void> {
    try {
      // delete cached req
      await Cache.redisClient.hDel(userId.toString(), tickerMint);
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }
}

const redis = new Cache();
await redis.init();
export { redis };
