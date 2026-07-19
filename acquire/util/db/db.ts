require("dotenv").config();
import { Pool } from "pg";

// Standard Postgres pool. This CLI is short-lived, so a single shared pool is
// fine; call closeDb() before exit if the process hangs. SSL handling mirrors
// the Next app (see nextjs/src/util/db/db.ts): strip sslmode and drive SSL here,
// accepting a self-signed server cert so a networked connection stays encrypted.
const raw = process.env.DATABASE_URL || "";
const wantSsl = /sslmode=(require|prefer|verify)/i.test(raw);
const connectionString = raw
  .replace(/([?&])sslmode=[^&]*&?/i, "$1")
  .replace(/[?&]$/, "");

const pool = new Pool({
  connectionString,
  ssl: wantSsl ? { rejectUnauthorized: false } : undefined,
});

export async function db(query: string, params: any[] = []) {
  const result = await pool.query(query, params);
  return result.rows;
}

export async function closeDb() {
  await pool.end();
}
