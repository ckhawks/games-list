import { Image } from "react-bootstrap";
import Link from "next/link";
import { ExternalLink, Star } from "react-feather";
import styles from "@/app/page.module.scss";
import { getTimeString } from "@/util/getTimeString";
import GameEditor from "./GameEditor";

// Presentational game card, shared by the static list (non-owners) and the
// draggable owner list. `rank` is the 1-based position shown as "#N".
export type GameRow = {
  playerGameId: string;
  name: string;
  rating: number | null;
  order: number | null;
  storeURL: string | null;
  storeName: string | null;
  releaseDate: string | Date | null;
  descriptionShort: string | null;
  artworkS3Key: string | null;
  reviewBlurb: string | null;
  hoursPlayed: number | null;
  steamReviewPercent: number | null;
  tags: string[] | null;
};

export default function GameCard({
  game,
  rank,
  isOwner,
}: {
  game: GameRow;
  rank: number;
  isOwner: boolean;
}) {
  return (
    <div className={styles["game-list-item"]}>
      <div className={styles["game-list-top"]}>
        <div className={styles["game-list-score"]}>
          {game.rating}
          <div
            className={`${styles["game-extras"]} roww`}
            style={{ fontWeight: 400 }}
          >
            #{rank}
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
              <div className={styles["game-title"]}>{game.name}</div>
              {game.storeURL && (
                <Link href={game.storeURL} className={"external-link"}>
                  {game.storeName}
                  <ExternalLink size={14} />
                </Link>
              )}
              <div
                className={"subtext roww"}
                style={{ fontSize: "14px" }}
              >
                Released:{" "}
                {game.releaseDate ? getTimeString(game.releaseDate) : "Unknown"}
              </div>
            </div>
            {game.descriptionShort && (
              <div className={styles["game-info-description"]}>
                {game.descriptionShort}
              </div>
            )}
            <div className={`${styles["game-info-2tags"]} roww`}>
              {game.tags &&
                game.tags.slice(0, 7).map((tag) => (
                  <div className={`badge grey small`} key={tag}>
                    {tag}
                  </div>
                ))}
            </div>
            <div className={`${styles["game-info-3extra"]} roww`}>
              {game.steamReviewPercent && (
                <div
                  className={`${styles["review-badge"]} badge blue small roww`}
                >
                  <Star size={14} fill={"var(--accent-dark-color)"} />
                  <span>Steam: {game.steamReviewPercent}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {game.reviewBlurb && (
        <div className={styles["game-list-bottom"]}>
          <i>&quot;{game.reviewBlurb}&quot;</i>
        </div>
      )}
      {isOwner && (
        <div className={styles["game-list-bottom"]}>
          <GameEditor
            playerGameId={game.playerGameId}
            rating={game.rating}
            hoursPlayed={game.hoursPlayed}
            reviewBlurb={game.reviewBlurb}
          />
        </div>
      )}
    </div>
  );
}
