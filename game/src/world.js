// The Meridian Vault — state, guard AI, detection, alarm, win/lose.
// Pure logic: no DOM, no canvas, no Math.random. The same state plus the
// same inputs plus the same dt always produce the same next state, which
// is what the deterministic replay test checks.
//
// Phases: 'title' | 'playing' | 'roomclear' | 'caught' | 'gameover' | 'win'
// Guard minds: 'patrol' | 'suspicious' | 'chase' | 'return'

import { WORLD, PLAYER, GUARD, CAMERA, ALARM, COIN, LOOT, GAME } from './config.js';
import { LEVELS } from './levels.js';

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

// Does the segment (x1,y1)-(x2,y2) cross the rectangle? Slab test.
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  for (const [p, q] of [[-dx, x1 - r.x], [dx, r.x + r.w - x1], [-dy, y1 - r.y], [dy, r.y + r.h - y1]]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > tmax) return false;
        if (t > tmin) tmin = t;
      } else {
        if (t < tmin) return false;
        if (t < tmax) tmax = t;
      }
    }
  }
  return true;
}

export function hasLineOfSight(x1, y1, x2, y2, obstacles) {
  for (const o of obstacles) {
    if (segmentHitsRect(x1, y1, x2, y2, o)) return false;
  }
  return true;
}

// Can a watcher at (wx,wy) facing `facing` see the player?
export function canSee(wx, wy, facing, range, halfAngle, px, py, obstacles, sneak) {
  const d = dist(wx, wy, px, py);
  const effectiveRange = sneak ? range * PLAYER.sneakSightFactor : range;
  if (d > effectiveRange) return false;
  const toPlayer = Math.atan2(py - wy, px - wx);
  if (Math.abs(angleDiff(toPlayer, facing)) > halfAngle) return false;
  return hasLineOfSight(wx, wy, px, py, obstacles);
}

// Push a circle out of a rectangle it overlaps. Returns true if it pushed.
function resolveCircleRect(e, r) {
  const cx = Math.max(r.x, Math.min(e.x, r.x + r.w));
  const cy = Math.max(r.y, Math.min(e.y, r.y + r.h));
  const dx = e.x - cx;
  const dy = e.y - cy;
  const d2 = dx * dx + dy * dy;
  if (d2 >= e.radius * e.radius) return false;
  if (d2 === 0) {
    // Center inside the rect: push out along the smallest penetration.
    const left = e.x - r.x;
    const right = r.x + r.w - e.x;
    const top = e.y - r.y;
    const bottom = r.y + r.h - e.y;
    const m = Math.min(left, right, top, bottom);
    if (m === left) e.x = r.x - e.radius;
    else if (m === right) e.x = r.x + r.w + e.radius;
    else if (m === top) e.y = r.y - e.radius;
    else e.y = r.y + r.h + e.radius;
    return true;
  }
  const d = Math.sqrt(d2);
  e.x = cx + (dx / d) * e.radius;
  e.y = cy + (dy / d) * e.radius;
  return true;
}

function clampToRoom(e) {
  const w = WORLD.wall;
  e.x = Math.max(w + e.radius, Math.min(WORLD.width - w - e.radius, e.x));
  e.y = Math.max(w + e.radius, Math.min(WORLD.height - w - e.radius, e.y));
}

function moveEntity(e, dx, dy, obstacles) {
  e.x += dx;
  for (const o of obstacles) resolveCircleRect(e, o);
  clampToRoom(e);
  e.y += dy;
  for (const o of obstacles) resolveCircleRect(e, o);
  clampToRoom(e);
}

function turnToward(e, targetAngle, rate, dt) {
  const d = angleDiff(targetAngle, e.dir);
  const step = Math.max(-rate * dt, Math.min(rate * dt, d));
  e.dir += step;
}

export function createWorld() {
  const state = {
    phase: 'title',
    roomIndex: 0,
    lives: GAME.lives,
    score: 0,
    scoreAtRoomStart: 0,
    lootValue: 0,
    lootValueAtRoomStart: 0,
    hasDiamond: false,
    alarm: 0,
    coins: COIN.perRoom,
    elapsed: 0,
    time: 0, // total animation clock, drives camera sweeps
    flashTimer: 0,
    message: '',
    messageTimer: 0,
    cameraSpotted: false,
    events: [],
    player: { x: 0, y: 0, dir: -Math.PI / 2, radius: PLAYER.radius, sneaking: false },
    guards: [],
    cameras: [],
    loot: [],
    coinsInFlight: [],
    level: null,
  };
  startRoom(state, 0);
  state.phase = 'title';
  return state;
}

