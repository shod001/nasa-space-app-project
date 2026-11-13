import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';

interface DebriefInput {
  location?: 'moon' | 'mars';
  science?: number;
  health?: number;
  morale?: number;
  daysSurvived?: number;
  badges?: string[];
  flareDay?: number | null;
}

function fallback(body: DebriefInput): string {
  const place = body.location === 'mars' ? 'Mars' : 'the Moon';
  return `Mission done, Commander! You brought home ${body.science ?? 0} science points from ${place} with your crew at ${body.health ?? 100}% health. ${
    body.flareDay
      ? `Remember the solar flare on Day ${body.flareDay}? Real astronauts use NASA's DONKI alerts exactly like that!`
      : 'You balanced power, safety, and science. Real astronaut thinking!'
  } Fun fact: 1.3 million Earths could fit inside the Sun!`;
}

export async function POST(req: Request) {
  let body: DebriefInput = {};
  try {
    body = (await req.json()) as DebriefInput;
  } catch {
    /* use defaults */
  }

  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content:
            'You are A.S.T.R.O., the friendly robot co-pilot in the kids game "Outpost Director: Moon & Mars". Write a warm, happy mission debrief for children aged 7-10. Use VERY easy words that a 7-year-old knows. Use short sentences. At most 4 sentences and 60 words total. Include one fun real space fact. Use at most one emoji.',
        },
        {
          role: 'user',
          content: `Write my mission debrief. Location: ${body.location === 'mars' ? 'Mars, Jezero Crater' : 'the Moon, south pole'}. Science earned: ${body.science ?? 0} points. Crew health: ${body.health ?? 100}%. Crew happiness: ${body.morale ?? 80}%. Days served: ${body.daysSurvived ?? 14}. Medals earned: ${(body.badges ?? []).join(', ') || 'none'}. ${body.flareDay ? `The player safely handled a solar flare on day ${body.flareDay}.` : ''}`,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const message = completion.choices[0]?.message?.content?.trim();
    if (!message) throw new Error('empty LLM response');

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ message: fallback(body) });
  }
}
