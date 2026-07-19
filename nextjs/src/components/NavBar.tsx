import Link from "next/link";
import styles from "./NavBar.module.scss";
import ThemeToggle from "./ThemeToggle";
import AuthControl from "./AuthControl";

export default function NavBar() {
  return (
    <nav className={styles["nav"]}>
      <div className={styles["inner"]}>
        <Link href="/" className={styles["brand"]}>
          Games
        </Link>
        <div className={styles["right"]}>
          <ThemeToggle />
          <AuthControl />
        </div>
      </div>
    </nav>
  );
}
