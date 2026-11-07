'use client';

import { Zap, Wind, ShieldHalf, FlaskConical, Sprout, Plus, Sparkles } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import { CUBES_PER_DAY, type Allocation, type ModuleKey, type ResourceState } from '@/lib/game/types';

const MODULES: {
  key: ModuleKey;
  name: string;
  icon: typeof Zap;
  ring: string;
  chip: string;
  cube: string;
  hint: string;
}[] = [
  {
    key: 'life',
    name: 'Life Support',
    icon: Wind,
    ring: 'border-emerald-400/40',
    chip: 'bg-emerald-400/15 text-emerald-300',
    cube: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]',
    hint: 'Cleans air & water — keeps oxygen up',
  },
  {
    key: 'shield',
    name: 'Radiation Shields',
    icon: ShieldHalf,
    ring: 'border-rose-400/40',
    chip: 'bg-rose-400/15 text-rose-300',
    cube: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]',
    hint: 'Charges deflectors — blocks space radiation',
  },
  {
    key: 'science',
    name: 'Science Lab',
    icon: FlaskConical,
    ring: 'border-violet-400/40',
    chip: 'bg-violet-400/15 text-violet-300',
    cube: 'bg-violet-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]',
    hint: 'Runs experiments — earns science points',
  },
  {
    key: 'green',
    name: 'Greenhouse',
    icon: Sprout,
    ring: 'border-lime-400/40',
    chip: 'bg-lime-400/15 text-lime-300',
    cube: 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.5)]',
    hint: 'Grows food for the crew',
  },
];

/** Kid-friendly heuristic: protect whatever is running low. */
export function suggestAllocation(r: ResourceState): Allocation {
  const a: Allocation = { life: 3, shield: 2, science: 3, green: 2 };
  if (r.oxygen < 45) a.life += 2;
  if (r.shield < 45) a.shield += 2;
  if (r.food < 40) a.green += 2;
  if (r.power < 35) a.science = 1;
  let sum = a.life + a.shield + a.science + a.green;
  while (sum > 10) {
    if (a.science > 1) a.science--;
    else if (a.green > 1) a.green--;
    else a.shield--;
    sum--;
  }
  while (sum < 10) {
    a.science++;
    sum++;
  }
  return a;
}

interface Props {
  alloc: Allocation;
  onChange: (a: Allocation) => void;
  resources?: ResourceState;
  showSuggestion?: boolean;
}

export default function EnergyAllocator({ alloc, onChange, resources, showSuggestion }: Props) {
  const used = alloc.life + alloc.shield + alloc.science + alloc.green;
  const remaining = CUBES_PER_DAY - used;

  const add = (k: ModuleKey) => {
    if (remaining <= 0) return;
    sfx.tick();
    onChange({ ...alloc, [k]: alloc[k] + 1 });
  };
  const remove = (k: ModuleKey) => {
    if (alloc[k] <= 0) return;
    sfx.click();
    onChange({ ...alloc, [k]: alloc[k] - 1 });
  };
  const dropOn = (k: ModuleKey) => (e: React.DragEvent) => {
    e.preventDefault();
    const key = e.dataTransfer.getData('text/cube') as ModuleKey;
    if ((key === 'life' || key === 'shield' || key === 'science' || key === 'green') && remaining > 0) {
      sfx.tick();
      onChange({ ...alloc, [k]: alloc[k] + 1 });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div
          className="flex items-center gap-2 panel-soft rounded-full px-3 py-1.5"
          aria-live="polite"
          aria-label={`${remaining} power cubes left to assign`}
        >
          <Zap className="w-4 h-4 text-amber-300" aria-hidden />
          <span className="text-sm font-bold text-white">{remaining}</span>
          <span className="text-xs text-violet-200/80">cubes left</span>
        </div>
        {showSuggestion && resources && (
          <button
            onClick={() => {
              sfx.confirm();
              onChange(suggestAllocation(resources));
            }}
            className="min-h-[44px] px-3 rounded-full text-xs font-bold text-fuchsia-200 bg-fuchsia-500/15 border border-fuchsia-400/30 hover:bg-fuchsia-500/25 active:scale-95 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            A.S.T.R.O. suggestion
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={dropOn(m.key)}
              className={`panel-soft rounded-2xl p-3 border-2 border-dashed ${m.ring} transition-colors`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-8 h-8 rounded-xl ${m.chip} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-sm text-white truncate">{m.name}</p>
                    <p className="text-[10px] text-violet-200/60 leading-tight truncate">{m.hint}</p>
                  </div>
                </div>
                <button
                  onClick={() => add(m.key)}
                  disabled={remaining <= 0}
                  aria-label={`Add power cube to ${m.name}`}
                  className="w-9 h-9 shrink-0 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center active:scale-90 transition"
                >
                  <Plus className="w-5 h-5 text-white" aria-hidden />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 min-h-[26px]">
                {Array.from({ length: alloc[m.key] }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => remove(m.key)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/cube', m.key)}
                    aria-label={`Remove one power cube from ${m.name}`}
                    className={`w-6 h-6 rounded-md ${m.cube} hover:opacity-70 active:scale-90 transition cursor-pointer`}
                  />
                ))}
                {alloc[m.key] === 0 && (
                  <span className="text-[10px] text-violet-200/40 italic self-center">tap + to add cubes</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
