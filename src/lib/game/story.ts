import type { Location } from './types';

/* ============================================================
   STORY BEATS — "Outpost Director: Moon & Mars"
   Cinematic story scenes between gameplay days.
   All text uses easy words for kids under 12.
   Every story has a real NASA fun fact + an A.S.T.R.O. joke.
   ============================================================ */

export interface StoryBeat {
  id: string;
  /** intro = after difficulty pick, mid = day 8 morning, finale = day 14 morning */
  kind: 'intro' | 'mid' | 'finale';
  title: string;
  /** image path under /public */
  art: string;
  artAlt: string;
  /** story lines revealed one tap at a time */
  lines: string[];
  /** A.S.T.R.O.'s excited line */
  astro: string;
  /** real NASA fun fact shown at the end */
  fact: { label: string; text: string };
  joke: { setup: string; punchline: string };
  cta: string;
}

const INTRO_MOON: StoryBeat = {
  id: 'intro-moon',
  kind: 'intro',
  title: 'Blast Off to the Moon!',
  art: '/images/story-launch.png',
  artAlt: 'A cute cartoon rocket lifting off from Earth into a starry purple sky',
  lines: [
    '3... 2... 1... LIFTOFF!',
    'Your rocket roars away from Earth with a mighty WHOOSH.',
    'You and your crew are flying to the Moon!',
    'A.S.T.R.O. the robot buckles in right next to you.',
    'You are the Commander. Your big mission starts now!',
  ],
  astro: 'Captain, we are almost at the Moon! Ready to build our base?',
  fact: {
    label: 'Moon Trip Time',
    text: 'A rocket needs about 3 days to fly from Earth to the Moon. That is a VERY long car trip!',
  },
  joke: {
    setup: 'Why did the Moon skip dinner?',
    punchline: 'Because it was already FULL!',
  },
  cta: 'Open the Base!',
};

const INTRO_MARS: StoryBeat = {
  id: 'intro-mars',
  kind: 'intro',
  title: 'Blast Off to Mars!',
  art: '/images/story-launch.png',
  artAlt: 'A cute cartoon rocket lifting off from Earth into a starry purple sky',
  lines: [
    '3... 2... 1... LIFTOFF!',
    'Your rocket zooms away from Earth, super fast!',
    'Mars is far, far away. The trip takes about 7 months!',
    'A.S.T.R.O. the robot plays space checkers with you the whole way.',
    'You are the Commander. Your big mission starts now!',
  ],
  astro: 'Captain, we made it to Mars! Ready to build our base?',
  fact: {
    label: 'The Long Trip',
    text: 'A trip to Mars takes about 7 months each way. Real astronauts pack lots of snacks and books!',
  },
  joke: {
    setup: 'How does Mars talk to Earth?',
    punchline: 'On the RED-e-o!',
  },
  cta: 'Open the Base!',
};

const MID_MOON: StoryBeat = {
  id: 'mid-moon',
  kind: 'mid',
  title: 'Earthrise!',
  art: '/images/story-earthrise.png',
  artAlt: 'Cartoon moon base domes with the blue Earth rising over the horizon',
  lines: [
    'Half of your mission is done. Way to go, Commander!',
    'Tonight, something amazing happens...',
    'Slowly, a big blue ball rises over the Moon hills.',
    "It's EARTH! Your whole crew watches and cheers.",
    'From the Moon, Earth looks like a tiny blue marble in space.',
  ],
  astro: 'Wow, Captain! Earthrise is the best view in all of space!',
  fact: {
    label: 'Real Earthrise Photo',
    text: "In 1968, Apollo 8 astronauts took the famous 'Earthrise' photo. It is one of the most loved space pictures ever!",
  },
  joke: {
    setup: 'What did Earth say to the Moon?',
    punchline: 'You crack me up!',
  },
  cta: 'Back to Work, Crew!',
};

const MID_MARS: StoryBeat = {
  id: 'mid-mars',
  kind: 'mid',
  title: 'The Blue Sunset',
  art: '/images/story-bluesunset.png',
  artAlt: 'A child astronaut and a robot watching a glowing blue sunset on Mars',
  lines: [
    'Half of your mission is done. Way to go, Commander!',
    'Tonight, the crew gathers by the big window.',
    'The Sun starts to set on Mars... and it turns BLUE!',
    'On Mars, sunsets glow blue instead of orange. So cool!',
    'A.S.T.R.O. takes a picture to send back home.',
  ],
  astro: 'Blue sunsets, Captain! Mars is full of surprises!',
  fact: {
    label: 'Blue Sunsets Are Real',
    text: 'Real Mars sunsets glow blue! The red dust in the Martian air bends sunlight in a special way.',
  },
  joke: {
    setup: 'Why did the Sun go to school?',
    punchline: 'To get a little BRIGHTER!',
  },
  cta: 'Back to Work, Crew!',
};

const FINALE_MOON: StoryBeat = {
  id: 'finale-moon',
  kind: 'finale',
  title: 'One Last Moon Morning',
  art: '/images/story-earthrise.png',
  artAlt: 'Cartoon moon base domes with the blue Earth shining in the sky',
  lines: [
    "It's the LAST day of your mission!",
    'Tomorrow morning, the ride home arrives.',
    'The crew packs moon rocks, plants, and science notes.',
    'A.S.T.R.O. shines like a little lantern, helping everyone.',
    'Make this last day count, Commander!',
  ],
  astro: "Last day, Captain! Let's finish strong!",
  fact: {
    label: 'Coming Home',
    text: 'Moon astronauts land in the ocean with big parachutes. Boats come pick them up like treasure!',
  },
  joke: {
    setup: 'How do you organize a party in space?',
    punchline: 'You PLANET!',
  },
  cta: 'Final Day, Go!',
};

const FINALE_MARS: StoryBeat = {
  id: 'finale-mars',
  kind: 'finale',
  title: 'One Last Mars Morning',
  art: '/images/story-bluesunset.png',
  artAlt: 'A child astronaut and a robot watching a glowing blue sunset on Mars',
  lines: [
    "It's the LAST day of your mission!",
    'Soon, your rocket will fly all the way home to Earth.',
    'The crew packs samples, photos, and Mars data.',
    'A.S.T.R.O. polishes the windows for one last look.',
    'Make this last day count, Commander!',
  ],
  astro: "Last day, Captain! Let's finish strong!",
  fact: {
    label: 'Coming Home',
    text: "The ride home from Mars takes about 7 months. Astronauts will miss their rocket bunk beds!",
  },
  joke: {
    setup: 'How do you organize a party in space?',
    punchline: 'You PLANET!',
  },
  cta: 'Final Day, Go!',
};

export const STORIES: Record<string, StoryBeat> = {
  'intro-moon': INTRO_MOON,
  'intro-mars': INTRO_MARS,
  'mid-moon': MID_MOON,
  'mid-mars': MID_MARS,
  'finale-moon': FINALE_MOON,
  'finale-mars': FINALE_MARS,
};

/** The intro story plays right after picking a difficulty (before base setup). */
export function introStoryFor(location: Location): StoryBeat {
  return location === 'mars' ? INTRO_MARS : INTRO_MOON;
}

/** Milestone story shown before the briefing of that day, or null. */
export function storyForDay(location: Location, day: number): StoryBeat | null {
  if (day === 8) return location === 'mars' ? MID_MARS : MID_MOON;
  if (day === 14) return location === 'mars' ? FINALE_MARS : FINALE_MOON;
  return null;
}
