'use client';

import type { CSSProperties, ReactNode } from 'react';

export type ModuleStatus = 'nominal' | 'warning' | 'critical';

export interface BaseSceneProps {
  location: 'moon' | 'mars';
  day: number;
  statuses: {
    habitat: ModuleStatus; // ring around habitat dome (tracks oxygen)
    solar: ModuleStatus; // ring around solar array (power)
    greenhouse: ModuleStatus; // ring around greenhouse (food)
    lab: ModuleStatus; // ring around science lab (science activity)
    bunker: ModuleStatus; // ring around regolith bunker (shield)
  };
  roverState?: 'parked' | 'driving' | 'sheltered';
  sheltered?: boolean; // crew inside bunker: windows dim, astronauts walk over
  effects?: {
    dim?: number; // 0..1 -> black overlay opacity = dim * 0.55
    fog?: number; // 0..1 -> drifting blurred fog blobs
    radiation?: boolean; // red pulsing inset vignette
    storm?: boolean; // dust streaks + ochre tint
    night?: boolean; // darker sky tint
  };
}

/* ------------------------------------------------------------------ */
/* Static data (module scope: deterministic, hydration-safe)           */
/* ------------------------------------------------------------------ */

interface Palette {
  groundTop: string;
  groundBottom: string;
  crater: string;
  craterShadow: string;
  rock: string;
  horizon: string;
}

const PALETTES: Record<'moon' | 'mars', Palette> = {
  moon: {
    groundTop: '#bcb6cb',
    groundBottom: '#9c95b2',
    crater: '#968eac',
    craterShadow: 'rgba(58, 48, 92, 0.35)',
    rock: '#8d85a1',
    horizon: 'rgba(255, 255, 255, 0.22)',
  },
  mars: {
    groundTop: '#a8532c',
    groundBottom: '#7e391b',
    crater: '#8a4222',
    craterShadow: 'rgba(50, 20, 8, 0.35)',
    rock: '#6f3318',
    horizon: 'rgba(255, 214, 165, 0.35)',
  },
};

const CRATERS = [
  { left: '7%', top: '22%', w: '13%', h: '30%' },
  { left: '27%', top: '55%', w: '10%', h: '24%' },
  { left: '49%', top: '30%', w: '15%', h: '34%' },
  { left: '66%', top: '62%', w: '9%', h: '20%' },
  { left: '84%', top: '26%', w: '12%', h: '26%' },
];

const ROCKS = [
  { left: '18%', top: '46%', w: '2.6%', h: '11%', rot: -8 },
  { left: '44%', top: '72%', w: '2%', h: '8%', rot: 12 },
  { left: '57.5%', top: '40%', w: '1.7%', h: '7%', rot: -4 },
  { left: '78%', top: '56%', w: '2.4%', h: '9%', rot: 7 },
];

const DUST_STREAKS = [
  { top: 5, delay: -0.2 },
  { top: 14, delay: -1.1 },
  { top: 23, delay: -2 },
  { top: 31, delay: -0.6 },
  { top: 40, delay: -1.5 },
  { top: 48, delay: -2.4 },
  { top: 57, delay: -0.9 },
  { top: 66, delay: -1.8 },
  { top: 74, delay: -2.7 },
];

/** Literal duration variants so the Tailwind JIT can emit them. */
const STREAK_DUR_CLASSES = [
  'animate-[dust-streak_2.4s_linear_infinite]',
  'animate-[dust-streak_3.1s_linear_infinite]',
  'animate-[dust-streak_3.8s_linear_infinite]',
  'animate-[dust-streak_4.5s_linear_infinite]',
] as const;

