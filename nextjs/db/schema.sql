-- Canonical schema for games-rating-lists (Postgres).
-- There is no migration tool yet; this file is the source of truth applied by hand.
-- UUID defaults use gen_random_uuid() (native in PG13+), so no uuid-ossp extension.

-- ---------------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Game" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "steamAppId" integer,
  "storeURL" text,
  "storeName" text,
  "descriptionShort" text,
  "releaseDate" timestamp without time zone,
  "artworkS3Key" text,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "deletedAt" timestamp without time zone,
  "steamReviewPercent" integer,
  "metacriticReviewPercent" integer,
  CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Tag" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "steamTagId" integer,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "deletedAt" timestamp without time zone,
  CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GameTag" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "gameId" uuid NOT NULL,
  "tagId" uuid NOT NULL,
  "weight" integer,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "deletedAt" timestamp without time zone,
  CONSTRAINT "GameTag_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Auth identity (Stage 2). One AppUser per Steam account.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "AppUser" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "steamId64" varchar(255) NOT NULL,
  "personaName" varchar(255),
  "avatarUrl" text,
  "profileUrl" varchar(255),
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "lastLoginAt" timestamp without time zone,
  CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AppUser_steamId64_key" UNIQUE ("steamId64")
);

-- ---------------------------------------------------------------------------
-- Player = one game list + profile. Owned by at most one AppUser (one list per
-- user); ownerUserId is null for legacy/unclaimed lists.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Player" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "username" varchar(255) NOT NULL,
  "steamId64" varchar(255),
  "steamProfileURL" varchar(255),
  "profileBlurb" text,
  "displayOrder" integer,
  "avatarS3Key" varchar(255),
  "listLastUpdatedAt" timestamp without time zone,
  "createdAt" timestamp without time zone NOT NULL,
  "deletedAt" timestamp without time zone,
  "ownerUserId" uuid,
  CONSTRAINT "Player_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Player_name_key" UNIQUE ("username"),
  CONSTRAINT "Player_ownerUserId_key" UNIQUE ("ownerUserId"),
  CONSTRAINT "Player_ownerUserId_fkey" FOREIGN KEY ("ownerUserId")
    REFERENCES "AppUser" ("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "PlayerGame" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "gameId" uuid NOT NULL,
  "playerId" uuid NOT NULL,
  "rating" integer NOT NULL,
  "order" integer NOT NULL,
  "reviewBlurb" text,
  "hoursPlayed" integer,
  "createdAt" timestamp without time zone NOT NULL DEFAULT now(),
  "deletedAt" timestamp without time zone,
  CONSTRAINT "PlayerGame_pkey" PRIMARY KEY ("id")
);
