import { NextRequest, NextResponse } from "next/server";
import { verifySteamAssertion, fetchSteamSummary } from "@/util/auth/steam";
import { getOrigin } from "@/util/auth/origin";
import { signSession, sessionCookieConfig } from "@/util/auth/session";
import { db } from "@/util/db/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const callbackUrl = origin + request.nextUrl.pathname + request.nextUrl.search;

  const steamId64 = await verifySteamAssertion(origin, callbackUrl);
  if (!steamId64) {
    return NextResponse.redirect(`${origin}/?auth=failed`);
  }

  const summary = await fetchSteamSummary(steamId64);

  // Upsert the auth identity keyed by SteamID, refreshing profile fields each login.
  const rows = await db(
    `INSERT INTO "AppUser" ("steamId64", "personaName", "avatarUrl", "profileUrl", "lastLoginAt")
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT ("steamId64") DO UPDATE SET
       "personaName" = EXCLUDED."personaName",
       "avatarUrl" = EXCLUDED."avatarUrl",
       "profileUrl" = EXCLUDED."profileUrl",
       "lastLoginAt" = now()
     RETURNING "id"`,
    [steamId64, summary.personaName, summary.avatarUrl, summary.profileUrl]
  );
  const userId = rows[0].id as string;

  // Auto-claim: if an existing, unowned Player has this SteamID, link it to the user.
  await db(
    `UPDATE "Player" SET "ownerUserId" = $1
     WHERE "steamId64" = $2 AND "ownerUserId" IS NULL`,
    [userId, steamId64]
  );

  const token = await signSession({ userId, steamId64 });
  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set({ ...sessionCookieConfig, value: token });
  return res;
}
