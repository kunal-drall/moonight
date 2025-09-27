import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moonight Protocol - Privacy-First Lending Circles",
  description: "Anonymous lending circles with zero-knowledge proofs on Midnight blockchain",
  keywords: ["privacy", "lending", "zero-knowledge", "blockchain", "defi", "midnight"],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-midnight-950 text-midnight-50 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
