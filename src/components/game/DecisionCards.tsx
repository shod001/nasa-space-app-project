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
        <h3 className="font-display text-lg text-white flex items-center gap-2">
          {event.critical && <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" aria-hidden />}
          {event.title}
        </h3>
        {event.badge && (
          <button
            onClick={onOpenBadge}
            className="min-h-[36px] px-2.5 rounded-full text-[11px] font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/30 hover:bg-emerald-400/20 flex items-center gap-1.5 active:scale-95 transition"
          >
            <Satellite className="w-3.5 h-3.5" aria-hidden />
            {event.badge.system} data
          </button>
        )}
      </div>

      <div className="space-y-2.5 max-h-[46vh] lg:max-h-[38vh] overflow-y-auto scrollbar-game pr-1">
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
              className="w-full text-left panel rounded-2xl p-3.5 hover:-translate-y-0.5 hover:border-fuchsia-300/40 active:scale-[0.98] transition-all disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-[15px] text-white">{c.label}</span>
                <span className={`shrink-0 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${risk.cls}`}>
                  {risk.label}
                </span>
              </div>
              <p className="text-xs text-violet-100/70 mt-1 leading-relaxed">{c.desc}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {c.chips.map((chip, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full bg-white/5 border border-white/10 px-2 py-0.5 ${chipTone(chip)}`}
                  >
                    {chip.startsWith('+') ? (
                      <TrendingUp className="w-3 h-3" aria-hidden />
                    ) : chip.startsWith('−') || chip.startsWith('-') ? (
                      <TrendingDown className="w-3 h-3" aria-hidden />
                    ) : (
                      <Minus className="w-3 h-3 opacity-60" aria-hidden />
                    )}
                    {chip}
                  </span>
                ))}
              </div>
              {disabled && (
                <p className="mt-2 text-[11px] text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" aria-hidden />
                  {missingFuel ? 'No backup fuel cells left!' : `Needs ${c.requires?.power}+ power in the battery!`}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
