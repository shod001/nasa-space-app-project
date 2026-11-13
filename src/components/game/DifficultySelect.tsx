'use client';

import { Rocket, ShieldCheck, Swords } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import { DIFFICULTIES, type Difficulty, type Location } from '@/lib/game/types';

const STYLE: Record<Difficulty, { card: string; badge: string; text: string; icon: React.ReactNode }> = {
  easy: {
    card: 'hover:border-emerald-300/60 bg-gradient-to-b from-emerald-400/15 to-transparent',
    badge: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300',
    text: 'text-emerald-300',
    icon: <Rocket className="h-5 w-5" aria-hidden />,
  },
  normal: {
    card: 'hover:border-amber-300/60 bg-gradient-to-b from-amber-400/15 to-transparent',
    badge: 'bg-amber-400/15 border-amber-400/40 text-amber-300',
    text: 'text-amber-300',
    icon: <ShieldCheck className="h-5 w-5" aria-hidden />,
  },
  hard: {
    card: 'hover:border-rose-300/60 bg-gradient-to-b from-rose-400/15 to-transparent',
    badge: 'bg-rose-400/15 border-rose-400/40 text-rose-300',
    text: 'text-rose-300',
    icon: <Swords className="h-5 w-5" aria-hidden />,
  },
};

const HINT: Record<Difficulty, string[]> = {
  easy: ['Lots of supplies', 'Goal: 300 science', 'Crew feels less pain'],
  normal: ['A fair mission', 'Goal: 380 science', 'Real astronaut math'],
  hard: ['Very few supplies', 'Goal: 460 science', 'Every cube counts!'],
};

interface Props {
  location: Location;
  onPick: (d: Difficulty) => void;
}

export default function DifficultySelect({ location, onPick }: Props) {
  const place = location === 'mars' ? 'Mars' : 'the Moon';

  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl text-center">
        <h2 className="font-display text-3xl text-white title-glow sm:text-4xl">Pick Your Challenge</h2>
        <p className="mt-2 text-base text-violet-200/80 sm:text-lg">
          How tricky should your mission to {place} be, Commander?
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((key, i) => {
            const cfg = DIFFICULTIES[key];
            const s = STYLE[key];
            return (
              <button
                key={key}
                onClick={() => {
                  sfx.confirm();
                  onPick(key);
                }}
                className={`panel rounded-3xl p-5 text-left transition-all hover:-translate-y-1.5 active:scale-[0.98] ${s.card} animate-[pop-in_0.4s_ease-out_both]`}
                style={{ animationDelay: `${i * 110}ms` }}
              >
                <span className="text-5xl inline-block animate-[bounce-soft_2.2s_ease-in-out_infinite]" aria-hidden>
                  {cfg.emoji}
                </span>
                <h3 className="mt-2 font-display text-2xl text-white">{cfg.name}</h3>
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${s.badge}`}
                >
                  {s.icon}
                  {key === 'easy' ? 'RELAXED' : key === 'normal' ? 'BALANCED' : 'EXPERT'}
                </span>
                <p className="mt-3 min-h-[44px] text-sm text-violet-100/85">{cfg.blurb}</p>
                <ul className="mt-2 space-y-1">
                  {HINT[key].map((h) => (
                    <li key={h} className={`flex items-center gap-1.5 text-xs font-semibold ${s.text}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
                <span className={`mt-4 inline-block font-display text-base font-bold ${s.text}`}>
                  Choose {cfg.name} →
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
