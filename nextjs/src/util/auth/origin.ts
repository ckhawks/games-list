import { NextRequest } from "next/server";

// Reconstruct the public origin, honoring reverse-proxy headers (nginx on the VPS
// sets x-forwarded-*). Falls back to the request's own host in dev. Used to build
// the Steam return/realm URLs so they match across localhost and production.
export function getOrigin(request: NextRequest): string {
  const proto =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  return `${proto}://${host}`;
}
