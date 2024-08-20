"use server";

import { Image, Row } from "react-bootstrap";
import styles from "../page.module.scss";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Link as LinkIcon,
  ShoppingCart,
  Star,
} from "react-feather";

const player = {
  username: "Stellaric",
  listLastUpdatedAt: "August 19, 2024",
  profileBlurb: `Welcome to my games page. I&apos;m pretty specific with my games, but there&apos;s two, maybe three main categories that they fall under:
  <ul><li>Sandbox-y building crafting games</li>
  <li>Competitive fast mechanical-gameplay games</li>
  <li>Casual fun with friends party-esque games</li>
  </ul>
  
  I&apos;m also pretty bad at categorizing and rating and trying to be objective... so take my numbers with a grain of salt. If I have a lot of hours ins something, I probably enjoy it.`,
  games: [
    {
      name: "Factorio",
      rating: 10,
      storeURL: "",
      storeName: "Steam",
      releaseDate: "March 23, 2020",
      artworkS3Key: "games/factorio.jpg",
      estimatedCopiesSold: 4080000,
      hoursPlayed: 603,
      reviewBlurb:
        "I enjoyed this game a lot. I love doing the factories and making the bots and cutting down the trees with my flamethrower. It’s pretty awesome honestly.",
      tags: [
        {
          name: "Automation",
        },
        {
          name: "Base-building",
        },
        {
          name: "Crafting",
        },
        {
          name: "Management",
        },
      ],
      ratings: [
        {
          name: "Steam",
          rating: 96,
        },
        {
          name: "Metacritic",
          rating: 56,
        },
      ],
    },
  ],
};

export default async function PlayerListPage({
  params,
}: {
  params: { username: string };
}) {
  if (params.username === null) {
    return <>404</>;
  }

  const usernameLowered = params.username.toLowerCase();

  // search DB for username lower()
  return (
    <div className={styles["wrapper"]}>
      <div className={styles["content"]}>
        <Row>
          <BackButton to="/" text={"Back"} />
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1>{player.username}&apos;s Games</h1>
            <span style={{ color: "var(--sub-text-color)" }}>
              Last updated {player.listLastUpdatedAt}
            </span>
          </div>
          <p>{player.profileBlurb}</p>
          <div className={styles["list-filter-controls"]}>Filters</div>
          <div className={styles["game-list-wrapper"]}>
            {player.games &&
              player.games.map((game, index) => {
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
                          src={"/" + game.artworkS3Key}
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
                            <Link
                              href={game.storeURL}
                              className={"external-link"}
                            >
                              {game.storeName}
                              <ExternalLink size={14} />
                            </Link>
                            <div
                              className={"subtext roww"}
                              style={{ fontSize: "14px" }}
                            >
                              Released: {game.releaseDate}
                            </div>
                          </div>
                          <div className={`${styles["game-info-2tags"]} roww`}>
                            {game.tags &&
                              game.tags.map((tag, index) => {
                                return (
                                  <div
                                    className={`badge grey small`}
                                    key={tag.name}
                                  >
                                    {tag.name}
                                  </div>
                                );
                              })}
                          </div>
                          <div className={`${styles["game-info-3extra"]} roww`}>
                            <div
                              className={`${styles["review-badge"]} badge blue small roww`}
                            >
                              <Star
                                size={14}
                                fill={"var(--accent-dark-color)"}
                              />
                              {game.ratings &&
                                game.ratings.map((rating, index) => {
                                  return (
                                    <span key={rating.name}>
                                      {rating.name}: {rating.rating}%
                                    </span>
                                  );
                                })}
                            </div>
                            <div className={`${styles["game-extras"]} roww`}>
                              <Clock size={14} /> {game.hoursPlayed}h
                            </div>
                            <div className={`${styles["game-extras"]} roww`}>
                              <ShoppingCart size={14} />{" "}
                              {game.estimatedCopiesSold}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles["game-list-bottom"]}>
                      <i>&quot;{game.reviewBlurb}&quot;</i>
                    </div>
                  </div>
                );
              })}
          </div>
        </Row>
      </div>
    </div>
  );

  //   const list = ['h', 'e', 'l', 'l', 'o'];
  // list.map((currElement, index) => {
  //   console.log("The current iteration is: " + index);
  //   console.log("The current element is: " + currElement);
  //   console.log("\n");
  //   return currElement; //equivalent to list[index]
  // });
}
