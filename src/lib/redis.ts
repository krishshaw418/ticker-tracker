import { createClient, type RedisClientType } from "redis";
import { config } from "./config";

class Cache {
  private static redisClient: RedisClientType<{}, {}, {}, 3, {}> = createClient(
    {
      url: config.redisConnectionString,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error("Max retry attempts has reached");
          }

          return Math.min(Math.pow(2, retries) * 50, 2000);
        },
      },
    },
  )
    .on("error", (err) => {
      console.log("[Redis Error]: ", err);
      return;
    })
    .on("end", (err) => {
      console.log("[Redis Error]: ", err);
      return;
    });

  public async init() {
    try {
      await Cache.redisClient.connect();
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async cacheDecimals(
    tickerMint: string,
    decimals: number,
  ): Promise<void> {
    try {
      // set the key only if it does not already exists
      await Cache.redisClient.set(tickerMint, decimals, {
        condition: "NX",
      });
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }

  public async readCachedDecimals(
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

  public async cacheRequest(
    userId: number,
    tickerMint: string,
    threshold: number,
  ): Promise<void> {
    try {
      const key = tickerMint;
      const value = threshold;
      const res = await Cache.redisClient.hSet(userId.toString(), key, value);
      await Cache.redisClient.hExpire(userId.toString(), key, 60);
      console.log(`Cached request: ${res}: ${key}-${value}`);
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
      const key = tickerMint;
      const threshold = await Cache.redisClient.hGet(userId.toString(), key);
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
      const key = tickerMint;
      const res = await Cache.redisClient.hDel(userId.toString(), key);
      console.log(res);
    } catch (err) {
      console.error("[Redis Error]: ", err);
      return;
    }
  }
}

const redis = new Cache();
await redis.init();
export { redis };
