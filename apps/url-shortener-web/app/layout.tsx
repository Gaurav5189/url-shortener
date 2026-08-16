import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "LinkCut — Fast, Reliable & Free URL Shortener",
    template: "%s | LinkCut",
  },
  description:
    "LinkCut is a fast, reliable, open-source URL shortener with sub-20ms edge redirects, real-time analytics, and zero login required. Paste, cut, and share instantly.",
  keywords: [
    "url shortener",
    "link shortener",
    "short url",
    "shorten link",
    "custom short links",
    "link analytics",
    "open source url shortener",
    "free url shortener",
    "fast link redirect",
    "LinkCut",
    "LinkCut url shortener",
    "LinkCut app",
    "LinkCut link shortener",
    "LinkCut url shortener app",
  ],
  authors: [{ name: "Gaurav5189", url: "https://github.com/Gaurav5189" }],
  creator: "Gaurav5189",
  publisher: "Gaurav5189",
  applicationName: "LinkCut",
  generator: "Next.js",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "LinkCut",
    title: "LinkCut — Fast, Reliable & Free URL Shortener",
    description:
      "Fast, reliable, open-source URL shortener with sub-20ms edge redirects and real-time analytics. No login required.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "LinkCut — Fast, Reliable & Free URL Shortener",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkCut — Fast, Reliable & Free URL Shortener",
    description:
      "Fast, reliable, open-source URL shortener with sub-20ms edge redirects and real-time analytics.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "gSG7Y5CUhuFZxtlMZfX6Vws8zZT6DRSxcJMdZyjwM_E",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LinkCut",
    url: siteUrl || "/",
    description:
      "Fast & Reliable, single-page, open-source URL shortener with sub-20ms edge redirects and real-time analytics.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Instant URL Shortening",
      "Sub-20ms Edge Redirection",
      "Real-time Click Analytics",
      "No Login or Authentication Required",
      "100% Open Source",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var localTheme = window.localStorage.getItem('theme');
                  var theme = localTheme || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} antialiased`}
        style={{
          // Override the CSS variables with the actual next/font references if desired,
          // but we already use them via standard variables in globals.css.
          // Let's just define them here so globals.css can pick them up.
          '--font-h1': 'var(--font-poppins)',
          '--font-body': 'var(--font-inter)',
          '--font-mono': 'var(--font-jetbrains-mono)',
        } as React.CSSProperties}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
