import {
  emptyDeltas,
  SCIENCE_GOAL,
  TOTAL_DAYS,
  type Allocation,
  type BadgeEarned,
  type Choice,
  type Deltas,
  type FinalResult,
  type GameEvent,
  type GameState,
  type Location,
  type ResourceState,
} from './types';

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const round = (v: number) => Math.round(v * 10) / 10;

export interface DayForecast {
  solar: number;
}

export function solarFor(location: Location, flags: string[]): number {
  let solar = location === 'moon' ? 24 : 19;
  if (flags.includes('dust')) solar *= 0.4;
  if (flags.includes('dim')) solar *= 0.85;
  return solar;
}

export interface ResolveInput {
  location: Location;
  resources: ResourceState;
  crewHealth: number;
  crewMorale: number;
  event: GameEvent;
  choice: Choice;
  allocation: Allocation;
}

export interface ResolveOutput {
  deltas: Deltas;
  notes: string[];
}

/** Resolve one full mission day: base systems + energy cubes + event choice effects. */
export function resolveDay(input: ResolveInput): ResolveOutput {
  const { location, resources, crewHealth, crewMorale, event, choice, allocation } = input;
  const flags = choice.flags ?? [];
  const d = emptyDeltas();
  const notes: string[] = [];

  // --- power: solar generation vs base consumption ---
  const solar = solarFor(location, flags);
  d.power = round(solar - 12);

  // --- life support cubes ---
  d.oxygen = round(-7 + allocation.life * 2.4);

  // --- greenhouse cubes ---
  d.food = round(-6 + allocation.green * 1.9);

  // --- shield cubes ---
  d.shield = round(-2 + allocation.shield * 3);

  // --- science cubes ---
  const sheltered = flags.includes('sheltered');
  if (sheltered) {
    d.science = 0;
  } else {
    d.science = allocation.science * 4 + (allocation.science > 0 ? 2 : 0);
  }

  // --- fuel cell use by choice ---
  if (choice.fuelCells) {
    d.fuelCells -= choice.fuelCells;
  }

  // --- immediate choice deltas ---
  for (const [k, v] of Object.entries(choice.deltas ?? {})) {
    if (typeof v === 'number') {
      d[k as keyof Deltas] = round(d[k as keyof Deltas] + v);
    }
  }

  // --- radiation exposure ---
  if (flags.includes('rad') && event.radIntensity) {
    let factor = (resources.shield / 100) * 0.6 + allocation.shield * 0.04;
    if (flags.includes('emergencyShield')) factor += 0.5;
    factor = Math.min(factor, 0.92);
    const dmg = Math.round(event.radIntensity * (1 - factor));
    d.health -= dmg;
    notes.push(`Radiation exposure: -${dmg} crew health (shields blocked ${Math.round(factor * 100)}%)`);
  }

  // --- predicted post values for scarcity checks ---
  const postOxy = resources.oxygen + d.oxygen;
  const postFood = resources.food + d.food;
  const postPower = resources.power + d.power;

  if (postOxy <= 0) {
    d.health -= 8;
    d.morale -= 6;
    notes.push('Air ran out! Emergency oxygen candles saved the day (health hit).');
  }
  if (postFood <= 0) {
    d.health -= 4;
    d.morale -= 6;
    notes.push('Food ran out — ration bars to the rescue (crew grumpy).');
  }
  if (postPower <= 0) {
    d.power += 0;
    d.oxygen -= 4;
    d.morale -= 5;
    notes.push('Blackout! Batteries hit zero and life support sputtered.');
  }

  if (resources.oxygen < 25 || postOxy < 25) {
    d.health -= 6;
    notes.push('Low oxygen all day — crew breathing hard.');
  }
  if (resources.food < 20 || postFood < 20) {
    d.health -= 5;
    notes.push('Food stores critical — hungry crew.');
  }

  // --- morale dynamics ---
  d.morale += -1;
  if (postFood > 60) d.morale += 2;
  if (postFood < 25) d.morale -= 3;
  if (postOxy < 25) d.morale -= 3;
  if (postPower < 15) d.morale -= 3;
  if (d.science >= 15) d.morale += 1;

  // --- natural recovery ---
  if (postOxy >= 50 && postFood >= 50 && crewHealth < 100) {
    d.health += 2;
  }
  if (crewMorale >= 85 && d.morale > 0) {
    d.morale = Math.round(d.morale / 2);
  }

  return { deltas: d, notes };
}

const R = (v: number) => Math.round(v);

/** Apply resolved deltas to a game state snapshot, returning the next snapshot. */
export function applyDeltas(
  resources: ResourceState,
  crew: { health: number; morale: number },
  science: number,
  d: Deltas,
) {
  const nextResources: ResourceState = {
    power: R(clamp(resources.power + d.power)),
    oxygen: R(clamp(resources.oxygen + d.oxygen)),
    food: R(clamp(resources.food + d.food)),
    shield: R(clamp(resources.shield + d.shield)),
    fuelCells: Math.min(3, Math.max(0, resources.fuelCells + d.fuelCells)),
  };
  const nextCrew = {
    health: R(clamp(crew.health + d.health)),
    morale: R(clamp(crew.morale + d.morale)),
  };
  return {
    resources: nextResources,
    crew: nextCrew,
    science: Math.max(0, R(science + d.science)),
  };
}

