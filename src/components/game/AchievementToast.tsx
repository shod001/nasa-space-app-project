'use client';

import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import type { Achievement } from '@/lib/game/types';

interface Props {
  achievement: Achievement;
  onDone: () => void;
}

/**
 * "ACHIEVEMENT UNLOCKED" banner that slides in from the top of the screen,
 * plays a fanfare, sparkles, and auto-hides after a few seconds.
 */
export default function AchievementToast({ achievement, onDone }: Props) {
  useEffect(() => {
    sfx.medal();
    const t = setTimeout(onDone, 3600);
    return () => clearTimeout(t);
  }, [achievement.id, onDone]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-2 z-[80] flex justify-center px-3" aria-live="polite">
      <div
        key={achievement.id}
        className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-300/70 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 animated-gradient p-[3px] shadow-[0_16px_50px_rgba(251,146,60,0.5)]"
        style={{ animation: 'achievement-in 3.6s ease-in-out both' }}
        role="status"
      >
        <div className="relative flex items-center gap-3 rounded-[20px] bg-space-900/95 px-4 py-3">
          {/* shine sweep */}
          <span
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]"
            aria-hidden
          >
            <span
              className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              style={{ animation: 'shine-sweep 2.2s ease-in-out infinite' }}
            />
          </span>

          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-300 to-orange-400 shadow-[0_0_18px_rgba(251,191,36,0.65)] animate-[bounce-soft_1.6s_ease-in-out_infinite]">
            <span className="text-3xl" aria-hidden>
              {achievement.emoji}
            </span>
          </span>

          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.25em] text-amber-300">
              <Trophy className="h-3.5 w-3.5" aria-hidden /> Achievement unlocked!
            </p>
            <p className="font-display text-lg font-bold text-white">{achievement.name}</p>
            <p className="truncate text-xs text-violet-200/80">{achievement.desc}</p>
          </div>

          <span className="absolute -right-1 -top-1 text-2xl animate-[star-pop_0.5s_ease-out_both]" aria-hidden>
            ✨
          </span>
        </div>
      </div>
    </div>
  );
}
