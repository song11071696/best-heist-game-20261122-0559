// The Meridian Vault — tuning constants.
// One place for every number the designers argue about: speeds, sight,
// the alarm, the coin, the score. Nothing here touches the DOM.

export const WORLD = {
  width: 1280,
  height: 720,
  wall: 24,
};

export const PLAYER = {
  radius: 14,
  walkSpeed: 178,
  sneakSpeed: 96,
  // A sneaking thief is harder to spot: shorter sight range, slower alarm.
  sneakSightFactor: 0.62,
  sneakAlarmFactor: 0.5,
};

export const GUARD = {
  radius: 15,
  patrolSpeed: 62,
  investigateSpeed: 96,
  chaseSpeed: 134,
  sightRange: 235,
  sightHalfAngle: 0.56, // ~32 degrees each side of facing
  catchDistance: 27,
  suspicionRateNear: 1.7,
  suspicionRateFar: 0.95,
  suspicionDecay: 0.22,
  suspiciousAt: 0.35, // glimpsed: comes to look
  chaseAt: 0.85, // held in sight: locks on and chases
  loseSightSeconds: 2.5, // of no sight before a chase cools off
  waypointPause: 0.8,
  coinHearRange: 330,
};

export const CAMERA = {
  sightRange: 250,
  sightHalfAngle: 0.42,
  alarmRate: 18, // alarm points per second while a camera holds you
  sweepSpeed: 0.55, // radians per second
};

export const ALARM = {
  guardRate: 15, // alarm points per second while a guard holds you
  decayRate: 7, // points per second while nobody sees you
  max: 100,
  cameraAlertAt: 60, // alarm above this: the nearest guard comes looking
};

export const COIN = {
  perRoom: 3,
  throwRange: 280,
  flySeconds: 0.45,
  ringSeconds: 1.6, // how long the landing ring stays visible
};

export const LOOT = {
  pickupDistance: 32,
  diamondValue: 5000,
};

export const GAME = {
  lives: 3,
  roomClearBonus: 250,
  timeBonusParSeconds: 300,
  timeBonusPerSecond: 5,
  caughtFlashSeconds: 1.4,
};

// Colors, kept in one place so the look stays consistent.
export const COLORS = {
  floorA: '#171a26',
  floorB: '#1b1e2c',
  floorLine: '#232739',
  wall: '#2e3350',
  wallTop: '#3d4370',
  case: '#1d5c46',
  caseTrim: '#37b98a',
  pillar: '#39406b',
  gold: '#f2c14e',
  diamond: '#7fe7ff',
  player: '#2dd4bf',
  playerDark: '#0f766e',
  guard: '#e5484d',
  guardCone: 'rgba(229, 72, 77, 0.30)',
  guardConeEdge: 'rgba(229, 72, 77, 0.55)',
  cameraCone: 'rgba(245, 158, 11, 0.30)',
  cameraConeEdge: 'rgba(245, 158, 11, 0.6)',
  exit: '#22c55e',
  hud: '#e8eaf2',
  hudDim: '#9aa0b8',
  alarm: '#ef4444',
  alarmTrack: '#2a2f45',
};
