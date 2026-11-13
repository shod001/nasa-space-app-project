'use client';

import { ArrowRight, FlaskConical, Wind, Apple, ShieldHalf, Zap, Heart, SmilePlus, BatteryMedium, NotebookPen, Star } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import type { DayRecord } from '@/lib/game/types';

const ROWS: { key: keyof DayRecord['deltas']; name: string; icon: typeof Zap }[] = [
  { key: 'science', name: 'Science', icon: FlaskConical },
  { key: 'power', name: 'Power', icon: Zap },
  { key: 'oxygen', name: 'Oxygen', icon: Wind },
  { key: 'food', name: 'Food', icon: Apple },
  { key: 'shield', name: 'Shield', icon: ShieldHalf },
  { key: 'health', name: 'Crew Health', icon: Heart },
  { key: 'morale', name: 'Happy', icon: SmilePlus },
  { key: 'fuelCells', name: 'Fuel Cells', icon: BatteryMedium },
];

function dayStars(deltas: DayRecord['deltas']): number {
  if (deltas.science >= 20 && deltas.health >= 0 && deltas.oxygen >= 0) return 3;
  if (deltas.science >= 10) return 2;
  return 1;
}

export default function DaySummary({
  day,
  record,
  isLastDay,
  onContinue,
}: {
  day: number;
  record: DayRecord;
  isLastDay: boolean;
  onContinue: () => void;
}) {
  const rows = ROWS.filter((r) => (r.key === 'fuelCells' ? record.deltas.fuelCells !== 0 : record.deltas[r.key] !== 0));
  const stars = dayStars(record.deltas);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-space-950/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Day ${day} summary`}
    >
      <div className="panel max-h-[90vh] w-full max-w-lg animate-[pop-in_0.3s_ease-out] overflow-y-auto scrollbar-game rounded-3xl p-6">
        <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-violet-300/70">
          {isLastDay ? 'Mission day complete' : `Day ${day} complete`}
        </p>
        <h3 className="mt-1 text-center font-display text-3xl text-white title-glow">Night Report</h3>

        {/* stars earned today */}
        <div className="mt-2 flex justify-center gap-2" aria-label={`${stars} of 3 stars for today`}>
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={`h-10 w-10 animate-[star-pop_0.5s_ease-out_both] ${
                s <= stars ? 'fill-amber-300 text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]' : 'text-white/15'
              }`}
              style={{ animationDelay: `${0.15 + s * 0.18}s` }}
              aria-hidden
            />
          ))}
        </div>
        <p className="mt-1 text-center text-sm font-bold text-amber-300">
          {stars === 3 ? 'Perfect day, Commander!' : stars === 2 ? 'Good day! Keep going!' : 'A safe day. Try more science!'}
        </p>

        <p className="mt-2 text-center text-sm text-violet-200/60">
          {record.eventTitle} · chose <span className="font-semibold text-white">{record.choiceLabel}</span>
        </p>

        <ul className="mt-5 space-y-2">
          {rows.map((r, i) => {
            const v = record.deltas[r.key];
            const Icon = r.icon;
            return (
              <li
                key={r.key}
                className="animate-[pop-in_0.35s_ease-out_both] flex items-center gap-3 panel-soft rounded-xl px-3 py-2.5"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${v >= 0 ? 'bg-emerald-400/15' : 'bg-rose-400/15'}`}>
                  <Icon className={`h-5 w-5 ${v >= 0 ? 'text-emerald-300' : 'text-rose-300'}`} aria-hidden />
                </span>
                <span className="flex-1 text-base text-violet-100/90">{r.name}</span>
                <span className={`font-display text-2xl ${v > 0 ? 'text-emerald-300' : v < 0 ? 'text-rose-300' : 'text-violet-200/60'}`}>
                  {v > 0 ? '+' : v < 0 ? '−' : ''}
                  {Math.abs(v)}
                </span>
              </li>
            );
          })}
          {rows.length === 0 && (
            <li className="py-4 text-center text-base italic text-violet-200/60">A calm, steady day at the outpost.</li>
          )}
        </ul>

        {record.note && (
          <p className="mt-4 flex gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-sm leading-relaxed text-amber-200/90">
            <NotebookPen className="h-5 w-5 shrink-0" aria-hidden />
            {record.note}
          </p>
        )}

        <button
          onClick={() => {
            sfx.confirm();
            onContinue();
          }}
          className="mt-5 flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-500/60 bg-gradient-to-r from-violet-300 to-fuchsia-300 font-display text-lg font-bold text-space-950 transition active:scale-[0.98] hover:from-violet-200 hover:to-fuchsia-200"
        >
          {isLastDay ? 'Final Debrief' : 'Next Morning'} <ArrowRight className="h-6 w-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}
