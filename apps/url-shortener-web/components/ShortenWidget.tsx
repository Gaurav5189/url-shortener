"use client";

import { useState } from "react";
import { Link2, Copy, Check } from "lucide-react";

const BeanEaterLoader = () => (
  <div className="loader-container">
    <div className="loader-inner">
      <div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
);

export function ShortenWidget() {
  const [longUrl, setLongUrl] = useState("");
  const [lastLongUrl, setLastLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl) return;

    setIsLoading(true);
    setError("");
    setShortUrl("");
    setCopied(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/urls/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: longUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const detail = Array.isArray(errorData.detail)
          ? errorData.detail[0]?.msg || "Invalid URL"
          : errorData.detail || "Failed to shorten URL";
        throw new Error(detail);
      }

      const data = await res.json();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ql.link';
      setShortUrl(`${origin}/${data.short_code}`);
      setLastLongUrl(longUrl);
      setLongUrl("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while shortening the URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard. Please copy manually.");
    }
  };

  return (
    <div className="card">
      <div className="status-row">
        <div className="status-dot"></div>
        <span>Ready to cut</span>
      </div>

      <form onSubmit={handleSubmit} className="input-row">
        <div className="input-row-inner">
          <Link2 className="input-icon" size={20} />
          <input
            type="url"
            aria-label="Destination URL"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://very-long-url.com/example/path..."
            className="url-input"
            required
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isLoading || !longUrl}
        >
          {isLoading ? <BeanEaterLoader /> : "Cut"}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '8px', fontSize: '14px' }}>{error}</p>}

      {shortUrl && (
        <div className="result-row">
          <div className="result-info">
            <span className="result-link">{shortUrl}</span>
            <span className="result-sub">{lastLongUrl}</span>
          </div>
          <button 
            type="button" 
            onClick={handleCopy} 
            className="copy-btn"
            aria-label="Copy to clipboard"
          >
            {copied ? <Check size={20} className="text-success" style={{ color: 'var(--success)' }} /> : <Copy size={20} />}
          </button>
        </div>
      )}
    </div>
  );
}
