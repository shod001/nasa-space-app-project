'use client';

import { useCallback, useReducer } from 'react';
import { applyDeltas, endingFor, resolveDay } from '@/lib/game/engine';
import { getEventForDay } from '@/lib/game/events';
import {
  DEFAULT_ALLOCATION,
  TOTAL_DAYS,
  emptyDeltas,
  type Allocation,
  type Choice,
  type GameState,
  type Location,
} from '@/lib/game/types';

export type GameAction =
  | { type: 'START' }
  | { type: 'PICK_LOCATION'; location: Location }
  | { type: 'CONFIRM_SETUP' }
  | { type: 'PROCEED' }
  | { type: 'PICK_CHOICE'; choice: Choice }
  | { type: 'SET_ALLOC'; alloc: Allocation }
  | { type: 'RUN_DAY' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_BADGE' }
  | { type: 'CLOSE_BADGE' }
  | { type: 'RESTART' };

function initialState(soundOn = true): GameState {
  return {
    phase: 'title',
    location: null,
    day: 1,
    resources: { power: 80, oxygen: 90, food: 75, shield: 100, fuelCells: 3 },
    crew: { health: 100, morale: 80 },
    science: 0,
    allocation: { ...DEFAULT_ALLOCATION },
    event: null,
    chosen: null,
    lastDeltas: null,
    history: [],
    criticalHandled: 0,
    minFood: 75,
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
      return { ...state, location: action.location, phase: 'setup' };

    case 'CONFIRM_SETUP':
      if (!state.location) return state;
      return {
        ...state,
        phase: 'briefing',
        day: 1,
        event: getEventForDay(state.location, 1),
        chosen: null,
        lastDeltas: null,
      };

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
      if (!state.event || !state.chosen || !state.location) return state;
      const { deltas, notes } = resolveDay({
        location: state.location,
        resources: state.resources,
        crewHealth: state.crew.health,
        crewMorale: state.crew.morale,
        event: state.event,
        choice: state.chosen,
        allocation: state.allocation,
      });
      const applied = applyDeltas(state.resources, state.crew, state.science, deltas);
      const note = notes.length ? notes.join(' ') : undefined;
      return {
        ...state,
        phase: 'resolution',
        resources: applied.resources,
        crew: applied.crew,
        science: applied.science,
        lastDeltas: deltas,
        minFood: Math.min(state.minFood, applied.resources.food),
        criticalHandled: state.criticalHandled + (state.event.critical ? 1 : 0),
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
  const confirmSetup = useCallback(() => dispatch({ type: 'CONFIRM_SETUP' }), []);
  const proceed = useCallback(() => dispatch({ type: 'PROCEED' }), []);
  const pickChoice = useCallback((choice: Choice) => dispatch({ type: 'PICK_CHOICE', choice }), []);
  const setAlloc = useCallback((alloc: Allocation) => dispatch({ type: 'SET_ALLOC', alloc }), []);
  const runDay = useCallback(() => dispatch({ type: 'RUN_DAY' }), []);
  const toggleSound = useCallback(() => dispatch({ type: 'TOGGLE_SOUND' }), []);
  const toggleBadge = useCallback(() => dispatch({ type: 'TOGGLE_BADGE' }), []);
  const closeBadge = useCallback(() => dispatch({ type: 'CLOSE_BADGE' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return {
    state,
    emptyDeltas,
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
  };
}
