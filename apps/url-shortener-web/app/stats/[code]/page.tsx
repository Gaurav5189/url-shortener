import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { LogoIcon } from "../../../components/LogoIcon";
import { StatsWidget } from "../../../components/StatsWidget";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Analytics for /${code} — LinkCut`,
    description: `Real-time click statistics and performance analytics for shortened URL /${code}.`,
  };
}

export default async function StatsPage({ params }: Props) {
  const { code } = await params;

  return (
    <div className="w-full flex-col min-h-screen" style={{ display: "flex" }}>
      {/* Header */}
      <header className="header container">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <LogoIcon className="text-accent" width={32} height={32} />
          <span style={{ fontSize: "18px", fontWeight: 700 }}>LinkCut</span>
        </Link>
        <div className="header-right">
          <ThemeToggle />
          <a
            href="https://github.com/Gaurav5189/url-shortener"
            target="_blank"
            rel="noopener noreferrer"
            className="repo-link"
          >
            <ExternalLink size={20} />
            <span>Repo &rarr;</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-col items-center w-full" style={{ display: "flex", flex: 1 }}>
        <div
          className="container flex-col items-center"
          style={{ display: "flex", width: "100%" }}
        >
          {/* Hero */}
          <div className="text-center" style={{ marginTop: "64px", marginBottom: "40px", width: "100%" }}>
            <h1 className="h1-title">
              Link <span className="h1-pill">analytics</span>
            </h1>
            <p className="subhead" style={{ marginBottom: "0px", marginTop: "16px" }}>
              Real-time performance metrics and click tracking for short link{" "}
              <code
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                  fontWeight: 600,
                }}
              >
                /{code}
              </code>
              .
            </p>
          </div>

          {/* Stats Widget */}
          <StatsWidget code={code} />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-logo-col">
            <div className="footer-logo">
              <LogoIcon className="text-accent" width={24} height={24} />
              <span>LinkCut</span>
            </div>
            <p className="footer-copy">
              © {new Date().getFullYear()} LinkCut Inc. All rights reserved.
            </p>
            <p className="footer-copy" style={{ marginTop: "4px" }}>
              Built with Next.js & Upstash Redis
            </p>
          </div>

          <div>
            <h2 className="footer-heading">Developers</h2>
            <div className="footer-links">
              <Link href="/" className="footer-link">
                Home
              </Link>
              <a
                href="https://github.com/Gaurav5189/url-shortener"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                GitHub Repo
              </a>
            </div>
          </div>

          <div>
            <h2 className="footer-heading">Features</h2>
            <div className="footer-links">
              <span className="footer-link" style={{ cursor: "default" }}>
                Sub-20ms Redirects
              </span>
              <span className="footer-link" style={{ cursor: "default" }}>
                Real-Time Analytics
              </span>
              <span className="footer-link" style={{ cursor: "default" }}>
                84-Day Lifespan
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
