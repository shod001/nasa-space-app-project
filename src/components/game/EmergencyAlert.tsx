'use client';

import { EMERGENCIES, type EmergencyKind } from '@/lib/game/types';

interface Props {
  kind: EmergencyKind;
  onDismiss: () => void;
}

/**
 * Full-screen emergency alarm. Shown when a resource drops dangerously low.
 * Loud, bright and impossible to miss — but with a friendly kid-safe tone.
 */
export default function EmergencyAlert({ kind, onDismiss }: Props) {
  const info = EMERGENCIES[kind];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={info.title}
    >
      {/* flashing red backdrop */}
      <div className="absolute inset-0 bg-space-950" />
      <div className="absolute inset-0 animate-[siren-bg_0.9s_ease-in-out_infinite] bg-rose-600/60" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, rgba(255,255,255,0.14) 0 26px, transparent 26px 52px)',
          animation: 'siren-bg 1.4s linear infinite',
        }}
      />

      <div className="relative z-10 w-full max-w-lg text-center animate-[pop-in_0.3s_ease-out]">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-white/60 bg-rose-600 px-5 py-1.5 text-sm font-black uppercase tracking-[0.3em] text-white">
          <span className="h-3 w-3 animate-ping rounded-full bg-white" aria-hidden />
          Emergency
        </p>

        <div className="mx-auto mb-2 w-40 animate-[alert-shake_0.7s_ease-in-out_infinite] text-[110px] leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
          <span aria-hidden>{info.emoji}</span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white title-glow">{info.title}</h2>
        <p className="mx-auto mt-4 max-w-sm rounded-2xl border-2 border-white/25 bg-black/40 px-5 py-3 text-lg font-bold text-amber-200">
          {info.help}
        </p>

        <button
          onClick={onDismiss}
          autoFocus
          className="mt-7 min-h-[64px] w-full max-w-xs rounded-2xl border-b-4 border-amber-600 bg-gradient-to-b from-amber-300 to-amber-400 font-display text-xl font-bold text-space-950 shadow-[0_10px_40px_rgba(251,191,36,0.45)] transition active:scale-95 hover:from-amber-200"
        >
          Got it, Chief!
        </button>
      </div>
    </div>
  );
}
