import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client (only if credentials are provided)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.warn("Failed to initialize Upstash Redis from env vars:", error);
    redis = null;
  }
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icon.svg') ||
    pathname.startsWith('/api/') ||
    pathname === '/stats' ||
    pathname.startsWith('/stats/') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname.startsWith('/opengraph-image') ||
    pathname.startsWith('/twitter-image')
  ) {
    return NextResponse.next();
  }

  // Handle '+' suffix (e.g. /0000D+ -> /stats/0000D)
  if (pathname.endsWith('+')) {
    const rawCode = pathname.slice(1, -1);
    if (rawCode.length > 0) {
      const statsUrl = new URL(`/stats/${encodeURIComponent(rawCode)}`, request.url);
      return NextResponse.redirect(statsUrl, 307);
    }
  }

  const shortCode = pathname.substring(1);

  if (redis) {
    try {
      const cachedUrl = await redis.get<string>(`url:${shortCode}`);
      if (cachedUrl) {
        // Fire non-blocking analytics increment
        event.waitUntil(redis.incr(`analytics:clicks:${shortCode}`));
        return NextResponse.redirect(cachedUrl, 302);
      }
    } catch (error) {
      console.error("Redis Edge Middleware Error:", error);
    }
  }

  // Proxy to FastAPI backend on Cache MISS or error
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Build URL from trusted API origin, then set pathname.
  // NEVER use `new URL(\`/${shortCode}\`, apiUrl)` — that allows SSRF via
  // path-relative resolution if shortCode starts with '/attacker.example'.
  const backendUrl = new URL(apiUrl);
  backendUrl.pathname = `/${shortCode}`;

  try {
    const res = await fetch(backendUrl, {
      method: request.method,
      headers: request.headers,
      redirect: 'manual',
    });

    if (res.status === 404) {
      // Let Next.js router handle the 404 (which will render not-found.tsx)
      return NextResponse.next();
    }

    // Return the backend response directly (e.g., 302 Redirect)
    return res;
  } catch (error) {
    console.error("Backend proxy error:", error);
    // Fallback to rewrite if fetch fails
    return NextResponse.rewrite(backendUrl);
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|stats|robots.txt|sitemap.xml|manifest.webmanifest|opengraph-image|twitter-image).*)',
  ],
};

