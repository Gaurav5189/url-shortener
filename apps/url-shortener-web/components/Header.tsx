import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LogoIcon } from "./LogoIcon";

export function Header() {
  return (
    <header className="header container">
      <Link href="/" className="flex items-center gap-2" style={{ textDecoration: "none" }}>
        <LogoIcon className="text-accent" width={32} height={32} />
        <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
          LinkCut
        </span>
      </Link>
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
  );
}
