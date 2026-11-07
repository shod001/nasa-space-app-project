'use client';

import { ArrowRight, FlaskConical, Wind, Apple, ShieldHalf, Zap, Heart, SmilePlus, BatteryMedium, NotebookPen } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import type { DayRecord } from '@/lib/game/types';

const ROWS: { key: keyof DayRecord['deltas']; name: string; icon: typeof Zap }[] = [
  { key: 'science', name: 'Science', icon: FlaskConical },
  { key: 'power', name: 'Power', icon: Zap },
  { key: 'oxygen', name: 'Oxygen', icon: Wind },
  { key: 'food', name: 'Food', icon: Apple },
  { key: 'shield', name: 'Shield', icon: ShieldHalf },
  { key: 'health', name: 'Crew Health', icon: Heart },
  { key: 'morale', name: 'Morale', icon: SmilePlus },
  { key: 'fuelCells', name: 'Fuel Cells', icon: BatteryMedium },
];

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

  return (
    <div className="fixed inset-0 z-50 bg-space-950/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Day ${day} summary`}>
      <div className="panel rounded-3xl p-6 w-full max-w-md max-h-[88vh] overflow-y-auto scrollbar-game animate-[pop-in_0.3s_ease-out]">
        <p className="text-[10px] uppercase tracking-[0.25em] text-violet-300/70 font-bold text-center">
          {isLastDay ? 'Mission Day Complete' : `Day ${day} complete`}
        </p>
        <h3 className="font-display text-2xl text-white text-center mt-1 title-glow">Night Report</h3>
        <p className="text-center text-xs text-violet-200/60 mt-1">
          {record.eventTitle} · chose <span className="text-white font-semibold">{record.choiceLabel}</span>
        </p>

        <ul className="mt-5 space-y-2">
          {rows.map((r, i) => {
            const v = record.deltas[r.key];
            const Icon = r.icon;
            return (
              <li
                key={r.key}
                className="animate-[pop-in_0.35s_ease-out_both] flex items-center gap-3 panel-soft rounded-xl px-3 py-2"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${v >= 0 ? 'bg-emerald-400/15' : 'bg-rose-400/15'}`}>
                  <Icon className={`w-4 h-4 ${v >= 0 ? 'text-emerald-300' : 'text-rose-300'}`} aria-hidden />
                </span>
                <span className="text-sm text-violet-100/90 flex-1">{r.name}</span>
                <span className={`font-display text-lg ${v > 0 ? 'text-emerald-300' : v < 0 ? 'text-rose-300' : 'text-violet-200/60'}`}>
                  {v > 0 ? '+' : v < 0 ? '−' : ''}
                  {Math.abs(v)}
                </span>
              </li>
            );
          })}
          {rows.length === 0 && (
            <li className="text-sm text-violet-200/60 italic text-center py-4">A calm, steady day at the outpost.</li>
          )}
        </ul>

        {record.note && (
          <p className="mt-4 text-xs text-amber-200/90 bg-amber-400/10 border border-amber-400/25 rounded-xl px-3 py-2 leading-relaxed flex gap-2">
            <NotebookPen className="w-4 h-4 shrink-0" aria-hidden />
            {record.note}
          </p>
        )}

        <button
          onClick={() => {
            sfx.confirm();
            onContinue();
          }}
          className="mt-5 min-h-[52px] w-full rounded-2xl font-display text-base font-semibold text-space-950 bg-gradient-to-r from-violet-300 to-fuchsia-300 hover:from-violet-200 hover:to-fuchsia-200 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          {isLastDay ? 'Final Debrief' : 'Next Morning'} <ArrowRight className="w-5 h-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
