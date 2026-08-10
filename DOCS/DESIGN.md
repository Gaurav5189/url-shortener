# LinkCut — Design Spec

Single-page, open-source URL shortener. No dashboard, no auth, no multi-page marketing site — this document reflects the finalized design exactly as built (see `LinkCut-light.png` / `LinkCut-dark.png`).

---

## 1. Color System

### Light Mode
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#F7F8F7` | Page background |
| `--bg-card` | `#FFFFFF` | Shorten widget card |
| `--bg-input` | `#F4F5F4` | URL input field, result row |
| `--bg-footer` | `#FFFFFF` | Footer background |
| `--text-primary` | `#111813` | Headline black, "LinkCut" wordmark |
| `--text-secondary` | `#6B7280` | Subhead paragraph, footer links |
| `--text-tertiary` | `#9CA3AF` | Input placeholder, result sub-URL |
| `--border` | `#E5E7EB` | Input border, footer divider |
| `--accent` | `#4D7C2E` | "shortener" highlight text, ql.link result link |
| `--accent-bg` | `#E4EAD9` | Highlight pill behind "shortener" |
| `--btn-primary-bg` | `#1F3A24` | "CUT" button (dark green) |
| `--btn-primary-fg` | `#FFFFFF` | Shorten button text |
| `--success` | `#22C55E` | "Ready to shorten" status dot |
| `--check-icon` | `#1F3A24` | Feature checkmarks |

### Dark Mode
| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0A0A0A` | Page background |
| `--bg-card` | `#121212` | Shorten widget card |
| `--bg-input` | `#1A1A1A` | URL input field, result row |
| `--bg-footer` | `#0A0A0A` | Footer background |
| `--text-primary` | `#FAFAFA` | Headline white, wordmark |
| `--text-secondary` | `#A1A1AA` | Subhead paragraph, footer links |
| `--text-tertiary` | `#71717A` | Placeholder, sub-URL |
| `--border` | `#27272A` | Input border, footer divider |
| `--accent` | `#8FCB3E` | "shortener" highlight text, result link |
| `--accent-bg` | `#1E2A12` | Highlight pill behind "shortener" |
| `--btn-primary-bg` | `#7FBF2A` | Shorten button (lime green) |
| `--btn-primary-fg` | `#0A0A0A` | Shorten button text |
| `--success` | `#22C55E` | Status dot (same both modes) |
| `--check-icon` | `#7FBF2A` | Feature checkmarks |

**Brand color shift by mode:** light mode uses a muted forest green (`#4D7C2E` / `#1F3A24`); dark mode shifts to a brighter lime (`#8FCB3E` / `#7FBF2A`) for contrast against near-black. This is a deliberate hue shift, not just a lightness adjustment — treat as two distinct accent tokens, not one token with opacity/brightness applied.

Theme toggle: present in header. Simple sun/moon icon button, placed left of the GitHub icon (i.e. `[Theme toggle] [GitHub icon] [Repo →]`, right-aligned as a group). Icon-only, no label, `~32px` tap target, ghost/transparent style matching header — no border or background until hover/focus (hover: subtle `--bg-input` circle behind icon). Toggles between light/dark instantly (no transition delay needed beyond the standard 150ms color-token transition).

---

## 2. Typography

- **Font family:** Rounded/geometric sans (e.g. `Poppins`, `Baloo 2`, or similar rounded grotesk based on the letterforms in "URL shortener") for the H1; `Inter` or `system-ui` for body copy, nav, and UI text. Monospace (`JetBrains Mono` / `Menlo`) for the result URL (`ql.link/example`).
- **Scale:**
  | Role | Size (approx) | Weight | Notes |
  |---|---|---|---|
  | Hero H1 | ~64px | 800 (extrabold) | Two-tone: "URL" in `--text-primary`, "shortener" in `--accent` on `--accent-bg` pill |
  | Subhead | ~20px | 400 | Centered, 3 lines, max-width ~560px |
  | Card status label | ~13px | 600, uppercase, letter-spaced | "READY TO CUT" |
  | Input text | ~17px | 400 | |
  | Button label | ~14px | 700, uppercase, letter-spaced | "CUT" |
  | Result link (mono) | ~18px | 600 | `ql.link/example` |
  | Result sub-URL (mono) | ~14px | 400 | `--text-tertiary` |
  | Feature list items | ~15px | 500 | |
  | Footer headers | ~15px | 700 | "Product" / "Company" / "Legal & Support" |
  | Footer links | ~14px | 400 | |
  | Wordmark ("LinkCut") | ~18px | 700 | Header + footer |

- H1 is center-aligned, single line, tight letter-spacing.
- The "shortener" word sits in a rounded pill (`border-radius: 12–16px`, generous horizontal padding ~24px, vertical padding ~8px) — this is the signature visual motif of the hero.

---

## 3. Page Structure (as built — single page, top to bottom)

