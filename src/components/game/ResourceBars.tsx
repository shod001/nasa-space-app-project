'use client';

import { Zap, Wind, Apple, ShieldHalf, Heart, SmilePlus, BatteryMedium } from 'lucide-react';
import type { Deltas, ResourceState, CrewState } from '@/lib/game/types';

interface Props {
  resources: ResourceState;
  crew: CrewState;
  deltas?: Deltas | null;
}

interface MeterDef {
  key: keyof Pick<ResourceState, 'power' | 'oxygen' | 'food' | 'shield'>;
  name: string;
  icon: typeof Zap;
  bar: string;
  chip: string;
  glow: string;
  cardLow: string;
}

const METERS: MeterDef[] = [
  { key: 'power', name: 'Power', icon: Zap, bar: 'bg-gradient-to-r from-amber-500 to-amber-300', chip: 'text-amber-300 bg-amber-400/15', glow: 'shadow-[0_0_16px_rgba(251,191,36,0.35)]', cardLow: 'border-amber-400/50' },
  { key: 'oxygen', name: 'Oxygen', icon: Wind, bar: 'bg-gradient-to-r from-emerald-500 to-emerald-300', chip: 'text-emerald-300 bg-emerald-400/15', glow: 'shadow-[0_0_16px_rgba(52,211,153,0.35)]', cardLow: 'border-emerald-400/50' },
  { key: 'food', name: 'Food', icon: Apple, bar: 'bg-gradient-to-r from-lime-500 to-lime-300', chip: 'text-lime-300 bg-lime-400/15', glow: 'shadow-[0_0_16px_rgba(163,230,53,0.35)]', cardLow: 'border-lime-400/50' },
  { key: 'shield', name: 'Shield', icon: ShieldHalf, bar: 'bg-gradient-to-r from-rose-500 to-rose-300', chip: 'text-rose-300 bg-rose-400/15', glow: 'shadow-[0_0_16px_rgba(251,113,133,0.35)]', cardLow: 'border-rose-400/50' },
];

function DeltaTag({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <span
      className={`text-xs font-black ${value > 0 ? 'text-emerald-300' : 'text-rose-300'}`}
      aria-label={`${value > 0 ? 'plus' : 'minus'} ${Math.abs(value)}`}
    >
      {value > 0 ? '+' : '−'}
      {Math.abs(value)}
    </span>
  );
}

export default function ResourceBars({ resources, crew, deltas }: Props) {
  return (
    <section aria-label="Base resource meters" className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {METERS.map((m) => {
          const Icon = m.icon;
          const v = resources[m.key];
          const low = v < 30;
          const crit = v < 15;
          const d = deltas?.[m.key];
          return (
            <div
              key={m.key}
              className={`panel rounded-2xl px-3 py-2.5 transition-colors ${crit ? `animate-[ring-pulse_1s_ease-in-out_infinite] ${m.cardLow}` : low ? m.cardLow : ''}`}
              role="meter"
              aria-valuenow={v}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${m.name} at ${v} percent`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.chip}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className={`font-display text-2xl leading-none ${low ? 'text-rose-300' : 'text-white'}`}>
                  {v}
                  <span className="text-xs text-violet-200/60">%</span>
                </span>
              </div>
              <div className="mb-1 mt-1.5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-200/80">{m.name}</span>
                {typeof d === 'number' && d !== 0 && <DeltaTag value={Math.round(d)} />}
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${m.bar} ${low ? m.glow : ''}`}
                  style={{ width: `${Math.max(2, v)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Crew + backup cells row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="panel-soft rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Heart className={`h-5 w-5 ${crew.health < 35 ? 'animate-pulse text-rose-400' : 'text-rose-300'}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2 text-xs text-violet-200/80">
                <span className="shrink-0 font-bold">Health</span>
                <span className="font-black text-white">{crew.health}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-rose-500 to-rose-300 transition-all duration-1000" style={{ width: `${crew.health}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="panel-soft rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <SmilePlus className={`h-5 w-5 ${crew.morale < 35 ? 'animate-pulse text-amber-400' : 'text-amber-300'}`} aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2 text-xs text-violet-200/80">
                <span className="shrink-0 font-bold">Happy</span>
                <span className="font-black text-white">{crew.morale}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000" style={{ width: `${crew.morale}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="panel-soft rounded-xl px-3 py-2.5" aria-label={`${resources.fuelCells} backup fuel cells left`}>
          <div className="flex items-center gap-2">
            <BatteryMedium className="h-5 w-5 text-cyan-300" aria-hidden />
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-6 w-5 rounded-sm border ${i <= resources.fuelCells ? 'border-cyan-200/60 bg-cyan-300/80 shadow-[0_0_8px_rgba(103,232,249,0.5)]' : 'border-white/15 bg-white/5'}`}
                />
              ))}
              <span className="ml-1 hidden text-xs text-violet-200/70 sm:inline">fuel cells</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
