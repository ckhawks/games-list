import { Image, Row } from "react-bootstrap";
import styles from "../page.module.scss";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { ExternalLink, List, Star } from "react-feather";
import { db } from "@/util/db/db";
import FooterBar from "@/components/FooterBar";
import { ListFilters } from "@/components/ListFilters";
import { Metadata } from "next";

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
  return {
    title: `Combined Ratings`,
  };
}

export default async function CombinedListPage() {
  const games = await db(
    `
    WITH RaterInfo AS (
      SELECT 
          pg."gameId",
          jsonb_agg(
              jsonb_build_object('playerId', p.id, 'username', p.username, 'rating', pg.rating)
              ORDER BY pg.rating DESC, p.username ASC
          ) AS raters,
          AVG(pg.rating) AS avg_rating,
          COUNT(DISTINCT p.id) AS rater_count
      FROM 
          "PlayerGame" pg
      JOIN 
          "Player" p ON pg."playerId" = p.id
      WHERE 
          pg."deletedAt" IS NULL
          AND p."deletedAt" IS NULL
      GROUP BY 
          pg."gameId"
  )
  SELECT 
      g.id,
      g.name,
      g."storeURL",
      g."storeName",
      g."releaseDate",
      g."descriptionShort",
      ri.avg_rating AS "averageRating",
      g."artworkS3Key",
      g."steamReviewPercent",
      ARRAY_AGG(DISTINCT t.name) AS "tags",
      ri.rater_count AS "ratingCount",
      ri.raters AS "raters"
  FROM 
      "Game" g
  JOIN 
      RaterInfo ri ON g.id = ri."gameId"
  LEFT JOIN 
      "GameTag" gt ON gt."gameId" = g.id
  LEFT JOIN 
      "Tag" t ON t.id = gt."tagId"
  WHERE 
      g."deletedAt" IS NULL
      AND gt."deletedAt" IS NULL
      AND t."deletedAt" IS NULL
  GROUP BY 
      g.id, ri.avg_rating, ri.rater_count, ri.raters
  HAVING 
      ri.rater_count > 1
  ORDER BY 
      ri.avg_rating DESC, g."releaseDate" DESC;
    `,
    []
  );

  return (
    <>
      <div className={styles["wrapper"]}>
        <div className={styles["content"]}>
          <Row>
            <BackButton to="/" text={"Back"} />
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <h1>Combined Rankings</h1>
              {/* <span style={{ color: "var(--sub-text-color)" }}>
                Last updated {getTimeString(player.listLastUpdatedAt)}
              </span> */}
            </div>
            <p>Only including games with at least 2 people rating them</p>
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
                          {Math.round(game.averageRating)}
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
                              <div
                                className={`${styles["review-badge"]} badge grey outline small roww`}
                              >
                                <List
                                  size={14}
                                  fill={"var(--accent-dark-color)"}
                                />
                                {game.raters &&
                                  // @ts-ignore
                                  game.raters.map((player) => {
                                    return (
                                      <span key={player.playerId}>
                                        {player.username}: {player.rating}
                                      </span>
                                    );
                                  })}

                                {/* {game.ratings &&
                                  game.ratings.map((rating, index) => {
                                    return (
                                      <span key={rating.name}>
                                        {rating.name}: {rating.rating}%
                                      </span>
                                    );
                                  })} */}
                              </div>
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
            </div>
          </Row>
        </div>
      </div>
      <FooterBar />
    </>
  );

  //   const list = ['h', 'e', 'l', 'l', 'o'];
  // list.map((currElement, index) => {
  //   console.log("The current iteration is: " + index);
  //   console.log("The current element is: " + currElement);
  //   console.log("\n");
  //   return currElement; //equivalent to list[index]
  // });
}
