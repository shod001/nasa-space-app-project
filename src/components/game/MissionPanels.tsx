'use client';

import { AlertTriangle, ArrowRight, Play, Zap } from 'lucide-react';
import EnergyAllocator from './EnergyAllocator';
import { sfx } from '@/lib/game/audio';
import type { Allocation, Choice, Deltas, GameEvent, ResourceState } from '@/lib/game/types';

/* ---------- Morning briefing card ---------- */

export function BriefingCard({ event, onProceed }: { event: GameEvent; onProceed: () => void }) {
  return (
    <section
      className={`panel rounded-3xl p-5 ${event.critical ? 'animate-[ring-pulse_1.4s_ease-in-out_infinite] border-rose-400/40' : ''}`}
      aria-label="Morning briefing"
    >
      {event.critical && (
        <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-rose-300">
          <AlertTriangle className="h-5 w-5 animate-pulse" aria-hidden /> Emergency day!
        </p>
      )}
      <h3 className="font-display text-2xl text-white">{event.title}</h3>
      <p className="mt-2 text-base font-semibold leading-relaxed text-violet-100/85">{event.astro}</p>
      <button
        onClick={() => {
          sfx.confirm();
          onProceed();
        }}
        className="mt-4 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-fuchsia-500/60 bg-gradient-to-r from-fuchsia-300 to-violet-300 font-display text-lg font-bold text-space-950 transition active:scale-[0.98] hover:from-fuchsia-200 hover:to-violet-200"
      >
        See your choices <ArrowRight className="h-5 w-5" aria-hidden />
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
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-xl text-white">
          <Zap className="h-6 w-6 text-amber-300" aria-hidden /> Power the Base
        </h3>
        <span className="max-w-[55%] text-right text-sm text-violet-200/60">
          Plan: <span className="font-bold text-white">{chosen.label}</span>
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-violet-100/75">
        Drag the glowing cubes into the modules. {event.kind === 'quiet' ? 'A calm day — set your rhythm!' : 'Every cube is energy — choose wisely!'}
      </p>
      <EnergyAllocator alloc={alloc} onChange={onChange} resources={resources} showSuggestion />
      <button
        onClick={() => {
          sfx.launch();
          onRunDay();
        }}
        disabled={!ready}
        className="mt-4 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-600/60 bg-gradient-to-r from-emerald-300 to-lime-300 font-display text-lg font-bold text-space-950 transition active:scale-[0.98] hover:from-emerald-200 hover:to-lime-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Play className="h-6 w-6" aria-hidden /> Run the Day!
      </button>
    </section>
  );
}

/* ---------- Resolution panel ---------- */

const DELTA_LABELS: { key: keyof Deltas; name: string }[] = [
  { key: 'science', name: 'Science' },
  { key: 'power', name: 'Power' },
  { key: 'oxygen', name: 'Oxygen' },
  { key: 'food', name: 'Food' },
  { key: 'shield', name: 'Shield' },
  { key: 'health', name: 'Health' },
  { key: 'morale', name: 'Happy' },
  { key: 'fuelCells', name: 'Fuel cells' },
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
      <p className="text-xs font-black uppercase tracking-widest text-violet-300/70">Day complete!</p>
      <h3 className="mt-0.5 font-display text-xl text-white">{chosen.label}</h3>
      <p className="mt-2 text-base leading-relaxed text-violet-100/85">{chosen.result}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map((r, i) => {
          const v = deltas[r.key];
          const good = v > 0;
          return (
            <span
              key={r.key}
              className={`animate-[pop-in_0.35s_ease-out_both] rounded-full border px-3 py-1.5 text-sm font-black ${
                good ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-rose-400/30 bg-rose-400/10 text-rose-300'
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {r.name} {v > 0 ? '+' : '−'}
              {Math.abs(v)}
            </span>
          );
        })}
        {rows.length === 0 && <span className="text-sm italic text-violet-200/60">A steady day — nothing changed much.</span>}
      </div>

      {notes && (
        <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-sm leading-relaxed text-amber-200/90">
          ⚠ {notes}
        </p>
      )}

      <button
        onClick={() => {
          sfx.confirm();
          onProceed();
        }}
        className="mt-4 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-500/60 bg-gradient-to-r from-amber-300 to-amber-400 font-display text-lg font-bold text-space-950 transition active:scale-[0.98] hover:from-amber-200 hover:to-amber-300"
      >
        Night report <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
    </section>
  );
}
