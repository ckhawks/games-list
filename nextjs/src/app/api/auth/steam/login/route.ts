import { NextRequest, NextResponse } from "next/server";
import { getSteamAuthUrl } from "@/util/auth/steam";
import { getOrigin } from "@/util/auth/origin";

// openid uses Node APIs — pin this handler to the Node.js runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  try {
    const authUrl = await getSteamAuthUrl(origin);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Steam login init failed:", error);
    return NextResponse.redirect(`${origin}/?auth=error`);
  }
}
