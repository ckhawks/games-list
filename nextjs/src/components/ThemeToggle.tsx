"use client";

import { Button } from "react-bootstrap";
import { Moon, Sun } from "react-feather";

import localStyles from "./ThemeToggle.module.scss";
// import styles from "../app/main.module.scss";
import { useTheme } from "@/app/contexts/LightThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className={`button-secondary ${localStyles["wrapper"]}`}
    >
      <Sun
        size={14}
        className={`${localStyles["icon"]} ${
          theme === "light" ? localStyles["active"] : ""
        }`}
      />
      <Moon
        size={14}
        className={`${localStyles["icon"]} ${
          theme !== "light" ? localStyles["active"] : ""
        }`}
      />
      {/* {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'} */}
    </Button>
  );
}
