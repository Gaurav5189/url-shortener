import Link from "next/link";
import { LogoIcon } from "./LogoIcon";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-logo-col">
          <Link href="/" className="footer-logo" style={{ textDecoration: "none" }}>
            <LogoIcon className="text-accent" width={24} height={24} />
            <span>LinkCut</span>
          </Link>
          <p className="footer-copy">
            © {new Date().getFullYear()} LinkCut Inc. All rights reserved.
          </p>
          <p className="footer-copy" style={{ marginTop: "4px" }}>
            Built with Next.js
          </p>
        </div>

        <div>
          <h2 className="footer-heading">Developers</h2>
          <div className="footer-links">
            <Link href="/dev-docs" className="footer-link">
              Docs
            </Link>
            <a
              href="https://github.com/Gaurav5189/url-shortener"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Repo
            </a>
          </div>
        </div>

        <div>
          <h2 className="footer-heading">Legal</h2>
          <div className="footer-links">
            <Link href="/privacy" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="footer-link">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
