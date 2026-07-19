import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";

import "bootstrap/dist/css/bootstrap.min.css";
import { LightThemeProvider } from "./contexts/LightThemeContext";
import { getInitialLightTheme } from "./contexts/getInitialLightTheme";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Games",
  description: "Your favorite friends' favorite games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = getInitialLightTheme();
  return (
    <html lang="en">
      <body className={inter.className}>
        <LightThemeProvider initialTheme={initialTheme}>
          <NavBar />
          {children}
        </LightThemeProvider>
      </body>
    </html>
  );
}
