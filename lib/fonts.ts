import localFont from "next/font/local";

// Self-hosted (no runtime request to Google Fonts — faster, more private,
// and works with zero external network access at build & request time).
export const inter = localFont({
  src: "../assets/fonts/Inter.ttf",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const manrope = localFont({
  src: "../assets/fonts/Manrope.ttf",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

export const tajawal = localFont({
  src: [
    { path: "../assets/fonts/Tajawal-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/Tajawal-Medium.ttf", weight: "500", style: "normal" },
    { path: "../assets/fonts/Tajawal-Bold.ttf", weight: "700", style: "normal" },
    { path: "../assets/fonts/Tajawal-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-tajawal",
  display: "swap",
});
