import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOBZENOX Lead Engine",
  description: "Find, research and qualify business prospects across Nigeria. Review every email before sending.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}