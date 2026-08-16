import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LinkCut — URL Shortener',
    short_name: 'LinkCut',
    description: 'Fast & Reliable, single-page, open-source URL shortener with sub-20ms edge redirects.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e110e',
    theme_color: '#4D7C2E',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
