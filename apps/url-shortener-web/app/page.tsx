import { Check, BookOpen } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ShortenWidget } from "../components/ShortenWidget";

export default function Home() {
  return (
    <div className="w-full flex-col min-h-screen" style={{ display: "flex" }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-col items-center w-full" style={{ display: "flex", flex: 1 }}>
        <div className="container flex-col items-center" style={{ display: "flex", width: "100%" }}>
          {/* Hero */}
          <div className="text-center" style={{ marginTop: "80px", width: "100%" }}>
            <h1 className="h1-title">
              URL <span className="h1-pill">shortener</span>
            </h1>
            <p className="subhead">
              Welcome to LinkCut - single-page, open-source URL shortener. No dashboard, no auth, no multi-page marketing site. Just paste, cut, and share.
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
      <Footer />
    </div>
  );
}
