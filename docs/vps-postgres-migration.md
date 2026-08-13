# VPS Postgres: create DB + migrate from Neon

Run these on the **VPS** (over SSH). It can reach Neon over the internet and the
local Postgres over `localhost`, so the whole migration happens in one place.

Fill in the two placeholders once and reuse them:

```bash
# --- set these at the top of your SSH session ---

# Neon source (this is your current nextjs/.env DATABASE_URL — paste it here)
export NEON_URL='postgresql://gameslist-api:PASTE_PASSWORD@ep-calm-bar-a5v6gqd5.us-east-2.aws.neon.tech/gameslist?sslmode=require'

# A new password for the local DB user (make one up, keep it safe)
export NEW_DB_PASSWORD='choose-a-strong-password'
```

---

## 0. Check versions first (important)

Neon runs **PostgreSQL 16**. Your dump tool must be **>= 16**, and ideally your VPS
server is 16 too. Mismatches (e.g. a PG15 `pg_dump` against a PG16 source) fail.

```bash
psql --version          # client tools version
pg_dump --version       # must be >= 16
sudo -u postgres psql -c 'SHOW server_version;'   # your VPS server version
```

If `pg_dump` is older than 16, install the v16 client tools before continuing
(on Debian/Ubuntu: add the PGDG apt repo and `apt install postgresql-client-16`).

---

## 1. Create the role and database on the VPS

Run `psql` as the `postgres` superuser and create a dedicated login role + an empty
database it owns:

```bash
sudo -u postgres psql <<SQL
CREATE ROLE "gameslist_api" WITH LOGIN PASSWORD '${NEW_DB_PASSWORD}';
CREATE DATABASE gameslist OWNER "gameslist_api";
SQL
```

> Using `gameslist_api` (underscore) as a clean local role name. The tables inside
> (`"Player"`, `"Game"`, …) keep their exact names from the dump — only the owning
> role changes.

---

## 2. Dump the data from Neon

`--no-owner --no-privileges` strips Neon's role/grant lines so everything restores
cleanly as your new local owner instead of failing on a missing `gameslist-api` role.

```bash
pg_dump "$NEON_URL" \
  --no-owner --no-privileges \
  --format=custom \
  --file=gameslist.dump

ls -lh gameslist.dump      # sanity-check it's non-empty
```

`--format=custom` produces a compact binary dump that `pg_restore` reads.

---

## 3. Restore into the VPS database

Restore as the new owner so every object ends up owned by `gameslist_api`:

```bash
sudo -u postgres pg_restore \
  --dbname=gameslist \
  --no-owner \
  --role="gameslist_api" \
  --exit-on-error \
  gameslist.dump
```

If it finishes with no output, it worked. (`--exit-on-error` makes it stop and
shout if anything actually fails, instead of burying errors.)

---

## 4. Verify the restore

```bash
sudo -u postgres psql -d gameslist -c '\dt'                       # list tables
sudo -u postgres psql -d gameslist -c 'SELECT COUNT(*) FROM "Player";'
sudo -u postgres psql -d gameslist -c 'SELECT COUNT(*) FROM "Game";'
sudo -u postgres psql -d gameslist -c 'SELECT COUNT(*) FROM "PlayerGame";'
```

Compare the counts against Neon to be sure nothing was dropped:

```bash
psql "$NEON_URL" -c 'SELECT COUNT(*) FROM "Player";'
```

You should see 7 players (matching what the app currently shows).

---

## 5. Point the app at the VPS database

The app already uses the standard `pg` driver, so this is just an env change.

For a **local** connection (app and Postgres on the same VPS) you don't need SSL —
leave `sslmode` **out** of the URL so `db.ts` opens a plain connection:

```
DATABASE_URL="postgresql://gameslist_api:THE_NEW_PASSWORD@localhost:5432/gameslist"
```

Put that in the production `.env` on the VPS. (Only add `?sslmode=require` if you
connect to Postgres over the network rather than localhost — and see the SSL caveat
in `ROADMAP.md` about self-signed certs.)

Quick connectivity check as the app user:

```bash
psql "postgresql://gameslist_api:${NEW_DB_PASSWORD}@localhost:5432/gameslist" -c 'SELECT 1;'
```

If `localhost` auth is rejected, your `pg_hba.conf` may require adjusting (allow
`md5`/`scram-sha-256` for local TCP) — tell me and I'll walk you through it.

---

## 6. Clean up

```bash
rm gameslist.dump          # remove the dump file (contains all your data)
unset NEON_URL NEW_DB_PASSWORD
```

Don't decommission the Neon project until the app is fully running on the VPS and
you've confirmed reads/writes work — keep it as a fallback for a few days.
