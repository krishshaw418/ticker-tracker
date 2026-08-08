import { pgPoolConfig } from "./config.js";
import { type Request } from "../types/types.js";
import pg from "pg";
const { Pool } = pg;

class Db {
  private static pool = new Pool(pgPoolConfig);

  public async init(): Promise<void> {
    try {
      // create request table
      const createTable =
        "CREATE TABLE IF NOT EXISTS request (userid BIGINT NOT NULL, tickermint TEXT CHECK (tickermint ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'), threshold NUMERIC NOT NULL, UNIQUE(userid, tickermint))";

      await Db.pool.query(createTable);
    } catch (err) {
      throw err;
    }
  }

  public async insertNewRequest(
    userId: number,
    tickerMint: string,
    threshold: number,
  ): Promise<void> {
    try {
      const insertQuery =
        "INSERT INTO request (userId, tickerMint, threshold) VALUES ($1, $2, $3) RETURNING userId, tickerMint";

      await Db.pool.query(insertQuery, [userId, tickerMint, threshold]);
    } catch (err) {
      throw err;
    }
  }

  public async readRequest(
    userId: number,
    tickerMint: string,
  ): Promise<Request> {
    try {
      const readQuery =
        "SELECT * FROM request WHERE userId = $1 AND tickerMint = $2";

      const res = await Db.pool.query(readQuery, [userId, tickerMint]);
      return res.rows[0];
    } catch (err) {
      throw err;
    }
  }

  public async deleteRequest(
    userId: number,
    tickerMint: string,
  ): Promise<void> {
    try {
      const deleteQuery =
        "DELETE FROM request WHERE userId = $1 AND tickerMint = $2";

      await Db.pool.query(deleteQuery, [userId, tickerMint]);
    } catch (err) {
      throw err;
    }
  }

  public async readAllRequest(): Promise<Array<Request>> {
    try {
      const readAllReqQuery = "SELECT * FROM request";
      const res = await Db.pool.query(readAllReqQuery);

      return res.rows;
    } catch (err) {
      throw err;
    }
  }
}

const db = new Db();
await db.init();

export { db };
