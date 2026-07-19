# Roadmap: from personal site → self-hosted platform

Turning games-rating-lists from a single-author site (Stellaric's list, data entered via a
local CLI) into a platform where anyone can sign up and maintain their own game list —
while also moving hosting off Vercel + Neon onto the existing VPS.

The guiding principle: **evolve in stages, don't rewrite.** The data model is already
multi-tenant-shaped (`Player`, `Game`, `PlayerGame`, `Tag`, `GameTag` with soft deletes),
so most stages add surface area rather than tearing things down. Each stage below is
shippable on its own.

---

## Stage 0 — Foundation cleanup ✅ (done)

- Fixed untagged-games query, `getTimeString` crash, case-sensitive URLs.
- Scrubbed the leaked (expired) Steam JWT.
- Removed dead code / bogus `"use server"` directives.

**Still deferred from Stage 0** (safe today because only the owner writes data; must be
closed before Stage 2 opens signups):
- `dangerouslySetInnerHTML` on `profileBlurb` → stored-XSS risk once others can edit it.
- `/api/resource/[...s3Key]` does no key validation → any object in the bucket is fetchable.

---

## Stage 1 — Infra migration (Vercel → VPS, Neon → VPS Postgres)

Do this first: it's independent of the platform work and de-risks everything after it
(no more managed-service lock-in, no cold starts, one box to reason about).

**The one real code change — the DB driver. ✅ DONE (verified against Neon).**
`@neondatabase/serverless` talked to Neon over HTTP/WebSocket and would not work against a
vanilla Postgres instance. Swapped both `db.ts` files to `pg` (node-postgres) with a shared
pool; `@neondatabase/serverless` removed from both `package.json`s. Verified: `pg` connects
to the existing Neon URL, all queries (incl. the `ARRAY_AGG ... FILTER` games query) return
correct shapes, `next build` passes. So the app runs unchanged today and will point at the
VPS Postgres just by changing `DATABASE_URL`.
- **SSL caveat for the VPS:** `db.ts` enables SSL only when the connection string contains
  `sslmode=require`/`verify`, with `rejectUnauthorized: true`. Local VPS Postgres over
  `localhost` needs no SSL (leave `sslmode` out → plain connection, works). If you instead
  connect over the network with a **self-signed** cert, `rejectUnauthorized: true` will
  reject it — either install a real cert or relax that flag for that host.

**Hosting Next.js on the VPS:**
- Set `output: "standalone"` in `next.config.mjs` for a lean deploy bundle.
- Run `next start` (or the standalone server) under **systemd** or **pm2**; reverse-proxy
  with the nginx/Caddy already on the box. Give it its own subdomain/vhost.
- Move `.env` onto the server (systemd `EnvironmentFile=` or pm2 ecosystem file). Keep it
  out of git (already gitignored).

**Object storage: keeping S3** (decided). Already wired up via `getS3Client`; no code change
needed during the migration. Costs pennies at this scale. (MinIO/local disk revisitable
later if full self-hosting becomes a goal.)

**Deploy flow:** start with `git pull && npm ci && npm run build && systemctl restart`;
graduate to a GitHub Actions job that SSHes in and does the same when it gets tedious.

**Exit criteria:** site runs on the VPS against local Postgres, Vercel + Neon projects can
be torn down.

---

## Stage 2 — Auth & ownership

The single biggest addition. Everything downstream depends on "who owns which list."

- **Auth library:** Auth.js (NextAuth) with a Postgres adapter, self-hosted (no external
  auth SaaS, consistent with Stage 1).
- **Login method: Steam OpenID** (decided) — the audience already has Steam accounts, it's
  zero-friction, and it ties in with the Steam data you already pull. (Steam is OpenID 2.0;
  use a community provider or a small custom provider.)
  - Steam OpenID by itself only returns the user's SteamID64. To pull their **display name
    and avatar** on first login, call the Steam Web API `ISteamUser/GetPlayerSummaries`
    using `STEAMWEB_API_KEY` (already set in `.env`). This is a server-side, app-level key.
