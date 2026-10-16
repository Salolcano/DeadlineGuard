import type { Metadata, Viewport } from "next";
import "@genlayer/transaction-kit-react/styles.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "DeadlineGuard · SLA escrow settled by GenLayer",
  description:
    "Lock payment in escrow against a plain-English SLA. GenLayer validators read the live status page and release or refund the funds.",
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = { themeColor: "#faf8f3" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