const SKY_STARS = [
  { x: 90, y: 84, r: 1.6, o: 0.7 },
  { x: 150, y: 190, r: 1.2, o: 0.5 },
  { x: 235, y: 64, r: 1.8, o: 0.8 },
  { x: 305, y: 158, r: 1.3, o: 0.55 },
  { x: 392, y: 92, r: 1.5, o: 0.6 },
  { x: 470, y: 208, r: 1.2, o: 0.45 },
  { x: 540, y: 74, r: 1.7, o: 0.75 },
  { x: 645, y: 176, r: 1.3, o: 0.5 },
  { x: 706, y: 52, r: 1.4, o: 0.6 },
  { x: 872, y: 232, r: 1.2, o: 0.4 },
  { x: 958, y: 94, r: 1.5, o: 0.65 },
  { x: 1042, y: 178, r: 1.7, o: 0.7 },
  { x: 1122, y: 64, r: 1.3, o: 0.5 },
  { x: 204, y: 268, r: 1.2, o: 0.4 },
  { x: 524, y: 296, r: 1.4, o: 0.5 },
  { x: 982, y: 306, r: 1.3, o: 0.45 },
];

const TWINKLE_STARS = [
  { x: 132, y: 124, r: 2, delay: '-0.4s' },
  { x: 352, y: 44, r: 2.2, delay: '-1.2s' },
  { x: 598, y: 114, r: 1.9, delay: '-2s' },
  { x: 760, y: 244, r: 2, delay: '-0.8s' },
  { x: 902, y: 54, r: 2.1, delay: '-1.7s' },
  { x: 1082, y: 236, r: 1.8, delay: '-0.2s' },
];

const TWINKLE_SKY_CLASSES = [
  'animate-[twinkle_2.5s_ease-in-out_infinite]',
  'animate-[twinkle_3s_ease-in-out_infinite]',
  'animate-[twinkle_4s_ease-in-out_infinite]',
] as const;

