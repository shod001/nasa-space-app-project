export type Location = 'moon' | 'mars';

export type ModuleKey = 'life' | 'shield' | 'science' | 'green';

export type Allocation = Record<ModuleKey, number>;

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface ResourceState {
  power: number;
  oxygen: number;
  food: number;
  shield: number;
  fuelCells: number;
}

export interface CrewState {
  health: number;
  morale: number;
}

export interface Deltas {
  power: number;
  oxygen: number;
  food: number;
  shield: number;
  health: number;
  morale: number;
  science: number;
  fuelCells: number;
}

export type Risk = 'safe' | 'balanced' | 'risky';

export interface ChoiceRequirement {
  fuelCells?: number;
  power?: number;
}

export interface Choice {
  id: string;
  label: string;
  desc: string;
  chips: string[];
  risk: Risk;
  deltas?: Partial<Deltas>;
  flags?: string[];
  fuelCells?: number;
  requires?: ChoiceRequirement;
  result: string;
}

export interface DataBadge {
  system: string;
  label: string;
  detail: string;
}

export interface GameEvent {
  id: string;
  kind: 'event' | 'quiet';
  title: string;
  astro: string;
  mood?: 'normal' | 'alert' | 'worried' | 'happy' | 'excited';
  badge?: DataBadge;
  scene?: { storm?: boolean; night?: boolean; rover?: boolean };
  radIntensity?: number;
  critical?: boolean;
  choices: Choice[];
}

export interface DayRecord {
  day: number;
  eventTitle: string;
  choiceLabel: string;
  deltas: Deltas;
  note?: string;
}

export interface BadgeEarned {
  id: string;
  name: string;
  desc: string;
  emoji: string;
}

/* ---------------- Achievements (mid-game rewards) ---------------- */

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  emoji: string;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first: {
    id: 'first',
    name: 'First Flight',
    desc: 'You finished your first day!',
    emoji: '🚀',
  },
  half: {
    id: 'half',
    name: 'Halfway Hero',
    desc: 'Half of the mission is done!',
    emoji: '🎖️',
  },
  sci100: {
    id: 'sci100',
    name: 'Science Sprint',
    desc: '100 science points collected!',
    emoji: '🔬',
  },
  sci250: {
    id: 'sci250',
    name: 'Science Star',
    desc: '250 science points! Amazing!',
    emoji: '🌟',
  },
  goal: {
    id: 'goal',
    name: 'Goal Crusher',
    desc: 'You reached the science goal!',
    emoji: '🏅',
  },
  flare: {
    id: 'flare',
    name: 'Flare Hero',
    desc: 'You kept the crew safe in a solar flare!',
    emoji: '🛡️',
  },
  storm: {
    id: 'storm',
    name: 'Storm Rider',
    desc: 'You beat a giant dust storm!',
    emoji: '🌪️',
  },
  shield: {
    id: 'shield',
    name: 'Shield Master',
    desc: 'Shields filled all the way up!',
    emoji: '⚡',
  },
  happy: {
    id: 'happy',
    name: 'Happy Crew',
    desc: 'Your crew is super happy!',
    emoji: '😄',
  },
  green: {
    id: 'green',
    name: 'All Green',
    desc: 'Power, air, food and shield all strong!',
    emoji: '🌈',
  },
};

/* ---------------- Emergency alerts ---------------- */

export type EmergencyKind = 'health' | 'oxygen' | 'food' | 'power' | 'shield';

export const EMERGENCIES: Record<
  EmergencyKind,
  { title: string; help: string; emoji: string }
> = {
  health: {
    title: 'THE CREW NEEDS HELP!',
    help: 'Keep everyone inside and safe. Health first!',
    emoji: '🧑‍🚀',
  },
  oxygen: {
    title: 'OXYGEN IS LOW!',
    help: 'Put more power cubes on Life Support!',
    emoji: '🫧',
  },
  food: {
    title: 'FOOD IS LOW!',
    help: 'Give the Greenhouse more power cubes!',
    emoji: '🥬',
  },
  power: {
    title: 'POWER IS LOW!',
    help: 'Pick plans that save power next time!',
    emoji: '🔋',
  },
  shield: {
    title: 'SHIELDS ARE LOW!',
    help: 'Give the Safety Bunker more cubes!',
    emoji: '🛡️',
  },
};

/* ---------------- Difficulty modes ---------------- */

export interface DifficultyConfig {
  key: Difficulty;
  name: string;
  emoji: string;
  blurb: string;
  start: ResourceState;
  goal: number;
  /** Multiplier on sunshine power the base collects. */
  solarMul: number;
  /** Multiplier on how fast the crew uses power, air, food and shields. */
  drainMul: number;
  /** Multiplier on damage the crew takes. */
  damageMul: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    key: 'easy',
    name: 'Easy Pilot',
    emoji: '🌱',
    blurb: 'Extra supplies. Great for first flights.',
    start: { power: 90, oxygen: 95, food: 85, shield: 100, fuelCells: 4 },
    goal: 300,
    solarMul: 1.3,
    drainMul: 0.75,
    damageMul: 0.7,
  },
  normal: {
    key: 'normal',
    name: 'Space Captain',
    emoji: '🚀',
    blurb: 'A real mission. Balanced and fair.',
    start: { power: 80, oxygen: 90, food: 75, shield: 100, fuelCells: 3 },
    goal: 380,
    solarMul: 1,
    drainMul: 1,
    damageMul: 1,
  },
  hard: {
    key: 'hard',
    name: 'Space Legend',
    emoji: '🔥',
    blurb: 'Very few supplies. For expert commanders.',
    start: { power: 70, oxygen: 85, food: 65, shield: 95, fuelCells: 2 },
    goal: 460,
    solarMul: 0.8,
    drainMul: 1.25,
    damageMul: 1.35,
  },
};

export type FinalTier = 'success' | 'partial' | 'fail' | 'abort';

export interface FinalResult {
  tier: FinalTier;
  title: string;
  blurb: string;
  badges: BadgeEarned[];
  flareDay: number | null;
}

export type Phase =
  | 'title'
  | 'location'
  | 'difficulty'
  | 'story'
  | 'setup'
  | 'briefing'
  | 'decision'
  | 'action'
  | 'resolution'
  | 'summary'
  | 'debrief';

export interface GameState {
  phase: Phase;
  location: Location | null;
  difficulty: Difficulty | null;
  day: number;
  resources: ResourceState;
  crew: CrewState;
  science: number;
  goal: number;
  allocation: Allocation;
  event: GameEvent | null;
  /** id of the story beat currently on screen (phase === 'story') */
  storyId: string | null;
  /** story beats already watched, so milestones never repeat */
  seenStories: string[];
  chosen: Choice | null;
  lastDeltas: Deltas | null;
  history: DayRecord[];
  criticalHandled: number;
  minFood: number;
  achievements: Achievement[];
  pending: Achievement[];
  alert: EmergencyKind | null;
  soundOn: boolean;
  badgeOpen: boolean;
  final: FinalResult | null;
}

export const TOTAL_DAYS = 14;
export const CUBES_PER_DAY = 10;

export const DEFAULT_ALLOCATION: Allocation = { life: 3, shield: 2, science: 3, green: 2 };

export const emptyDeltas = (): Deltas => ({
  power: 0,
  oxygen: 0,
  food: 0,
  shield: 0,
  health: 0,
  morale: 0,
  science: 0,
  fuelCells: 0,
});
