import "./globals-v2.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instant Mechanic Operations",
  description: "Live vehicle service operations dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
