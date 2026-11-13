'use client';

import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Rocket, Satellite, Star } from 'lucide-react';
import AstroPanel, { type AstroMood } from './AstroPanel';
import { sfx } from '@/lib/game/audio';
import type { GameState, Location } from '@/lib/game/types';

const NASA_CARDS: Record<Location, { system: string; title: string; text: string }[]> = {
  moon: [
    {
      system: 'DONKI',
      title: 'Sun Storm Alerts',
      text: "NASA's DONKI computer watches the Sun every minute. When a flare erupts, DONKI warns moon bases so astronauts can hide — just like you did!",
    },
    {
      system: 'OSDR',
      title: 'Astronaut Health',
      text: 'OSDR collects health data from real astronauts — radiation badges, plants in space, and more. It keeps future crews healthy.',
    },
    {
      system: 'LRO',
      title: 'Moon Maps',
      text: "The Lunar Reconnaissance Orbiter photographs the Moon's poles. It maps sunshine and shadow so rovers can plan safe, sunny routes!",
    },
  ],
  mars: [
    {
      system: 'DONKI',
      title: 'Sun Storm Alerts',
      text: 'Mars has almost no magnetic shield, so DONKI flare alerts are extra important. Real Mars astronauts will hide in dirt bunkers — like your crew!',
    },
    {
      system: 'REMS',
      title: 'Mars Weather',
      text: "Perseverance's REMS station sends daily weather from Jezero Crater — wind, dust, and heat. Dust storms can cover real solar panels!",
    },
    {
      system: 'OSDR',
      title: 'Space Farming',
      text: 'OSDR collects data from real space-grown plants. Your lettuce harvest helps astronauts grow food on future Mars missions.',
    },
  ],
};

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        left: (i * 53) % 100,
        delay: (i % 14) * 0.3,
        dur: 3 + ((i * 7) % 22) / 10,
        color: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399', '#67e8f9', '#fb7185', '#facc15'][i % 7],
        size: 7 + (i % 4) * 3,
        round: i % 3 === 0,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`absolute top-0 animate-[confetti-fall_linear_infinite] ${p.round ? 'rounded-full' : 'rounded-sm'}`}
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * (p.round ? 1 : 0.6),
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Firework bursts behind the trophy for big wins. */
function Fireworks({ count = 6 }: { count?: number }) {
  const spots = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: 12 + ((i * 37) % 76),
        top: 8 + ((i * 23) % 40),
        delay: i * 0.7,
        color: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399'][i % 4],
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      {spots.map((s, i) => (
        <span
          key={i}
          className="absolute h-24 w-24 rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            background: `radial-gradient(circle, ${s.color}66 0%, transparent 70%)`,
            animation: `firework 1.6s ease-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Smoothly counts from 0 to target. */
function useCountUp(target: number, dur = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf: number;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

const TIER_EMOJI: Record<string, string> = {
  success: '🏆',
  partial: '🌟',
  fail: '💪',
  abort: '🛟',
};

const TIER_RANK: Record<string, { rank: string; cls: string; stars: number }> = {
  success: { rank: 'GOLD COMMANDER', cls: 'from-amber-300 via-yellow-400 to-amber-500', stars: 3 },
  partial: { rank: 'SILVER COMMANDER', cls: 'from-slate-200 via-slate-300 to-slate-400', stars: 2 },
  fail: { rank: 'SPACE CADET', cls: 'from-orange-300 via-amber-400 to-orange-500', stars: 1 },
  abort: { rank: 'RESCUE STAR', cls: 'from-cyan-300 via-teal-400 to-cyan-500', stars: 1 },
};

const TIER_MOOD: Record<string, AstroMood> = {
  success: 'excited',
  partial: 'happy',
  fail: 'normal',
  abort: 'worried',
};

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="panel-soft rounded-2xl p-4 text-center">
      <p className="text-2xl" aria-hidden>
        {emoji}
      </p>
      <p className="mt-1 font-display text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-violet-200/70">{label}</p>
    </div>
  );
}

export default function Debrief({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const final = state.final;
  const location = (state.location ?? 'moon') as Location;

  const fallbackMessage = useMemo(
    () =>
      `Mission done, Commander! You scored ${state.science} science points and kept your crew at ${state.crew.health}% health. ${
        final?.flareDay
          ? `Remember the solar flare on Day ${final.flareDay}? Real astronauts use NASA's DONKI alerts exactly like that!`
          : 'You balanced power, safety, and science — real astronaut thinking!'
      } Fun fact: 1.3 million Earths could fit inside the Sun!`,
    [state.science, state.crew.health, final?.flareDay],
  );

  const [astroMessage, setAstroMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!final) return;
    if (final.tier === 'success' || final.tier === 'partial') sfx.success();
    else sfx.fail();
  }, [final]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/astro-debrief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: state.location,
        science: state.science,
        health: state.crew.health,
        morale: state.crew.morale,
        daysSurvived: state.history.length,
        badges: final?.badges.map((b) => b.name) ?? [],
        flareDay: final?.flareDay ?? null,
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status'))))
      .then((d: { message?: string }) => {
        if (!cancelled && d.message) setAstroMessage(d.message);
      })
      .catch(() => {
        /* keep template fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sciCount = useCountUp(state.science);
  const healthCount = useCountUp(state.crew.health);
  const moraleCount = useCountUp(state.crew.morale);

  if (!final) return null;

  const tier = TIER_RANK[final.tier];
  const isWin = final.tier === 'success' || final.tier === 'partial';

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      {isWin && <Confetti />}
      {final.tier === 'success' && <Fireworks />}

      {/* Rank banner + trophy */}
      <div className="animate-[pop-in_0.4s_ease-out] text-center">
        <span
          className={`inline-block rounded-full bg-gradient-to-r ${tier.cls} px-6 py-2 font-display text-lg font-black tracking-widest text-space-950 shadow-[0_8px_30px_rgba(251,191,36,0.35)] animated-gradient`}
        >
          {tier.rank}
        </span>
        <div className="mt-2 text-7xl animate-[floaty_4s_ease-in-out_infinite] sm:text-8xl" aria-hidden>
          {TIER_EMOJI[final.tier]}
        </div>

        {/* star rating */}
        <div className="mt-2 flex justify-center gap-2" aria-label={`${tier.stars} of 3 stars`}>
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`h-12 w-12 animate-[star-pop_0.6s_ease-out_both] ${
                s <= tier.stars ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.8)]' : 'text-white/15'
              }`}
              style={{ animationDelay: `${0.3 + s * 0.25}s` }}
              aria-hidden
            />
          ))}
        </div>

        <h2 className="mt-2 font-display text-4xl text-white title-glow sm:text-6xl">{final.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-violet-100/85">{final.blurb}</p>
      </div>

      {/* Stats with count-up */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Final mission stats">
        <StatCard emoji="🔬" label="Science Points" value={`${sciCount}`} />
        <StatCard emoji="📅" label="Days Served" value={`${state.history.length} / 14`} />
        <StatCard emoji="❤️" label="Crew Health" value={`${healthCount}%`} />
        <StatCard emoji="😄" label="Crew Happy" value={`${moraleCount}%`} />
      </section>

      {/* Badges with shine */}
      <section className="mt-8" aria-label="Badges earned">
        <h3 className="mb-3 text-center font-display text-2xl text-white">🏅 Mission Medals</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {final.badges.map((b, i) => (
            <div
              key={b.id}
              className="panel relative overflow-hidden rounded-2xl p-4 text-center animate-[pop-in_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 130}ms` }}
            >
              <span
                className="pointer-events-none absolute inset-0"
                aria-hidden
              >
                <span
                  className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  style={{ animation: `shine-sweep 2.8s ease-in-out ${0.4 + i * 0.25}s infinite` }}
                />
              </span>
              <span className="inline-block text-4xl animate-[glow-breathe_2.4s_ease-in-out_infinite]">{b.emoji}</span>
              <p className="mt-1.5 font-display text-base font-bold text-amber-200">{b.name}</p>
              <p className="mt-1 text-sm leading-snug text-violet-200/70">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission log */}
      <section className="mt-8" aria-label="Mission log">
        <h3 className="mb-3 text-center font-display text-2xl text-white">📜 Mission Log</h3>
        <div className="panel max-h-44 overflow-y-auto scrollbar-game rounded-2xl p-3">
          <ul className="space-y-1.5">
            {state.history.map((h) => (
              <li key={h.day} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm">
                <span className="w-14 shrink-0 font-black text-amber-300">
                  {state.location === 'mars' ? 'SOL' : 'DAY'} {h.day}
                </span>
                <span className="min-w-0 flex-1 truncate text-violet-100/85">{h.choiceLabel}</span>
                <span className={`shrink-0 font-black ${h.deltas.science > 0 ? 'text-emerald-300' : 'text-violet-200/50'}`}>
                  +{h.deltas.science} sci
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* NASA debrief */}
      <section className="mt-8" aria-label="How real NASA data was used">
        <h3 className="flex items-center justify-center gap-2 font-display text-2xl text-white">
          <Satellite className="h-6 w-6 text-emerald-300" aria-hidden /> Real NASA Data Helped You
        </h3>
        {final.flareDay && (
          <p className="mx-auto mt-3 max-w-xl rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-center text-base leading-relaxed text-amber-200">
            You handled a solar flare on <span className="font-black">Day {final.flareDay}</span>! In real life, NASA uses
            the <span className="font-black">DONKI system</span> to warn astronauts — just like in your mission.
          </p>
        )}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {NASA_CARDS[location].map((c) => (
            <div key={c.system} className="panel rounded-2xl p-4">
              <p className="text-sm font-black text-emerald-300">{c.system}</p>
              <p className="mt-0.5 font-display text-base text-white">{c.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-violet-100/75">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ASTRO farewell */}
      <section className="mt-8">
        <AstroPanel mood={TIER_MOOD[final.tier]} text={astroMessage ?? fallbackMessage} />
      </section>

      {/* Medals collected chip */}
      {state.achievements.length > 0 && (
        <p className="mt-6 text-center text-sm font-bold text-amber-300/90">
          ✨ You earned {state.achievements.length} achievement{state.achievements.length > 1 ? 's' : ''} this mission!
        </p>
      )}

      <div className="mb-4 mt-6 flex justify-center">
        <button
          onClick={() => {
            sfx.launch();
            onRestart();
          }}
          className="flex min-h-[64px] items-center gap-2.5 rounded-full border-b-4 border-amber-600 bg-gradient-to-r from-amber-300 to-amber-400 px-10 font-display text-xl font-bold text-space-950 shadow-[0_10px_40px_rgba(251,191,36,0.3)] transition-all active:scale-95 hover:from-amber-200 hover:to-amber-300"
        >
          <RotateCcw className="h-6 w-6" aria-hidden />
          Fly Again!
          <Rocket className="h-6 w-6" aria-hidden />
        </button>
      </div>
    </main>
  );
}
