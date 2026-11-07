'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';

export interface StarfieldProps {
  count?: number;
  className?: string;
}

interface StarSpec {
  top: number;
  left: number;
  size: number;
  delay: number;
  durClass: string;
}

/**
 * Twinkle durations (2-5s) as literal Tailwind arbitrary-animation classes so
 * the JIT compiler can see and emit them. Per-star phase offset is applied via
 * inline `animationDelay`, which overrides the shorthand's 0s delay.
 */
const STAR_DURATIONS = [
  'animate-[twinkle_2s_ease-in-out_infinite]',
  'animate-[twinkle_2.5s_ease-in-out_infinite]',
  'animate-[twinkle_3s_ease-in-out_infinite]',
  'animate-[twinkle_3.5s_ease-in-out_infinite]',
  'animate-[twinkle_4s_ease-in-out_infinite]',
  'animate-[twinkle_4.5s_ease-in-out_infinite]',
  'animate-[twinkle_5s_ease-in-out_infinite]',
] as const;

const GLOW_STAR_COUNT = 3;
const GLOW_SHADOW = '0 0 12px 3px rgba(196, 181, 253, 0.55)';

/** Tiny deterministic PRNG (mulberry32) so SSR and client render identical stars. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Decorative animated starfield. Parent element must be `relative`. */
export default function Starfield({ count = 70, className = '' }: StarfieldProps) {
  const stars = useMemo<StarSpec[]>(() => {
    const rand = mulberry32(0x5eed01 + count);
    return Array.from({ length: count }, () => ({
      top: rand() * 100,
      left: rand() * 100,
      size: 1 + rand() * 2,
      delay: rand() * 4,
      durClass: STAR_DURATIONS[Math.floor(rand() * STAR_DURATIONS.length)],
    }));
  }, [count]);

  const glowStars = useMemo<StarSpec[]>(() => {
    const rand = mulberry32(0x601a88);
    return Array.from({ length: GLOW_STAR_COUNT }, (_, i) => ({
      top: 6 + rand() * 55,
      left: 8 + rand() * 84,
      size: 3.5 + rand() * 1.5,
      delay: i * 1.4 + rand(),
      durClass: STAR_DURATIONS[(i * 2 + 1) % STAR_DURATIONS.length],
    }));
  }, []);

  const starStyle = (star: StarSpec, extra?: CSSProperties): CSSProperties =>
    ({
      top: `${star.top}%`,
      left: `${star.left}%`,
      width: `${star.size}px`,
      height: `${star.size}px`,
      animationDelay: `${star.delay.toFixed(2)}s`,
      ...extra,
    }) satisfies CSSProperties;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {stars.map((star, index) => (
        <div
          key={`star-${index}`}
          className={`absolute rounded-full bg-white ${star.durClass}`}
          style={starStyle(star)}
        />
      ))}

      {glowStars.map((star, index) => (
        <div
          key={`glow-${index}`}
          className={`absolute rounded-full bg-violet-200/80 ${star.durClass}`}
          style={starStyle(star, { boxShadow: GLOW_SHADOW })}
        />
      ))}

      {/* Cute little crescent planet, bottom-right */}
      <div className="absolute bottom-[7%] right-[5%] h-10 w-10 animate-[floaty_9s_ease-in-out_infinite] sm:h-12 sm:w-12">
        <div className="absolute inset-0 rounded-full bg-violet-400" />
        <div className="absolute inset-0 rounded-full shadow-[inset_-9px_-5px_0_0_rgba(76,29,149,0.6)]" />
        <div className="absolute left-[20%] top-[24%] h-1.5 w-1.5 rounded-full bg-violet-500/70" />
        <div className="absolute bottom-[26%] left-[34%] h-1 w-1 rounded-full bg-violet-500/60" />
      </div>
    </div>
  );
}
