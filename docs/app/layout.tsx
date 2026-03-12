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
  title: "nuqschim Docs",
  description: "Documentation and live examples for nuqschim, a lightweight type-safe URL search params state manager for Next.js.",
  openGraph: {
    title: "nuqschim Docs",
    description: "Documentation and live examples for nuqschim.",
    url: siteUrl,
    siteName: "nuqschim Docs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nuqschim Docs",
    description: "Documentation and live examples for nuqschim.",
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
