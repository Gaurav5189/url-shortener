import { Check, BookOpen, Search, Copy } from "lucide-react";
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
        <section className="section-container">
          <h2 className="section-heading">
            Recent <span className="section-pill">Links</span>
          </h2>
          <p className="section-subhead">Your most recently shortened URLs.</p>

          <div className="recent-links-card">
            <div className="recent-link-header">
              <div className="recent-link-th">Short Link</div>
              <div className="recent-link-th">Destination</div>
              <div></div>
            </div>

            <div className="recent-links-empty">
              No recent links stored.
            </div>
          </div>
        </section>

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
        <section className="section-container text-center">
          <h2 className="section-heading">
            Link <span className="section-pill">Analytics</span>
          </h2>
          <p className="section-subhead">
            Search by link or short code to see detailed performance metrics.<br />
            You can also add '+' sign at the end of link to open its analytics.
          </p>

          <div className="analytics-search-card">
            <Search size={20} className="analytics-search-icon" />
            <input
              type="text"
              placeholder="Enter short code or URL ..."
              className="analytics-search-input"
            />
            <button className="btn-primary analytics-search-btn">
              SEARCH
            </button>
          </div>
        </section>

        {/* Read Docs */}
        <div style={{ marginBottom: "64px", display: "flex", justifyContent: "center", width: "100%" }}>
          <a href="/DOCS/README.md" className="read-docs-btn" style={{ marginTop: 0 }}>
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
