import { Row } from "react-bootstrap";
import styles from "../page.module.scss";
import BackButton from "@/components/BackButton";
import { db } from "@/util/db/db";
import { redirect } from "next/navigation";
import FooterBar from "@/components/FooterBar";
import { ListFilters } from "@/components/ListFilters";
import { Metadata } from "next";
import { currentUserOwnsPlayer } from "@/util/auth/ownership";
import { getTimeString } from "@/util/getTimeString";
import GameCard, { GameRow } from "@/components/GameCard";
import SortableGameList from "@/components/SortableGameList";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const playerSearch = await db(
    `
    SELECT * FROM "Player"
    WHERE LOWER(username) = $1`,
    [params.username.toLowerCase()]
  );

  let username = params.username;
  if (playerSearch.length == 1) {
    username = playerSearch[0].username;
  }

  return {
    title: `${username}'s Ratings`,
  };
}

export default async function PlayerListPage({
  params,
}: {
  params: { username: string };
}) {
  if (params.username === null) {
    return <>404</>;
  }

  const playerSearch = await db(
    `
    SELECT * FROM "Player"
    WHERE LOWER(username) = $1`,
    [params.username.toLowerCase()]
  );

  if (playerSearch.length != 1) {
    redirect("/");
    return <>404</>;
  }

  const player = playerSearch[0];
  const isOwner = await currentUserOwnsPlayer(player.id);

  const games = (await db(
    `
      SELECT
          g.id,
          pg.id AS "playerGameId",
          g.name,
          g."storeURL",
          g."storeName",
          g."releaseDate",
          g."descriptionShort",
          pg.rating AS "rating",
          pg."order" AS "order",
          g."artworkS3Key",
          pg."reviewBlurb",
          pg."hoursPlayed",
          g."steamReviewPercent",
          pg."createdAt" AS "ratingDate",
          ARRAY_AGG(t.name ORDER BY gt.weight DESC)
            FILTER (WHERE t.name IS NOT NULL) AS "tags"
      FROM
          "PlayerGame" pg
      JOIN
          "Game" g ON g.id = pg."gameId"
      LEFT JOIN
          "GameTag" gt ON gt."gameId" = g.id AND gt."deletedAt" IS NULL
      LEFT JOIN
          "Tag" t ON t.id = gt."tagId" AND t."deletedAt" IS NULL
      WHERE
          pg."playerId" = $1
          AND pg."deletedAt" IS NULL
          AND g."deletedAt" IS NULL
      GROUP BY
          g.id, pg.id, pg.rating, pg."order", pg."reviewBlurb", pg."hoursPlayed", pg."createdAt"
      ORDER BY
          pg.rating DESC, pg."order" ASC, pg."createdAt" DESC;
    `,
    [playerSearch[0].id]
  )) as GameRow[];

  return (
    <>
      <div className={styles["wrapper"]}>
        <div className={styles["content"]}>
          <Row>
            <BackButton to="/" text={"Back"} />
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <h1>{player.username}&apos;s Games</h1>
              {isOwner && <span className={"badge blue small"}>Your list</span>}
              <span style={{ color: "var(--sub-text-color)" }}>
                Last updated {getTimeString(player.listLastUpdatedAt)}
              </span>
            </div>
            <div
              style={{ marginBottom: "16px" }}
              dangerouslySetInnerHTML={{
                __html: player.profileBlurb,
              }}
            />

            <div className={styles["list-filter-controls"]}>
              <ListFilters />
              <span className={"subtext"}>
                {games ? games.length : 0} total games
              </span>
            </div>
            {isOwner && games.length > 0 && (
              <div className={"subtext"} style={{ marginBottom: "12px" }}>
                Drag the handle on a game to reorder it, or drag it into another
                rating to re-rate it.
              </div>
            )}
            <div className={styles["game-list-wrapper"]}>
              {games.length === 0 && <div>No ratings found. :(</div>}
              {games.length > 0 &&
                (isOwner ? (
                  <SortableGameList username={player.username} games={games} />
                ) : (
                  games.map((game, index) => (
                    <GameCard
                      key={game.playerGameId}
                      game={game}
                      rank={index + 1}
                      isOwner={false}
                    />
                  ))
                ))}
            </div>
          </Row>
        </div>
      </div>
      <FooterBar />
    </>
  );
}
