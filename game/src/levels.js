// The Meridian Vault — the three room layouts.
// Coordinates live in a 1280 x 720 world with a 24px outer wall.
// Obstacles block movement and block sight: green display cases and
// pillars are the thief's only friends. Cameras hang on walls and sweep.
// Loot values are dollars; the Diamond is worth $5,000 and is the only
// loot that unlocks the Vault exit.

export const LEVELS = [
  {
    name: 'Room 1 — The Gallery',
    subtitle: 'Lift the gallery pieces. Learn the patrols.',
    parSeconds: 75,
    spawn: { x: 90, y: 630 },
    exit: { x: 1140, y: 54, w: 104, h: 46, lockedUntilDiamond: false },
    obstacles: [
      { x: 300, y: 180, w: 150, h: 60, kind: 'case' },
      { x: 620, y: 150, w: 150, h: 60, kind: 'case' },
      { x: 920, y: 220, w: 150, h: 60, kind: 'case' },
      { x: 380, y: 420, w: 170, h: 60, kind: 'case' },
      { x: 760, y: 430, w: 170, h: 60, kind: 'case' },
      { x: 180, y: 300, w: 44, h: 44, kind: 'pillar' },
      { x: 1080, y: 420, w: 44, h: 44, kind: 'pillar' },
    ],
    loot: [
      { x: 180, y: 78, value: 150, label: 'Gilded Mirror', kind: 'painting' },
      { x: 640, y: 78, value: 200, label: 'Duchess Portrait', kind: 'painting' },
      { x: 1100, y: 78, value: 250, label: 'Emerald Vase', kind: 'vase' },
      { x: 640, y: 664, value: 120, label: 'Silver Candlestick', kind: 'vase' },
    ],
    guards: [
      { waypoints: [[250, 140], [1020, 140]], pause: 0.9 },
      { waypoints: [[300, 560], [950, 560], [950, 300], [300, 300]], pause: 0.7 },
    ],
    cameras: [
      { x: 640, y: 26, baseAngle: Math.PI / 2, sweep: 0.62, speed: 0.55, phase: 0 },
    ],
  },
  {
    name: 'Room 2 — The Vault Corridor',
    subtitle: 'Watched end to end. Weave between the lanes.',
    parSeconds: 90,
    spawn: { x: 90, y: 630 },
    exit: { x: 1140, y: 54, w: 104, h: 46, lockedUntilDiamond: false },
    obstacles: [
      // Three lane walls, each with a gap to slip through.
      { x: 200, y: 180, w: 380, h: 26, kind: 'wall' },
      { x: 700, y: 180, w: 380, h: 26, kind: 'wall' },
      { x: 200, y: 360, w: 380, h: 26, kind: 'wall' },
      { x: 700, y: 360, w: 380, h: 26, kind: 'wall' },
      { x: 200, y: 540, w: 380, h: 26, kind: 'wall' },
      { x: 700, y: 540, w: 380, h: 26, kind: 'wall' },
      { x: 640, y: 270, w: 44, h: 44, kind: 'pillar' },
      { x: 640, y: 450, w: 44, h: 44, kind: 'pillar' },
    ],
    loot: [
      { x: 300, y: 90, value: 250, label: 'Ruby Brooch', kind: 'painting' },
      { x: 960, y: 270, value: 200, label: 'Ivory Statue', kind: 'vase' },
      { x: 300, y: 450, value: 150, label: 'Gold Pocket Watch', kind: 'vase' },
      { x: 960, y: 630, value: 180, label: 'Jade Figurine', kind: 'vase' },
    ],
    guards: [
      { waypoints: [[150, 120], [1150, 120]], pause: 0.6 },
      { waypoints: [[1150, 270], [150, 270]], pause: 0.6 },
      { waypoints: [[150, 630], [1150, 630]], pause: 0.6 },
    ],
    cameras: [
      { x: 580, y: 208, baseAngle: Math.PI / 2, sweep: 0.7, speed: 0.6, phase: 0 },
      { x: 700, y: 538, baseAngle: -Math.PI / 2, sweep: 0.7, speed: 0.6, phase: 1.6 },
    ],
  },
  {
    name: 'Room 3 — The Vault',
    subtitle: 'The Meridian Diamond sits on the central plinth. Take it, then run.',
    parSeconds: 120,
    spawn: { x: 90, y: 630 },
    exit: { x: 1140, y: 54, w: 104, h: 46, lockedUntilDiamond: true },
    obstacles: [
      { x: 600, y: 300, w: 80, h: 70, kind: 'plinth' },
      { x: 480, y: 220, w: 44, h: 44, kind: 'pillar' },
      { x: 756, y: 220, w: 44, h: 44, kind: 'pillar' },
      { x: 480, y: 456, w: 44, h: 44, kind: 'pillar' },
      { x: 756, y: 456, w: 44, h: 44, kind: 'pillar' },
      { x: 200, y: 120, w: 26, h: 200, kind: 'wall' },
      { x: 1054, y: 400, w: 26, h: 200, kind: 'wall' },
      { x: 300, y: 580, w: 200, h: 26, kind: 'case' },
      { x: 780, y: 580, w: 200, h: 26, kind: 'case' },
    ],
    loot: [
      { x: 640, y: 296, value: 5000, label: 'Meridian Diamond', kind: 'diamond' },
      { x: 1080, y: 90, value: 200, label: 'Crown Jewels', kind: 'painting' },
      { x: 200, y: 630, value: 150, label: 'Platinum Ingot', kind: 'vase' },
    ],
    guards: [
      { waypoints: [[640, 180], [860, 335], [640, 490], [420, 335]], pause: 0.5 },
      { waypoints: [[200, 120], [1080, 120]], pause: 0.6 },
      { waypoints: [[1080, 620], [200, 620]], pause: 0.6 },
    ],
    cameras: [
      { x: 640, y: 26, baseAngle: Math.PI / 2, sweep: 0.55, speed: 0.5, phase: 0 },
      { x: 1254, y: 360, baseAngle: Math.PI, sweep: 0.6, speed: 0.65, phase: 2.1 },
    ],
  },
];
