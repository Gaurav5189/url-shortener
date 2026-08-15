"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

export interface RecentLink {
  shortCode: string;
  shortUrl: string;
  longUrl: string;
  createdAt: string;
}

const STORAGE_KEY = "url_shortener_recent_links";

function isRecentLink(value: unknown): value is RecentLink {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as RecentLink).shortCode === "string" &&
    typeof (value as RecentLink).shortUrl === "string" &&
    typeof (value as RecentLink).longUrl === "string" &&
    typeof (value as RecentLink).createdAt === "string"
  );
}

export const getRecentLinks = (): RecentLink[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed.filter(isRecentLink) : [];
  } catch {
    return [];
  }
};

export const addRecentLink = (link: RecentLink) => {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentLinks();

    // Remove duplicates if the same code exists
    const filtered = existing.filter((item) => item.shortCode !== link.shortCode);

    // Prepend new link and cap at 5 items
    const updated = [link, ...filtered].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify listeners only after successful write
    window.dispatchEvent(new Event('recentLinksUpdated'));
  } catch {
    // Recent links must not affect the URL shortening operation.
  }
};

export function RecentLinksWidget() {
  const [links, setLinks] = useState<RecentLink[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadLinks = () => {
    setLinks(getRecentLinks());
  };

  useEffect(() => {
    // Initial load
    loadLinks();

    // Listen for updates from other components
    window.addEventListener('recentLinksUpdated', loadLinks);

    return () => {
      window.removeEventListener('recentLinksUpdated', loadLinks);
    };
  }, []);

  const handleCopy = async (shortUrl: string, code: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shortUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shortUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  return (
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

        {links.length === 0 ? (
          <div className="recent-links-empty">
            No recent links stored.
          </div>
        ) : (
          <div className="recent-links-list">
            {links.map((link) => (
              <div className="recent-link-row" key={link.shortCode}>
                <div className="recent-link-short">
                  <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                    {link.shortUrl}
                  </a>
                </div>
                <div className="recent-link-dest" title={link.longUrl}>
                  {link.longUrl}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="recent-link-copy"
                    onClick={() => handleCopy(link.shortUrl, link.shortCode)}
                    aria-label="Copy to clipboard"
                  >
                    {copiedCode === link.shortCode ? (
                      <Check size={16} className="text-success" style={{ color: 'var(--success)' }} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
