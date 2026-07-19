import "server-only";
import { RelyingParty } from "openid";

const STEAM_OPENID = "https://steamcommunity.com/openid";
const CLAIMED_ID_RE = /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/;

function relyingParty(origin: string): RelyingParty {
  // returnUrl must match the callback route; realm is the site root Steam shows the
  // user. Both are derived per-request so this works on localhost:3001, the prod
  // domain, whatever — no hardcoded URL to keep in sync.
  const returnUrl = `${origin}/api/auth/steam/callback`;
  return new RelyingParty(returnUrl, origin, true /* stateless */, false, []);
}

// Build the URL to redirect the user to for Steam login.
export function getSteamAuthUrl(origin: string): Promise<string> {
  const rp = relyingParty(origin);
  return new Promise((resolve, reject) => {
    rp.authenticate(STEAM_OPENID, false, (err, authUrl) => {
      if (err || !authUrl) return reject(err || new Error("No auth URL from Steam"));
      resolve(authUrl);
    });
  });
}

// Verify the assertion Steam sent back and return the 64-bit SteamID, or null.
export function verifySteamAssertion(
  origin: string,
  callbackUrl: string
): Promise<string | null> {
  const rp = relyingParty(origin);
  return new Promise((resolve) => {
    rp.verifyAssertion(callbackUrl, (err, result) => {
      if (err || !result || !result.authenticated || !result.claimedIdentifier) {
        return resolve(null);
      }
      const match = result.claimedIdentifier.match(CLAIMED_ID_RE);
      resolve(match ? match[1] : null);
    });
  });
}

export type SteamSummary = {
  steamId64: string;
  personaName: string | null;
  avatarUrl: string | null;
  profileUrl: string | null;
};

// Fetch display name + avatar from the Steam Web API. Best-effort: returns nulls
// for the profile fields if the call fails, so login never hinges on it.
export async function fetchSteamSummary(steamId64: string): Promise<SteamSummary> {
  const key = process.env.STEAMWEB_API_KEY;
  const base: SteamSummary = { steamId64, personaName: null, avatarUrl: null, profileUrl: null };
  if (!key) return base;

  try {
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId64}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return base;
    const data = await res.json();
    const p = data?.response?.players?.[0];
    if (!p) return base;
    return {
      steamId64,
      personaName: p.personaname ?? null,
      avatarUrl: p.avatarfull ?? p.avatarmedium ?? p.avatar ?? null,
      profileUrl: p.profileurl ?? null,
    };
  } catch {
    return base;
  }
}
