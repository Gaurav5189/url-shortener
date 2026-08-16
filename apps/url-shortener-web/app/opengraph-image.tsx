import { ImageResponse } from 'next/og';

export const alt = 'LinkCut — Fast, Reliable & Free URL Shortener';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0e110e',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Subtle decorative background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '250px',
            width: '700px',
            height: '400px',
            background: 'rgba(77, 124, 46, 0.15)',
            borderRadius: '9999px',
            filter: 'blur(80px)',
          }}
        />

        {/* Brand Logo Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#4D7C2E',
              color: '#ffffff',
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '46px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#ffffff',
            }}
          >
            Link<span style={{ color: '#7bc44e' }}>Cut</span>
          </span>
        </div>

        {/* Hero Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '68px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
            }}
          >
            URL
          </span>
          <span
            style={{
              fontSize: '68px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: 'rgba(77, 124, 46, 0.25)',
              color: '#7bc44e',
              border: '2px solid rgba(123, 196, 78, 0.45)',
              padding: '2px 24px',
              borderRadius: '9999px',
            }}
          >
            shortener
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '24px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '840px',
            margin: '0 0 44px 0',
            lineHeight: 1.4,
          }}
        >
          Fast &amp; Reliable, single-page, open-source URL shortener with sub-20ms edge redirects.
        </p>

        {/* Feature Strip Pills */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
          }}
        >
          {[
            'Sub-20ms Redirects',
            'Real-Time Analytics',
            'Zero Login Required',
            'Open Source',
          ].map((feature) => (
            <div
              key={feature}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '100px',
                padding: '10px 22px',
                fontSize: '17px',
                fontWeight: 600,
                color: '#e4e4e7',
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
