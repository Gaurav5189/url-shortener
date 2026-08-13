import { NextResponse } from 'next/server';

// Ensure this runs on Vercel Edge for maximum reliability and zero cold-start delay
export const runtime = 'edge';

export async function GET(request: Request) {
  // Verify request is authorized (cron secret must match)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/cron/purge-expired`;

  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend returned status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Purge expired cron failed:', error);
    return NextResponse.json({ error: 'Purge failed' }, { status: 500 });
  }
}
