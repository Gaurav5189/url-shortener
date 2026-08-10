import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client.
let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch (error) {
  console.warn("Failed to initialize Upstash Redis from env vars.");
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
  
  // Build URL from trusted API origin, then set pathname.
  // NEVER use `new URL(\`/${shortCode}\`, apiUrl)` — that allows SSRF via
  // path-relative resolution if shortCode starts with '/attacker.example'.
  const backendUrl = new URL(apiUrl);
  backendUrl.pathname = `/${shortCode}`;

  return NextResponse.rewrite(backendUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
