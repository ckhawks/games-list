import { Pool } from "pg";

// Reuse a single pool across requests (and across hot-reloads in dev) instead of
// opening a new connection on every query. Works against any standard Postgres —
// Neon today, the VPS Postgres after the Stage 1 migration — just by pointing
// DATABASE_URL at it. SSL is enabled automatically when the connection string
// asks for it (Neon), and off for a plain local/VPS connection.
const globalForPg = global as unknown as { pgPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL || "";
  const needsSsl = /sslmode=(require|verify)/.test(connectionString);

  return new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: true } : undefined,
  });
}

const pool = globalForPg.pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}

export async function db(query: string, params: any[] = []) {
  const result = await pool.query(query, params);
  return result.rows;
}
