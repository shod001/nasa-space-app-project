'use client';

import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Rocket, Satellite } from 'lucide-react';
import AstroPanel, { type AstroMood } from './AstroPanel';
import { sfx } from '@/lib/game/audio';
import type { GameState, Location } from '@/lib/game/types';

const NASA_CARDS: Record<Location, { system: string; title: string; text: string }[]> = {
  moon: [
    {
      system: 'DONKI',
      title: 'Solar Storm Alerts',
      text: 'NASA\u2019s DONKI system watches the Sun every minute. When a flare erupts, DONKI warns space stations and moon bases so astronauts can shelter — just like you did!',
    },
    {
      system: 'OSDR',
      title: 'Astronaut Health Data',
      text: 'The Open Science Data Repository collects radiation dosimeter readings and plant-growth data from real missions. Scientists use it to keep future crews healthy.',
    },
    {
      system: 'LRO',
      title: 'Lunar Maps',
      text: 'The Lunar Reconnaissance Orbiter photographs the Moon\u2019s poles, mapping sunshine and shadow so rovers can plan safe, sunny routes — like the one you chose!',
    },
  ],
  mars: [
    {
      system: 'DONKI',
      title: 'Solar Storm Alerts',
      text: 'Mars has almost no magnetic shield, so NASA\u2019s DONKI flare alerts are extra important. Real Mars astronauts will shelter in regolith bunkers — just like your crew!',
    },
    {
      system: 'REMS',
      title: 'Mars Weather Reports',
      text: 'Perseverance\u2019s REMS station sends daily weather from Jezero Crater — wind, dust, and temperature. Dust storms like the one you managed can cover real solar panels!',
    },
    {
      system: 'OSDR',
      title: 'Space Farming Science',
      text: 'OSDR collects data from real space-grown plants. Every lettuce experiment — like your hydroponics harvest — helps astronauts grow food on future Mars missions.',
    },
  ],
};

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        left: (i * 97) % 100,
        delay: (i % 12) * 0.35,
        dur: 3.2 + ((i * 7) % 20) / 10,
        color: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399', '#67e8f9'][i % 5],
        size: 6 + (i % 3) * 3,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-sm animate-[confetti-fall_linear_infinite]"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

const TIER_EMOJI: Record<string, string> = {
  success: '🏆',
  partial: '🌟',
  fail: '💪',
  abort: '🛟',
};

const TIER_MOOD: Record<string, AstroMood> = {
  success: 'excited',
  partial: 'happy',
  fail: 'normal',
  abort: 'worried',
};

export default function Debrief({ state, onRestart }: { state: GameState; onRestart: () => void }) {
  const final = state.final;
  const location = (state.location ?? 'moon') as Location;

  const fallbackMessage = useMemo(
    () =>
      `Mission complete, Commander! You scored ${state.science} science points and kept your crew's health at ${state.crew.health}%. ${
        final?.flareDay
          ? `Remember the solar flare on Day ${final.flareDay}? Real astronauts rely on NASA's DONKI system for exactly that warning!`
          : 'Every choice you made balanced power, safety, and discovery — that is real flight-director thinking!'
      } Rest well — the next outpost is waiting for you.`,
    [state.science, state.crew.health, final?.flareDay],
  );

  // Shows the template instantly; replaced by the LLM's personalized farewell when it arrives.
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

  if (!final) return null;

  return (
    <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 py-8">
      {(final.tier === 'success' || final.tier === 'partial') && <Confetti />}

      <div className="text-center animate-[pop-in_0.4s_ease-out]">
        <span className="text-6xl sm:text-7xl inline-block animate-[floaty_4s_ease-in-out_infinite]">{TIER_EMOJI[final.tier]}</span>
        <h2 className="font-display text-3xl sm:text-5xl text-white title-glow mt-2">{final.title}</h2>
        <p className="mt-3 text-sm sm:text-base text-violet-100/85 max-w-xl mx-auto leading-relaxed">{final.blurb}</p>
      </div>

      {/* Badges */}
      <section className="mt-8" aria-label="Badges earned">
        <h3 className="font-display text-lg text-white text-center mb-3">Mission Badges</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {final.badges.map((b, i) => (
            <div
              key={b.id}
              className="panel rounded-2xl p-4 text-center animate-[pop-in_0.4s_ease-out_both]"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <span className="text-3xl inline-block animate-[glow-breathe_2.4s_ease-in-out_infinite]">{b.emoji}</span>
              <p className="font-display text-sm text-amber-200 mt-1.5">{b.name}</p>
              <p className="text-[11px] text-violet-200/70 mt-1 leading-snug">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Final mission stats">
        {[
          { label: 'Science Points', value: `${state.science}` },
          { label: 'Days Served', value: `${state.history.length} / 14` },
          { label: 'Crew Health', value: `${state.crew.health}%` },
          { label: 'Crew Morale', value: `${state.crew.morale}%` },
        ].map((s) => (
          <div key={s.label} className="panel-soft rounded-2xl p-4 text-center">
            <p className="font-display text-2xl text-white">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-violet-200/70 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* NASA debrief */}
      <section className="mt-8" aria-label="How real NASA data was used">
        <h3 className="font-display text-lg text-white flex items-center justify-center gap-2">
          <Satellite className="w-5 h-5 text-emerald-300" aria-hidden /> How Real NASA Data Helped You
        </h3>
        {final.flareDay && (
          <p className="mt-3 text-sm text-center text-amber-200 bg-amber-400/10 border border-amber-400/25 rounded-2xl px-4 py-3 max-w-xl mx-auto leading-relaxed">
            You managed a solar flare on <span className="font-bold">Day {final.flareDay}</span>! In real life, NASA uses
            the <span className="font-bold">DONKI system</span> to give astronauts time to take shelter — just like you did.
          </p>
        )}
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          {NASA_CARDS[location].map((c) => (
            <div key={c.system} className="panel rounded-2xl p-4">
              <p className="text-xs font-bold text-emerald-300">{c.system}</p>
              <p className="font-display text-sm text-white mt-0.5">{c.title}</p>
              <p className="text-[11px] text-violet-100/75 mt-1.5 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ASTRO farewell */}
      <section className="mt-8">
        <AstroPanel mood={TIER_MOOD[final.tier]} text={astroMessage ?? fallbackMessage} />
      </section>

      <div className="mt-8 mb-4 flex justify-center">
        <button
          onClick={() => {
            sfx.launch();
            onRestart();
          }}
          className="min-h-[56px] px-8 rounded-full font-display text-lg font-semibold text-space-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 active:scale-95 transition-all shadow-[0_10px_40px_rgba(251,191,36,0.3)] flex items-center gap-2.5"
        >
          <RotateCcw className="w-5 h-5" aria-hidden />
          Fly Again
          <Rocket className="w-5 h-5" aria-hidden />
        </button>
      </div>
    </main>
  );
}
