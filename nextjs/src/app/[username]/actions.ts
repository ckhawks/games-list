"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/util/auth/session";
import { db } from "@/util/db/db";

// Returns the owning player's username if the signed-in user owns this PlayerGame,
// else undefined. Every mutation goes through this — never trust a client-sent id.
async function ownedPlayerGameUsername(
  playerGameId: string,
  userId: string
): Promise<string | undefined> {
  const rows = await db(
    `SELECT p."username"
     FROM "PlayerGame" pg
     JOIN "Player" p ON p.id = pg."playerId"
     WHERE pg.id = $1 AND p."ownerUserId" = $2 AND pg."deletedAt" IS NULL`,
    [playerGameId, userId]
  );
  return rows[0]?.username as string | undefined;
}

function parseIntInRange(
  value: FormDataEntryValue | null,
  min: number,
  max: number
): number | null {
  if (value === null || String(value).trim() === "") return null;
  const n = Number.parseInt(String(value), 10);
  if (Number.isNaN(n)) return null;
  return Math.min(max, Math.max(min, n));
}

async function touchList(username: string) {
  await db(`UPDATE "Player" SET "listLastUpdatedAt" = now() WHERE "username" = $1`, [
    username,
  ]);
  revalidatePath(`/${username.toLowerCase()}`);
  revalidatePath("/");
}

export async function updatePlayerGame(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");

  const playerGameId = String(formData.get("playerGameId") || "");
  const username = await ownedPlayerGameUsername(playerGameId, session.userId);
  if (!username) throw new Error("Not authorized to edit this game");

  const rating = parseIntInRange(formData.get("rating"), 0, 10);
  if (rating === null) throw new Error("Rating is required (0–10)");
  const hoursPlayed = parseIntInRange(formData.get("hoursPlayed"), 0, 1_000_000);
  const reviewBlurb =
    String(formData.get("reviewBlurb") || "").trim() || null;

  await db(
    `UPDATE "PlayerGame"
     SET "rating" = $1, "hoursPlayed" = $2, "reviewBlurb" = $3
     WHERE "id" = $4`,
    [rating, hoursPlayed, reviewBlurb, playerGameId]
  );
  await touchList(username);
}

export async function removePlayerGame(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");

  const playerGameId = String(formData.get("playerGameId") || "");
  const username = await ownedPlayerGameUsername(playerGameId, session.userId);
  if (!username) throw new Error("Not authorized to remove this game");

  // Soft delete — keeps history and matches the rest of the schema.
  await db(`UPDATE "PlayerGame" SET "deletedAt" = now() WHERE "id" = $1`, [
    playerGameId,
  ]);
  await touchList(username);
}
