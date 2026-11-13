'use client';

import Image from 'next/image';
import { ArrowRight, Sun, CloudSun, Mountain, Snowflake, Timer, Waves } from 'lucide-react';
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
    name: 'The Moon',
    tag: 'Moon Base Alpha',
    image: '/images/moon-hero.png',
    difficulty: 2,
    facts: [
      { icon: <Sun className="h-4 w-4 text-amber-300" />, text: 'Lots of sunshine on high spots' },
      { icon: <Snowflake className="h-4 w-4 text-sky-300" />, text: 'Crater shadows are very cold' },
      { icon: <Mountain className="h-4 w-4 text-violet-300" />, text: 'Water ice hides in craters' },
    ],
    blurb: 'Close to Earth! Sunny peaks — just stay away from the dark, cold craters.',
    accent: 'from-violet-400/30',
  },
  {
    id: 'mars',
    name: 'Mars',
    tag: 'Mars Base Jezero',
    image: '/images/mars-hero.png',
    difficulty: 3,
    facts: [
      { icon: <CloudSun className="h-4 w-4 text-orange-300" />, text: 'Dust storms dim your panels' },
      { icon: <Timer className="h-4 w-4 text-emerald-300" />, text: 'A Mars day is called a "sol"' },
      { icon: <Waves className="h-4 w-4 text-cyan-300" />, text: 'An old river to explore' },
    ],
    blurb: 'The big trip! Dust storms and a robot neighbor named Perseverance.',
    accent: 'from-orange-400/30',
  },
];

function Difficulty({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Difficulty ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={`h-3 w-3 rounded-full ${i <= level ? 'bg-amber-300' : 'bg-white/15'}`} />
      ))}
    </span>
  );
}

export default function LocationSelect({ onPick }: { onPick: (loc: Location) => void }) {
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h2 className="font-display text-3xl text-white title-glow sm:text-5xl">Pick Your Home</h2>
        <p className="mt-2 text-lg text-violet-200/80 sm:text-xl">Where will you live for 14 days, Commander?</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            onClick={() => {
              sfx.confirm();
              onPick(loc.id);
            }}
            className={`panel group rounded-3xl bg-gradient-to-b p-4 text-left transition-all hover:-translate-y-1.5 hover:border-violet-300/40 active:scale-[0.98] ${loc.accent} to-transparent`}
          >
            <div className="relative mb-4 aspect-[2/1] overflow-hidden rounded-2xl">
              <Image
                src={loc.image}
                alt={`${loc.name} base illustration`}
                fill
                sizes="(max-width: 768px) 92vw, 460px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-2xl text-white">{loc.name}</h3>
              <Difficulty level={loc.difficulty} />
            </div>
            <p className="mt-0.5 text-sm uppercase tracking-wider text-violet-300/70">{loc.tag}</p>
            <p className="mt-2 min-h-[44px] text-base text-violet-100/85">{loc.blurb}</p>
            <ul className="mt-3 space-y-2">
              {loc.facts.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-base text-violet-100/90">
                  {f.icon}
                  {f.text}
                </li>
              ))}
            </ul>
            <span className="mt-4 inline-flex items-center gap-2 font-display text-lg font-bold text-amber-300 transition-all group-hover:gap-3">
              Build here! <ArrowRight className="h-5 w-5" aria-hidden />
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
