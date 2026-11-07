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
}

const METERS: MeterDef[] = [
  { key: 'power', name: 'Power', icon: Zap, bar: 'bg-gradient-to-r from-amber-500 to-amber-300', chip: 'text-amber-300 bg-amber-400/15', glow: 'shadow-[0_0_16px_rgba(251,191,36,0.35)]' },
  { key: 'oxygen', name: 'Oxygen', icon: Wind, bar: 'bg-gradient-to-r from-emerald-500 to-emerald-300', chip: 'text-emerald-300 bg-emerald-400/15', glow: 'shadow-[0_0_16px_rgba(52,211,153,0.35)]' },
  { key: 'food', name: 'Food', icon: Apple, bar: 'bg-gradient-to-r from-lime-500 to-lime-300', chip: 'text-lime-300 bg-lime-400/15', glow: 'shadow-[0_0_16px_rgba(163,230,53,0.35)]' },
  { key: 'shield', name: 'Shield', icon: ShieldHalf, bar: 'bg-gradient-to-r from-rose-500 to-rose-300', chip: 'text-rose-300 bg-rose-400/15', glow: 'shadow-[0_0_16px_rgba(251,113,133,0.35)]' },
];

function DeltaTag({ value, unit = '' }: { value: number; unit?: string }) {
  if (value === 0) return null;
  return (
    <span
      className={`text-[10px] font-bold ${value > 0 ? 'text-emerald-300' : 'text-rose-300'}`}
      aria-label={`${value > 0 ? 'plus' : 'minus'} ${Math.abs(value)} ${unit}`}
    >
      {value > 0 ? '+' : '−'}
      {Math.abs(value)}
      {unit}
    </span>
  );
}

export default function ResourceBars({ resources, crew, deltas }: Props) {
  return (
    <section aria-label="Base resource meters" className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {METERS.map((m) => {
          const Icon = m.icon;
          const v = resources[m.key];
          const low = v < 30;
          const crit = v < 15;
          const d = deltas?.[m.key];
          return (
            <div
              key={m.key}
              className={`panel rounded-2xl px-3 py-2.5 ${crit ? 'animate-[ring-pulse_1s_ease-in-out_infinite]' : ''}`}
              role="meter"
              aria-valuenow={v}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${m.name} at ${v} percent`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.chip}`}>
                  <Icon className="w-4 h-4" aria-hidden />
                </span>
                <span className={`font-display text-lg leading-none ${low ? 'text-rose-300' : 'text-white'}`}>
                  {v}
                  <span className="text-[10px] text-violet-200/60">%</span>
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200/70">{m.name}</span>
                {typeof d === 'number' && d !== 0 && <DeltaTag value={Math.round(d)} />}
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
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
      <div className="grid grid-cols-3 gap-2">
        <div className="panel-soft rounded-xl px-3 py-2 flex items-center gap-2">
          <Heart className={`w-4 h-4 ${crew.health < 35 ? 'text-rose-400 animate-pulse' : 'text-rose-300'}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[10px] text-violet-200/70">
              <span>Crew Health</span>
              <span className="font-bold text-white">{crew.health}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
              <div className="h-full bg-gradient-to-r from-rose-500 to-rose-300 transition-all duration-1000" style={{ width: `${crew.health}%` }} />
            </div>
          </div>
        </div>
        <div className="panel-soft rounded-xl px-3 py-2 flex items-center gap-2">
          <SmilePlus className={`w-4 h-4 ${crew.morale < 35 ? 'text-amber-400 animate-pulse' : 'text-amber-300'}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[10px] text-violet-200/70">
              <span>Morale</span>
              <span className="font-bold text-white">{crew.morale}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mt-0.5">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-1000" style={{ width: `${crew.morale}%` }} />
            </div>
          </div>
        </div>
        <div className="panel-soft rounded-xl px-3 py-2 flex items-center gap-2" aria-label={`${resources.fuelCells} backup fuel cells left`}>
          <BatteryMedium className="w-4 h-4 text-cyan-300" aria-hidden />
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-4 h-5 rounded-sm border ${i <= resources.fuelCells ? 'bg-cyan-300/80 border-cyan-200/60' : 'bg-white/5 border-white/15'}`}
              />
            ))}
            <span className="text-[10px] text-violet-200/70 ml-1 hidden sm:inline">fuel cells</span>
          </div>
        </div>
      </div>
    </section>
  );
}
