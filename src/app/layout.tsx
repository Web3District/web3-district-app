import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GlobalRadio from "@/components/GlobalRadio";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3001")
  ),
  title: "Web4City. The Vibecoders City.",
  description:
    "Web4City. The Vibecoders City.",
  keywords: [
    "github",
    "3d city",
    "developer profile",
    "contributions",
    "pixel art",
    "open source",
    "git visualization",
    "vibecoders",
    "web4city",
  ],
  openGraph: {
    title: "Web4City. The Vibecoders City.",
    description:
      "Web4City. The Vibecoders City.",
    siteName: "Web4City. The Vibecoders City.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: {
      rel: "icon",
      url: "/favicon.ico",
    },
  },
};

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3001");

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Web4City. The Vibecoders City.",
  description:
    "Web4City. The Vibecoders City.",
  url: BASE_URL,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  author: {
    "@type": "Person",
    name: "Web4City. The Vibecoders City.",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg font-pixel text-warm" suppressHydrationWarning>
        {children}
        <GlobalRadio />
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_HIMETRICA_API_KEY && (
          <>
            <Script
              src="https://cdn.himetrica.com/tracker.js"
              data-api-key={process.env.NEXT_PUBLIC_HIMETRICA_API_KEY}
              strategy="afterInteractive"
            />
            <Script
              src="https://cdn.himetrica.com/vitals.js"
              data-api-key={process.env.NEXT_PUBLIC_HIMETRICA_API_KEY}
              strategy="afterInteractive"
            />
            <Script
              src="https://cdn.himetrica.com/errors.js"
              data-api-key={process.env.NEXT_PUBLIC_HIMETRICA_API_KEY}
              strategy="afterInteractive"
            />
          </>
        )}
      </body>
    </html>
  );
}
