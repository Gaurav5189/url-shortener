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

export const metadata: Metadata = {
  title: "LinkCut — URL Shortener",
  description: "Fast & Reliable, single-page, open-source URL shortener.",
  verification: {
    google: "gSG7Y5CUhuFZxtlMZfX6Vws8zZT6DRSxcJMdZyjwM_E",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
