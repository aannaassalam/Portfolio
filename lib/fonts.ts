import { Geist, Geist_Mono } from "next/font/google";

/**
 * Only the faces the site sets. Every font instantiated here is preloaded on
 * every page whether or not anything uses it, so this file stays as short as
 * the design.
 */
export const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist"
});

export const geist_mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-geist-mono"
});
