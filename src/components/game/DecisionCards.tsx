'use client';

import { Satellite, TrendingUp, TrendingDown, Minus, Flame, AlertTriangle } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import type { Choice, GameEvent, ResourceState } from '@/lib/game/types';

const RISK_STYLE = {
  safe: { label: 'SAFE', cls: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' },
  balanced: { label: 'BOLD', cls: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
  risky: { label: 'RISKY', cls: 'bg-rose-400/15 text-rose-300 border-rose-400/30' },
} as const;

function chipTone(chip: string) {
  if (chip.startsWith('+')) return 'text-emerald-300';
  if (chip.startsWith('−') || chip.startsWith('-')) return 'text-rose-300';
  return 'text-violet-100/85';
}

interface Props {
  event: GameEvent;
  resources: ResourceState;
  onPick: (c: Choice) => void;
  onOpenBadge: () => void;
}

export default function DecisionCards({ event, resources, onPick, onOpenBadge }: Props) {
  return (
    <section aria-label="Decision cards" className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="flex items-center gap-2 font-display text-xl text-white">
          {event.critical && <AlertTriangle className="h-6 w-6 animate-pulse text-rose-400" aria-hidden />}
          {event.title}
        </h3>
        {event.badge && (
          <button
            onClick={onOpenBadge}
            className="flex min-h-[40px] items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 text-xs font-bold text-emerald-300 transition active:scale-95 hover:bg-emerald-400/20"
          >
            <Satellite className="h-4 w-4" aria-hidden />
            {event.badge.system} data
          </button>
        )}
      </div>

      <div className="max-h-[46vh] space-y-3 overflow-y-auto scrollbar-game pr-1 lg:max-h-[40vh]">
        {event.choices.map((c) => {
          const missingFuel = !!c.requires?.fuelCells && resources.fuelCells < c.requires.fuelCells;
          const missingPower = !!c.requires?.power && resources.power < c.requires.power;
          const disabled = missingFuel || missingPower;
          const risk = RISK_STYLE[c.risk];
          return (
            <button
              key={c.id}
              onClick={() => {
                sfx.confirm();
                onPick(c);
              }}
              disabled={disabled}
              className="panel w-full rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:border-fuchsia-300/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-semibold text-white">{c.label}</span>
                <span className={`shrink-0 border px-2.5 py-1 text-xs font-black tracking-wider rounded-full ${risk.cls}`}>
                  {risk.label}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-violet-100/80">{c.desc}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {c.chips.map((chip, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm font-bold ${chipTone(chip)}`}
                  >
                    {chip.startsWith('+') ? (
                      <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                    ) : chip.startsWith('−') || chip.startsWith('-') ? (
                      <TrendingDown className="h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Minus className="h-3.5 w-3.5 opacity-60" aria-hidden />
                    )}
                    {chip}
                  </span>
                ))}
              </div>
              {disabled && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-300">
                  <Flame className="h-4 w-4" aria-hidden />
                  {missingFuel ? 'No backup fuel cells left!' : `Needs ${c.requires?.power}+ power!`}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