- **Schema:** add a `User`/account + session tables (adapter-generated). Link
  `User → Player` (one list per user to start). Add to `Player`:
  - `ownerUserId`
  - `isPublic` (boolean)
  - unique, reserved-name-checked `username`/slug
- **Ownership enforcement:** editing a list requires `session.user` to own that `Player`.
- **Migrate the existing single user** (Stellaric + friends) into real accounts.

**Exit criteria:** you can log in, and only the owner can edit their own list.

---

## Stage 3 — Self-serve data entry (retire the `acquire` CLI)

Right now, adding a game = running a local TS script with your personal Steam token. Real
users can't do that. The scraping logic has to move server-side.

- **"Add a game" flow:** search Steam by name → pick the app → server fetches
  `GetItems` → upserts a **shared** `Game` row + uploads artwork. The `acquire/index.ts`
  logic is the blueprint; port it into a server action / API route.
- **Key insight the schema already supports:** `Game` is global/shared across users;
  `PlayerGame` is the per-user rating. So two users rating Factorio share one `Game` row —
  scrape once, cache forever.
- **Steam token:** lives server-side only, one app-level token (not per-user). Add caching
  + rate-limit handling since all users now hit it.
- **Per-user editing UI:** set rating, review blurb, hours; reorder; add/remove tags;
  upload avatar.

**Exit criteria:** a new user can build a full list entirely in the browser.

---

## Stage 4 — User-generated-content safety (gate before public signups)

Closes the deferred Stage-0 items plus the new exposure from Stage 3.

- Replace `dangerouslySetInnerHTML` with **markdown** (`react-markdown`, no raw HTML) or
  server-side sanitization (DOMPurify). Applies to `profileBlurb` and any review text.
- Harden `/api/resource`: validate/allowlist keys, scope uploads under a per-user prefix,
  reject path traversal.
- Validate + constrain uploads (size, MIME, dimensions).
- Rate-limit writes; unique + reserved usernames; basic report/moderation path.

**Exit criteria:** a hostile user can't XSS, traverse storage, or spam.

---

## Stage 5 — Platform features

Now it feels like a product rather than one person's page.

- **Make `ListFilters` real** (it currently says "doesn't work yet"): wire sort
  (rating/hours/release) and tag filtering. Simplest: client-side sort/filter on the
  already-loaded list, or URL query params for shareable filtered views.
- **Discovery:** the current homepage hardcodes a player list — turn it into "browse public
  lists," browse by tag, maybe a popularity/recently-updated feed.
- **Public/private** toggle honored throughout.
- Nice-to-haves: compare two lists, "games we both love," shareable OG images.

---

## Stage 6 — Scale & polish (only if it grows)

- Query tuning / indexes (`PlayerGame.playerId`, `GameTag.gameId`, `Player.username`).
- Caching for the shared `Game` data and Steam responses.
- Backups for the VPS Postgres (was Neon's job before).
- Observability: error tracking, uptime.

---

## Rough sequencing & effort

| Stage | Effort | Blocks |
|-------|--------|--------|
| 1 — Infra migration | S–M | driver swap is the only tricky bit |
| 2 — Auth & ownership | M–L | everything downstream |
| 3 — Self-serve entry | M–L | Stage 2 |
| 4 — UGC safety | S–M | must precede public signups |
| 5 — Platform features | M | — |
| 6 — Scale/polish | ongoing | — |

## Decisions made
- **Storage:** keep S3.
- **Auth:** Steam OpenID (via `STEAMWEB_API_KEY` for profile fetch).
- **Lists:** one list per user (`ownerUserId` on `Player`; no separate `List` table).
- **Games:** must support non-Steam / manually-entered games (with manually-sourced
  artwork), so the "add game" flow needs a manual-entry path alongside Steam import.

## Open questions
- _(none currently — revisit as stages land)_
