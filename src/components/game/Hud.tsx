'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, Rocket, Satellite, Volume2, VolumeX, X, Loader2 } from 'lucide-react';
import { SCIENCE_GOAL, TOTAL_DAYS, type DataBadge, type GameState } from '@/lib/game/types';

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
    <div className="absolute right-3 sm:right-5 top-full mt-2 w-[min(360px,calc(100vw-1.5rem))] panel rounded-2xl p-4 z-40 animate-[pop-in_0.2s_ease-out]">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-display text-sm text-white flex items-center gap-1.5">
            <Satellite className="w-4 h-4 text-emerald-300" aria-hidden /> NASA Real-Data Badge
          </p>
          <p className="text-[10px] text-violet-200/60">What NASA system powers today&apos;s event</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close NASA data panel"
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center"
        >
          <X className="w-4 h-4 text-violet-200" aria-hidden />
        </button>
      </div>

      {currentBadge ? (
        <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/25 p-3">
          <p className="text-xs font-bold text-emerald-300">
            {currentBadge.system} — {currentBadge.label}
          </p>
          <p className="mt-1 text-xs text-violet-100/85 leading-relaxed">{currentBadge.detail}</p>
        </div>
      ) : (
        <p className="text-xs text-violet-200/60 italic">
          Open the data badge during a mission event to see which NASA system is behind it.
        </p>
      )}

      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-wider text-violet-300/70 mb-1.5 flex items-center gap-1.5">
          Live solar feed
          {feed?.live ? (
            <span className="text-emerald-300 normal-case">● live</span>
          ) : feed ? (
            <span className="text-amber-300 normal-case">◐ demo feed</span>
          ) : null}
        </p>
        {!feed && (
          <p className="text-xs text-violet-200/60 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden /> Contacting NASA DONKI…
          </p>
        )}
        {feed && feed.events.length > 0 && (
          <ul className="space-y-1.5 max-h-36 overflow-y-auto scrollbar-game">
            {feed.events.map((e, i) => (
              <li key={i} className="text-[11px] text-violet-100/85 bg-white/5 rounded-lg px-2.5 py-1.5">
                <span className="font-bold text-amber-200">{e.type}</span> · {e.cls} ·{' '}
                {e.time ? e.time.slice(0, 10) : 'recent'}
                <span className="block text-violet-200/60">{e.note}</span>
              </li>
            ))}
          </ul>
        )}
        {feed && feed.events.length === 0 && (
          <p className="text-xs text-violet-200/60">The Sun has been quiet lately — no flares in the last two weeks!</p>
        )}
      </div>
    </div>
  );
}

export default function Hud({ state, currentBadge, onToggleSound, onToggleBadge, onCloseBadge }: HudProps) {
  const unit = state.location === 'mars' ? 'SOL' : 'DAY';

  return (
    <header className="sticky top-0 z-30 w-full max-w-6xl mx-auto px-3 sm:px-5 pt-3 pb-1">
      <div className="panel rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap backdrop-blur-md">
        {/* Left: mission tracker */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0">
            <Rocket className="w-[18px] h-[18px] text-violet-300" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm text-white leading-tight truncate">
              {state.location === 'mars' ? 'Mars Jezero Crater' : 'Lunar South Pole'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-300 tracking-wider">
                {unit} {state.day} / {TOTAL_DAYS}
              </span>
              <span className="hidden sm:flex items-center gap-1" aria-hidden>
                {Array.from({ length: TOTAL_DAYS }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${i < state.day ? 'bg-amber-300' : 'bg-white/15'}`}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* Right: science + data + sound */}
        <div className="flex items-center gap-2">
          <div
            className="panel-soft rounded-full pl-2.5 pr-3 py-1.5 flex items-center gap-2"
            aria-label={`Science ${state.science} of goal ${SCIENCE_GOAL}`}
          >
            <FlaskConical className="w-4 h-4 text-fuchsia-300" aria-hidden />
            <div className="leading-none">
              <span className="text-sm font-bold text-white">{state.science}</span>
              <span className="text-[10px] text-violet-200/70"> / {SCIENCE_GOAL} sci</span>
            </div>
            <span className="hidden sm:block w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <span
                className="block h-full bg-gradient-to-r from-fuchsia-400 to-violet-400 transition-all duration-700"
                style={{ width: `${Math.min(100, (state.science / SCIENCE_GOAL) * 100)}%` }}
              />
            </span>
          </div>

          <button
            onClick={onToggleBadge}
            aria-expanded={state.badgeOpen}
            aria-label="Toggle NASA real-data badge panel"
            className={`min-h-[40px] px-3 rounded-full text-xs font-bold flex items-center gap-1.5 border transition active:scale-95 ${
              state.badgeOpen
                ? 'bg-emerald-400/20 border-emerald-300/40 text-emerald-200'
                : 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/20'
            }`}
          >
            <Satellite className="w-4 h-4" aria-hidden />
            <span className="hidden sm:inline">NASA Data</span>
            {currentBadge && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden />}
          </button>

          <button
            onClick={onToggleSound}
            aria-label={state.soundOn ? 'Turn sound off' : 'Turn sound on'}
            className="min-h-[40px] w-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center active:scale-95 transition"
          >
            {state.soundOn ? (
              <Volume2 className="w-4 h-4 text-violet-200" aria-hidden />
            ) : (
              <VolumeX className="w-4 h-4 text-violet-200/60" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {state.badgeOpen && <NasaPanel currentBadge={currentBadge} onClose={onCloseBadge} />}
    </header>
  );
}