export type ModuleStatus = 'nominal' | 'warning' | 'critical';

export function statusOf(value: number): ModuleStatus {
  if (value >= 50) return 'nominal';
  if (value >= 25) return 'warning';
  return 'critical';
}

export interface SceneStatuses {
  habitat: ModuleStatus;
  solar: ModuleStatus;
  greenhouse: ModuleStatus;
  lab: ModuleStatus;
  bunker: ModuleStatus;
}

export function sceneStatuses(state: GameState): SceneStatuses {
  const lastSci = state.lastDeltas?.science ?? 10;
  return {
    habitat: statusOf(state.resources.oxygen),
    solar: statusOf(state.resources.power),
    greenhouse: statusOf(state.resources.food),
    lab: lastSci >= 8 ? 'nominal' : lastSci >= 1 ? 'warning' : 'critical',
    bunker: statusOf(state.resources.shield),
  };
}

export function endingFor(state: GameState): FinalResult {
  const { crew, science, criticalHandled, minFood, day } = state;

  if (crew.health <= 0) {
    return {
      tier: 'abort',
      title: 'Mission Abort — Crew Rescued',
      blurb:
        'The crew got too hurt to continue, but the rescue ship brought everyone home safe. Every astronaut learns from tough missions!',
      badges: computeBadges(state, true),
      flareDay: findFlareDay(state),
    };
  }

  const completed = day >= TOTAL_DAYS;
  if (!completed) {
    return {
      tier: 'fail',
      title: 'Mission Ended Early',
      blurb: 'The mission wrapped up sooner than planned — but science never stops. Ready for one more try?',
      badges: computeBadges(state, true),
      flareDay: findFlareDay(state),
    };
  }

  if (science >= SCIENCE_GOAL) {
    return {
      tier: 'success',
      title: 'MISSION SUCCESS!',
      blurb: `Outstanding, Commander! ${science} science points collected and the crew is coming home healthy. Mission Control is throwing you a party!`,
      badges: computeBadges(state, false),
      flareDay: findFlareDay(state),
    };
  }
  if (science >= 200) {
    return {
      tier: 'partial',
      title: 'Solid Mission',
      blurb: `Good flying, Commander! ${science} science points gathered. A little more power into the lab next time and you'll smash the goal of ${SCIENCE_GOAL}!`,
      badges: computeBadges(state, false),
      flareDay: findFlareDay(state),
    };
  }
  return {
    tier: 'fail',
    title: 'Learning Experience',
    blurb: `Only ${science} science points this time. Try keeping oxygen and power steady while the lab works — balancing is the real astronaut skill!`,
    badges: computeBadges(state, false),
    flareDay: findFlareDay(state),
  };
}

export function findFlareDay(state: GameState): number | null {
  const rec = state.history.find((h) => h.eventTitle.toLowerCase().includes('flare'));
  return rec ? rec.day : null;
}

export function computeBadges(state: GameState, earlyEnd: boolean): BadgeEarned[] {
  const badges: BadgeEarned[] = [];
  const { science, crew, criticalHandled, minFood } = state;

  badges.push({
    id: 'survivor',
    name: 'Mission Survivor',
    desc: 'Kept the crew alive through the whole mission.',
    emoji: '🏁',
  });
  if (science >= 550) {
    badges.push({
      id: 'cosmic',
      name: 'Cosmic Scientist',
      desc: 'Over 550 science points! Legendary research run.',
      emoji: '🌌',
    });
  } else if (science >= SCIENCE_GOAL) {
    badges.push({
      id: 'planner',
      name: 'Master Planner',
      desc: `Reached ${SCIENCE_GOAL}+ science while balancing the whole base.`,
      emoji: '🧠',
    });
  }
  if (crew.health >= 75 && crew.morale >= 70) {
    badges.push({
      id: 'champion',
      name: 'Crew Champion',
      desc: 'Kept both health and morale sky-high.',
      emoji: '💛',
    });
  }
  if (criticalHandled >= 3 && crew.health >= 55) {
    badges.push({
      id: 'emergency',
      name: 'Emergency Specialist',
      desc: 'Handled 3+ emergencies like a real flight director.',
      emoji: '🚨',
    });
  }
  if (minFood >= 45) {
    badges.push({
      id: 'green',
      name: 'Green Thumb',
      desc: 'Never let food stores drop below 45%. Space farmer elite.',
      emoji: '🌱',
    });
  }
  if (!earlyEnd && state.day >= TOTAL_DAYS) {
    badges.push({
      id: 'full14',
      name: 'Full Mission Patch',
      desc: `Completed all ${TOTAL_DAYS} days/sols of the mission.`,
      emoji: '🎖️',
    });
  }
  return badges;
}
