import { Check, BookOpen, ExternalLink } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { LogoIcon } from "../components/Icons";
import { ShortenWidget } from "../components/ShortenWidget";

export default function Home() {
  return (
    <div className="w-full flex-col min-h-screen" style={{ display: 'flex' }}>
      {/* Header */}
      <header className="header container">
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span style={{ fontSize: '18px', fontWeight: 700 }}>LinkCut</span>
        </div>
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
      <main className="flex-col items-center w-full" style={{ display: 'flex', flex: 1 }}>
        <div className="container flex-col items-center" style={{ display: 'flex', width: '100%' }}>
          {/* Hero */}
          <div className="text-center" style={{ marginTop: '80px', width: '100%' }}>
            <h1 className="h1-title">
              URL <span className="h1-pill">shortener</span>
            </h1>
            <p className="subhead">
              Single-page, open-source URL shortener. No dashboard, no auth, no multi-page marketing site. Just paste, cut, and share.
            </p>
          </div>

          {/* ShortenWidget */}
          <ShortenWidget />

          {/* Read Docs */}
          <a href="/DOCS/README.md" className="read-docs-btn">
            <BookOpen size={18} />
            <span>Read Docs</span>
          </a>
        </div>

        {/* Feature Strip */}
        <section className="feature-strip">
          <div className="container feature-list">
            <div className="feature-item">
              <Check size={20} className="feature-icon" />
              <span>Free To Use</span>
            </div>
            <div className="feature-item">
              <Check size={20} className="feature-icon" />
              <span>Open Source</span>
            </div>
            <div className="feature-item">
              <Check size={20} className="feature-icon" />
              <span>Fast & Reliable</span>
            </div>
            <div className="feature-item">
              <Check size={20} className="feature-icon" />
              <span>Advanced Analytics</span>
            </div>
          </div>
          <p className="analytics-disclaimer">* Advanced Analytics coming soon</p>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-logo-col">
            <div className="footer-logo">
              <LogoIcon />
              <span>LinkCut</span>
            </div>
            <p className="footer-copy">© {new Date().getFullYear()} LinkCut Inc. All rights reserved.</p>
            <p className="footer-copy" style={{ marginTop: '4px' }}>made with Next.js</p>
          </div>

          <div>
            <h3 className="footer-heading">Product</h3>
            <div className="footer-links">
              <a href="https://github.com/Gaurav5189/url-shortener" className="footer-link">Repo</a>
            </div>
          </div>

          <div>
            <h3 className="footer-heading">Developers</h3>
            <div className="footer-links">
              <a href="/docs" className="footer-link">Docs</a>
            </div>
          </div>

          <div>
            <h3 className="footer-heading">Legal</h3>
            <div className="footer-links">
              <a href="/privacy" className="footer-link">Privacy Policy</a>
              <a href="/terms" className="footer-link">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
