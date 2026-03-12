import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "next-query-sync Docs",
  description: "Documentation and live examples for next-query-sync, a lightweight type-safe URL search params state manager for Next.js.",
  openGraph: {
    title: "next-query-sync Docs",
    description: "Documentation and live examples for next-query-sync.",
    url: siteUrl,
    siteName: "next-query-sync Docs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "next-query-sync Docs",
    description: "Documentation and live examples for next-query-sync.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
