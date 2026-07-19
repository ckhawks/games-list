import Link from "next/link";
import styles from "./NavBar.module.scss";
import ThemeToggle from "./ThemeToggle";
import AuthControl from "./AuthControl";

export default function NavBar() {
  return (
    <nav className={styles["nav"]}>
      <Link href="/" className={styles["brand"]}>
        Game Rating Lists
      </Link>
      <div className={styles["right"]}>
        <ThemeToggle />
        <AuthControl />
      </div>
    </nav>
  );
}
