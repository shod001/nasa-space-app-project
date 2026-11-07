'use client';

import { useEffect, useState } from 'react';

export type AstroMood = 'normal' | 'alert' | 'worried' | 'happy' | 'excited';

const MOOD_COLOR: Record<AstroMood, string> = {
  normal: '#a78bfa',
  alert: '#fb7185',
  worried: '#fbbf24',
  happy: '#34d399',
  excited: '#e879f9',
};

function AstroFace({ mood }: { mood: AstroMood }) {
  const c = MOOD_COLOR[mood];
  const mouth =
    mood === 'alert'
      ? 'M15 24 Q20 19 25 24 Q20 21 15 24' // surprised
      : mood === 'worried'
        ? 'M15 24 Q20 21 25 24'
        : 'M14 23 Q20 29 26 23'; // smile

  return (
    <svg viewBox="0 0 40 44" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 drop-shadow-[0_4px_14px_rgba(167,139,250,0.4)]" role="img" aria-label={`A.S.T.R.O. looks ${mood}`}>
      {/* antenna */}
      <line x1="20" y1="6" x2="20" y2="12" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="4.5" r="2.6" fill={c} className="animate-[blink_1.6s_ease-in-out_infinite]" />
      {/* head */}
      <rect x="6" y="12" width="28" height="24" rx="10" fill="#eef0f8" stroke="#c7cbe0" strokeWidth="1.5" />
      {/* face screen */}
      <rect x="10" y="16" width="20" height="16" rx="6" fill="#191233" />
      {/* eyes */}
      <g className="animate-[eye-blink_4.5s_infinite]" style={{ transformOrigin: '20px 22px' }}>
        <rect x="14" y="20" width="3.6" height="4.6" rx="1.8" fill="#67e8f9" />
        <rect x="22.4" y="20" width="3.6" height="4.6" rx="1.8" fill="#67e8f9" />
      </g>
      {/* mouth */}
      <path d={mouth} fill="none" stroke="#67e8f9" strokeWidth="1.6" strokeLinecap="round" />
      {/* ear pods */}
      <rect x="3.5" y="20" width="3" height="7" rx="1.5" fill={c} />
      <rect x="33.5" y="20" width="3" height="7" rx="1.5" fill={c} />
      {/* little body */}
      <rect x="13" y="37.5" width="14" height="6" rx="3" fill="#c7cbe0" />
      <circle cx="17" cy="40.5" r="1.2" fill={c} />
      <circle cx="23" cy="40.5" r="1.2" fill={c} />
    </svg>
  );
}

interface Props {
  mood: AstroMood;
  text: string;
  footer?: React.ReactNode;
}

export default function AstroPanel(props: Props) {
  // Remount the typewriter whenever the text changes (key = text).
  return <AstroTypewriter key={props.text} {...props} />;
}

function AstroTypewriter({ mood, text, footer }: Props) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(timer);
          return c;
        }
        return c + 1;
      });
    }, 17);
    return () => clearInterval(timer);
  }, [text]);

  const done = count >= text.length;
  const shown = text.slice(0, count);

  const skip = () => {
    setCount(text.length);
  };

  return (
    <section className="panel rounded-3xl p-4" aria-label="A.S.T.R.O. co-pilot message">
      <div className="flex items-start gap-3">
        <div className="animate-[floaty_4s_ease-in-out_infinite]">
          <AstroFace mood={mood} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xs tracking-widest uppercase" style={{ color: MOOD_COLOR[mood] }}>
            A.S.T.R.O. — Co-Pilot
          </p>
          <button
            onClick={skip}
            aria-label="Skip typing animation"
            className="text-left w-full mt-1 rounded-xl bg-space-800/70 border border-violet-400/15 px-3 py-2.5 text-sm text-violet-50 leading-relaxed cursor-pointer"
          >
            {shown}
            {!done && (
              <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-fuchsia-300 animate-pulse" aria-hidden />
            )}
          </button>
          {footer}
        </div>
      </div>
    </section>
  );
}
