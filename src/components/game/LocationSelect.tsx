'use client';

import Image from 'next/image';
import { ArrowRight, Sun, CloudSun, Timer, Mountain, Snowflake, Waves } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import type { Location } from '@/lib/game/types';

const LOCATIONS: {
  id: Location;
  name: string;
  tag: string;
  image: string;
  difficulty: number;
  facts: { icon: React.ReactNode; text: string }[];
  blurb: string;
  accent: string;
}[] = [
  {
    id: 'moon',
    name: 'Lunar South Pole',
    tag: 'Moon Base Alpha',
    image: '/images/moon-hero.png',
    difficulty: 2,
    facts: [
      { icon: <Sun className="w-4 h-4 text-amber-300" />, text: 'Peak spots get steady sunshine' },
      { icon: <Snowflake className="w-4 h-4 text-sky-300" />, text: 'Crater shadows are freezing dark' },
      { icon: <Mountain className="w-4 h-4 text-violet-300" />, text: 'Water ice hiding in craters' },
    ],
    blurb: 'Close to home! Great sunshine on the peaks — just avoid the shadowy craters.',
    accent: 'from-violet-400/30',
  },
  {
    id: 'mars',
    name: 'Mars Jezero Crater',
    tag: 'Mars Base Jezero',
    image: '/images/mars-hero.png',
    difficulty: 3,
    facts: [
      { icon: <CloudSun className="w-4 h-4 text-orange-300" />, text: 'Dust storms dim your panels' },
      { icon: <Timer className="w-4 h-4 text-emerald-300" />, text: 'Earth is 2–20 light-minutes away' },
      { icon: <Waves className="w-4 h-4 text-cyan-300" />, text: 'Ancient river delta to explore' },
    ],
    blurb: 'The big one! A real explorer world with dust storms and a famous robot neighbor.',
    accent: 'from-orange-400/30',
  },
];

function Difficulty({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${i <= level ? 'bg-amber-300' : 'bg-white/15'}`}
        />
      ))}
    </span>
  );
}

export default function LocationSelect({ onPick }: { onPick: (loc: Location) => void }) {
  return (
    <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl sm:text-4xl text-white title-glow">Choose Your Outpost</h2>
        <p className="mt-2 text-sm text-violet-200/75">Where will you lead the 14-day mission, Commander?</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => {
              sfx.confirm();
              onPick(loc.id);
            }}
            className={`panel group rounded-3xl p-4 text-left hover:-translate-y-1.5 hover:border-violet-300/40 active:scale-[0.98] transition-all bg-gradient-to-b ${loc.accent} to-transparent`}
          >
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-4">
              <Image
                src={loc.image}
                alt={`${loc.name} base illustration`}
                fill
                sizes="(max-width: 768px) 92vw, 460px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-xl text-white">{loc.name}</h3>
              <Difficulty level={loc.difficulty} />
            </div>
            <p className="text-xs uppercase tracking-wider text-violet-300/70 mt-0.5">{loc.tag}</p>
            <p className="mt-2 text-sm text-violet-100/80 min-h-[40px]">{loc.blurb}</p>
            <ul className="mt-3 space-y-1.5">
              {loc.facts.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-violet-100/90">
                  {f.icon}
                  {f.text}
                </li>
              ))}
            </ul>
            <span className="mt-4 inline-flex items-center gap-2 font-display text-sm text-amber-300 group-hover:gap-3 transition-all">
              Build here <ArrowRight className="w-4 h-4" aria-hidden />
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
