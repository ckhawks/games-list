require("dotenv").config();
import { Pool } from "pg";

// Standard Postgres pool — works against Neon today and the VPS Postgres after
// the migration, just by changing DATABASE_URL. This CLI is short-lived, so a
// single shared pool is fine; call closeDb() before exit if the process hangs.
const connectionString = process.env.DATABASE_URL || "";
const needsSsl = /sslmode=(require|verify)/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: needsSsl ? { rejectUnauthorized: true } : undefined,
});

export async function db(query: string, params: any[] = []) {
  const result = await pool.query(query, params);
  return result.rows;
}

export async function closeDb() {
  await pool.end();
}
