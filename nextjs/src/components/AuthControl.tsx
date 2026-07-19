import Link from "next/link";
import { getSession } from "@/util/auth/session";
import { getSessionPlayer } from "@/util/auth/ownership";
import { db } from "@/util/db/db";
import styles from "./AuthControl.module.scss";

export default async function AuthControl() {
  const session = await getSession();

  let user: { personaName: string | null; avatarUrl: string | null } | null = null;
  let myPlayer: { username: string } | null = null;
  if (session) {
    const rows = await db(
      `SELECT "personaName", "avatarUrl" FROM "AppUser" WHERE "id" = $1`,
      [session.userId]
    );
    user = rows[0] ?? null;
    myPlayer = await getSessionPlayer();
  }

  return (
    <div className={styles["auth-control"]}>
      {session ? (
        <div className={styles["signed-in"]}>
          {myPlayer && (
            <Link
              href={"/" + myPlayer.username.toLowerCase()}
              className={styles["my-list"]}
            >
              My list
            </Link>
          )}
          {user?.avatarUrl && (
            // Steam-hosted avatar; plain img avoids next/image remote config.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles["avatar"]}
              src={user.avatarUrl}
              width={28}
              height={28}
              alt=""
            />
          )}
          <span className={styles["name"]}>{user?.personaName ?? "Signed in"}</span>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className={styles["link-button"]}>
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <a className={styles["signin"]} href="/api/auth/steam/login">
          Sign in through Steam
        </a>
      )}
    </div>
  );
}
