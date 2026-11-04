// Single source of truth: world geometry, routes, questions, results.

export const WORLD = { w: 3200, h: 2300 };

export const NODES = {
  start: { x: 440, y: 1580, label: 'Trailhead' },
  stop1: { x: 980, y: 1290, label: 'The Fork' },
  stop2: { x: 1610, y: 900, label: 'The Climb' },
  stop3: { x: 2260, y: 1230, label: 'The Lookout' },
  chest: { x: 2820, y: 620, label: 'The Hoard' },
};

const r1 = (n) => Math.round(n * 10) / 10;

// Cubic path through 4 points: exactly one M followed by three C segments.
// Endpoints are the given points verbatim, so routes start/end on their nodes.
function smooth(points) {
  const p = points.map(([x, y]) => ({ x, y }));
  const at = (i) => p[Math.max(0, Math.min(p.length - 1, i))];
  let d = `M${p[0].x},${p[0].y}`;
  for (let i = 0; i < p.length - 1; i += 1) {
    const a = p[i];
    const b = p[i + 1];
    const prev = at(i - 1);
    const next = at(i + 2);
    const c1x = a.x + (b.x - prev.x) / 6;
    const c1y = a.y + (b.y - prev.y) / 6;
    const c2x = b.x - (next.x - a.x) / 6;
    const c2y = b.y - (next.y - a.y) / 6;
    d += `C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${b.x},${b.y}`;
  }
  return d;
}

const route = (from, to, name, via) => ({
  name,
  d: smooth([from, ...via, to].map((p) => (Array.isArray(p) ? p : [p.x, p.y]))),
});

const k = NODES;
export const LEGS = [
  {
    from: 'start',
    to: 'stop1',
    routes: {
      k: route(k.start, k.stop1, 'Eagle Ridge', [[560, 1400], [760, 1300]]),
      s: route(k.start, k.stop1, 'Lantern Marsh', [[600, 1740], [830, 1560]]),
      p: route(k.start, k.stop1, 'Old Wood', [[700, 1520], [860, 1440]]),
    },
  },
  {
    from: 'stop1',
    to: 'stop2',
    routes: {
      k: route(k.stop1, k.stop2, 'Rocky Bluffs', [[1180, 1120], [1400, 960]]),
      s: route(k.stop1, k.stop2, 'Salt Flats', [[1180, 1400], [1420, 1180]]),
      p: route(k.stop1, k.stop2, 'Pine Hollow', [[1240, 1240], [1450, 1080]]),
    },
  },
  {
    from: 'stop2',
    to: 'stop3',
    routes: {
      k: route(k.stop2, k.stop3, 'Kite Pass', [[1780, 780], [2020, 900]]),
      s: route(k.stop2, k.stop3, 'Thorn Gully', [[1750, 1080], [2020, 1160]]),
      p: route(k.stop2, k.stop3, 'Chapel Rise', [[1850, 940], [2080, 1060]]),
    },
  },
  {
    from: 'stop3',
    to: 'chest',
    routes: {
      k: route(k.stop3, k.chest, 'The Long Stair', [[2440, 1050], [2640, 850]]),
      s: route(k.stop3, k.chest, 'Mire Crossing', [[2420, 1380], [2660, 1000]]),
      p: route(k.stop3, k.chest, 'Pilgrim Road', [[2520, 1180], [2700, 900]]),
    },
  },
];

// One old plate per map point. `dy` lifts it clear of the node and the sheet.
export const PLATES = {
  start: { plate: 'I', dy: -56 },
  stop1: { plate: 'II', dy: -56 },
  stop2: { plate: 'III', dy: -56 },
  stop3: { plate: 'IV', dy: -56 },
  chest: { plate: 'V', dy: -56 },
};

export const COVER = { img: 'assets/locations/cover.jpg' };

export const QUESTIONS = [
  {
    num: 'Stop 1 / 4 — Trailhead',
    img: 'assets/locations/q1.jpg',
    title: "You set off. What's in your hands?",
    hint: 'Route map below. Shoe on the line. The walk begins.',
    options: [
      { axis: 'k', label: 'Just keys + octopus card.', note: 'Light. Fast. First up the hill.' },
      { axis: 's', label: 'Snacks for the whole class.', note: 'Someone will need you halfway.' },
      { axis: 'p', label: 'Camera + first-aid + extra tee.', note: 'Carrying Green & White for everyone.' },
    ],
  },
  {
    num: 'Stop 2 / 4 — The Fork',
    img: 'assets/locations/q2.jpg',
    title: 'Glowing prints go left. Your mates go right. You…',
    hint: 'Like in the film — previous runners left a trail when lost.',
    options: [
      { axis: 'k', label: 'Follow the glow, quick look.', note: 'Curious, then back to the group.' },
      { axis: 's', label: 'Stay right, save energy.', note: 'Rest now, finish strong.' },
      { axis: 'p', label: 'Call everyone to follow the prints.', note: 'Lead the detour together.' },
    ],
  },
  {
    num: 'Stop 3 / 4 — The Climb',
    img: 'assets/locations/q3.jpg',
    title: 'Legs burning. You see an S1 boy stop, so you...',
    hint: 'Tired feet in front of a steep path.',
    options: [
      { axis: 'k', label: 'Slap his shoulder: “Almost there.”', note: 'Small word, big push.' },
      { axis: 's', label: 'Sit with him 2 minutes.', note: 'Rest is part of walking.' },
      { axis: 'p', label: 'Take his bag up the hill.', note: 'Carry it for him.' },
    ],
  },
  {
    num: 'Stop 4 / 4 — The Lookout',
    img: 'assets/locations/q4.jpg',
    title: 'City below. Walk done. What do you keep?',
    hint: "Four in white + green shorts, looking out. That's the memory.",
    options: [
      { axis: 'k', label: 'A small thing for my bag.', note: 'See it every day.' },
      { axis: 's', label: 'The feeling of sitting down after.', note: 'Comfort earned.' },
      { axis: 'p', label: 'Something to carry forward.', note: 'Next walk, next year.' },
    ],
  },
];

export const RESULTS = {
  k: {
    title: 'Light Walker',
    desc: 'You move fast and leave sparks. Small trace, long memory.',
    prize: 'KEYCHAIN · $100 DONATION',
    img: 'assets/prizes/prize-keychain.jpg',
    emblem: '🔑',
  },
  s: {
    title: 'Tired Feet',
    desc: 'You earned the rest. You know when to sit, breathe, go again.',
    prize: 'SLIPPERS · $300 DONATION',
    img: 'assets/prizes/prize-slippers.jpg',
    emblem: '🩴',
  },
  p: {
    title: 'Trace Keeper',
    desc: 'You carry Green & White forward. Bag on, everyone follows.',
    prize: 'BACKPACK · $500 DONATION',
    img: 'assets/prizes/prize-backpack.jpg',
    emblem: '🎒',
  },
};
