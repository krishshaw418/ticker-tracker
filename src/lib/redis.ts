import { createClient, type RedisClientType } from "redis";
import { config } from "./config";

class Cache {
  private static redisClient: RedisClientType<{}, {}, {}, 3, {}> = createClient(
    {
      url: config.redisConnectionString,
    },
  );

  public async cacheRequest(
    userId: number,
    tickerMint: string,
    threshold: number,
  ): Promise<void> {
    try {
      const key = tickerMint;
      const value = threshold;
      const res = await Cache.redisClient.hSet(userId.toString(), key, value);
      console.log(`${res}: ${key}-${value}`);
    } catch (err) {
      console.error("[Reedis Error]: ", err);
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
        return Number(threshold);
      } else {
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
      console.error("[Reedis Error]: ", err);
      return;
    }
  }
}

const redis = new Cache();
export { redis };
