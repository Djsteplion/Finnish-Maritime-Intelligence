import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://fmi-dashboard.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Finnish Maritime Intelligence | Real-Time AIS Vessel Tracking",
    template: "%s | Finnish Maritime Intelligence",
  },
  description:
    "A real-time maritime intelligence platform for Finnish waters, powered by live AIS data from Fintraffic / Digitraffic. Track vessels, ports, icebreaker operations and fleet analytics.",
  applicationName: "Finnish Maritime Intelligence",
  keywords: [
    "Finnish maritime intelligence",
    "AIS vessel tracking",
    "Finland vessel tracking",
    "maritime intelligence dashboard",
    "Digitraffic AIS",
    "Finnish waters",
    "Baltic Sea vessel tracking",
    "icebreaker operations",
    "maritime analytics",
  ],
  authors: [{ name: "Finnish Maritime Intelligence" }],
  creator: "Finnish Maritime Intelligence",
  publisher: "Finnish Maritime Intelligence",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Finnish Maritime Intelligence",
    title: "Finnish Maritime Intelligence | Real-Time AIS Vessel Tracking",
    description:
      "Explore live vessel movement, port activity, icebreaker operations and fleet analytics across Finnish waters.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Finnish Maritime Intelligence live vessel dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finnish Maritime Intelligence",
    description:
      "Real-time maritime intelligence for Finnish waters, powered by live AIS data.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#07111e",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Finnish Maritime Intelligence",
  url: siteUrl,
  description:
    "A real-time maritime intelligence dashboard using live AIS data to track vessels, ports, icebreaker operations and fleet analytics across Finnish waters.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  isAccessibleForFree: true,
  creator: {
    "@type": "Person",
    name: "Finnish Maritime Intelligence",
  },
  dataSource: {
    "@type": "Dataset",
    name: "Digitraffic Marine Traffic API",
    url: "https://www.digitraffic.fi/en/marine-traffic/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

