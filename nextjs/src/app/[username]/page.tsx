import { Image, Row } from "react-bootstrap";
import styles from "../page.module.scss";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { ExternalLink, Star } from "react-feather";
import { db } from "@/util/db/db";
import { redirect } from "next/navigation";
import FooterBar from "@/components/FooterBar";
import { ListFilters } from "@/components/ListFilters";
import { Metadata } from "next";
import NoSsr from "@/components/NoSsr";

export const revalidate = 60;

function getTimeString(date: Date): string {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hours: "",
  };

  const hours = 5;
  date.setHours(date.getHours() - hours);
  return date.toLocaleDateString("en-US", options as unknown as any);
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const playerSearch = await db(
    `
    SELECT * FROM "Player"
    WHERE LOWER(username) = $1`,
    [params.username]
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
    [params.username]
  );

  if (playerSearch.length != 1) {
    redirect("/");
    return <>404</>;
  }

  const player = playerSearch[0];

  const games = await db(
    `
      SELECT 
          g.id,
          g.name,
          g."storeURL",
          g."storeName",
          g."releaseDate",
          g."descriptionShort",
          pg.rating AS "rating",
          g."artworkS3Key",
          pg."reviewBlurb",
          pg."hoursPlayed",
          g."steamReviewPercent",
          pg."createdAt" AS "ratingDate",
          ARRAY_AGG(t.name ORDER BY gt.weight DESC) AS "tags"
      FROM 
          "PlayerGame" pg
      JOIN 
          "Game" g ON g.id = pg."gameId"
      LEFT JOIN 
          "GameTag" gt ON gt."gameId" = g.id
      LEFT JOIN 
          "Tag" t ON t.id = gt."tagId"
      WHERE 
          pg."playerId" = $1
          AND pg."deletedAt" IS NULL
          AND g."deletedAt" IS NULL
          AND gt."deletedAt" IS NULL
          AND t."deletedAt" IS NULL
      GROUP BY 
          g.id, pg.rating, pg."reviewBlurb", pg."hoursPlayed", pg."createdAt"
      ORDER BY 
          pg.rating DESC, pg."createdAt" DESC;
    `,
    [playerSearch[0].id]
  );

  return (
    <>
      <div className={styles["wrapper"]}>
        <div className={styles["content"]}>
          <Row>
            <BackButton to="/" text={"Back"} />
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <h1>{player.username}&apos;s Games</h1>
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
            {/* <NoSsr></NoSsr> */}

            <div className={styles["list-filter-controls"]}>
              <ListFilters />
              <span className={"subtext"}>
                {games ? games.length : 0} total games
              </span>
            </div>
            <div className={styles["game-list-wrapper"]}>
              {games &&
                games.map((game, index) => {
                  return (
                    <div className={styles["game-list-item"]} key={game.name}>
                      <div className={styles["game-list-top"]}>
                        <div className={styles["game-list-score"]}>
                          {game.rating}
                          <div
                            className={`${styles["game-extras"]} roww`}
                            style={{
                              fontWeight: 400,
                            }}
                          >
                            #{index + 1}
                          </div>
                        </div>
                        <div className={styles["game-list-info"]}>
                          <Image
                            src={"/api/resource/" + game.artworkS3Key}
                            width={200}
                            height={100}
                            style={{ borderRadius: "4px", objectFit: "cover" }}
                            alt={game.name + " artwork"}
                          />
                          <div className={styles["game-list-info-main"]}>
                            <div className={styles["game-info-1"]}>
                              <div className={styles["game-title"]}>
                                {game.name}
                              </div>
                              {game.storeURL && (
                                <Link
                                  href={game.storeURL}
                                  className={"external-link"}
                                >
                                  {game.storeName}
                                  <ExternalLink size={14} />
                                </Link>
                              )}

                              <div
                                className={"subtext roww"}
                                style={{ fontSize: "14px" }}
                              >
                                Released:{" "}
                                {game.releaseDate
                                  ? getTimeString(game.releaseDate)
                                  : "Unknown"}
                              </div>
                            </div>
                            {game.descriptionShort && (
                              <div className={styles["game-info-description"]}>
                                {game.descriptionShort}
                              </div>
                            )}

                            <div
                              className={`${styles["game-info-2tags"]} roww`}
                            >
                              {game.tags &&
                                game.tags
                                  .slice(0, 7)
                                  .map((tag: any, index: number) => {
                                    return (
                                      <div
                                        className={`badge grey small`}
                                        key={tag}
                                      >
                                        {tag}
                                      </div>
                                    );
                                  })}
                            </div>
                            <div
                              className={`${styles["game-info-3extra"]} roww`}
                            >
                              {game.steamReviewPercent && (
                                <div
                                  className={`${styles["review-badge"]} badge blue small roww`}
                                >
                                  <Star
                                    size={14}
                                    fill={"var(--accent-dark-color)"}
                                  />
                                  {game.steamReviewPercent && (
                                    <span>
                                      Steam: {game.steamReviewPercent}%
                                    </span>
                                  )}

                                  {/* {game.ratings &&
                                  game.ratings.map((rating, index) => {
                                    return (
                                      <span key={rating.name}>
                                        {rating.name}: {rating.rating}%
                                      </span>
                                    );
                                  })} */}
                                </div>
                              )}
                              {/* <div className={`${styles["game-extras"]} roww`}>
                                <Clock size={14} /> {game.hoursPlayed}h
                              </div>
                              <div className={`${styles["game-extras"]} roww`}>
                                <ShoppingCart size={14} />{" "}
                                {game.estimatedCopiesSold}
                              </div> */}
                            </div>
                          </div>
                        </div>
                      </div>
                      {game.reviewBlurb && (
                        <div className={styles["game-list-bottom"]}>
                          <i>&quot;{game.reviewBlurb}&quot;</i>
                        </div>
                      )}
                    </div>
                  );
                })}
              {games.length === 0 && <div>No ratings found. :(</div>}
            </div>
          </Row>
        </div>
      </div>
      <FooterBar />
    </>
  );
}
