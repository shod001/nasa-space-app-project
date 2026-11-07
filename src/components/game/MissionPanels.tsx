'use client';

import { AlertTriangle, ArrowRight, Play, Zap } from 'lucide-react';
import EnergyAllocator from './EnergyAllocator';
import { sfx } from '@/lib/game/audio';
import type { Allocation, Choice, Deltas, GameEvent, ResourceState } from '@/lib/game/types';

/* ---------- Morning briefing card ---------- */

export function BriefingCard({ event, onProceed }: { event: GameEvent; onProceed: () => void }) {
  return (
    <section
      className={`panel rounded-3xl p-5 ${event.critical ? 'border-rose-400/40 animate-[ring-pulse_1.4s_ease-in-out_infinite]' : ''}`}
      aria-label="Morning briefing"
    >
      {event.critical && (
        <p className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-rose-300 mb-2">
          <AlertTriangle className="w-4 h-4 animate-pulse" aria-hidden /> Emergency briefing
        </p>
      )}
      <h3 className="font-display text-xl text-white">{event.title}</h3>
      <p className="mt-1.5 text-sm text-violet-100/75 leading-relaxed">{event.astro}</p>
      <button
        onClick={() => {
          sfx.confirm();
          onProceed();
        }}
        className="mt-4 min-h-[52px] w-full rounded-2xl font-display text-base font-semibold text-space-950 bg-gradient-to-r from-fuchsia-300 to-violet-300 hover:from-fuchsia-200 hover:to-violet-200 active:scale-[0.98] transition flex items-center justify-center gap-2"
      >
        See your options <ArrowRight className="w-5 h-5" aria-hidden />
      </button>
    </section>
  );
}

/* ---------- Action phase: energy allocation ---------- */

export function ActionPanel({
  event,
  chosen,
  alloc,
  resources,
  onChange,
  onRunDay,
}: {
  event: GameEvent;
  chosen: Choice;
  alloc: Allocation;
  resources: ResourceState;
  onChange: (a: Allocation) => void;
  onRunDay: () => void;
}) {
  const used = alloc.life + alloc.shield + alloc.science + alloc.green;
  const ready = used === 10;
  return (
    <section className="panel rounded-3xl p-4" aria-label="Assign power cubes">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-display text-lg text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-300" aria-hidden /> Power the Base
        </h3>
        <span className="text-[11px] text-violet-200/60 text-right max-w-[55%]">
          Plan: <span className="text-white font-bold">{chosen.label}</span>
        </span>
      </div>
      <p className="text-xs text-violet-100/70 mb-3 leading-relaxed">
        Drag or tap the glowing cubes into your modules. {event.kind === 'quiet' ? 'A calm day — set your rhythm!' : 'Every cube is energy spent — choose wisely!'}
      </p>
      <EnergyAllocator alloc={alloc} onChange={onChange} resources={resources} showSuggestion />
      <button
        onClick={() => {
          sfx.launch();
          onRunDay();
        }}
        disabled={!ready}
        className="mt-4 min-h-[52px] w-full rounded-2xl font-display text-base font-semibold text-space-950 bg-gradient-to-r from-emerald-300 to-lime-300 hover:from-emerald-200 hover:to-lime-200 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Play className="w-5 h-5" aria-hidden /> Run the Day
      </button>
    </section>
  );
}

/* ---------- Resolution panel ---------- */

const DELTA_LABELS: { key: keyof Deltas; name: string; positive: boolean }[] = [
  { key: 'science', name: 'Science', positive: true },
  { key: 'power', name: 'Power', positive: true },
  { key: 'oxygen', name: 'Oxygen', positive: true },
  { key: 'food', name: 'Food', positive: true },
  { key: 'shield', name: 'Shield', positive: true },
  { key: 'health', name: 'Health', positive: true },
  { key: 'morale', name: 'Morale', positive: true },
  { key: 'fuelCells', name: 'Fuel cells', positive: true },
];

export function ResolutionPanel({
  chosen,
  deltas,
  notes,
  onProceed,
}: {
  chosen: Choice;
  deltas: Deltas;
  notes?: string;
  onProceed: () => void;
}) {
  const rows = DELTA_LABELS.filter((r) => (r.key === 'fuelCells' ? deltas.fuelCells !== 0 : deltas[r.key] !== 0));
  return (
    <section className="panel rounded-3xl p-5" aria-label="Day results">
      <p className="text-[10px] uppercase tracking-widest text-violet-300/70 font-bold">Simulation complete</p>
      <h3 className="font-display text-lg text-white mt-0.5">{chosen.label}</h3>
      <p className="text-sm text-violet-100/80 mt-1.5 leading-relaxed">{chosen.result}</p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {rows.map((r, i) => {
          const v = deltas[r.key];
          const good = r.key === 'fuelCells' ? v > 0 : v > 0;
          return (
            <span
              key={r.key}
              className={`animate-[pop-in_0.35s_ease-out_both] text-xs font-bold rounded-full px-2.5 py-1 border ${
                good ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' : 'text-rose-300 border-rose-400/30 bg-rose-400/10'
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {r.name} {v > 0 ? '+' : '−'}
              {Math.abs(v)}
            </span>
          );
        })}
        {rows.length === 0 && <span className="text-xs text-violet-200/60 italic">A steady day — nothing changed much.</span>}
      </div>

      {notes && (
        <p className="mt-3 text-xs text-amber-200/90 bg-amber-400/10 border border-amber-400/25 rounded-xl px-3 py-2 leading-relaxed">
          ⚠ {notes}
        </p>
      )}

      <button
        onClick={() => {
          sfx.confirm();
          onProceed();
        }}
        className="mt-4 min-h-[52px] w-full rounded-2xl font-display text-base font-semibold text-space-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] transition flex items-center justify-center gap-2"
      >
        End-of-day summary <ArrowRight className="w-5 h-5" aria-hidden />
      </button>
    </section>
  );
}
