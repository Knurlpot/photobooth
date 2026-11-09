import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PB&K",
  description: "PB&K — strike a pose, pick a filter, take the strip home.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
