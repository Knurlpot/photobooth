import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const display = Poppins({
  weight: ["800", "900"],
  subsets: ["latin"],
  variable: "--font-display",
});

const body = Poppins({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "photobooth",
  description: "by knurlpot — strike a pose, pick a filter, take the strip home.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