export function startRoom(state, index) {
  const level = LEVELS[index];
  state.level = level;
  state.roomIndex = index;
  state.player.x = level.spawn.x;
  state.player.y = level.spawn.y;
  state.player.dir = -Math.PI / 2;
  state.player.sneaking = false;
  state.guards = level.guards.map((g) => ({
    x: g.waypoints[0][0],
    y: g.waypoints[0][1],
    dir: 0,
    radius: GUARD.radius,
    waypoints: g.waypoints,
    waypointIndex: 1 % g.waypoints.length,
    pauseTimer: 0,
    pause: g.pause,
    mind: 'patrol',
    suspicion: 0,
    lastSeen: null,
    lookTimer: 0,
    loseTimer: 0,
    target: null,
  }));
  state.cameras = level.cameras.map((c) => ({ ...c, angle: c.baseAngle, seeing: false }));
  state.loot = level.loot.map((l) => ({ ...l, taken: false }));
  state.coinsInFlight = [];
  state.coins = COIN.perRoom;
  state.alarm = 0;
  state.hasDiamond = false;
  state.cameraSpotted = false;
  state.flashTimer = 0;
  state.phase = 'playing';
}

export function startGame(state) {
  state.lives = GAME.lives;
  state.score = 0;
  state.scoreAtRoomStart = 0;
  state.lootValue = 0;
  state.lootValueAtRoomStart = 0;
  state.elapsed = 0;
  state.time = 0;
  startRoom(state, 0);
}

export function restartRoom(state) {
  state.score = state.scoreAtRoomStart;
  state.lootValue = state.lootValueAtRoomStart;
  startRoom(state, state.roomIndex);
}

export function advanceRoom(state) {
  state.scoreAtRoomStart = state.score;
  state.lootValueAtRoomStart = state.lootValue;
  startRoom(state, state.roomIndex + 1);
}

function caught(state, why) {
  state.lives -= 1;
  state.events.push(why === 'alarm' ? 'alarm-caught' : 'caught');
  state.flashTimer = GAME.caughtFlashSeconds;
  if (state.lives <= 0) {
    state.phase = 'gameover';
    state.events.push('gameover');
  } else {
    state.phase = 'caught';
  }
}

