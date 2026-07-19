import "server-only";
import { getSession } from "./session";
import { db } from "@/util/db/db";

// The Player (list) owned by the currently signed-in user, or null. Stage 3 uses
// this to decide whether to show edit controls and to authorize mutations.
export async function getSessionPlayer(): Promise<{
  id: string;
  username: string;
} | null> {
  const session = await getSession();
  if (!session) return null;
  const rows = await db(
    `SELECT "id", "username" FROM "Player" WHERE "ownerUserId" = $1 LIMIT 1`,
    [session.userId]
  );
  return rows[0] ?? null;
}

// Authorization check for a specific list — true only if the signed-in user owns it.
export async function currentUserOwnsPlayer(playerId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const rows = await db(
    `SELECT 1 FROM "Player" WHERE "id" = $1 AND "ownerUserId" = $2`,
    [playerId, session.userId]
  );
  return rows.length === 1;
}
