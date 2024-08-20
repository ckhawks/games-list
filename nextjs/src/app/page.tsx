import Image from "next/image";
import styles from "./page.module.scss";
import ThemeToggle from "@/components/ThemeToggle";
import { Col, Row } from "react-bootstrap";
import { ArrowRight } from "react-feather";
import Link from "next/link";

const players = [
  {
    username: "Stellaric",
    avatarS3Key: "/avatars/stellaric.png",
    tags: [
      {
        name: "Automation",
      },
      {
        name: "Base-building",
      },
      {
        name: "Competitive",
      },
      {
        name: "First-person Shooter",
      },
    ],
  },
  {
    username: "Nrohgnol",
    avatarS3Key: "/avatars/nrohgnol.png",
    tags: [
      {
        name: "Automation",
      },
      {
        name: "Base-building",
      },
      {
        name: "Competitive",
      },
      {
        name: "First-person Shooter",
      },
    ],
  },
  {
    username: "DeadNotSleeping",
    avatarS3Key: "/avatars/deadnotsleeping.png",
    tags: [
      {
        name: "Automation",
      },
      {
        name: "Base-building",
      },
      {
        name: "Competitive",
      },
      {
        name: "First-person Shooter",
      },
    ],
  },
];

export default function HomePlayerList() {
  return (
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
              <ThemeToggle />
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
          {players &&
            players.map((player) => {
              return (
                <Link
                  href={"/" + player.username.toLowerCase()}
                  className={styles["home-player-row"]}
                  key={player.username}
                >
                  <div className={styles["home-player-row-identifier"]}>
                    <Image
                      className={styles["avatar"]}
                      width={48}
                      height={48}
                      src={player.avatarS3Key}
                      alt={player.username}
                    />
                    <h2>{player.username}</h2>
                  </div>
                  <div className={styles["home-player-row-tags"]}>
                    {player.tags &&
                      player.tags.map((tag) => (
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
  );
}
