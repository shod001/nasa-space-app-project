'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, BookOpen, FastForward, Lightbulb, PartyPopper } from 'lucide-react';
import { sfx } from '@/lib/game/audio';
import type { StoryBeat } from '@/lib/game/story';

/**
 * Cinematic story scene: a big illustration, story lines revealed
 * one tap at a time, then a real NASA fun fact + an A.S.T.R.O. joke.
 */
export default function StoryScene({ beat, onDone }: { beat: StoryBeat; onDone: () => void }) {
  const [revealed, setRevealed] = useState(1);
  const [jokeOpen, setJokeOpen] = useState(false);

  const total = beat.lines.length;
  const allShown = revealed >= total;

  const nextLine = () => {
    sfx.star();
    setRevealed((r) => Math.min(total, r + 1));
  };

  const finish = () => {
    sfx.confirm();
    onDone();
  };

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-8">
      <section className="panel relative rounded-3xl p-4 sm:p-6" aria-label={`Story: ${beat.title}`}>
        {/* skip (for replays) */}
        <button
          onClick={finish}
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-space-800/80 px-3 py-2 text-xs font-bold text-violet-200 transition hover:bg-space-700 min-h-[44px]"
          aria-label="Skip story"
        >
          <FastForward className="h-3.5 w-3.5" aria-hidden />
          Skip
        </button>

        {/* illustration */}
        <div className="relative">
          <span
            className="pointer-events-none absolute -inset-2 rounded-[2rem] bg-fuchsia-500/20 blur-xl"
            aria-hidden
          />
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-violet-400/25">
            <Image
              src={beat.art}
              alt={beat.artAlt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="animate-[floaty_7s_ease-in-out_infinite] object-cover"
              priority
            />
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-space-950/70 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-fuchsia-300 backdrop-blur">
              <BookOpen className="h-3.5 w-3.5" aria-hidden /> Story
            </span>
          </div>
        </div>

        {/* title */}
        <h2 className="mt-4 text-center font-display text-3xl text-white title-glow sm:text-4xl">
          {beat.title}
        </h2>

        {/* story lines */}
        <div aria-live="polite">
          <div className="mt-4 space-y-2">
            {beat.lines.slice(0, revealed).map((line, i) => (
              <p
                key={i}
                className="animate-[pop-in_0.45s_ease-out_both] rounded-2xl border border-violet-400/15 bg-space-800/70 px-4 py-3 text-lg font-semibold leading-relaxed text-violet-50 sm:text-xl"
                style={{ animationDelay: '0.05s' }}
              >
                {line}
              </p>
            ))}
          </div>

          {/* progress dots */}
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {beat.lines.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i < revealed ? 'w-6 bg-fuchsia-400' : 'w-2 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* next / extras */}
        {!allShown ? (
          <button
            onClick={nextLine}
            className="mt-4 flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-violet-800 bg-gradient-to-r from-fuchsia-500 to-violet-500 font-display text-xl font-bold text-white transition active:scale-[0.98] hover:from-fuchsia-400 hover:to-violet-400"
          >
            Next
            <ArrowRight className="h-6 w-6" aria-hidden />
          </button>
        ) : (
          <div className="mt-4 animate-[pop-in_0.4s_ease-out]">
            {/* A.S.T.R.O. line */}
            <div className="flex items-start gap-3 rounded-2xl border border-fuchsia-400/25 bg-fuchsia-500/10 px-4 py-3">
              <Image
                src="/images/astro-bot.png"
                alt="A.S.T.R.O., your robot co-pilot"
                width={44}
                height={44}
                className="mt-0.5 shrink-0 animate-[floaty_4s_ease-in-out_infinite] object-contain"
              />
              <p className="text-base font-semibold leading-relaxed text-fuchsia-100 sm:text-lg">
                <span className="font-black text-fuchsia-300">A.S.T.R.O.:</span> {beat.astro}
              </p>
            </div>

            {/* NASA fun fact */}
            <div className="mt-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
              <p className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-amber-300">
                <Lightbulb className="h-4 w-4" aria-hidden /> Real NASA Fact: {beat.fact.label}
              </p>
              <p className="mt-1.5 text-base leading-relaxed text-amber-100/90">{beat.fact.text}</p>
            </div>

            {/* A.S.T.R.O.'s joke */}
            <div className="mt-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3">
              <p className="flex items-center gap-2 font-display text-sm font-black uppercase tracking-wider text-emerald-300">
                <PartyPopper className="h-4 w-4" aria-hidden /> A.S.T.R.O.&apos;s Space Joke
              </p>
              <p className="mt-1.5 text-base font-semibold text-emerald-100/90">{beat.joke.setup}</p>
              {jokeOpen ? (
                <p className="mt-1.5 animate-[pop-in_0.35s_ease-out] text-lg font-black text-emerald-200">
                  {beat.joke.punchline} 😆
                </p>
              ) : (
                <button
                  onClick={() => {
                    sfx.medal();
                    setJokeOpen(true);
                  }}
                  className="mt-2 min-h-[44px] rounded-xl border-b-2 border-emerald-700 bg-emerald-400/20 px-4 py-1.5 text-sm font-bold text-emerald-100 transition hover:bg-emerald-400/30"
                >
                  See the answer!
                </button>
              )}
            </div>

            {/* continue */}
            <button
              onClick={finish}
              className="mt-4 flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-300 to-amber-400 font-display text-xl font-bold text-space-950 transition active:scale-[0.98] hover:from-amber-200 hover:to-amber-300"
            >
              {beat.cta}
              <ArrowRight className="h-6 w-6" aria-hidden />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
