'use client';

import { useEffect } from 'react';
import { Rocket, Users } from 'lucide-react';
import { setSoundEnabled, sfx } from '@/lib/game/audio';
import { useGame } from '@/hooks/use-game';
import { sceneStatuses } from '@/lib/game/engine';
import Starfield from './scene/Starfield';
import BaseScene from './scene/BaseScene';
import TitleScreen from './TitleScreen';
import LocationSelect from './LocationSelect';
import EnergyAllocator from './EnergyAllocator';
import Hud from './Hud';
import ResourceBars from './ResourceBars';
import AstroPanel, { type AstroMood } from './AstroPanel';
import DecisionCards from './DecisionCards';
import { BriefingCard, ActionPanel, ResolutionPanel } from './MissionPanels';
import DaySummary from './DaySummary';
import Debrief from './Debrief';
import { TOTAL_DAYS, type GameState } from '@/lib/game/types';

function Shell({ state, children }: { state: GameState; children: React.ReactNode }) {
  return (
    <div className="game-root min-h-screen flex flex-col relative overflow-x-clip text-foreground">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <Starfield count={90} />
      </div>
      {children}
      <footer className="relative z-10 mt-auto pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 text-center">
        <p className="text-[10px] text-violet-300/50 px-4">
          Outpost Director: Moon &amp; Mars — a kids&apos; mission trainer inspired by real NASA systems · DONKI · OSDR · REMS · LRO · SCaN
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
    <main className="relative z-10 flex-1 w-full max-w-xl mx-auto px-4 py-10 flex flex-col justify-center">
      <div className="panel rounded-3xl p-5 sm:p-6">
        <h2 className="font-display text-2xl sm:text-3xl text-white title-glow text-center">Mission Setup</h2>
        <p className="text-center text-sm text-violet-100/75 mt-2 flex items-center justify-center gap-1.5">
          <Users className="w-4 h-4 text-violet-300" aria-hidden />
          Crew is boarding! Assign your first <span className="text-amber-300 font-bold">10 power cubes</span> to set up the base.
        </p>
        <p className="text-center text-xs text-violet-200/60 mt-1 mb-4">
          Tip: Life Support cleans air, Shields block radiation, the Lab makes science, the Greenhouse grows food.
        </p>
        <EnergyAllocator alloc={alloc} onChange={onChange} showSuggestion={false} />
        <button
          onClick={() => {
            sfx.launch();
            onLaunch();
          }}
          disabled={!ready}
          className="mt-5 min-h-[56px] w-full rounded-2xl font-display text-lg font-semibold text-space-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Rocket className="w-5 h-5" aria-hidden /> Launch Mission
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
    confirmSetup,
    proceed,
    pickChoice,
    setAlloc,
    runDay,
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
  const roverState = sheltered ? ('sheltered' as const) : event.scene?.rover && state.phase !== 'briefing' ? ('driving' as const) : ('parked' as const);

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
        ? 'Quick, Captain — pick a plan! Remember: every choice gives something up. That is real space flying!'
        : "What's the plan, Captain? Pick one — there are no perfect answers out here, only smart trade-offs.";
  } else if (state.phase === 'action') {
    astroText = `Plan locked: "${state.chosen?.label}". Now drag the 10 power cubes to the modules that need them most today.`;
    mood = 'normal';
  } else if (state.phase === 'resolution' && state.lastDeltas) {
    const sci = state.lastDeltas.science;
    astroText =
      sci > 0
        ? `Sensors logged! We collected ${sci} science points today. Check the readout, Commander.`
        : 'Sensors logged for today. The lab was quiet, but the crew matters most. Check your readout!';
    mood = 'happy';
  } else if (state.phase === 'summary') {
    astroText = 'Get some rest, crew. Tomorrow the Sun rises again — and so do we!';
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

      <main className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-5 py-4 flex-1 grid gap-4 lg:grid-cols-[minmax(0,1fr)_430px] items-start">
        {/* Left: base view + resources */}
        <section className="flex flex-col gap-3 min-w-0 order-2 lg:order-1" aria-label="Base overview and resources">
          <div className="relative">
            <BaseScene
              location={state.location ?? 'moon'}
              day={state.day}
              statuses={statuses}
              roverState={roverState}
              sheltered={sheltered}
              effects={effects}
            />
          </div>
          <ResourceBars resources={state.resources} crew={state.crew} deltas={state.phase === 'summary' ? null : state.lastDeltas} />
        </section>

        {/* Right: ASTRO + decisions */}
        <aside className="flex flex-col gap-3 min-w-0 order-1 lg:order-2">
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
        <DaySummary
          day={state.day}
          record={lastRecord}
          isLastDay={state.day >= TOTAL_DAYS}
          onContinue={proceed}
        />
      )}
    </Shell>
  );
}