const RING_TONES: Record<ModuleStatus, string> = {
  nominal: 'border-emerald-400/80',
  warning: 'animate-[ring-pulse_1.6s_ease-in-out_infinite] border-amber-400',
  critical: 'animate-[ring-pulse_0.8s_ease-in-out_infinite] border-rose-500',
};

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function SkyBackdrop({ location }: { location: 'moon' | 'mars' }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 675"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 z-0 h-full w-full"
    >
      <defs>
        <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
          {location === 'moon' ? (
            <>
              <stop offset="0%" stopColor="#120b2e" />
              <stop offset="100%" stopColor="#2a1b52" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#5a2c14" />
              <stop offset="55%" stopColor="#9c4f21" />
              <stop offset="100%" stopColor="#d98a4a" />
            </>
          )}
        </linearGradient>
        <radialGradient id="earth-sea" cx="0.35" cy="0.3" r="0.95">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="55%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </radialGradient>
        <clipPath id="earth-clip">
          <circle cx="800" cy="128" r="46" />
        </clipPath>
      </defs>

      <rect width="1200" height="675" fill="url(#sky-grad)" />

      {location === 'moon' ? (
        <g>
          {SKY_STARS.map((s, i) => (
            <circle key={`sky-star-${i}`} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={s.o} />
          ))}
          {TWINKLE_STARS.map((s, i) => (
            <circle
              key={`twinkle-star-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#ffffff"
              className={TWINKLE_SKY_CLASSES[i % TWINKLE_SKY_CLASSES.length]}
              style={{ animationDelay: s.delay }}
            />
          ))}

          {/* Cute planet Earth floating in the upper sky */}
          <g
            className="animate-[floaty_9s_ease-in-out_infinite]"
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <circle cx="800" cy="128" r="58" fill="#2dd4bf" opacity="0.12" />
            <circle cx="800" cy="128" r="46" fill="url(#earth-sea)" />
            <g clipPath="url(#earth-clip)">
              <ellipse cx="786" cy="112" rx="26" ry="12" fill="#0f766e" opacity="0.6" transform="rotate(-14 786 112)" />
              <ellipse cx="812" cy="142" rx="30" ry="11" fill="#115e59" opacity="0.55" transform="rotate(10 812 142)" />
              <ellipse cx="778" cy="152" rx="18" ry="8" fill="#0f766e" opacity="0.5" transform="rotate(-8 778 152)" />
            </g>
            <g fill="#ffffff" opacity="0.85">
              <ellipse cx="784" cy="122" rx="10" ry="4" />
              <ellipse cx="812" cy="134" rx="12" ry="4.5" />
              <ellipse cx="798" cy="148" rx="8" ry="3.5" />
            </g>
          </g>
        </g>
      ) : (
        <g>
          {/* faint dust haze bands */}
          <ellipse cx="600" cy="240" rx="720" ry="60" fill="#f0b07a" opacity="0.1" />
          <ellipse cx="600" cy="330" rx="760" ry="50" fill="#f6c48f" opacity="0.08" />
          <ellipse cx="600" cy="420" rx="800" ry="55" fill="#ffd9ae" opacity="0.1" />
          {/* tiny pale moon Phobos */}
          <circle cx="420" cy="105" r="15" fill="#ded5c8" />
          <circle cx="415" cy="101" r="4" fill="#c4b8a8" />
          <circle cx="426" cy="111" r="2.6" fill="#c9bda9" />
        </g>
      )}
    </svg>
  );
}

function ModuleSlot({
  label,
  status,
  style,
  children,
}: {
  label: string;
  status: ModuleStatus;
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="absolute z-10" style={style}>
      <div className={`rounded-[2rem] border-2 border-dashed p-1.5 sm:p-2 ${RING_TONES[status]}`}>
        <div className={status === 'critical' ? 'animate-[shake_0.6s_infinite]' : undefined}>{children}</div>
        <div className="mt-1 flex justify-center">
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/85">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function HabitatModule({ crewInside }: { crewInside: boolean }) {
  const windowFill = crewInside ? '#64748b' : '#fbbf24';
  return (
    <svg aria-hidden viewBox="0 0 140 100" className="h-auto w-full">
      <defs>
        <linearGradient id="hab-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#c3cbd9" />
        </linearGradient>
        <radialGradient id="hab-glow">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* little legs */}
      <rect x="22" y="86" width="11" height="12" rx="3" fill="#64748b" />
      <rect x="107" y="86" width="11" height="12" rx="3" fill="#64748b" />
      {/* dome */}
      <path d="M14 88 A56 56 0 0 1 126 88 Z" fill="url(#hab-shell)" stroke="#8f9bb3" strokeWidth="2.5" />
      {/* antenna with blinking red tip */}
      <line x1="70" y1="33" x2="70" y2="13" stroke="#8f9bb3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="70" cy="11" r="4" fill="#f87171" className="animate-[blink_1.4s_infinite]" />
      {/* glowing round windows (dim + steady when crew is sheltered) */}
      <circle
        cx="47"
        cy="63"
        r="15"
        fill="url(#hab-glow)"
        className={`transition-opacity duration-700 ${crewInside ? 'opacity-0' : 'opacity-70'}`}
      />
      <circle
        cx="93"
        cy="63"
        r="15"
        fill="url(#hab-glow)"
        className={`transition-opacity duration-700 ${crewInside ? 'opacity-0' : 'opacity-70'}`}
      />
      <circle
        cx="47"
        cy="63"
        r="10"
        fill={windowFill}
        stroke="#e2e8f0"
        strokeWidth="3"
        className={`transition-colors duration-700 ${crewInside ? undefined : 'animate-[blink_3s_ease-in-out_infinite]'}`}
      />
      <circle
        cx="93"
        cy="63"
        r="10"
        fill={windowFill}
        stroke="#e2e8f0"
        strokeWidth="3"
        className={`transition-colors duration-700 ${crewInside ? undefined : 'animate-[blink_3s_ease-in-out_infinite]'}`}
      />
      {/* door */}
      <rect x="61" y="64" width="18" height="24" rx="8" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
    </svg>
  );
}

function SolarArray() {
  const panels = [
    { y: 12, tilt: -7 },
    { y: 40, tilt: 5 },
    { y: 68, tilt: -7 },
  ];
  return (
    <svg aria-hidden viewBox="0 0 140 122" className="h-auto w-full">
      <defs>
        <linearGradient id="sol-cell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3730a3" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      {/* pole, foot and legs */}
      <rect x="52" y="104" width="36" height="9" rx="4" fill="#64748b" />
      <rect x="65" y="50" width="10" height="58" rx="3" fill="#6b7280" />
      <rect x="30" y="110" width="12" height="10" rx="3" fill="#64748b" />
      <rect x="98" y="110" width="12" height="10" rx="3" fill="#64748b" />
      {/* three tilted panels, gently rocking to track the sun */}
      <g
        className="animate-[panel-tilt_6s_ease-in-out_infinite]"
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        {panels.map((p) => (
          <g key={p.y} transform={`rotate(${p.tilt} 70 ${p.y + 9})`}>
            <rect x="24" y={p.y} width="92" height="18" rx="3" fill="url(#sol-cell)" stroke="#4c1d95" strokeWidth="1.5" />
            {[1, 2, 3, 4, 5].map((k) => (
              <line
                key={k}
                x1={24 + k * (92 / 6)}
                y1={p.y + 2}
                x2={24 + k * (92 / 6)}
                y2={p.y + 16}
                stroke="#a5b4fc"
                strokeWidth="1"
                opacity="0.7"
              />
            ))}
            <line x1="26" y1={p.y + 9} x2="114" y2={p.y + 9} stroke="#a5b4fc" strokeWidth="1" opacity="0.7" />
          </g>
        ))}
      </g>
    </svg>
  );
}

const PLANTS = [
  { x: 42, h: 18, delay: 0 },
  { x: 65, h: 24, delay: 0.7 },
  { x: 88, h: 15, delay: 1.3 },
];

function Greenhouse() {
  return (
    <svg aria-hidden viewBox="0 0 130 100" className="h-auto w-full">
      <defs>
        <linearGradient id="gh-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* little legs */}
      <rect x="26" y="86" width="10" height="12" rx="3" fill="#64748b" />
      <rect x="94" y="86" width="10" height="12" rx="3" fill="#64748b" />
      {/* swaying plants */}
      {PLANTS.map((p) => (
        <g
          key={p.x}
          className="animate-[sway_4s_ease-in-out_infinite]"
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%', animationDelay: `${p.delay}s` }}
        >
          <rect x={p.x - 9} y={79} width="18" height="7" rx="2" fill="#92400e" />
          <line x1={p.x} y1={79} x2={p.x} y2={79 - p.h} stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
          <ellipse
            cx={p.x - 7}
            cy={76 - p.h * 0.45}
            rx="7"
            ry="3.4"
            fill="#22c55e"
            transform={`rotate(-24 ${p.x - 7} ${76 - p.h * 0.45})`}
          />
          <ellipse
            cx={p.x + 7}
            cy={74 - p.h * 0.45}
            rx="7"
            ry="3.4"
            fill="#16a34a"
            transform={`rotate(24 ${p.x + 7} ${74 - p.h * 0.45})`}
          />
          <circle cx={p.x} cy={75 - p.h} r="4.2" fill="#4ade80" />
        </g>
      ))}
      {/* clear glass dome */}
      <path d="M14 88 A51 51 0 0 1 116 88 Z" fill="url(#gh-glass)" stroke="#6ee7b7" strokeWidth="2.5" />
      <line x1="65" y1="37" x2="65" y2="88" stroke="#a7f3d0" strokeWidth="1.5" opacity="0.8" />
      <path d="M28 72 Q65 58 102 72" fill="none" stroke="#a7f3d0" strokeWidth="1.5" opacity="0.8" />
    </svg>
  );
}

function ScienceLab({ crewInside }: { crewInside: boolean }) {
  const glassFill = crewInside ? '#64748b' : '#7dd3fc';
  return (
    <svg aria-hidden viewBox="0 0 130 112" className="h-auto w-full">
      <defs>
        <linearGradient id="lab-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#c3cbd9" />
        </linearGradient>
        <radialGradient id="lab-glow">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* little legs */}
      <rect x="30" y="96" width="11" height="14" rx="3" fill="#64748b" />
      <rect x="89" y="96" width="11" height="14" rx="3" fill="#64748b" />
      {/* rotating radar dish */}
      <rect x="61" y="46" width="5" height="14" fill="#64748b" />
      <g
        className="animate-[spin-slow_9s_linear_infinite]"
        style={{ transformBox: 'view-box', transformOrigin: '63.5px 42px' }}
      >
        <path d="M47.5 42 A16 7 0 0 1 79.5 42 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="63.5" y1="42" x2="63.5" y2="27" stroke="#94a3b8" strokeWidth="2" />
        <circle cx="63.5" cy="25" r="3" fill="#fbbf24" />
        <circle cx="63.5" cy="42" r="4" fill="#475569" />
      </g>
      {/* box module body */}
      <rect x="18" y="58" width="94" height="40" rx="10" fill="url(#lab-shell)" stroke="#8f9bb3" strokeWidth="2.5" />
      <rect x="19" y="58" width="92" height="11" rx="5.5" fill="#a78bfa" />
      <circle
        cx="39.5"
        cy="81"
        r="14"
        fill="url(#lab-glow)"
        className={`transition-opacity duration-700 ${crewInside ? 'opacity-0' : 'opacity-70'}`}
      />
      <rect
        x="30"
        y="74"
        width="19"
        height="15"
        rx="4"
        fill={glassFill}
        stroke="#e2e8f0"
        strokeWidth="2.5"
        className="transition-colors duration-700"
      />
      <rect x="88" y="74" width="15" height="24" rx="6" fill="#475569" stroke="#94a3b8" strokeWidth="2" />
    </svg>
  );
}

function BunkerModule() {
  return (
    <svg aria-hidden viewBox="0 0 150 96" className="h-auto w-full">
      <defs>
        <pattern id="hz-stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="14" height="14" fill="#facc15" />
          <rect width="7" height="14" fill="#18181b" />
        </pattern>
        <linearGradient id="bunker-shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b6b3c4" />
          <stop offset="100%" stopColor="#7c7891" />
        </linearGradient>
      </defs>
      {/* little legs */}
      <rect x="16" y="84" width="13" height="10" rx="3" fill="#57534e" />
      <rect x="121" y="84" width="13" height="10" rx="3" fill="#57534e" />
      {/* regolith mound */}
      <path d="M8 88 Q18 38 75 36 Q132 38 142 88 Z" fill="url(#bunker-shell)" stroke="#5f5b73" strokeWidth="2.5" />
      {/* hazard stripe */}
      <rect x="44" y="56" width="62" height="11" rx="3" fill="url(#hz-stripes)" stroke="#3f3f46" strokeWidth="1.5" />
      {/* round airlock door */}
      <circle cx="75" cy="74" r="13.5" fill="#3f3f46" stroke="#d4d4d8" strokeWidth="3" />
      <circle cx="75" cy="74" r="7" fill="#52525b" />
      <circle cx="75" cy="74" r="2.4" fill="#fde047" />
      {/* vent */}
      <rect x="108" y="60" width="14" height="9" rx="2" fill="#57534e" />
      <line x1="111" y1="63" x2="119" y2="63" stroke="#a8a29e" strokeWidth="1.4" />
      <line x1="111" y1="66" x2="119" y2="66" stroke="#a8a29e" strokeWidth="1.4" />
    </svg>
  );
}

function Rover({ bob }: { bob: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 150 100"
      className={`h-auto w-full ${bob ? 'animate-[rover-bob_2.4s_ease-in-out_infinite]' : ''}`}
    >
      <defs>
        <linearGradient id="rov-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#c3cbd9" />
        </linearGradient>
      </defs>
      {/* flag + antenna */}
      <line x1="62" y1="30" x2="62" y2="10" stroke="#71717a" strokeWidth="2.5" />
      <path d="M62 10 L80 14 L62 18 Z" fill="#fb7185" />
      <line x1="116" y1="30" x2="123" y2="12" stroke="#71717a" strokeWidth="2" />
      <circle cx="123" cy="11" r="3.4" fill="#fbbf24" className="animate-[blink_2s_ease-in-out_infinite]" />
      {/* three chunky wheels */}
      {[38, 75, 112].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="79" r="14.5" fill="#27272a" />
          <circle cx={cx} cy="79" r="6" fill="#52525b" />
          <circle cx={cx} cy="79" r="2" fill="#a1a1aa" />
        </g>
      ))}
      {/* body */}
      <rect x="16" y="30" width="118" height="35" rx="12" fill="url(#rov-body)" stroke="#8f9bb3" strokeWidth="2.5" />
      <rect x="16" y="47" width="118" height="7" fill="#8b5cf6" opacity="0.9" />
      <rect x="26" y="34" width="26" height="13" rx="5" fill="#7dd3fc" stroke="#e0f2fe" strokeWidth="2" />
      <rect x="98" y="20" width="26" height="12" rx="4" fill="#a78bfa" stroke="#7c3aed" strokeWidth="1.5" />
      <circle cx="21" cy="57" r="3.2" fill="#fde047" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Main scene                                                          */
/* ------------------------------------------------------------------ */

export default function BaseScene({
  location,
  day,
  statuses,
  roverState = 'parked',
  sheltered = false,
  effects = {},
}: BaseSceneProps) {
  const { dim = 0, fog = 0, radiation = false, storm = false, night = false } = effects;
  const palette = PALETTES[location];

  return (
    <div
      className="relative aspect-video h-full w-full select-none overflow-hidden rounded-3xl border border-violet-400/20 bg-[#0c0918]"
    >
      <SkyBackdrop location={location} />

      {/* distant mesa (mars only), rooted at the horizon */}
      {location === 'mars' && (
        <div
          aria-hidden
          className="absolute bottom-[34.6%] left-[56%] z-[1] h-[9%] w-[13%] bg-gradient-to-b from-[#b06034] to-[#8a3f1e] [clip-path:polygon(6%_100%,20%_0,80%_0,94%_100%)]"
        />
      )}

      {/* ground = bottom 35% */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-[2] h-[35%]"
        style={{ background: `linear-gradient(180deg, ${palette.groundTop} 0%, ${palette.groundBottom} 100%)` }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[8px]"
          style={{ background: `linear-gradient(180deg, ${palette.horizon}, transparent)` }}
        />
        {CRATERS.map((c, i) => (
          <div
            key={`crater-${i}`}
            className="absolute rounded-[50%]"
            style={{
              left: c.left,
              top: c.top,
              width: c.w,
              height: c.h,
              background: palette.crater,
              boxShadow: `inset 0 5px 10px ${palette.craterShadow}`,
            }}
          />
        ))}
        {ROCKS.map((r, i) => (
          <div
            key={`rock-${i}`}
            className="absolute rounded-[45%]"
            style={{
              left: r.left,
              top: r.top,
              width: r.w,
              height: r.h,
              background: palette.rock,
              transform: `rotate(${r.rot}deg)`,
            }}
          />
        ))}
      </div>

      {/* modules with status rings */}
      <ModuleSlot label="SOLAR" status={statuses.solar} style={{ left: '2.5%', width: '15%', bottom: '30%' }}>
        <SolarArray />
      </ModuleSlot>
      <ModuleSlot label="LAB" status={statuses.lab} style={{ left: '21%', width: '12.5%', bottom: '29.5%' }}>
        <ScienceLab crewInside={sheltered} />
      </ModuleSlot>
      <ModuleSlot label="HABITAT" status={statuses.habitat} style={{ left: '41%', width: '18%', bottom: '30%' }}>
        <HabitatModule crewInside={sheltered} />
      </ModuleSlot>
      <ModuleSlot
        label="GREENHOUSE"
        status={statuses.greenhouse}
        style={{ left: '62.5%', width: '13.5%', bottom: '30%' }}
      >
        <Greenhouse />
      </ModuleSlot>
      <ModuleSlot label="BUNKER" status={statuses.bunker} style={{ left: '80%', width: '16%', bottom: '28.5%' }}>
        <BunkerModule />
      </ModuleSlot>

      {/* rover: parked between habitat and greenhouse, drives across, or shelters by the bunker */}
      <div aria-hidden className="absolute inset-x-0 bottom-[26%] z-[12]">
        <div className={roverState === 'driving' ? 'w-full animate-[drive_16s_linear_infinite]' : 'w-full'}>
          <div className={`relative w-[11%] ${roverState === 'sheltered' ? 'ml-[70%]' : 'ml-[54%]'}`}>
            <Rover bob={roverState === 'parked'} />
          </div>
        </div>
      </div>

      {/* tiny astronauts walking from habitat to the bunker when sheltered */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[14]">
        {[0, 1].map((i) => (
          <div
            key={`astro-${i}`}
            className="absolute h-[18px] w-[13px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.35)] transition-all duration-1000 ease-in-out"
            style={{
              bottom: i === 0 ? '29.5%' : '28.8%',
              left: sheltered ? `${72.5 + i * 3.5}%` : `${45.5 + i * 2.5}%`,
              opacity: sheltered ? 1 : 0,
              transitionDelay: `${i * 0.18}s`,
            }}
          >
            <div className="absolute left-1/2 top-[3px] h-[5px] w-[7px] -translate-x-1/2 rounded-full bg-amber-300" />
            <div className="absolute bottom-[1px] left-[2px] h-[3px] w-[4px] rounded-[1px] bg-slate-400" />
            <div className="absolute bottom-[1px] right-[2px] h-[3px] w-[4px] rounded-[1px] bg-slate-400" />
          </div>
        ))}
      </div>

      {/* effect overlays */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl">
        {radiation && (
          <div className="absolute inset-0 animate-[ring-pulse_1.2s_ease-in-out_infinite] shadow-[inset_0_0_80px_rgba(244,63,94,0.55)]" />
        )}
        {storm && (
          <div className="absolute inset-0">
            {DUST_STREAKS.map((s, i) => (
              <div
                key={`streak-${i}`}
                className={`absolute left-0 h-[3px] w-[22%] rounded-full bg-[#f1d3ad]/60 ${STREAK_DUR_CLASSES[i % STREAK_DUR_CLASSES.length]}`}
                style={{ top: `${s.top}%`, animationDelay: `${s.delay}s` }}
              />
            ))}
            <div className="absolute inset-0 bg-[#c47a3a]/20" />
          </div>
        )}
        <div className="absolute inset-0" style={{ opacity: fog * 0.7, transition: 'opacity 0.8s ease' }}>
          <div className="absolute -left-[12%] bottom-[8%] h-[46%] w-[58%] animate-[fog-drift_10s_ease-in-out_infinite] rounded-full bg-cyan-100/40 blur-xl" />
          <div
            className="absolute -right-[10%] top-[12%] h-[42%] w-[52%] animate-[fog-drift_10s_ease-in-out_infinite] rounded-full bg-white/50 blur-xl"
            style={{ animationDelay: '-5s' }}
          />
        </div>
        {night && <div className="absolute inset-0 bg-black/45" />}
        <div className="absolute inset-0 bg-black transition-opacity duration-700" style={{ opacity: dim * 0.55 }} />
      </div>

      {/* day chip */}
      <div className="absolute left-3 top-3 z-30 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
        {location === 'mars' ? 'SOL' : 'DAY'} {day}
      </div>
    </div>
  );
}