function updateGuard(state, g, dt, seenByAnyone) {
  const p = state.player;
  const obstacles = state.level.obstacles;
  const seen = canSee(g.x, g.y, g.dir, GUARD.sightRange, GUARD.sightHalfAngle, p.x, p.y, obstacles, p.sneaking);

  if (seen) {
    seenByAnyone.value = true;
    g.lastSeen = { x: p.x, y: p.y };
    g.loseTimer = 0;
    const rate = dist(g.x, g.y, p.x, p.y) < 120 ? GUARD.suspicionRateNear : GUARD.suspicionRateFar;
    g.suspicion = Math.min(1, g.suspicion + rate * dt * (p.sneaking ? 0.55 : 1));
    state.alarm = Math.min(ALARM.max, state.alarm + ALARM.guardRate * dt * (p.sneaking ? PLAYER.sneakAlarmFactor : 1));
    if (g.suspicion >= GUARD.chaseAt) g.mind = 'chase';
    else if (g.suspicion >= GUARD.suspiciousAt) {
      g.mind = 'suspicious';
      g.target = { ...g.lastSeen };
    }
  } else {
    g.suspicion = Math.max(0, g.suspicion - GUARD.suspicionDecay * dt);
    if (g.mind === 'chase') {
      g.loseTimer += dt;
      if (g.loseTimer > GUARD.loseSightSeconds) {
        g.mind = 'suspicious';
        g.target = g.lastSeen ? { ...g.lastSeen } : { x: g.x, y: g.y };
      }
    } else if (g.mind === 'suspicious' && g.suspicion < GUARD.suspiciousAt * 0.5) {
      g.mind = 'return';
      g.target = null;
    }
  }

  // Movement for the current mind.
  if (g.mind === 'patrol') {
    const wp = g.waypoints[g.waypointIndex];
    if (g.pauseTimer > 0) {
      g.pauseTimer -= dt;
    } else if (dist(g.x, g.y, wp[0], wp[1]) < 6) {
      g.waypointIndex = (g.waypointIndex + 1) % g.waypoints.length;
      g.pauseTimer = g.pause;
    } else {
      const a = Math.atan2(wp[1] - g.y, wp[0] - g.x);
      turnToward(g, a, 6, dt);
      moveEntity(g, Math.cos(g.dir) * GUARD.patrolSpeed * dt, Math.sin(g.dir) * GUARD.patrolSpeed * dt, obstacles);
    }
  } else if (g.mind === 'suspicious' && g.target) {
    const d = dist(g.x, g.y, g.target.x, g.target.y);
    if (d > 10) {
      const a = Math.atan2(g.target.y - g.y, g.target.x - g.x);
      turnToward(g, a, 7, dt);
      moveEntity(g, Math.cos(g.dir) * GUARD.investigateSpeed * dt, Math.sin(g.dir) * GUARD.investigateSpeed * dt, obstacles);
    } else {
      g.lookTimer += dt;
      g.dir += dt * 1.6; // scan the spot
      if (g.lookTimer > 1.4) {
        g.lookTimer = 0;
        g.mind = 'return';
        g.target = null;
      }
    }
  } else if (g.mind === 'chase') {
    const a = Math.atan2(p.y - g.y, p.x - g.x);
    turnToward(g, a, 8, dt);
    moveEntity(g, Math.cos(g.dir) * GUARD.chaseSpeed * dt, Math.sin(g.dir) * GUARD.chaseSpeed * dt, obstacles);
  } else if (g.mind === 'return') {
    // Head back to the nearest waypoint, then resume the patrol.
    let best = 0;
    let bestD = Infinity;
    g.waypoints.forEach((wp, i) => {
      const d = dist(g.x, g.y, wp[0], wp[1]);
      if (d < bestD) { bestD = d; best = i; }
    });
    const wp = g.waypoints[best];
    if (bestD < 8) {
      g.waypointIndex = (best + 1) % g.waypoints.length;
      g.mind = 'patrol';
    } else {
      const a = Math.atan2(wp[1] - g.y, wp[0] - g.x);
      turnToward(g, a, 6, dt);
      moveEntity(g, Math.cos(g.dir) * GUARD.patrolSpeed * dt, Math.sin(g.dir) * GUARD.patrolSpeed * dt, obstacles);
    }
  }

  // Caught by touch.
  if (dist(g.x, g.y, p.x, p.y) < GUARD.catchDistance) {
    caught(state, 'touch');
  }
}

