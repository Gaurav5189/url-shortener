"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function AnalyticsSearchWidget() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const val = query.trim();
    if (!val) return;

    let shortCode = val;

    // Remove any trailing plus sign used for shortcut routing
    if (shortCode.endsWith('+')) {
      shortCode = shortCode.slice(0, -1);
    }

    // If it's a full URL, extract the last part
    try {
      if (val.startsWith("http://") || val.startsWith("https://")) {
        const urlObj = new URL(val);
        // get the path without leading slash
        const path = urlObj.pathname.replace(/^\/+/, "");
        if (path) {
          shortCode = path;
          // Clean trailing plus again if it was in the path
          if (shortCode.endsWith('+')) {
            shortCode = shortCode.slice(0, -1);
          }
        }
      }
    } catch {
      // Not a valid URL, treat as raw short code
    }

    // Only allow alphanumeric to prevent weird routing or injection, and max length
    // Base62 short codes are alphanumeric
    const sanitizedCode = shortCode.replace(/[^a-zA-Z0-9]/g, "");

    if (sanitizedCode) {
      router.push(`/stats/${sanitizedCode}`);
    }
  };

  return (
    <section className="section-container text-center">
      <h2 className="section-heading">
        Link <span className="section-pill">Analytics</span>
      </h2>
      <p className="section-subhead">
        Search by link or short code to see detailed performance metrics.<br />
        You can also add '+' sign at the end of shortened link to open its analytics.
      </p>

      <form onSubmit={handleSearch} className="analytics-search-card">
        <Search size={20} className="analytics-search-icon" />
        <input
          type="text"
          placeholder="Enter short code or URL ..."
          className="analytics-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary analytics-search-btn" disabled={!query.trim()}>
          SEARCH
        </button>
      </form>
    </section>
  );
}
