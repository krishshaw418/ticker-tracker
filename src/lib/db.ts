import pg from "pg";
const { Pool } = pg;

class PgClient {
  private static pool = new Pool();

  public async init(): Promise<void> {
    try {
      // enable the pgcrypto extension for using gen_random_uuid
      await PgClient.pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");

      // create request table
      const createTable =
        "CREATE TABLE IF NOT EXISTS request (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), userId BIGINT NOT NULL, tickerMint TEXT CHECK (tickerMint ~ '^[1-9A-HJ-NP-Za-km-z]{32,44}$'), threshold NUMERIC NOT NULL)";
      await PgClient.pool.query(createTable);
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
        "INSERT INTO request (userId, tickerMint, threshold) VALUES ($1, $2, $3) RETURNING id";
      const res = await PgClient.pool.query(insertQuery, [
        userId,
        tickerMint,
        threshold,
      ]);
      console.log(`New request saved at row: \n`, res.rows[0]);
      return res.rows[0].id;
    } catch (err) {
      throw err;
    }
  }

  public async readRequest(requestId: string): Promise<any | null> {
    try {
      const readQuery = "SELECT * FROM request WHERE id = $1";

      const res = await PgClient.pool.query(readQuery, [requestId]);
      console.log(`Fetched request: \n`, res.rows[0]);
      return res.rows[0] ?? null;
    } catch (err) {
      throw err;
    }
  }

  public async deleteRequest(requestId: string): Promise<boolean> {
    try {
      const deleteQuery = "DELETE FROM request WHERE id = $1";

      const res = await PgClient.pool.query(deleteQuery, [requestId]);
      console.log(`Deleted row: ${res.rowCount}`);
      return res.rowCount === 1;
    } catch (err) {
      throw err;
    }
  }
}

const pgClient = new PgClient();
await pgClient.init();

export { pgClient };
