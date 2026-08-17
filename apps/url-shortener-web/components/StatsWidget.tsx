"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MousePointerClick,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  RotateCw,
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Link2,
} from "lucide-react";

interface URLStats {
  short_code: string;
  original_url: string;
  total_clicks: number;
  created_at: string;
  expires_at: string;
}

export function StatsWidget({ code }: { code: string }) {
  const [stats, setStats] = useState<URLStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copiedShort, setCopiedShort] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);

  const fetchStats = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError("");

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(`${apiUrl}/api/urls/${encodeURIComponent(code)}/stats`, {
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Short URL "${code}" was not found or has expired.`);
          }
          throw new Error("Failed to load link statistics.");
        }

        const data: URLStats = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error("Stats fetch error:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [code]
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const copyToClipboard = async (text: string, isShort: boolean) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        if (isShort) {
          setCopiedShort(true);
          setTimeout(() => setCopiedShort(false), 2000);
        } else {
          setCopiedOriginal(true);
          setTimeout(() => setCopiedOriginal(false), 2000);
        }
        return;
      } catch { }
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      if (isShort) {
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2000);
      } else {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      }
    } catch (e) {
      console.error("Copy fallback failed:", e);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || "");
  const fullShortUrl = `${origin}/${code}`;

  const parseUtcDate = (dateStr?: string): Date | null => {
    if (!dateStr) return null;
    const cleanStr =
      dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr)
        ? dateStr
        : `${dateStr}Z`;
    return new Date(cleanStr);
  };

  const isExpired = stats?.expires_at
    ? (parseUtcDate(stats.expires_at)?.getTime() ?? 0) < Date.now()
    : false;

  const formatDate = (dateStr?: string) => {
    const date = parseUtcDate(dateStr);
    if (!date || isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      // hour: "2-digit",     (optional)
      // minute: "2-digit",   (optional)
      hour12: false,
      // timeZoneName: "short", (optional - using user's default timezone)
    }).format(date);
  };


  const getRelativeExpiry = (expiresAtStr?: string) => {
    const expiry = parseUtcDate(expiresAtStr);
    if (!expiry || isNaN(expiry.getTime())) return "N/A";
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    if (diffMs <= 0) return "Expired";
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `Expires in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };


  return (
    <div style={{ width: "100%", maxWidth: "1000px" }}>
      <div className="stats-outer-card">
        {/* Top Header Row */}
        <div className="stats-top-row">
          <div className="status-row" style={{ marginBottom: 0 }}>
            <div
              className="status-dot"
              style={{
                backgroundColor: isExpired ? "var(--text-tertiary)" : "var(--success)",
              }}
            />
            <span>{isExpired ? "LINK EXPIRED" : "ANALYTICS"}</span>
          </div>

          <button
            onClick={() => fetchStats(true)}
            disabled={isLoading || isRefreshing}
            className="btn-ghost with-label"
            title="Refresh analytics"
            aria-label="Refresh analytics"
          >
            <RotateCw size={16} className={isRefreshing ? "spin-animation" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="stats-loading-box">
            <div className="stats-skeleton-hero" />
            <div className="stats-skeleton-row" />
            <div className="stats-skeleton-grid">
              <div className="stats-skeleton-card" />
              <div className="stats-skeleton-card" />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="stats-error-box">
            <AlertCircle size={40} className="stats-error-icon" />
            <h2 className="stats-error-title">Link Not Found</h2>
            <p className="stats-error-desc">{error}</p>
            <div style={{ marginTop: "24px" }}>
              <Link href="/" className="read-docs-btn" style={{ margin: "0 auto" }}>
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && !error && stats && (
          <div className="stats-content">
            <div className="stats-grid-row">
              {/* Hero Metric: Total Clicks */}
              <div className="stats-metric-hero">
                <div className="stats-metric-label-group">
                  <span className="stats-pill-badge">
                    <ArrowUpRight size={14} />
                    <span>TOTAL CLICKS</span>
                  </span>
                </div>
                <div className="stats-metric-number">
                  {stats.total_clicks.toLocaleString()}
                </div>
              </div>

              {/* Links Section */}
              <div className="stats-links-group">
                {/* Short URL Box */}
                <div className="stats-link-card">
                  <div className="stats-link-header">
                    <span className="stats-link-label">Shortened URL</span>
                    <span className="stats-pill-badge mono-slug">{stats.short_code}</span>
                  </div>
                  <div className="stats-link-body">
                    <a
                      href={fullShortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stats-short-link"
                    >
                      {fullShortUrl}
                    </a>
                    <div className="stats-actions">
                      <button
                        onClick={() => copyToClipboard(fullShortUrl, true)}
                        className="stats-icon-btn"
                        title="Copy short link"
                        aria-label="Copy short link"
                      >
                        {copiedShort ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                      <a
                        href={fullShortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stats-icon-btn"
                        title="Visit short link"
                        aria-label="Visit short link"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Original Target URL Box */}
                <div className="stats-link-card">
                  <div className="stats-link-header">
                    <span className="stats-link-label">Original Destination</span>
                  </div>
                  <div className="stats-link-body">
                    <a
                      href={stats.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stats-original-link"
                    >
                      <Link2 size={16} className="stats-original-icon" />
                      <span className="stats-original-text">{stats.original_url}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="stats-meta-grid">
              {/* Created At */}
              <div className="stats-meta-card">
                <div className="stats-meta-icon-box">
                  <Calendar size={20} className="stats-meta-icon" />
                </div>
                <div className="stats-meta-info">
                  <div className="stats-meta-title">Created</div>
                  <div className="stats-meta-value">{formatDate(stats.created_at)}</div>
                </div>
              </div>

              {/* Expiration */}
              <div className="stats-meta-card">
                <div className="stats-meta-icon-box">
                  <Clock size={20} className="stats-meta-icon" />
                </div>
                <div className="stats-meta-info">
                  <div className="stats-meta-title">Expiration</div>
                  <div className="stats-meta-value">
                    {isExpired ? (
                      <span style={{ color: "var(--text-tertiary)" }}>Expired</span>
                    ) : (
                      <>
                        <span>{getRelativeExpiry(stats.expires_at)}</span>
                        <span className="stats-meta-subvalue">
                          ({formatDate(stats.expires_at)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Retention Policy */}
              <div className="stats-meta-card">
                <div className="stats-meta-icon-box">
                  <ShieldCheck size={20} className="stats-meta-icon" />
                </div>
                <div className="stats-meta-info">
                  <div className="stats-meta-title">Lifespan Policy</div>
                  <div className="stats-meta-value">84-Day Retention</div>
                </div>
              </div>
            </div>

            {/* Bottom Action Footer */}
          </div>
        )}
      </div>

      {/* Shorten Another Link (Outside outer card) */}
      {!isLoading && !error && (
        <div className="stats-footer-actions">
          <Link href="/" className="btn-ghost with-label" style={{ borderRadius: "999px" }}>
            <ArrowLeft size={18} />
            <span>Shorten Another Link</span>
          </Link>
        </div>
      )}
    </div>
  );
}
