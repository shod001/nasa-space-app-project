export type Location = 'moon' | 'mars';

export type ModuleKey = 'life' | 'shield' | 'science' | 'green';

export type Allocation = Record<ModuleKey, number>;

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
  day: number;
  resources: ResourceState;
  crew: CrewState;
  science: number;
  allocation: Allocation;
  event: GameEvent | null;
  chosen: Choice | null;
  lastDeltas: Deltas | null;
  history: DayRecord[];
  criticalHandled: number;
  minFood: number;
  soundOn: boolean;
  badgeOpen: boolean;
  final: FinalResult | null;
}

export const TOTAL_DAYS = 14;
export const SCIENCE_GOAL = 380;
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
