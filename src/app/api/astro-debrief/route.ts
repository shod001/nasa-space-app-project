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
  const place = body.location === 'mars' ? 'Mars Jezero Crater' : 'the Lunar South Pole';
  return `Mission complete, Commander! You brought home ${body.science ?? 0} science points from ${place} with your crew's health at ${body.health ?? 100}%. ${
    body.flareDay
      ? `Remember the solar flare on Day ${body.flareDay}? Real astronauts rely on NASA's DONKI system for exactly that kind of warning!`
      : 'Every choice you made balanced power, safety, and discovery — that is real flight-director thinking!'
  } Fun fact: the Sun is so big that 1.3 million Earths could fit inside it. Rest well — the next outpost is waiting!`;
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
            'You are A.S.T.R.O., the friendly robot co-pilot in the kids game "Outpost Director: Moon & Mars". You write warm, encouraging mission debriefs for children aged 7-12. Use simple vocabulary, at most 3 short sentences plus one fun real space fact, and at most one emoji. Never exceed 90 words.',
        },
        {
          role: 'user',
          content: `Write my mission debrief. Location: ${body.location === 'mars' ? 'Mars Jezero Crater' : 'Lunar South Pole'}. Science earned: ${body.science ?? 0} points. Crew health: ${body.health ?? 100}%. Crew morale: ${body.morale ?? 80}%. Days served: ${body.daysSurvived ?? 14}. Badges earned: ${(body.badges ?? []).join(', ') || 'none'}. ${body.flareDay ? `The player handled a solar flare on day ${body.flareDay}.` : ''}`,
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
