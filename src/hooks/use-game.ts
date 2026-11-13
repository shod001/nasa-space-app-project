'use client';

import { useCallback, useReducer } from 'react';
import { applyDeltas, checkAchievements, endingFor, pickEmergency, resolveDay } from '@/lib/game/engine';
import { getEventForDay } from '@/lib/game/events';
import {
  DEFAULT_ALLOCATION,
  DIFFICULTIES,
  TOTAL_DAYS,
  emptyDeltas,
  type Allocation,
  type Choice,
  type Difficulty,
  type GameState,
  type Location,
} from '@/lib/game/types';

export type GameAction =
  | { type: 'START' }
  | { type: 'PICK_LOCATION'; location: Location }
  | { type: 'PICK_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'CONFIRM_SETUP' }
  | { type: 'PROCEED' }
  | { type: 'PICK_CHOICE'; choice: Choice }
  | { type: 'SET_ALLOC'; alloc: Allocation }
  | { type: 'RUN_DAY' }
  | { type: 'DISMISS_ALERT' }
  | { type: 'DISMISS_ACHIEVEMENT' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_BADGE' }
  | { type: 'CLOSE_BADGE' }
  | { type: 'RESTART' };

function initialState(soundOn = true): GameState {
  return {
    phase: 'title',
    location: null,
    difficulty: null,
    day: 1,
    resources: { power: 80, oxygen: 90, food: 75, shield: 100, fuelCells: 3 },
    crew: { health: 100, morale: 80 },
    science: 0,
    goal: 380,
    allocation: { ...DEFAULT_ALLOCATION },
    event: null,
    chosen: null,
    lastDeltas: null,
    history: [],
    criticalHandled: 0,
    minFood: 75,
    achievements: [],
    pending: [],
    alert: null,
    soundOn,
    badgeOpen: false,
    final: null,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START':
      return { ...state, phase: 'location' };

    case 'PICK_LOCATION':
      return { ...state, location: action.location, phase: 'difficulty' };

    case 'PICK_DIFFICULTY': {
      const cfg = DIFFICULTIES[action.difficulty];
      return {
        ...state,
        difficulty: action.difficulty,
        goal: cfg.goal,
        resources: { ...cfg.start },
        phase: 'setup',
      };
    }

    case 'CONFIRM_SETUP': {
      if (!state.location || !state.difficulty) return state;
      return {
        ...state,
        phase: 'briefing',
        day: 1,
        event: getEventForDay(state.location, 1),
        chosen: null,
        lastDeltas: null,
      };
    }

    case 'PROCEED': {
      if (state.phase === 'briefing') return { ...state, phase: 'decision' };
      if (state.phase === 'resolution') return { ...state, phase: 'summary' };
      if (state.phase === 'summary') {
        if (state.crew.health <= 0 || state.day >= TOTAL_DAYS) {
          return { ...state, phase: 'debrief', final: endingFor(state) };
        }
        const nextDay = state.day + 1;
        return {
          ...state,
          phase: 'briefing',
          day: nextDay,
          event: state.location ? getEventForDay(state.location, nextDay) : null,
          chosen: null,
          lastDeltas: null,
        };
      }
      return state;
    }

    case 'PICK_CHOICE':
      return { ...state, chosen: action.choice, phase: 'action' };

    case 'SET_ALLOC':
      return { ...state, allocation: action.alloc };

    case 'RUN_DAY': {
      if (!state.event || !state.chosen || !state.location || !state.difficulty) return state;
      const { deltas, notes } = resolveDay({
        location: state.location,
        difficulty: state.difficulty,
        resources: state.resources,
        crewHealth: state.crew.health,
        crewMorale: state.crew.morale,
        event: state.event,
        choice: state.chosen,
        allocation: state.allocation,
      });
      const applied = applyDeltas(state.resources, state.crew, state.science, deltas);
      const note = notes.length ? notes.join(' ') : undefined;

      const nextSnapshot = {
        day: state.day,
        resources: applied.resources,
        crew: applied.crew,
        science: applied.science,
        goal: state.goal,
      };
      const newAchievements = checkAchievements(state, nextSnapshot);

      return {
        ...state,
        phase: 'resolution',
        resources: applied.resources,
        crew: applied.crew,
        science: applied.science,
        lastDeltas: deltas,
        minFood: Math.min(state.minFood, applied.resources.food),
        criticalHandled: state.criticalHandled + (state.event.critical ? 1 : 0),
        achievements: [...state.achievements, ...newAchievements],
        pending: [...state.pending, ...newAchievements],
        alert: pickEmergency(applied.resources, applied.crew.health),
        history: [
          ...state.history,
          {
            day: state.day,
            eventTitle: state.event.title,
            choiceLabel: state.chosen.label,
            deltas,
            note,
          },
        ],
      };
    }

    case 'DISMISS_ALERT':
      return { ...state, alert: null };

    case 'DISMISS_ACHIEVEMENT':
      return { ...state, pending: state.pending.slice(1) };

    case 'TOGGLE_SOUND':
      return { ...state, soundOn: !state.soundOn };

    case 'TOGGLE_BADGE':
      return { ...state, badgeOpen: !state.badgeOpen };

    case 'CLOSE_BADGE':
      return { ...state, badgeOpen: false };

    case 'RESTART':
      return initialState(state.soundOn);

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState());

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const pickLocation = useCallback((location: Location) => dispatch({ type: 'PICK_LOCATION', location }), []);
  const pickDifficulty = useCallback((d: Difficulty) => dispatch({ type: 'PICK_DIFFICULTY', difficulty: d }), []);
  const confirmSetup = useCallback(() => dispatch({ type: 'CONFIRM_SETUP' }), []);
  const proceed = useCallback(() => dispatch({ type: 'PROCEED' }), []);
  const pickChoice = useCallback((choice: Choice) => dispatch({ type: 'PICK_CHOICE', choice }), []);
  const setAlloc = useCallback((alloc: Allocation) => dispatch({ type: 'SET_ALLOC', alloc }), []);
  const runDay = useCallback(() => dispatch({ type: 'RUN_DAY' }), []);
  const dismissAlert = useCallback(() => dispatch({ type: 'DISMISS_ALERT' }), []);
  const dismissAchievement = useCallback(() => dispatch({ type: 'DISMISS_ACHIEVEMENT' }), []);
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const toggleBadge = useCallback(() => dispatch({ type: 'TOGGLE_BADGE' }), []);
  const closeBadge = useCallback(() => dispatch({ type: 'CLOSE_BADGE' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return {
    state,
    emptyDeltas,
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
  };
}
