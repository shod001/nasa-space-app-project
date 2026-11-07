import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface FeedEvent {
  type: string;
  cls: string;
  time: string;
  note: string;
}

const DEMO_EVENTS: FeedEvent[] = [
  { type: 'Solar Flare', cls: 'M1.2', time: '2024-05-14T09:42:00Z', note: 'Moderate flare from Active Region AR3664 — astronauts notified.' },
  { type: 'Coronal Mass Ejection', cls: '890 km/s', time: '2024-05-11T03:15:00Z', note: 'CME observed by SOHO/LASCO; glancing blow predicted.' },
  { type: 'Solar Flare', cls: 'X2.8', time: '2024-05-10T06:20:00Z', note: 'Strong flare — radiation storm protocols recommended.' },
];

/**
 * Live DONKI feed (NASA Open APIs). Falls back to a clearly-labeled demo feed
 * when the network is unavailable so the game keeps working offline.
 */
export async function GET() {
  const key = process.env.NASA_API_KEY || 'DEMO_KEY';
  const start = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);

  try {
    const [flrRes, cmeRes] = await Promise.all([
      fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${start}&api_key=${key}`, {
        signal: AbortSignal.timeout(3500),
        cache: 'no-store',
      }),
      fetch(`https://api.nasa.gov/DONKI/CME?startDate=${start}&api_key=${key}`, {
        signal: AbortSignal.timeout(3500),
        cache: 'no-store',
      }),
    ]);

    if (!flrRes.ok) throw new Error(`DONKI FLR ${flrRes.status}`);

    const flr = (await flrRes.json()) as Array<{ classType?: string; beginTime?: string }>;
    const cme = cmeRes.ok
      ? ((await cmeRes.json()) as Array<{ startTime?: string; cmeAnalyticals?: Array<{ speed?: number }> }>)
      : [];

    const events: FeedEvent[] = [
      ...flr.slice(0, 4).map((f) => ({
        type: 'Solar Flare',
        cls: f.classType ?? '—',
        time: f.beginTime ?? '',
        note: `Class ${f.classType ?? '?'} flare detected by GOES satellites.`,
      })),
      ...cme.slice(0, 2).map((c) => ({
        type: 'Coronal Mass Ejection',
        cls: c.cmeAnalyticals?.[0]?.speed ? `${Math.round(c.cmeAnalyticals[0].speed!)} km/s` : '—',
        time: c.startTime ?? '',
        note: 'CME observed by SOHO/LASCO coronagraphs.',
      })),
    ];

    return NextResponse.json({ live: true, source: 'NASA DONKI', events });
  } catch {
    return NextResponse.json({ live: false, source: 'DONKI Demo Feed', events: DEMO_EVENTS });
  }
}
