'use client';

import { useRef, useState } from 'react';
import { Zap, Wind, ShieldHalf, FlaskConical, Sprout, Plus, Sparkles } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import { CUBES_PER_DAY, type Allocation, type ModuleKey, type ResourceState } from '@/lib/game/types';

const MODULES: {
  key: ModuleKey;
  name: string;
  icon: typeof Zap;
  ring: string;
  hot: string;
  chip: string;
  hint: string;
}[] = [
  {
    key: 'life',
    name: 'Life Support',
    icon: Wind,
    ring: 'border-emerald-400/50',
    hot: 'border-emerald-300 ring-4 ring-emerald-300/50',
    chip: 'bg-emerald-400/20 text-emerald-200',
    hint: 'Makes fresh air',
  },
  {
    key: 'shield',
    name: 'Shields',
    icon: ShieldHalf,
    ring: 'border-rose-400/50',
    hot: 'border-rose-300 ring-4 ring-rose-300/50',
    chip: 'bg-rose-400/20 text-rose-200',
    hint: 'Blocks bad sun rays',
  },
  {
    key: 'science',
    name: 'Science Lab',
    icon: FlaskConical,
    ring: 'border-violet-400/50',
    hot: 'border-violet-300 ring-4 ring-violet-300/50',
    chip: 'bg-violet-400/20 text-violet-200',
    hint: 'Earns science points',
  },
  {
    key: 'green',
    name: 'Greenhouse',
    icon: Sprout,
    ring: 'border-lime-400/50',
    hot: 'border-lime-300 ring-4 ring-lime-300/50',
    chip: 'bg-lime-400/20 text-lime-200',
    hint: 'Grows food',
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

interface DragState {
  from: ModuleKey | 'tray';
  x: number;
  y: number;
  over: ModuleKey | 'tray' | null;
  moved: boolean;
}

export function Cube({ onPointerDown, onPointerMove, onPointerUp, onClick, label, className = '' }: {
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 touch-none select-none items-center justify-center rounded-xl border-b-4 border-amber-700 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 text-amber-900 shadow-[0_0_12px_rgba(251,191,36,0.5)] transition active:scale-90 ${className}`}
    >
      <Zap className="h-6 w-6" aria-hidden />
    </button>
  );
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

  const [drag, setDrag] = useState<DragState | null>(null);
  const [trayPick, setTrayPick] = useState(false);
  const lastDropAt = useRef(0);

  const assign = (from: ModuleKey | 'tray', to: ModuleKey | 'tray') => {
    if (from === to) return;
    const next = { ...alloc };
    if (to === 'tray') {
      // moving a cube back to the tray
      if (from !== 'tray' && next[from] > 0) {
        next[from] -= 1;
        onChange(next);
        sfx.click();
      }
      return;
    }
    if (from === 'tray') {
      if (remaining <= 0) {
        sfx.fail();
        return;
      }
      next[to] += 1;
    } else {
      if (next[from] <= 0) return;
      next[from] -= 1;
      next[to] += 1;
    }
    onChange(next);
    sfx.drop();
  };

  const zoneAt = (x: number, y: number): ModuleKey | 'tray' | null => {
    const el = document.elementFromPoint(x, y);
    const z = el?.closest('[data-zone]')?.getAttribute('data-zone');
    if (z === 'life' || z === 'shield' || z === 'science' || z === 'green' || z === 'tray') return z;
    return null;
  };

  const startDrag = (from: ModuleKey | 'tray') => (e: React.PointerEvent) => {
    if (from === 'tray' && remaining <= 0) {
      sfx.fail();
      return;
    }
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* capture not available — tap fallback still works */
    }
    sfx.tick();
    setDrag({ from, x: e.clientX, y: e.clientY, over: null, moved: false });
  };

  const moveDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const over = zoneAt(e.clientX, e.clientY);
    setDrag({ ...drag, x: e.clientX, y: e.clientY, over, moved: true });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag) return;
    const over = zoneAt(e.clientX, e.clientY);
    if (over) {
      assign(drag.from, over);
      lastDropAt.current = Date.now();
    }
    setDrag(null);
    setTrayPick(false);
  };

  const clickGuard = () => Date.now() - lastDropAt.current < 350;

  const trayCubeClick = () => {
    if (clickGuard()) return;
    sfx.click();
    setTrayPick((v) => !v);
  };

  const cubeClick = (from: ModuleKey) => () => {
    if (clickGuard()) return;
    assign(from, 'tray');
  };

  const cubeColor = (from: ModuleKey | 'tray') => 'from-amber-200 via-amber-300 to-amber-500';

  return (
    <div className="space-y-3">
      {/* ---- power cube tray ---- */}
      <div
        data-zone="tray"
        className={`rounded-2xl border-2 border-dashed p-3 transition-all ${
          drag?.over === 'tray' ? 'border-amber-300 bg-amber-400/10 ring-4 ring-amber-300/50' : 'border-amber-400/40 bg-white/[0.03]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-display text-base text-white" aria-live="polite">
            <Zap className="h-5 w-5 text-amber-300" aria-hidden />
            {remaining === 0 ? (
              <>All {CUBES_PER_DAY} cubes placed!</>
            ) : (
              <>
                <span className="text-xl font-bold text-amber-300">{remaining}</span> cubes left
              </>
            )}
          </p>
          {showSuggestion && resources && (
            <button
              onClick={() => {
                sfx.confirm();
                onChange(suggestAllocation(resources));
                setTrayPick(false);
              }}
              className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-3 text-xs font-bold text-fuchsia-200 transition active:scale-95 hover:bg-fuchsia-500/25"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              A.S.T.R.O. idea
            </button>
          )}
        </div>
        <p className="mt-0.5 text-xs text-violet-200/60">Drag a cube onto a module — or tap a cube, then tap a module.</p>
        <div className="mt-2 flex min-h-[48px] flex-wrap gap-2">
          {Array.from({ length: remaining }).map((_, i) => (
            <Cube
              key={i}
              label="Power cube. Drag it to a module."
              onPointerDown={startDrag('tray')}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onClick={trayCubeClick}
              className={trayPick ? 'animate-[wiggle_0.5s_ease-in-out_infinite] ring-4 ring-amber-300/70' : ''}
            />
          ))}
          {remaining === 0 && (
            <span className="self-center text-sm text-amber-200/70 italic">Nice! Tap a cube to take it back.</span>
          )}
        </div>
      </div>

      {/* ---- module drop zones ---- */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const isHot = drag?.over === m.key;
          const isTarget = trayPick;
          return (
            <div
              key={m.key}
              data-zone={m.key}
              onClick={() => {
                if (clickGuard()) return;
                if (trayPick && remaining > 0) {
                  assign('tray', m.key);
                  setTrayPick(false);
                }
              }}
              className={`panel-soft rounded-2xl border-2 border-dashed p-3 transition-all ${
                isHot ? `${m.hot} animate-[zone-hot_0.5s_ease-in-out_infinite]` : m.ring
              } ${isTarget && remaining > 0 ? 'cursor-pointer scale-[1.015] ring-2 ring-white/30' : ''}`}
              role="group"
              aria-label={`${m.name}. ${m.hint}. ${alloc[m.key]} cubes assigned.`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${m.chip}`}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base text-white">{m.name}</p>
                    <p className="truncate text-xs text-violet-200/60">{m.hint}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (remaining <= 0) {
                      sfx.fail();
                      return;
                    }
                    sfx.tick();
                    onChange({ ...alloc, [m.key]: alloc[m.key] + 1 });
                    setTrayPick(false);
                  }}
                  disabled={remaining <= 0}
                  aria-label={`Add power cube to ${m.name}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 transition active:scale-90 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Plus className="h-5 w-5 text-white" aria-hidden />
                </button>
              </div>
              <div className="mt-2 flex min-h-[44px] flex-wrap gap-1.5">
                {Array.from({ length: alloc[m.key] }).map((_, i) => (
                  <Cube
                    key={i}
                    label={`Take one power cube back from ${m.name}`}
                    onPointerDown={startDrag(m.key)}
                    onPointerMove={moveDrag}
                    onPointerUp={endDrag}
                    onClick={cubeClick(m.key)}
                  />
                ))}
                {alloc[m.key] === 0 && (
                  <span className="self-center text-xs text-violet-200/40 italic">drop cubes here</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- floating drag ghost (follows the finger/mouse) ---- */}
      {drag?.moved && (
        <div className="pointer-events-none fixed z-[120]" style={{ left: drag.x - 22, top: drag.y - 26 }} aria-hidden>
          <div
            className={`flex h-11 w-11 rotate-6 scale-125 items-center justify-center rounded-xl border-b-4 border-amber-700 bg-gradient-to-b ${cubeColor(
              drag.from,
            )} shadow-[0_0_26px_rgba(251,191,36,0.85)]`}
            style={{ animation: 'cube-glow 1s ease-in-out infinite' }}
          >
            <Zap className="h-6 w-6 text-amber-900" />
          </div>
        </div>
      )}
    </div>
  );
}
