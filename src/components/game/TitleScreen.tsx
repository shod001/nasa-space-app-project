'use client';

import Image from 'next/image';
import { Rocket, Satellite, Sparkles } from 'lucide-react';
import { sfx } from '@/lib/game/audio';

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        <div className="relative h-32 w-32 animate-[floaty_5s_ease-in-out_infinite] sm:h-40 sm:w-40">
          <Image
            src="/images/astro-bot.png"
            alt="A.S.T.R.O., your friendly robot co-pilot"
            fill
            sizes="(max-width: 640px) 128px, 160px"
            className="object-contain drop-shadow-[0_10px_30px_rgba(192,132,252,0.45)]"
            priority
          />
        </div>

        <p className="mt-4 text-sm font-black uppercase tracking-[0.3em] text-violet-300/80 sm:text-base">
          A NASA space mission game
        </p>
        <h1 className="mt-1 font-display text-5xl font-semibold leading-tight text-white title-glow sm:text-7xl">
          Outpost Director
        </h1>
        <p className="animated-gradient mt-1 bg-gradient-to-r from-amber-300 via-fuchsia-300 to-emerald-300 bg-clip-text font-display text-2xl font-medium text-transparent sm:text-4xl">
          Moon &amp; Mars
        </p>

        <p className="mt-5 max-w-2xl text-lg text-violet-100/85 sm:text-xl">
          You are the <span className="font-bold text-amber-300">Commander</span>! Keep your crew
          <span className="font-bold text-white"> safe</span> and <span className="font-bold text-emerald-300">happy</span>. Grow
          food. Do <span className="font-bold text-fuchsia-300">science</span>. Survive
          <span className="font-bold text-white"> 14 days </span>
          of space surprises with your robot friend <span className="font-bold text-fuchsia-300">A.S.T.R.O.</span>
        </p>

        <button
          onClick={() => {
            sfx.launch();
            onStart();
          }}
          className="mt-8 flex min-h-[64px] items-center gap-3 rounded-full border-b-4 border-amber-600 bg-gradient-to-r from-amber-300 to-amber-400 px-12 font-display text-2xl font-bold text-space-950 shadow-[0_10px_40px_rgba(251,191,36,0.35)] transition-all active:scale-95 hover:from-amber-200 hover:to-amber-300"
        >
          <Rocket className="h-7 w-7" aria-hidden />
          Start Mission!
        </button>

        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          <span className="panel-soft flex items-center gap-1.5 rounded-full px-4 py-2 text-violet-200">
            <Sparkles className="h-4 w-4 text-fuchsia-300" aria-hidden /> Ages 7–12
          </span>
          <span className="panel-soft flex items-center gap-1.5 rounded-full px-4 py-2 text-violet-200">
            <Satellite className="h-4 w-4 text-emerald-300" aria-hidden /> Real NASA science
          </span>
          <span className="panel-soft flex items-center gap-1.5 rounded-full px-4 py-2 text-violet-200">
            🎯 Easy, Normal, and Hard modes
          </span>
        </div>

        <div className="mt-10 grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-5">
          <div className="panel rotate-[-2deg] rounded-3xl p-1.5 transition-transform hover:rotate-0">
            <div className="relative aspect-[2/1] overflow-hidden rounded-2xl">
              <Image
                src="/images/moon-hero.png"
                alt="Cartoon moon base on the lunar south pole"
                fill
                sizes="(max-width: 640px) 45vw, 380px"
                className="object-cover"
              />
            </div>
            <p className="py-2 font-display text-base text-moon-300">Lunar South Pole</p>
          </div>
          <div className="panel rotate-[2deg] rounded-3xl p-1.5 transition-transform hover:rotate-0">
            <div className="relative aspect-[2/1] overflow-hidden rounded-2xl">
              <Image
                src="/images/mars-hero.png"
                alt="Cartoon Mars base in Jezero crater"
                fill
                sizes="(max-width: 640px) 45vw, 380px"
                className="object-cover"
              />
            </div>
            <p className="py-2 font-display text-base text-mars-400">Mars Jezero Crater</p>
          </div>
        </div>
      </div>
    </main>
  );
}
