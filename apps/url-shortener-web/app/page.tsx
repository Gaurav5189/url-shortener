import { Check, BookOpen, Search, Copy } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ShortenWidget } from "../components/ShortenWidget";
import { RecentLinksWidget } from "../components/RecentLinksWidget";
import { AnalyticsSearchWidget } from "../components/AnalyticsSearchWidget";

export default function Home() {
  return (
    <div className="w-full flex-col min-h-screen" style={{ display: "flex" }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-col items-center w-full" style={{ display: "flex", flex: 1 }}>
        <div className="container flex-col items-center" style={{ display: "flex", width: "100%", marginBottom: "64px" }}>
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
        </div>

        {/* Recent Links Section */}
        <RecentLinksWidget />

        {/* Feature Strip */}
        <section className="feature-strip" style={{ marginBottom: "64px" }}>
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
              <span>Fast and Reliable</span>
            </div>
            <div className="feature-item">
              <Check size={20} className="feature-icon" />
              <span>Advanced Analytics</span>
            </div>
          </div>
        </section>

        {/* Link Analytics Search Section */}
        <AnalyticsSearchWidget />

        {/* Read Docs */}
        <div style={{ marginBottom: "64px", display: "flex", justifyContent: "center", width: "100%" }}>
          <a href="/docs" className="read-docs-btn" style={{ marginTop: 0 }}>
            <BookOpen size={18} />
            <span>Read Docs</span>
          </a>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
