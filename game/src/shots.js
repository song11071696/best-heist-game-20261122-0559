// The Meridian Vault — deterministic staged scenes for screenshots.
// Each shot is a fixed, hand-placed moment: the same seed always builds
// the same frame, so the four screenshots are byte-identical on re-run.
// Every shot shows the room, the thief, guard vision cones, a camera,
// a loot target and the alarm meter in one frame.

import { createWorld, startRoom } from './world.js';
import { mulberry32 } from './random.js';

// Put a guard at a fixed spot, facing a fixed direction, in a fixed mind.
function placeGuard(state, i, x, y, dir, mind = 'patrol', suspicion = 0) {
  const g = state.guards[i];
  if (!g) return;
  g.x = x;
  g.y = y;
  g.dir = dir;
  g.mind = mind;
  g.suspicion = suspicion;
  g.pauseTimer = 0;
}

export function stageShot(name, seed = 7) {
  const rng = mulberry32(seed);
  const state = createWorld();
  // A little seeded sparkle so repeated seeds stay stable but distinct.
  const sparkle = rng();

  if (name === 'cover') {
    // Room 1, wide view: Wren mid-room, both guards on patrol with cones,
    // the camera sweeping, loot on the walls, alarm already warm.
    startRoom(state, 0);
    state.player.x = 560;
    state.player.y = 330;
    state.player.dir = Math.PI / 4;
    placeGuard(state, 0, 700, 140, Math.PI, 'patrol');
    placeGuard(state, 1, 420, 520, 0, 'suspicious', 0.45);
    state.guards[1].target = { x: 560, y: 330 };
    state.cameras[0].angle = Math.PI / 2 + 0.35;
    state.alarm = 34 + Math.floor(sparkle * 4);
    state.score = 350;
    state.lootValue = 350;
    state.loot[0].taken = true;
    state.time = 6.2;
  } else if (name === 'gallery') {
    // Room 1, Wren slipping along the bottom cases toward the candlestick.
    startRoom(state, 0);
    state.player.x = 520;
    state.player.y = 600;
    state.player.dir = Math.PI / 2;
    state.player.sneaking = true;
    placeGuard(state, 0, 880, 140, Math.PI / 2, 'patrol');
    placeGuard(state, 1, 640, 300, -Math.PI / 2, 'patrol');
    state.cameras[0].angle = Math.PI / 2 - 0.4;
    state.alarm = 12 + Math.floor(sparkle * 3);
    state.score = 200;
    state.lootValue = 200;
    state.loot[1].taken = true;
    state.coinsInFlight.push({ x: 520, y: 600, ox: 520, oy: 600, tx: 760, ty: 560, t: 0.6, landed: false, ringTimer: 0 });
    state.coins = 2;
    state.time = 11.5;
  } else if (name === 'alarm') {
    // Room 2, the corridor: alarm screaming, a guard locked on and chasing.
    startRoom(state, 1);
    state.player.x = 640;
    state.player.y = 300;
    state.player.dir = -Math.PI / 2;
    placeGuard(state, 0, 640, 150, Math.PI / 2, 'chase', 1);
    placeGuard(state, 1, 300, 270, 0, 'suspicious', 0.6);
    state.guards[1].target = { x: 640, y: 300 };
    placeGuard(state, 2, 900, 630, Math.PI, 'patrol');
    state.cameras[0].angle = Math.PI / 2;
    state.cameras[0].seeing = true;
    state.cameras[1].angle = -Math.PI / 2 + 0.3;
    state.alarm = 82 + Math.floor(sparkle * 3);
    state.score = 620;
    state.lootValue = 620;
    state.loot[0].taken = true;
    state.loot[1].taken = true;
    state.time = 23.8;
  } else if (name === 'vault') {
    // Room 3, the payoff: Wren at the plinth taking the Meridian Diamond.
    startRoom(state, 2);
    state.player.x = 700;
    state.player.y = 300;
    state.player.dir = Math.PI;
    placeGuard(state, 0, 860, 335, Math.PI, 'suspicious', 0.55);
    state.guards[0].target = { x: 640, y: 272 };
    placeGuard(state, 1, 420, 120, 0, 'patrol');
    placeGuard(state, 2, 900, 620, Math.PI, 'patrol');
    state.cameras[0].angle = Math.PI / 2 + 0.2;
    state.cameras[1].angle = Math.PI - 0.25;
    state.alarm = 55 + Math.floor(sparkle * 4);
    state.score = 1250;
    state.lootValue = 1250;
    state.loot[1].taken = true;
    state.time = 31.4;
  } else {
    // Unknown shot name: fall back to the cover.
    return stageShot('cover', seed);
  }

  state.phase = 'playing';
  state.flashTimer = 0;
  return state;
}
