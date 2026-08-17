import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { LogoIcon } from "../../components/LogoIcon";
import { Footer } from "../../components/Footer";

export const metadata = {
  title: "Documentation & Legal | LinkCut",
  description: "Read the LinkCut documentation, developer API, privacy policy, and terms of service.",
};

export default function DocsPage() {
  return (
    <div className="w-full flex-col min-h-screen" style={{ display: "flex", backgroundColor: "#FAFAFA", color: "#171717" }}>
      <header className="header container" style={{ paddingTop: "24px", paddingBottom: "24px" }}>
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
          <LogoIcon width={32} height={32} style={{ color: "#4D7C2E" }} />
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#111813" }}>
            LinkCut
          </span>
        </Link>
        <div className="header-right">
          <a
            href="https://github.com/Gaurav5189/url-shortener"
            target="_blank"
            rel="noopener noreferrer"
            className="repo-link"
            style={{ color: "#111813", textDecoration: "none" }}
          >
            <ExternalLink size={20} />
            <span>Repo &rarr;</span>
          </a>
        </div>
      </header>
      <main style={{ flex: 1, display: "flex", justifyContent: "center", width: "100%", padding: "64px 16px" }}>
        <article style={{ maxWidth: "768px", width: "100%", lineHeight: "1.7", fontFamily: "var(--font-inter)" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "2rem", fontFamily: "var(--font-poppins)", color: "#111813" }}>LinkCut Documentation & Legal</h1>

          <hr style={{ border: "0", height: "1px", backgroundColor: "#E5E7EB", marginBottom: "2rem" }} />

          <section id="read-docs" style={{ marginBottom: "3rem", scrollMarginTop: "100px" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem", fontFamily: "var(--font-poppins)", color: "#111813" }}>1. Read Docs (User Guide)</h2>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>What is LinkCut?</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>LinkCut is a free, open-source URL shortener. No signup, no account — paste a long URL, get a short one.</p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>Key Rules to Know</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1rem", color: "#4B5563" }}>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>No Sign-up Required:</strong> Shorten links instantly, without creating an account or logging in.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>84-Day Lifespan:</strong> Every short link stays active for <strong>84 days (3 months)</strong> from creation. After that, it expires and is permanently purged from the database.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Fast Edge Redirects:</strong> Redirects run on the Vercel Edge with Upstash Redis caching, delivering sub-20ms response times globally.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>HTTP 302 Redirects:</strong> LinkCut uses temporary (302) redirects, so browsers don't cache the destination locally — this allows accurate, anonymous click counting.</li>
            </ul>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>Acceptable Use</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              LinkCut has no accounts and no login — anyone can generate a link. Because of this, misuse falls back on the community, not on individual users. You may not use LinkCut to shorten links leading to:
            </p>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1rem", color: "#4B5563" }}>
              <li style={{ marginBottom: "0.5rem" }}>Phishing, scam sites, or financial fraud.</li>
              <li style={{ marginBottom: "0.5rem" }}>Malware, spyware, ransomware, or other malicious code.</li>
              <li style={{ marginBottom: "0.5rem" }}>Illegal content of any kind.</li>
              <li style={{ marginBottom: "0.5rem" }}>Spam campaigns or deceptive/cloaked redirects.</li>
            </ul>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              Since LinkCut is open-source and account-free, we can't ban individual users. If the service is used to distribute abusive, dangerous, or illegal content, the response is project-wide: <strong style={{ color: "#111813" }}>the project is taken down in full — hosting, redirects, and the public repository are all suspended.</strong> Report abuse via the repository's issue tracker.
            </p>
          </section>

          <hr style={{ border: "0", height: "1px", backgroundColor: "#E5E7EB", marginBottom: "2rem" }} />

          <section id="dev-docs" style={{ marginBottom: "3rem", scrollMarginTop: "100px" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem", fontFamily: "var(--font-poppins)", color: "#111813" }}>2. Dev Docs (API & Tech Stack)</h2>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>Architecture Overview</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>LinkCut uses a hybrid architecture separating high-speed Edge reads from core database writes:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1rem", color: "#4B5563" }}>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Frontend / Edge:</strong> Next.js (App Router) on Vercel Edge Middleware.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Cache & Counter:</strong> Redis (Serverless).</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Backend Engine:</strong> FastAPI</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Database:</strong> SQLite</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Encoding:</strong> 5-character Base62 short code generated from auto-incrementing integer IDs (~916 million link capacity).</li>
            </ul>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "2rem", marginBottom: "1rem", color: "#111813" }}>REST API Reference</h3>

            <div style={{ backgroundColor: "#FFFFFF", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #E5E7EB" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#111813" }}>Shorten a URL</h4>
              <p style={{ marginBottom: "1rem", color: "#4B5563" }}>Creates a new Base62 short code for any given target URL.</p>
              <ul style={{ listStyleType: "none", marginBottom: "1rem", color: "#4B5563", padding: 0 }}>
                <li><strong style={{ color: "#111813" }}>Endpoint:</strong> <code style={{ backgroundColor: "#F3F4F6", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>POST /api/urls/shorten</code></li>
                <li><strong style={{ color: "#111813" }}>Content-Type:</strong> <code style={{ backgroundColor: "#F3F4F6", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>application/json</code></li>
              </ul>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#111813" }}>Request Body:</p>
              <pre style={{ backgroundColor: "#111827", color: "#F9FAFB", padding: "1rem", borderRadius: "6px", overflowX: "auto", fontFamily: "var(--font-mono)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {`{
  "url": "https://example.com/very/long/url/path?param=123"
}`}
              </pre>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#111813" }}>Response (<code>201 Created</code>):</p>
              <pre style={{ backgroundColor: "#111827", color: "#F9FAFB", padding: "1rem", borderRadius: "6px", overflowX: "auto", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                {`{
  "id": 100523,
  "short_code": "00q8L",
  "short_url": "https://yourdomain.com/00q8L",
  "long_url": "https://example.com/very/long/url/path?param=123",
  "created_at": "2026-08-11T01:50:00Z",
  "expires_at": "2026-11-03T01:50:00Z"
}`}
              </pre>
            </div>

            <div style={{ backgroundColor: "#FFFFFF", padding: "1.5rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #E5E7EB" }}>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem", color: "#111813" }}>Redirect Short Code</h4>
              <p style={{ marginBottom: "1rem", color: "#4B5563" }}>Looks up and redirects to the target long URL.</p>
              <ul style={{ listStyleType: "none", marginBottom: "1rem", color: "#4B5563", padding: 0 }}>
                <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Endpoint:</strong> <code style={{ backgroundColor: "#F3F4F6", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>GET /&#123;short_code&#125;</code></li>
                <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Response:</strong> <code>302 Found</code> (redirects to <code>long_url</code>)</li>
                <li><strong style={{ color: "#111813" }}>Error Response (<code>404 Not Found</code>):</strong> returned if the code doesn't exist or its 84-day lifespan has passed.</li>
              </ul>
            </div>
          </section>

          <hr style={{ border: "0", height: "1px", backgroundColor: "#E5E7EB", marginBottom: "2rem" }} />

          <section id="privacy" style={{ marginBottom: "3rem", scrollMarginTop: "100px" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-poppins)", color: "#111813" }}>3. Privacy Policy</h2>
            <p style={{ color: "#6B7280", fontStyle: "italic", marginBottom: "1.5rem" }}>Last Updated: August 2026</p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>1. Information We Collect</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>LinkCut is built around <strong style={{ color: "#111813" }}>Zero PII (Personally Identifiable Information)</strong>:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1rem", color: "#4B5563" }}>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>No User Accounts:</strong> We do not collect names, email addresses, passwords, or personal profiles.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>No Tracking Cookies:</strong> We do not use cross-site tracking cookies or analytics pixels.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>Link Data:</strong> We store the submitted destination URL, the auto-generated short code, the creation timestamp, and the total click count.</li>
            </ul>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>2. Click Analytics & Metrics</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>LinkCut records a click count whenever a short link is visited. Clicks are incremented anonymously at the Edge (<code style={{ backgroundColor: "#F3F4F6", padding: "0.2rem 0.4rem", borderRadius: "4px" }}>INCR analytics:clicks:&#123;code&#125;</code>) and synced periodically to the primary database. No IP addresses, device user-agents, or geographic locations are tied to click events.</p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>3. Data Retention & Purging</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>All link records and associated click metrics are automatically deleted <strong style={{ color: "#111813" }}>84 days</strong> after creation. We do not maintain historical archives or permanent backups of expired links.</p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>4. Legal Disclosure</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              We do not sell or share link data with third parties for marketing purposes. We may access, preserve, or disclose stored link data only when reasonably necessary to (i) comply with a valid legal request or applicable law, (ii) detect or prevent fraud, abuse, or security incidents, or (iii) protect the rights, property, or safety of LinkCut, its users, or the public. Because click data is anonymous and not tied to any individual, our ability to respond to such requests is limited to what we actually store: the destination URL, short code, timestamp, and click count.
            </p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>5. Aggregated Data</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              We may use aggregated, anonymized click totals (e.g. overall usage volume) to monitor system health and capacity. This data cannot be traced back to any individual visitor or link creator.
            </p>
          </section>

          <hr style={{ border: "0", height: "1px", backgroundColor: "#E5E7EB", marginBottom: "2rem" }} />

          <section id="tos" style={{ marginBottom: "3rem", scrollMarginTop: "100px" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem", fontFamily: "var(--font-poppins)", color: "#111813" }}>4. Terms of Service (ToS)</h2>
            <p style={{ color: "#6B7280", fontStyle: "italic", marginBottom: "1.5rem" }}>Last Updated: August 2026</p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>1. Acceptance of Terms</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>By shortening or visiting a LinkCut link, you agree to these Terms of Service. If you don't agree, don't use the service.</p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>2. Prohibited Content</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>LinkCut has <strong style={{ color: "#111813" }}>zero tolerance</strong> for malicious use. You may not shorten links leading to:</p>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1rem", color: "#4B5563" }}>
              <li style={{ marginBottom: "0.5rem" }}>Phishing, scam sites, or financial fraud.</li>
              <li style={{ marginBottom: "0.5rem" }}>Malware, spyware, ransomware, or executable exploits.</li>
              <li style={{ marginBottom: "0.5rem" }}>Illegal content, spam campaigns, or deceptive redirects.</li>
            </ul>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              You also may not use LinkCut to circumvent detection of the above (e.g. chaining LinkCut through another redirect or shortening service to mask a destination), or to infringe on another party&apos;s intellectual property.
            </p>
            <p style={{ fontStyle: "italic", marginBottom: "1rem", color: "#4B5563" }}>We reserve the right to delete any short code violating these rules immediately and without notice.</p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>3. Enforcement</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              Because LinkCut has no accounts, enforcement can&apos;t be scoped to a single user. Violations of this policy may result in individual short codes being removed, or, for sustained or severe misuse, the entire service — hosting, redirects, and repository — being suspended. See the Acceptable Use section of the Read Docs for details.
            </p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>4. Intellectual Property / DMCA</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              If you believe a LinkCut short link redirects to content that infringes your copyright, report it via the repository&apos;s issue tracker with the short code and a description of the infringing content. Confirmed reports will be removed.
            </p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>5. Service Lifespan & Availability</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: "1rem", color: "#4B5563" }}>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>84-Day Expiration:</strong> LinkCut is a temporary link shortener. Short codes are guaranteed active for a maximum of 84 days.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong style={{ color: "#111813" }}>No Uptime Warranty:</strong> LinkCut is provided <strong style={{ color: "#111813" }}>&quot;as is&quot;</strong> and <strong style={{ color: "#111813" }}>&quot;as available,&quot;</strong> with no warranties of any kind. We target 99.9% uptime via Edge caching, but we&apos;re not liable for temporary interruptions or lost links.</li>
            </ul>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>6. Limitation of Liability</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              LinkCut is a free, open-source project provided without charge. To the fullest extent permitted by law, LinkCut and its maintainers are not liable for any damages arising from use of the service, including but not limited to lost links, service downtime, or content accessed through shortened URLs.
            </p>

            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem", color: "#111813" }}>7. Changes to These Terms</h3>
            <p style={{ marginBottom: "1rem", color: "#4B5563" }}>
              These Terms may be updated periodically. Continued use of LinkCut after changes are published constitutes acceptance of the revised Terms.
            </p>
          </section>

        </article>
      </main>
      <div style={{
        "--bg-footer": "#FFFFFF",
        "--border": "#E5E7EB",
        "--text-primary": "#111813",
        "--text-secondary": "#4B5563",
        "--accent": "#4D7C2E"
      } as React.CSSProperties}>
        <Footer />
      </div>
    </div>
  );
}
