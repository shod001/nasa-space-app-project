'use client';

import { useEffect } from 'react';
import { Rocket, Users } from 'lucide-react';
import { setSoundEnabled, sfx } from '@/lib/game/audio';
import { useGame } from '@/hooks/use-game';
import { sceneStatuses } from '@/lib/game/engine';
import { TOTAL_DAYS, type GameState } from '@/lib/game/types';
import Starfield from './scene/Starfield';
import BaseScene from './scene/BaseScene';
import TitleScreen from './TitleScreen';
import LocationSelect from './LocationSelect';
import DifficultySelect from './DifficultySelect';
import EnergyAllocator from './EnergyAllocator';
import Hud from './Hud';
import ResourceBars from './ResourceBars';
import AstroPanel, { type AstroMood } from './AstroPanel';
import DecisionCards from './DecisionCards';
import { BriefingCard, ActionPanel, ResolutionPanel } from './MissionPanels';
import DaySummary from './DaySummary';
import Debrief from './Debrief';
import EmergencyAlert from './EmergencyAlert';
import AchievementToast from './AchievementToast';

/** Extra living background: aurora glows + shooting stars. */
function DeepSpace() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -top-32 left-[8%] h-96 w-96 animate-[aurora-drift_14s_ease-in-out_infinite] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div
        className="absolute right-[4%] top-[35%] h-80 w-80 animate-[aurora-drift_18s_ease-in-out_infinite] rounded-full bg-emerald-400/10 blur-3xl"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute bottom-[8%] left-[30%] h-72 w-72 animate-[aurora-drift_16s_ease-in-out_infinite] rounded-full bg-amber-400/10 blur-3xl"
        style={{ animationDelay: '-11s' }}
      />
      {[
        { top: '6%', right: '12%', delay: '2s', dur: '7s' },
        { top: '18%', right: '55%', delay: '5.5s', dur: '9s' },
        { top: '4%', right: '80%', delay: '9s', dur: '8s' },
      ].map((s, i) => (
        <span
          key={i}
          className="absolute h-1 w-24 rounded-full bg-gradient-to-l from-white via-violet-200/80 to-transparent"
          style={{
            top: s.top,
            right: s.right,
            animation: `shooting-star ${s.dur} linear ${s.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Shell({ state, children }: { state: GameState; children: React.ReactNode }) {
  return (
    <div className="game-root relative flex min-h-screen flex-col overflow-x-clip text-foreground">
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <Starfield count={90} />
      </div>
      <DeepSpace />
      {children}
      <footer className="relative z-10 mt-auto pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 text-center">
        <p className="px-4 text-xs text-violet-300/50">
          Outpost Director: Moon &amp; Mars — a kids&apos; mission game with real NASA science · DONKI · OSDR · REMS · LRO · SCaN
        </p>
        {state.phase !== 'title' && (
          <p className="sr-only">
            Mission progress: day {state.day} of {TOTAL_DAYS}.
          </p>
        )}
      </footer>
    </div>
  );
}

function SetupScreen({
  alloc,
  onChange,
  onLaunch,
}: {
  alloc: GameState['allocation'];
  onChange: (a: GameState['allocation']) => void;
  onLaunch: () => void;
}) {
  const used = alloc.life + alloc.shield + alloc.science + alloc.green;
  const ready = used === 10;
  return (
    <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-10">
      <div className="panel rounded-3xl p-5 sm:p-6">
        <h2 className="text-center font-display text-3xl text-white title-glow sm:text-4xl">Set Up Your Base</h2>
        <p className="mt-3 flex items-center justify-center gap-2 text-center text-base text-violet-100/80 sm:text-lg">
          <Users className="h-5 w-5 text-violet-300" aria-hidden />
          Your crew is boarding! Give out your first <span className="font-black text-amber-300">10 power cubes</span>.
        </p>
        <p className="mb-4 mt-2 text-center text-sm text-violet-200/70">
          Life Support makes air. Shields block sun rays. The Lab makes science. The Greenhouse grows food.
        </p>
        <EnergyAllocator alloc={alloc} onChange={onChange} showSuggestion={false} />
        <button
          onClick={() => {
            sfx.launch();
            onLaunch();
          }}
          disabled={!ready}
          className="mt-5 flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-300 to-amber-400 font-display text-xl font-bold text-space-950 transition active:scale-[0.98] hover:from-amber-200 hover:to-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Rocket className="h-6 w-6" aria-hidden /> Launch Mission!
        </button>
      </div>
    </main>
  );
}

export default function Game() {
  const {
    state,
    start,
    pickLocation,
    pickDifficulty,
    confirmSetup,
    proceed,
    pickChoice,
    setAlloc,
    runDay,
    dismissAlert,
    dismissAchievement,
    toggleSound,
    toggleBadge,
    closeBadge,
    restart,
  } = useGame();

  useEffect(() => {
    setSoundEnabled(state.soundOn);
  }, [state.soundOn]);

  useEffect(() => {
    if (state.phase === 'briefing' && state.event?.critical) {
      sfx.alert();
    }
  }, [state.phase, state.event]);

  /* ---------- Non-mission phases ---------- */

  if (state.phase === 'title') {
    return (
      <Shell state={state}>
        <TitleScreen onStart={start} />
      </Shell>
    );
  }

  if (state.phase === 'location') {
    return (
      <Shell state={state}>
        <LocationSelect onPick={pickLocation} />
      </Shell>
    );
  }

  if (state.phase === 'difficulty') {
    return (
      <Shell state={state}>
        <DifficultySelect location={state.location ?? 'moon'} onPick={pickDifficulty} />
      </Shell>
    );
  }

  if (state.phase === 'setup') {
    return (
      <Shell state={state}>
        <SetupScreen alloc={state.allocation} onChange={setAlloc} onLaunch={confirmSetup} />
      </Shell>
    );
  }

  if (state.phase === 'debrief') {
    return (
      <Shell state={state}>
        <Debrief state={state} onRestart={restart} />
      </Shell>
    );
  }

  /* ---------- Mission phases ---------- */

  const event = state.event;
  if (!event) return null;

  const statuses = sceneStatuses(state);
  const chosenFlags = state.chosen?.flags ?? [];
  const isAfterChoice = state.phase === 'resolution' || state.phase === 'summary';
  const sheltered = chosenFlags.includes('sheltered') && isAfterChoice;
  const roverState = sheltered
    ? ('sheltered' as const)
    : event.scene?.rover && state.phase !== 'briefing'
      ? ('driving' as const)
      : ('parked' as const);

  const effects = {
    dim: state.resources.power < 30 ? (30 - state.resources.power) / 30 : 0,
    fog: state.resources.oxygen < 30 ? (30 - state.resources.oxygen) / 30 : 0,
    radiation: !!event.radIntensity && chosenFlags.includes('rad') && isAfterChoice,
    storm: !!event.scene?.storm,
    night: !!event.scene?.night,
  };

  let mood: AstroMood = event.mood ?? 'normal';
  let astroText = event.astro;
  if (state.phase === 'decision') {
    astroText =
      mood === 'alert' || mood === 'worried'
        ? 'Hurry, Captain! Pick a plan!'
        : 'Pick a plan, Captain. Every choice gives something up!';
  } else if (state.phase === 'action') {
    astroText = 'Plan locked! Drag power cubes to the modules.';
    mood = 'normal';
  } else if (state.phase === 'resolution' && state.lastDeltas) {
    const sci = state.lastDeltas.science;
    astroText = sci > 0 ? `Wow! ${sci} science points today!` : 'Day done! The crew matters most.';
    mood = 'happy';
  } else if (state.phase === 'summary') {
    astroText = 'Rest well, crew. Tomorrow we go again!';
    mood = 'happy';
  }

  const lastRecord = state.history[state.history.length - 1] ?? null;

  return (
    <Shell state={state}>
      <Hud
        state={state}
        currentBadge={event.badge ?? null}
        onToggleSound={toggleSound}
        onToggleBadge={toggleBadge}
        onCloseBadge={closeBadge}
      />

      <main className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-start gap-4 px-3 py-4 sm:px-5 lg:grid-cols-[minmax(0,1fr)_500px]">
        {/* Left: base view + resources */}
        <section className="order-2 flex min-w-0 flex-col gap-3 lg:order-1" aria-label="Base overview and resources">
          <div className="relative">
            <BaseScene
              location={state.location ?? 'moon'}
              day={state.day}
              statuses={statuses}
              roverState={roverState}
              sheltered={sheltered}
              cubeCounts={state.phase === 'action' ? state.allocation : undefined}
              values={{
                power: state.resources.power,
                oxygen: state.resources.oxygen,
                food: state.resources.food,
                shield: state.resources.shield,
                science: state.science,
              }}
              effects={effects}
            />
          </div>
          <ResourceBars
            resources={state.resources}
            crew={state.crew}
            deltas={state.phase === 'summary' ? null : state.lastDeltas}
          />
        </section>

        {/* Right: ASTRO + decisions */}
        <aside className="order-1 flex min-w-0 flex-col gap-3 lg:order-2">
          <AstroPanel mood={mood} text={astroText} />

          {state.phase === 'briefing' && <BriefingCard event={event} onProceed={proceed} />}
          {state.phase === 'decision' && (
            <DecisionCards event={event} resources={state.resources} onPick={pickChoice} onOpenBadge={toggleBadge} />
          )}
          {state.phase === 'action' && state.chosen && (
            <ActionPanel
              event={event}
              chosen={state.chosen}
              alloc={state.allocation}
              resources={state.resources}
              onChange={setAlloc}
              onRunDay={runDay}
            />
          )}
          {state.phase === 'resolution' && state.chosen && state.lastDeltas && (
            <ResolutionPanel
              chosen={state.chosen}
              deltas={state.lastDeltas}
              notes={lastRecord?.note}
              onProceed={proceed}
            />
          )}
        </aside>
      </main>

      {state.phase === 'summary' && lastRecord && (
        <DaySummary day={state.day} record={lastRecord} isLastDay={state.day >= TOTAL_DAYS} onContinue={proceed} />
      )}

      {/* Full-screen emergency alarm */}
      {state.alert && <EmergencyAlert kind={state.alert} onDismiss={dismissAlert} />}

      {/* Achievement popups */}
      {state.pending.length > 0 && (
        <AchievementToast achievement={state.pending[0]} onDone={dismissAchievement} />
      )}
    </Shell>
  );
}