export function updateWorld(state, input, dt) {
  if (state.flashTimer > 0) state.flashTimer -= dt;
  if (state.messageTimer > 0) {
    state.messageTimer -= dt;
    if (state.messageTimer <= 0) state.message = '';
  }
  if (state.phase !== 'playing') return;
  state.time += dt;
  state.elapsed += dt;
  const level = state.level;
  const p = state.player;
  const obstacles = level.obstacles;

  // --- Player movement ---
  const mx = input.moveX || 0;
  const my = input.moveY || 0;
  const moving = mx !== 0 || my !== 0;
  p.sneaking = !!input.sneak;
  if (moving) {
    const len = Math.hypot(mx, my);
    const speed = p.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
    const vx = (mx / len) * speed * dt;
    const vy = (my / len) * speed * dt;
    p.dir = Math.atan2(my, mx);
    moveEntity(p, vx, vy, obstacles);
  }

  // --- Coin toss ---
  if (input.coin && state.coins > 0) {
    state.coins -= 1;
    const dx = input.coin.x - p.x;
    const dy = input.coin.y - p.y;
    const d = Math.hypot(dx, dy);
    const range = Math.min(d, COIN.throwRange);
    const tx = d === 0 ? p.x : p.x + (dx / d) * range;
    const ty = d === 0 ? p.y : p.y + (dy / d) * range;
    state.coinsInFlight.push({ x: p.x, y: p.y, ox: p.x, oy: p.y, tx, ty, t: 0, landed: false, ringTimer: 0 });
    state.events.push('coin-throw');
  }

  // --- Coins in flight / landed rings ---
  for (const c of state.coinsInFlight) {
    if (!c.landed) {
      c.t += dt / COIN.flySeconds;
      if (c.t >= 1) {
        c.t = 1;
        c.landed = true;
        c.ringTimer = COIN.ringSeconds;
        state.events.push('coin-land');
        for (const g of state.guards) {
          if (dist(g.x, g.y, c.tx, c.ty) < GUARD.coinHearRange) {
            g.mind = 'suspicious';
            g.target = { x: c.tx, y: c.ty };
            g.suspicion = Math.max(g.suspicion, 0.5);
            g.lookTimer = 0;
          }
        }
      }
      c.x = c.ox + (c.tx - c.ox) * c.t;
      c.y = c.oy + (c.ty - c.oy) * c.t;
    } else {
      c.ringTimer -= dt;
    }
  }
  state.coinsInFlight = state.coinsInFlight.filter((c) => !c.landed || c.ringTimer > 0);

  // --- Loot pickup (walk over, or E) ---
  for (const l of state.loot) {
    if (l.taken) continue;
    if (dist(p.x, p.y, l.x, l.y) < LOOT.pickupDistance) {
      l.taken = true;
      state.score += l.value;
      state.lootValue += l.value;
      if (l.kind === 'diamond') {
        state.hasDiamond = true;
        state.events.push('diamond');
        state.message = 'THE MERIDIAN DIAMOND IS YOURS — reach the green exit!';
        state.messageTimer = 3;
      } else {
        state.events.push('pickup');
      }
    }
  }

  // --- Exit ---
  const ex = level.exit;
  if (p.x > ex.x && p.x < ex.x + ex.w && p.y > ex.y && p.y < ex.y + ex.h) {
    if (ex.lockedUntilDiamond && !state.hasDiamond) {
      state.message = 'LOCKED — the Vault exit only opens with the Meridian Diamond.';
      state.messageTimer = 1.5;
    } else {
      state.score += GAME.roomClearBonus;
      state.events.push('clear');
      if (state.roomIndex >= LEVELS.length - 1) {
        const bonus = Math.max(0, Math.round((GAME.timeBonusParSeconds - state.elapsed) * GAME.timeBonusPerSecond));
        state.score += bonus;
        state.phase = 'win';
        state.events.push('win');
      } else {
        state.phase = 'roomclear';
      }
      return;
    }
  }

  // --- Guards and cameras ---
  const seenByAnyone = { value: false };
  for (const g of state.guards) {
    updateGuard(state, g, dt, seenByAnyone);
    if (state.phase !== 'playing') return; // caught mid-update
  }
  state.cameraSpotted = false;
  for (const cam of state.cameras) {
    cam.angle = cam.baseAngle + cam.sweep * Math.sin(state.time * cam.speed + cam.phase);
    const seen = canSee(cam.x, cam.y, cam.angle, CAMERA.sightRange, CAMERA.sightHalfAngle, p.x, p.y, obstacles, p.sneaking);
    cam.seeing = seen;
    if (seen) {
      seenByAnyone.value = true;
      state.cameraSpotted = true;
      state.alarm = Math.min(ALARM.max, state.alarm + CAMERA.alarmRate * dt * (p.sneaking ? PLAYER.sneakAlarmFactor : 1));
      if (state.alarm > ALARM.cameraAlertAt) {
        // The camera's operator sends the nearest guard to look.
        let best = null;
        let bestD = Infinity;
        for (const g of state.guards) {
          const d = dist(g.x, g.y, p.x, p.y);
          if (d < bestD) { bestD = d; best = g; }
        }
        if (best && best.mind === 'patrol') {
          best.mind = 'suspicious';
          best.target = { x: p.x, y: p.y };
          best.suspicion = Math.max(best.suspicion, 0.5);
        }
      }
    }
  }

  // --- Alarm decay when nobody sees you ---
  if (!seenByAnyone.value) {
    state.alarm = Math.max(0, state.alarm - ALARM.decayRate * dt);
  }
  if (state.alarm >= ALARM.max) {
    caught(state, 'alarm');
  }
}
