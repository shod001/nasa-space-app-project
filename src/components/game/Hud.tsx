'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, Rocket, Satellite, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { TOTAL_DAYS, type DataBadge, type GameState } from '@/lib/game/types';

interface DonkiEvent {
  type: string;
  cls: string;
  time: string;
  note: string;
}
interface DonkiFeed {
  live: boolean;
  source: string;
  events: DonkiEvent[];
}

interface HudProps {
  state: GameState;
  currentBadge: DataBadge | null;
  onToggleSound: () => void;
  onToggleBadge: () => void;
  onCloseBadge: () => void;
}

/** Mounts only when the badge panel is open; fetches the DONKI feed on mount. */
function NasaPanel({ currentBadge, onClose }: { currentBadge: DataBadge | null; onClose: () => void }) {
  const [feed, setFeed] = useState<DonkiFeed | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/donki')
      .then((r) => r.json())
      .then((d: DonkiFeed) => {
        if (alive) setFeed(d);
      })
      .catch(() => {
        if (alive) setFeed({ live: false, source: 'DONKI Demo Feed', events: [] });
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="absolute right-3 top-full z-40 mt-2 w-[min(400px,calc(100vw-1.5rem))] animate-[pop-in_0.2s_ease-out] rounded-2xl panel p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 font-display text-sm text-white">
            <Satellite className="h-4 w-4 text-emerald-300" aria-hidden /> NASA Real-Data Badge
          </p>
          <p className="text-xs text-violet-200/60">The NASA system behind today&apos;s event</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close NASA data panel"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/15"
        >
          <X className="h-4 w-4 text-violet-200" aria-hidden />
        </button>
      </div>

      {currentBadge ? (
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-3">
          <p className="text-sm font-bold text-emerald-300">
            {currentBadge.system} — {currentBadge.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-violet-100/85">{currentBadge.detail}</p>
        </div>
      ) : (
        <p className="text-sm italic text-violet-200/60">
          Open the data badge during a mission event to see which NASA system is behind it.
        </p>
      )}

      <div className="mt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-violet-300/70">
          Live solar feed
          {feed?.live ? (
            <span className="text-emerald-300 normal-case">● live</span>
          ) : feed ? (
            <span className="text-amber-300 normal-case">◐ demo feed</span>
          ) : null}
        </p>
        {!feed && (
          <p className="flex items-center gap-2 text-sm text-violet-200/60">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Contacting NASA DONKI…
          </p>
        )}
        {feed && feed.events.length > 0 && (
          <ul className="max-h-40 space-y-1.5 overflow-y-auto scrollbar-game">
            {feed.events.map((e, i) => (
              <li key={i} className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-violet-100/85">
                <span className="font-bold text-amber-200">{e.type}</span> · {e.cls} ·{' '}
                {e.time ? e.time.slice(0, 10) : 'recent'}
                <span className="block text-violet-200/60">{e.note}</span>
              </li>
            ))}
          </ul>
        )}
        {feed && feed.events.length === 0 && (
          <p className="text-sm text-violet-200/60">The Sun has been quiet — no flares in the last two weeks!</p>
        )}
      </div>
    </div>
  );
}

export default function Hud({ state, currentBadge, onToggleSound, onToggleBadge, onCloseBadge }: HudProps) {
  const unit = state.location === 'mars' ? 'SOL' : 'DAY';
  const diff = state.difficulty ? state.difficulty : null;

  return (
    <header className="sticky top-0 z-30 mx-auto w-full max-w-7xl px-3 pb-1 pt-3 sm:px-5">
      <div className="panel flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3 py-2.5 backdrop-blur-md sm:px-4">
        {/* Left: mission tracker */}
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-500/20">
            <Rocket className="h-5 w-5 text-violet-300" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base leading-tight text-white">
              {state.location === 'mars' ? 'Mars Jezero Crater' : 'Lunar South Pole'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-amber-300">
                {unit} {state.day} / {TOTAL_DAYS}
              </span>
              {diff && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-200/80">
                  {diff === 'easy' ? '🌱 Easy' : diff === 'hard' ? '🔥 Hard' : '🚀 Normal'}
                </span>
              )}
              <span className="hidden items-center gap-1 sm:flex" aria-hidden>
                {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full ${i < state.day ? 'bg-amber-300' : 'bg-white/15'}`}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* Right: science + data + sound */}
        <div className="flex items-center gap-2">
          <div
            className="panel-soft flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3"
            aria-label={`Science ${state.science} of goal ${state.goal}`}
          >
            <FlaskConical className="h-5 w-5 text-fuchsia-300" aria-hidden />
            <div className="leading-none">
              <span className="text-base font-black text-white">{state.science}</span>
              <span className="text-xs text-violet-200/70"> / {state.goal}</span>
            </div>
            <span className="hidden h-2 w-20 overflow-hidden rounded-full bg-white/10 sm:block">
              <span
                className="block h-full bg-gradient-to-r from-fuchsia-400 to-violet-400 transition-all duration-700"
                style={{ width: `${Math.min(100, (state.science / Math.max(1, state.goal)) * 100)}%` }}
              />
            </span>
          </div>

          <button
            onClick={onToggleBadge}
            aria-expanded={state.badgeOpen}
            aria-label="Toggle NASA real-data badge panel"
            className={`flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-sm font-bold transition active:scale-95 ${
              state.badgeOpen
                ? 'border-emerald-300/40 bg-emerald-400/20 text-emerald-200'
                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20'
            }`}
          >
            <Satellite className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">NASA Data</span>
            {currentBadge && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" aria-hidden />}
          </button>

          <button
            onClick={onToggleSound}
            aria-label={state.soundOn ? 'Turn sound off' : 'Turn sound on'}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition active:scale-95 hover:bg-white/10"
          >
            {state.soundOn ? (
              <Volume2 className="h-5 w-5 text-violet-200" aria-hidden />
            ) : (
              <VolumeX className="h-5 w-5 text-violet-200/60" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {state.badgeOpen && <NasaPanel currentBadge={currentBadge} onClose={onCloseBadge} />}
    </header>
  );
}
