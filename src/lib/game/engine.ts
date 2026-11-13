import {
  ACHIEVEMENTS,
  DIFFICULTIES,
  emptyDeltas,
  TOTAL_DAYS,
  type Achievement,
  type Allocation,
  type BadgeEarned,
  type Choice,
  type Difficulty,
  type Deltas,
  type EmergencyKind,
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

export function solarFor(location: Location, flags: string[], difficulty: Difficulty = 'normal'): number {
  let solar = location === 'moon' ? 24 : 19;
  if (flags.includes('dust')) solar *= 0.4;
  if (flags.includes('dim')) solar *= 0.85;
  return solar * DIFFICULTIES[difficulty].solarMul;
}

export interface ResolveInput {
  location: Location;
  difficulty: Difficulty;
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
  const { location, difficulty, resources, crewHealth, crewMorale, event, choice, allocation } = input;
  const cfg = DIFFICULTIES[difficulty];
  const flags = choice.flags ?? [];
  const d = emptyDeltas();
  const notes: string[] = [];

  // --- power: sunshine made vs base used ---
  const solar = solarFor(location, flags, difficulty);
  d.power = round(solar - 12 * cfg.drainMul);

  // --- life support cubes (drain scales with difficulty, gains stay fair) ---
  d.oxygen = round(-7 * cfg.drainMul + allocation.life * 2.4);

  // --- greenhouse cubes ---
  d.food = round(-6 * cfg.drainMul + allocation.green * 1.9);

  // --- shield cubes ---
  d.shield = round(-2 * cfg.drainMul + allocation.shield * 3);

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

  // --- bad sun rays hitting the crew ---
  if (flags.includes('rad') && event.radIntensity) {
    let factor = (resources.shield / 100) * 0.6 + allocation.shield * 0.04;
    if (flags.includes('emergencyShield')) factor += 0.5;
    factor = Math.min(factor, 0.92);
    const dmg = Math.round(event.radIntensity * (1 - factor) * cfg.damageMul);
    d.health -= dmg;
    notes.push(`Bad sun rays hit the crew: -${dmg} health (shields blocked ${Math.round(factor * 100)}%)`);
  }

  // --- check for empty supplies after today ---
  const postOxy = resources.oxygen + d.oxygen;
  const postFood = resources.food + d.food;
  const postPower = resources.power + d.power;

  if (postOxy <= 0) {
    d.health -= Math.round(8 * cfg.damageMul);
    d.morale -= 6;
    notes.push('The air ran out! Backup oxygen saved the day (crew got hurt).');
  }
  if (postFood <= 0) {
    d.health -= Math.round(4 * cfg.damageMul);
    d.morale -= 6;
    notes.push('The food ran out! Snack bars saved the day (crew grumpy).');
  }
  if (postPower <= 0) {
    d.oxygen -= 4;
    d.morale -= 5;
    notes.push('Blackout! The power hit zero and machines sputtered.');
  }

  if (resources.oxygen < 25 || postOxy < 25) {
    d.health -= Math.round(6 * cfg.damageMul);
    notes.push('Low air all day — the crew is breathing hard.');
  }
  if (resources.food < 20 || postFood < 20) {
    d.health -= Math.round(5 * cfg.damageMul);
    notes.push('Low food all day — hungry crew.');
  }

  // --- how the crew feels ---
  d.morale += -1;
  if (postFood > 60) d.morale += 2;
  if (postFood < 25) d.morale -= 3;
  if (postOxy < 25) d.morale -= 3;
  if (postPower < 15) d.morale -= 3;
  if (d.science >= 15) d.morale += 1;

  // --- bodies rest when things are okay ---
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

/** Pick the single most urgent emergency to shout about on the big red screen. */
export function pickEmergency(resources: ResourceState, health: number): EmergencyKind | null {
  if (health <= 30) return 'health';
  if (resources.oxygen <= 25) return 'oxygen';
  if (resources.food <= 25) return 'food';
  if (resources.power <= 25) return 'power';
  if (resources.shield <= 15) return 'shield';
  return null;
}

/** Look at a finished day and list any NEW achievements the player just earned. */
export function checkAchievements(
  prev: GameState,
  next: {
    day: number;
    resources: ResourceState;
    crew: { health: number; morale: number };
    science: number;
    goal: number;
  },
): Achievement[] {
  const out: Achievement[] = [];
  const has = (id: string) => prev.achievements.some((a) => a.id === id);
  const push = (id: string) => {
    if (!has(id)) out.push(ACHIEVEMENTS[id]);
  };

  push('first');
  if (next.day >= Math.ceil(TOTAL_DAYS / 2)) push('half');
  if (next.science >= 100) push('sci100');
  if (next.science >= 250) push('sci250');
  if (next.science >= next.goal) push('goal');
  if ((prev.event?.id === 'm5' || prev.event?.id === 'ms5') && next.crew.health > 0) push('flare');
  if (prev.event?.id === 'ms10') push('storm');
  if (prev.resources.shield < 100 && next.resources.shield >= 100) push('shield');
  if (next.crew.morale >= 90) push('happy');
  if (
    next.resources.power >= 60 &&
    next.resources.oxygen >= 60 &&
    next.resources.food >= 60 &&
    next.resources.shield >= 60
  ) {
    push('green');
  }
  return out;
}

export function endingFor(state: GameState): FinalResult {
  const { crew, science, criticalHandled, minFood, day, goal } = state;

  if (crew.health <= 0) {
    return {
      tier: 'abort',
      title: 'Mission Stop — Crew Saved',
      blurb:
        'The crew got too hurt to go on, so a rescue ship brought everyone home safe. Every astronaut learns from hard days!',
      badges: computeBadges(state, true),
      flareDay: findFlareDay(state),
    };
  }

  const completed = day >= TOTAL_DAYS;
  if (!completed) {
    return {
      tier: 'fail',
      title: 'Mission Ended Early',
      blurb: 'The mission stopped sooner than planned. Science never stops — ready to try again?',
      badges: computeBadges(state, true),
      flareDay: findFlareDay(state),
    };
  }

  if (science >= goal) {
    return {
      tier: 'success',
      title: 'MISSION SUCCESS!',
      blurb: `Amazing, Commander! You collected ${science} science points and your crew is safe. Mission Control is having a party for you!`,
      badges: computeBadges(state, false),
      flareDay: findFlareDay(state),
    };
  }
  if (science >= Math.round(goal * 0.55)) {
    return {
      tier: 'partial',
      title: 'Great Mission!',
      blurb: `Nice flying, Commander! ${science} science points collected. Give the Lab more power next time to reach ${goal}!`,
      badges: computeBadges(state, false),
      flareDay: findFlareDay(state),
    };
  }
  return {
    tier: 'fail',
    title: 'Good Try, Explorer!',
    blurb: `You got ${science} science points. Try keeping air and power steady while the Lab works. Balancing is the astronaut skill!`,
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
  const { science, crew, criticalHandled, minFood, day, goal } = state;

  badges.push({
    id: 'survivor',
    name: 'Mission Survivor',
    desc: 'You kept the crew alive. Great work!',
    emoji: '🏁',
  });
  if (science >= Math.round(goal * 1.45)) {
    badges.push({
      id: 'cosmic',
      name: 'Space Scientist',
      desc: 'So much science! A legendary research run.',
      emoji: '🌌',
    });
  } else if (science >= goal) {
    badges.push({
      id: 'planner',
      name: 'Master Planner',
      desc: `Reached ${goal}+ science points. Big brain!`,
      emoji: '🧠',
    });
  }
  if (crew.health >= 75 && crew.morale >= 70) {
    badges.push({
      id: 'champion',
      name: 'Crew Champion',
      desc: 'Kept the crew healthy and happy.',
      emoji: '💛',
    });
  }
  if (criticalHandled >= 3 && crew.health >= 55) {
    badges.push({
      id: 'emergency',
      name: 'Emergency Hero',
      desc: 'Handled 3 or more emergencies. Brave!',
      emoji: '🚨',
    });
  }
  if (minFood >= 45) {
    badges.push({
      id: 'green',
      name: 'Space Farmer',
      desc: 'Never let the food get low.',
      emoji: '🌱',
    });
  }
  if (!earlyEnd && day >= TOTAL_DAYS) {
    badges.push({
      id: 'full14',
      name: 'Full Mission Patch',
      desc: `Finished all ${TOTAL_DAYS} days of the mission!`,
      emoji: '🎖️',
    });
  }
  return badges;
}
