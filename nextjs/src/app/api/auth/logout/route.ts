import { NextRequest, NextResponse } from "next/server";
import { getOrigin } from "@/util/auth/origin";
import { sessionCookieConfig } from "@/util/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST-only (a form submit) so a stray link/prefetch can't log you out.
export async function POST(request: NextRequest) {
  const origin = getOrigin(request);
  const res = NextResponse.redirect(`${origin}/`, { status: 303 });
  res.cookies.set({ ...sessionCookieConfig, value: "", maxAge: 0 });
  return res;
}
