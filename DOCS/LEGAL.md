# LinkCut Documentation & Legal

---

## 1. Read Docs (User Guide)

<a id="read-docs"></a>

### What is LinkCut?

LinkCut is a free, open-source URL shortener. No signup, no account — paste a long URL, get a short one.

### Key Rules to Know

* **No Sign-up Required:** Shorten links instantly, without creating an account or logging in.
* **84-Day Lifespan:** Every short link stays active for **84 days (3 months)** from creation. After that, it expires and is permanently purged from the database.
* **Fast Edge Redirects:** Redirects run on the Vercel Edge with Upstash Redis caching, delivering sub-20ms response times globally.
* **HTTP 302 Redirects:** LinkCut uses temporary (302) redirects, so browsers don't cache the destination locally — this allows accurate, anonymous click counting.

### Acceptable Use

LinkCut has no accounts and no login — anyone can generate a link. Because of this, misuse falls back on the community, not on individual users. You may not use LinkCut to shorten links leading to:

* Phishing, scam sites, or financial fraud.
* Malware, spyware, ransomware, or other malicious code.
* Illegal content of any kind.
* Spam campaigns or deceptive/cloaked redirects.

Since LinkCut is open-source and account-free, we can't ban individual users. If the service is used to distribute abusive, dangerous, or illegal content, the response is project-wide: **the project is taken down in full — hosting, redirects, and the public repository are all suspended.** Report abuse via the repository's issue tracker.

---

## 2. Dev Docs (API & Tech Stack)

<a id="dev-docs"></a>

### Architecture Overview

LinkCut uses a hybrid architecture separating high-speed Edge reads from core database writes:

* **Frontend / Edge:** Next.js (App Router) on Vercel Edge Middleware.
* **Cache & Counter:** Redis (Serverless).
* **Backend Engine:** FastAPI.
* **Database:** SQLite.
* **Encoding:** 5-character Base62 short code generated from auto-incrementing integer IDs (~916 million link capacity).

---

### REST API Reference

#### Shorten a URL

Creates a new Base62 short code for any given target URL.

* **Endpoint:** `POST /api/urls/shorten`
* **Content-Type:** `application/json`

**Request Body:**

```json
{
  "url": "https://example.com/very/long/url/path?param=123"
}
```

**Response (`201 Created`):**

```json
{
  "id": 100523,
  "short_code": "00q8L",
  "short_url": "https://yourdomain.com/00q8L",
  "long_url": "https://example.com/very/long/url/path?param=123",
  "created_at": "2026-08-11T01:50:00Z",
  "expires_at": "2026-11-03T01:50:00Z"
}
```

---

#### Redirect Short Code

Looks up and redirects to the target long URL.

* **Endpoint:** `GET /{short_code}`
* **Response:** `302 Found` (redirects to `long_url`)
* **Error Response (`404 Not Found`):** returned if the code doesn't exist or its 84-day lifespan has passed.

---

## 3. Privacy Policy

<a id="privacy"></a>

* **Last Updated:** August 2026

### 1. Information We Collect

LinkCut is built around **Zero PII (Personally Identifiable Information)**:

* **No User Accounts:** We do not collect names, email addresses, passwords, or personal profiles.
* **No Tracking Cookies:** We do not use cross-site tracking cookies or analytics pixels.
* **Link Data:** We store the submitted destination URL, the auto-generated short code, the creation timestamp, and the total click count.

### 2. Click Analytics & Metrics

LinkCut records a click count whenever a short link is visited. Clicks are incremented anonymously at the Edge (`INCR analytics:clicks:{code}`) and synced periodically to the primary database. No IP addresses, device user-agents, or geographic locations are tied to click events.

### 3. Data Retention & Purging

All link records and associated click metrics are automatically deleted **84 days** after creation. We do not maintain historical archives or permanent backups of expired links.

### 4. Legal Disclosure

We do not sell or share link data with third parties for marketing purposes. We may access, preserve, or disclose stored link data only when reasonably necessary to (i) comply with a valid legal request or applicable law, (ii) detect or prevent fraud, abuse, or security incidents, or (iii) protect the rights, property, or safety of LinkCut, its users, or the public. Because click data is anonymous and not tied to any individual, our ability to respond to such requests is limited to what we actually store: the destination URL, short code, timestamp, and click count.

### 5. Aggregated Data

We may use aggregated, anonymized click totals (e.g. overall usage volume) to monitor system health and capacity. This data cannot be traced back to any individual visitor or link creator.

---

## 4. Terms of Service (ToS)

<a id="tos"></a>

* **Last Updated:** August 2026

### 1. Acceptance of Terms

By shortening or visiting a LinkCut link, you agree to these Terms of Service. If you don't agree, don't use the service.

### 2. Prohibited Content

LinkCut has **zero tolerance** for malicious use. You may not shorten links leading to:

* Phishing, scam sites, or financial fraud.
* Malware, spyware, ransomware, or executable exploits.
* Illegal content, spam campaigns, or deceptive redirects.

You also may not use LinkCut to circumvent detection of the above (e.g. chaining LinkCut through another redirect or shortening service to mask a destination), or to infringe on another party's intellectual property.

*We reserve the right to delete any short code violating these rules immediately and without notice.*

### 3. Enforcement

Because LinkCut has no accounts, enforcement can't be scoped to a single user. Violations of this policy may result in individual short codes being removed, or, for sustained or severe misuse, the entire service — hosting, redirects, and repository — being suspended. See the Acceptable Use section of the Read Docs for details.

### 4. Intellectual Property / DMCA

If you believe a LinkCut short link redirects to content that infringes your copyright, report it via the repository's issue tracker with the short code and a description of the infringing content. Confirmed reports will be removed.

### 5. Service Lifespan & Availability

* **84-Day Expiration:** LinkCut is a temporary link shortener. Short codes are guaranteed active for a maximum of 84 days.
* **No Uptime Warranty:** LinkCut is provided **"as is"** and **"as available,"** with no warranties of any kind. We target 99.9% uptime via Edge caching, but we're not liable for temporary interruptions or lost links.

### 6. Limitation of Liability

LinkCut is a free, open-source project provided without charge. To the fullest extent permitted by law, LinkCut and its maintainers are not liable for any damages arising from use of the service, including but not limited to lost links, service downtime, or content accessed through shortened URLs.

### 7. Changes to These Terms

These Terms may be updated periodically. Continued use of LinkCut after changes are published constitutes acceptance of the revised Terms.

---
