'use client';

import Image from 'next/image';
import { Rocket, Satellite, Sparkles } from 'lucide-react';
import { sfx } from '@/lib/game/audio';

export default function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl flex flex-col items-center text-center">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 animate-[floaty_5s_ease-in-out_infinite]">
          <Image
            src="/images/astro-bot.png"
            alt="A.S.T.R.O., your friendly robot co-pilot"
            fill
            sizes="(max-width: 640px) 112px, 144px"
            className="object-contain drop-shadow-[0_10px_30px_rgba(192,132,252,0.45)]"
            priority
          />
        </div>

        <p className="mt-4 text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-violet-300/80">
          A NASA-data mission game
        </p>
        <h1 className="font-display text-5xl sm:text-7xl font-semibold text-white title-glow leading-tight">
          Outpost Director
        </h1>
        <p className="font-display text-2xl sm:text-4xl font-medium bg-gradient-to-r from-amber-300 via-fuchsia-300 to-emerald-300 bg-clip-text text-transparent mt-1">
          Moon &amp; Mars
        </p>

        <p className="mt-5 max-w-xl text-sm sm:text-base text-violet-100/80">
          You are the <span className="text-amber-300 font-bold">Outpost Commander</span>. Keep your crew
          safe and happy, run amazing science, and survive <span className="font-bold text-white">14 days</span> of
          real space surprises — guided by your co-pilot <span className="font-bold text-fuchsia-300">A.S.T.R.O.</span>
        </p>

        <button
          onClick={() => {
            sfx.launch();
            onStart();
          }}
          className="mt-8 min-h-[56px] px-10 rounded-full font-display text-xl font-semibold text-space-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 active:scale-95 transition-all shadow-[0_10px_40px_rgba(251,191,36,0.35)] flex items-center gap-3"
        >
          <Rocket className="w-6 h-6" aria-hidden />
          Start Mission
        </button>

        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
          <span className="panel-soft rounded-full px-3 py-1.5 text-violet-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" aria-hidden /> For explorers ages 7–12
          </span>
          <span className="panel-soft rounded-full px-3 py-1.5 text-violet-200 flex items-center gap-1.5">
            <Satellite className="w-3.5 h-3.5 text-emerald-300" aria-hidden /> Powered by real NASA data concepts
          </span>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-2xl">
          <div className="panel rounded-3xl p-1.5 rotate-[-2deg] hover:rotate-0 transition-transform">
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden">
              <Image
                src="/images/moon-hero.png"
                alt="Cartoon moon base on the lunar south pole"
                fill
                sizes="(max-width: 640px) 45vw, 380px"
                className="object-cover"
              />
            </div>
            <p className="py-2 font-display text-sm text-moon-300">Lunar South Pole</p>
          </div>
          <div className="panel rounded-3xl p-1.5 rotate-[2deg] hover:rotate-0 transition-transform">
            <div className="relative aspect-[2/1] rounded-2xl overflow-hidden">
              <Image
                src="/images/mars-hero.png"
                alt="Cartoon Mars base in Jezero crater"
                fill
                sizes="(max-width: 640px) 45vw, 380px"
                className="object-cover"
              />
            </div>
            <p className="py-2 font-display text-sm text-mars-400">Mars Jezero Crater</p>
          </div>
        </div>
      </div>
    </main>
  );
}
