import { config } from "./config.js";
import pg from "pg";
const { Pool } = pg;

interface Request {
  userid: number;
  tickermint: string;
  threshold: number;
}

class Db {
  private static pool = new Pool({
    connectionString: config.pgConnectionString,
    max: 20, // max allowed client in the pool
    idleTimeoutMillis: 30000, // minimum time the client can sit idle in the pool before getting disconnected from the backend & discarded
    connectionTimeoutMillis: 2000, // minimum time before timing out the client connection
  });

  public async init(): Promise<void> {
    try {
      // create request table
      const createTable =
        "CREATE TABLE IF NOT EXISTS request (userId BIGINT NOT NULL, tickerMint TEXT CHECK (tickerMint ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'), threshold NUMERIC NOT NULL, UNIQUE(userId, tickerMint))";
      await Db.pool.query(createTable);
    } catch (err) {
      throw err;
    }
  }

  public async insertNewRequest(
    userId: number,
    tickerMint: string,
    threshold: number,
  ): Promise<string> {
    try {
      const insertQuery =
        "INSERT INTO request (userId, tickerMint, threshold) VALUES ($1, $2, $3) RETURNING userId, tickerMint";
      const res = await Db.pool.query(insertQuery, [
        userId,
        tickerMint,
        threshold,
      ]);
      console.log(`New request saved at row: \n`, res.rows[0]);
      return res.rows[0];
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
      // console.log(`Fetched request: \n`, res.rows[0]);
      return res.rows[0];
    } catch (err) {
      throw err;
    }
  }

  public async deleteRequest(
    userId: number,
    tickerMint: string,
  ): Promise<boolean> {
    try {
      const deleteQuery =
        "DELETE FROM request WHERE userId = $1 AND tickerMint = $2";

      const res = await Db.pool.query(deleteQuery, [userId, tickerMint]);
      console.log(`Deleted row: ${res.rowCount}`);
      return res.rowCount === 1;
    } catch (err) {
      throw err;
    }
  }
}

const db = new Db();
await db.init();

export { db };
