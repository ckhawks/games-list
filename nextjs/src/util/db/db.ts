import { Pool, PoolConfig } from "pg";

// Reuse a single pool across requests (and across hot-reloads in dev) instead of
// opening a new connection on every query. Works against any standard Postgres —
// Neon, or the VPS Postgres — just by pointing DATABASE_URL at it. SSL is turned
// on when the connection string asks for it (sslmode=require/prefer/verify).
//
// We strip sslmode from the string and drive SSL ourselves so pg doesn't apply
// its own (verify-full) interpretation, and we use rejectUnauthorized:false so a
// self-signed server cert (the VPS default) is accepted. That encrypts traffic —
// which is the point over a network — without verifying the cert chain. In
// production the app talks to Postgres over localhost, where SSL isn't used at all.
// To harden a networked connection later: install a real/CA cert on Postgres and
// flip rejectUnauthorized back to true.
export const buildPoolConfig = (): PoolConfig => {
  const raw = process.env.DATABASE_URL || "";
  const wantSsl = /sslmode=(require|prefer|verify)/i.test(raw);
  const connectionString = raw
    .replace(/([?&])sslmode=[^&]*&?/i, "$1")
    .replace(/[?&]$/, "");

  return {
    connectionString,
    ssl: wantSsl ? { rejectUnauthorized: false } : undefined,
  };
};

const globalForPg = global as unknown as { pgPool?: Pool };

function createPool(): Pool {
  return new Pool(buildPoolConfig());
}

const pool = globalForPg.pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function db(query: string, params: any[] = []) {
  const result = await pool.query(query, params);
  return result.rows;
}