1. **Header** — logo mark (interlocking link icon) + "LinkCut" wordmark, left-aligned. Right-aligned group: theme toggle icon (sun/moon) + GitHub icon + "Repo →" link, in that order. No nav links, no login/signup, not sticky. Transparent background matching page bg.
2. **Hero**
   - H1: "URL **shortener**" (second word highlighted in accent pill)
   - Subhead: 3-line description, centered, muted text
   - No badge/eyebrow pill above H1 in the final version (dropped from earlier draft)
   - No dual CTA — single interactive widget replaces CTA buttons
3. **Shorten widget (card)**
   - Status row: green dot + "READY TO CUT" label (uppercase, tracked)
   - Input row: link icon + placeholder `https://very-long-url.com/example/path...` + solid "CUT" button (uppercase label), inline, right-aligned button
   - Result row (below, in same card): shortened link in accent-colored mono (`ql.link/example`) + original truncated URL beneath in muted mono, right-aligned copy icon
   - Card: white/near-black bg, `border-radius: 20–24px`, soft shadow, generous internal padding (~32px)
4. **"Read Docs" button** — centered below the card, outline/ghost style, book icon + label, standalone (not part of hero CTA row)
5. **Feature checklist strip** — 4 items in a single horizontal row, centered, each: green checkmark icon + label (`Free To Use`, `Open Source`, `[Placeholder]`, `Advanced Analytics*`). Sits in its own full-width band with top/bottom hairline dividers, subtly tinted background.
6. **Footer** — 4-column layout:
   - Col 1: logo + "LinkCut" wordmark, copyright line (`© 2024 LinkCut Inc. All rights reserved.`)
   - Col 2 "Product": Features, Pricing, Integrations
   - Col 3 "Company": About Us, Careers, Blog
   - Col 4 "Legal & Support": Privacy Policy, Terms of Service, Help Center
   - White/near-black background, hairline top border separating from feature strip

**Sections explicitly cut from earlier drafts:** announcement bar, badge/eyebrow above H1, dual hero CTAs, logo cloud, manifesto block, bento feature grid, tabbed walkthrough, integrations grid, audience tabs, stats band, testimonials. This is intentionally a single-purpose tool page, not a SaaS marketing site.

---

## 4. Components

- **Header logo mark:** two interlocking rounded-link shapes (chain-link icon), colored in accent green in both modes.
- **Shorten input:** `border-radius: 12px`, 1px border (`--border`), link icon prefix in muted gray, placeholder text in `--text-tertiary`.
- **Shorten button:** solid fill (`--btn-primary-bg`), white/near-black text, `border-radius: 10px`, medium padding (~14px × 28px), no icon.
- **Result row:** nested inside the same card, `border-radius: 12px`, `background: --bg-input`, link text in accent mono, copy icon top-right in muted gray, hover state not specified (assume subtle bg lighten).
- **Read Docs button:** outline style, 1px border, `border-radius: 10px`, book icon + label, transparent/card-matched background, centered standalone.
- **Feature checklist item:** circular checkmark icon (accent-colored outline + check), label in medium-weight text, horizontal flex with icon-label gap ~8px.
- **Footer columns:** header label in bold, links stacked with ~12px vertical gap, all links in `--text-secondary`, no visible hover treatment specified (assume color shift to `--text-primary` on hover).

---

## 5. Layout & Spacing

- Content max-width: ~1200–1280px, centered, generous side margins.
- Hero-to-widget vertical rhythm: large gap (~80–100px) between header and H1; H1 to subhead ~24px; subhead to card ~64px.
- Card is narrower than full content width (~900px), centered.
- Feature strip is full-bleed background with centered content, functions as a section divider between hero and footer.
- Footer top padding notably larger than other section gaps, separated by hairline border from feature strip.

---

## 6. Responsive Notes (not shown in exports, inferred)

- Breakpoints: `640 / 768 / 1024px`.
- Header: logo left, GitHub/Repo right — likely stays single row even on mobile given its simplicity; wordmark may shrink.
- H1 wraps to two lines on narrow viewports ("URL" / "shortener" pill stacked).
- Widget card goes full-width with reduced padding; Shorten button may drop to full-width below input on small screens.
- Feature checklist: 4 items likely wrap to 2×2 grid or scroll horizontally below ~640px.
- Footer: 4 columns collapse to 2×2 or stacked single column below ~768px.

---

## 7. Assets Needed

- [x] Logo mark (chain-link icon, works in accent green on both light/dark bg)
- [ ] Favicon + OG image derived from logo mark
- [ ] GitHub icon (outline, monochrome, tintable)
- [ ] Link icon (input prefix), copy icon (result row), book icon (Read Docs) — all monochrome/tintable SVGs
- [ ] Checkmark icon (circular, outline style) for feature strip

---

## 8. Open Items / Placeholders

- `[Placeholder]` feature label needs a real value before ship.
- `Advanced Analytics*` has an asterisk with no footnote visible — either add disclaimer text or remove the asterisk.
- Footer "Product" column (Features, Pricing, Integrations) and "Company" column (About Us, Careers, Blog) reference pages/sections that don't exist on this single-page site — confirm whether these are anchor links to be built, external links, or should be trimmed to match the site's actual scope (e.g. cut to just Repo, Docs, Privacy, Terms).
