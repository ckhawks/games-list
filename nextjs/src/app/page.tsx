import styles from "./page.module.scss";
import { Col, Row } from "react-bootstrap";
import { ArrowRight, Link as LinkIcon } from "react-feather";
import Link from "next/link";
import { db } from "@/util/db/db";
import FooterBar from "@/components/FooterBar";

export const revalidate = 60;

export default async function HomePlayerList() {
  const playersUnsorted = await db(
    `
      SELECT * FROM "Player"
    `
  );

  if (playersUnsorted.length === 0) {
    return <>Error getting players.</>;
  }

  const players = playersUnsorted.sort((a, b) =>
    a.displayOrder < b.displayOrder ? 1 : -1
  );

  return (
    <>
      <div className={styles["wrapper"]}>
        <div className={styles["content"]}>
          <Row>
            <Col lg={6}>
              <h1>The Games</h1>
              <p>
                Ever wondered what your favorite set of friends enjoys playing?
                Ever wonder what our top games of all time are? You&apos;ve come
                to the right place!
                <br />
                <br />
                Dive in by selecting someone below.
              </p>
            </Col>
            <Col lg={6}>
              <div className={`${styles["callout"]} col`}>
                <h4>Why&apos;d you make this?</h4>
                <div>
                  I wanted to build a handy resource to share that allows people
                  to learn about the games I enjoy.
                </div>
                <div>- Stellaric</div>
              </div>
            </Col>
          </Row>
          <div className={styles["home-player-rows"]}>
            <Link
              href={"/global"}
              className={`${styles["home-player-row"]} ${styles["home-player-row-global"]}`}
            >
              <div>
                <LinkIcon size={14} style={{ marginRight: "8px" }} />
                View the average rankings of everyone&apos;s lists
              </div>
              {/* <div className={styles["home-player-row-identifier"]}>
                <img
                  className={styles["avatar"]}
                  width={48}
                  height={48}
                  src={"/api/resource/" + player.avatarS3Key}
                  alt={player.username}
                />
              </div> */}
              {/* <div className={styles["home-player-row-tags"]}>
                {player.tags &&
                  player.tags.map((tag: any) => (
                    <div className={"badge grey"} key={tag.name}>
                      {tag.name}
                    </div>
                  ))}
              </div> */}
              <div className={styles["home-player-row-arrow"]}>
                <ArrowRight size={24} />
              </div>
            </Link>
            {players &&
              players.map((player) => {
                return (
                  <Link
                    href={"/" + player.username.toLowerCase()}
                    className={styles["home-player-row"]}
                    key={player.username}
                  >
                    <div className={styles["home-player-row-identifier"]}>
                      <img
                        className={styles["avatar"]}
                        width={48}
                        height={48}
                        src={"/api/resource/" + player.avatarS3Key}
                        alt={player.username}
                      />
                      <h2>{player.username}</h2>
                    </div>
                    <div className={styles["home-player-row-tags"]}>
                      {player.tags &&
                        player.tags.map((tag: any) => (
                          <div className={"badge grey"} key={tag.name}>
                            {tag.name}
                          </div>
                        ))}
                    </div>
                    <div className={styles["home-player-row-arrow"]}>
                      <ArrowRight size={24} />
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
      <FooterBar />
    </>
  );
}
