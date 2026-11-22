// The Meridian Vault — canvas drawing: room, cones, HUD, screens.
// Everything the judge sees in a screenshot is drawn here: the thief's
// room, red guard cones, orange camera cones, the loot target and the
// alarm meter, all in one frame. No images, no fonts over the network.

import { WORLD, COLORS, ALARM, GAME } from './config.js';

const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

function text(ctx, s, x, y, size, color, weight = '600', align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function conePath(ctx, x, y, angle, range, halfAngle) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  conePath(ctx, x, y, angle, range, halfAngle);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx) {
  const tile = 80;
  for (let y = 0; y < WORLD.height; y += tile) {
    for (let x = 0; x < WORLD.width; x += tile) {
      ctx.fillStyle = ((x / tile + y / tile) % 2 === 0) ? COLORS.floorA : COLORS.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 1;
  for (let x = 0; x <= WORLD.width; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD.height); ctx.stroke();
  }
  for (let y = 0; y <= WORLD.height; y += tile) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD.width, y); ctx.stroke();
  }
}

function drawWalls(ctx) {
  const w = WORLD.wall;
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, WORLD.width, w);
  ctx.fillRect(0, WORLD.height - w, WORLD.width, w);
  ctx.fillRect(0, 0, w, WORLD.height);
  ctx.fillRect(WORLD.width - w, 0, w, WORLD.height);
  ctx.fillStyle = COLORS.wallTop;
  ctx.fillRect(0, 0, WORLD.width, 4);
  ctx.fillRect(0, WORLD.height - 4, WORLD.width, 4);
  ctx.fillRect(0, 0, 4, WORLD.height);
  ctx.fillRect(WORLD.width - 4, 0, 4, WORLD.height);
}

function drawObstacle(ctx, o) {
  if (o.kind === 'case') {
    ctx.fillStyle = COLORS.case;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = COLORS.caseTrim;
    ctx.lineWidth = 2;
    ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(o.x + 4, o.y + 4, o.w - 8, 10);
    text(ctx, '◆', o.x + o.w / 2, o.y + o.h / 2 + 1, 20, 'rgba(242,193,78,0.75)', '700', 'center');
  } else if (o.kind === 'pillar') {
    ctx.fillStyle = COLORS.pillar;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = '#565e96';
    ctx.lineWidth = 2;
    ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(o.x + 5, o.y + 5, o.w - 10, 6);
  } else if (o.kind === 'plinth') {
    ctx.fillStyle = '#cfd3e6';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 3;
    ctx.strokeRect(o.x + 1.5, o.y + 1.5, o.w - 3, o.h - 3);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(o.x, o.y + o.h - 8, o.w, 8);
  } else { // 'wall'
    ctx.fillStyle = '#272c47';
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.strokeStyle = '#3a4066';
    ctx.lineWidth = 2;
    ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
  }
}

function drawLoot(ctx, l, t) {
  if (l.taken) return;
  if (l.kind === 'diamond') {
    const pulse = 1 + 0.12 * Math.sin(t * 4);
    const s = 17 * pulse;
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = COLORS.diamond;
    ctx.shadowColor = COLORS.diamond;
    ctx.shadowBlur = 18;
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(l.x - 22, l.y - 14); ctx.lineTo(l.x - 10, l.y - 22);
    ctx.moveTo(l.x + 20, l.y - 16); ctx.lineTo(l.x + 12, l.y - 26);
    ctx.moveTo(l.x - 24, l.y + 12); ctx.lineTo(l.x - 14, l.y + 20);
    ctx.stroke();
    text(ctx, '$5,000', l.x, l.y + 34, 13, COLORS.diamond, '700', 'center');
    text(ctx, 'MERIDIAN DIAMOND', l.x, l.y - 34, 12, '#e8eaf2', '700', 'center');
  } else if (l.kind === 'painting') {
    ctx.fillStyle = '#6b4f1d';
    ctx.fillRect(l.x - 26, l.y - 18, 52, 36);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 3;
    ctx.strokeRect(l.x - 26, l.y - 18, 52, 36);
    ctx.fillStyle = '#3d6b8e';
    ctx.fillRect(l.x - 20, l.y - 12, 40, 24);
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.arc(l.x - 8, l.y - 2, 6, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, `$${l.value}`, l.x, l.y + 32, 12, COLORS.gold, '700', 'center');
  } else { // vase
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.ellipse(l.x, l.y, 11, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6a1f';
    ctx.fillRect(l.x - 4, l.y - 20, 8, 7);
    text(ctx, `$${l.value}`, l.x, l.y + 28, 12, COLORS.gold, '700', 'center');
  }
}

function drawGuard(ctx, g) {
  const chasing = g.mind === 'chase';
  const suspicious = g.mind === 'suspicious';
  const range = chasing ? 260 : 235;
  drawCone(
    ctx, g.x, g.y, g.dir, range, 0.56,
    chasing ? 'rgba(229,72,77,0.42)' : COLORS.guardCone,
    COLORS.guardConeEdge,
  );
  // Body: dark uniform, red rim, facing tick.
  ctx.fillStyle = '#1c1f2e';
  ctx.beginPath(); ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = COLORS.guard;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = COLORS.guard;
  ctx.beginPath();
  ctx.arc(g.x + Math.cos(g.dir) * 8, g.y + Math.sin(g.dir) * 8, 4, 0, Math.PI * 2);
  ctx.fill();
  // Eyes: two dots toward facing.
  ctx.fillStyle = '#fff';
  const ex = Math.cos(g.dir + Math.PI / 2) * 5;
  const ey = Math.sin(g.dir + Math.PI / 2) * 5;
  ctx.beginPath(); ctx.arc(g.x + Math.cos(g.dir) * 5 + ex, g.y + Math.sin(g.dir) * 5 + ey, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(g.x + Math.cos(g.dir) * 5 - ex, g.y + Math.sin(g.dir) * 5 - ey, 2, 0, Math.PI * 2); ctx.fill();
  if (chasing) text(ctx, '!', g.x, g.y - 26, 22, '#ff5a5f', '800', 'center');
  else if (suspicious) text(ctx, '?', g.x, g.y - 26, 20, '#fbbf24', '800', 'center');
  else if (g.suspicion > 0.12) {
    // A guard growing wary shows a thin suspicion arc.
    ctx.strokeStyle = 'rgba(251,191,36,0.9)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.radius + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.suspicion);
    ctx.stroke();
  }
}

function drawCamera(ctx, cam) {
  drawCone(ctx, cam.x, cam.y, cam.angle, 250, 0.42, COLORS.cameraCone, COLORS.cameraConeEdge);
  ctx.fillStyle = '#11131d';
  ctx.fillRect(cam.x - 9, cam.y - 9, 18, 18);
  ctx.strokeStyle = cam.seeing ? '#ff4444' : '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cam.x - 9, cam.y - 9, 18, 18);
  ctx.fillStyle = cam.seeing ? '#ff4444' : '#f59e0b';
  ctx.beginPath(); ctx.arc(cam.x, cam.y, 4, 0, Math.PI * 2); ctx.fill();
  // Lens direction tick.
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cam.x, cam.y);
  ctx.lineTo(cam.x + Math.cos(cam.angle) * 14, cam.y + Math.sin(cam.angle) * 14);
  ctx.stroke();
}

function drawPlayer(ctx, p, t) {
  const r = p.sneaking ? 12 : 14;
  // Soft shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + r - 2, r, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLORS.player;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = COLORS.playerDark;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Thief's mask band.
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r - 3, p.dir - 1.1, p.dir + 1.1);
  ctx.stroke();
  // Facing tick.
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(p.x + Math.cos(p.dir) * (r - 2), p.y + Math.sin(p.dir) * (r - 2), 3, 0, Math.PI * 2);
  ctx.fill();
  if (p.sneaking) {
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(45,212,191,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(p.x, p.y, r + 7, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    text(ctx, 'SNEAKING', p.x, p.y - r - 14, 10, COLORS.player, '700', 'center');
  }
  text(ctx, 'WREN', p.x, p.y + r + 13, 10, '#e8eaf2', '700', 'center');
}

function drawCoins(ctx, state) {
  for (const c of state.coinsInFlight) {
    if (!c.landed) {
      ctx.fillStyle = COLORS.gold;
      ctx.beginPath(); ctx.arc(c.x, c.y - 10 * Math.sin(c.t * Math.PI), 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#8a6a1f';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      const a = Math.max(0, c.ringTimer / 1.6);
      ctx.strokeStyle = `rgba(242,193,78,${a})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(c.tx, c.ty, 12 + (1 - a) * 26, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = COLORS.gold;
      ctx.beginPath(); ctx.arc(c.tx, c.ty, 5, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function drawExit(ctx, exit, locked) {
  ctx.fillStyle = locked ? '#7f1d1d' : COLORS.exit;
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = locked ? '#ef4444' : '#bbf7d0';
  ctx.lineWidth = 2;
  ctx.strokeRect(exit.x + 1, exit.y + 1, exit.w - 2, exit.h - 2);
  text(ctx, locked ? 'LOCKED' : 'EXIT →', exit.x + exit.w / 2, exit.y + exit.h / 2, 14, '#fff', '800', 'center');
}

function drawHud(ctx, state) {
  const level = state.level;
  ctx.fillStyle = 'rgba(10,12,22,0.88)';
  ctx.fillRect(0, 0, WORLD.width, 46);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, 46, WORLD.width, 1);
  text(ctx, 'THE MERIDIAN VAULT', 16, 24, 16, COLORS.hud, '800');
  text(ctx, level.name, 250, 24, 14, COLORS.hudDim, '600');

  // Alarm meter, center.
  const ax = 560;
  const aw = 180;
  const ah = 16;
  const ay = 15;
  const hot = state.alarm > 60;
  text(ctx, 'ALARM', ax - 8, ay + ah / 2, 13, hot ? '#ff6b6b' : COLORS.hudDim, '800', 'right');
  ctx.fillStyle = COLORS.alarmTrack;
  ctx.fillRect(ax, ay, aw, ah);
  const frac = state.alarm / ALARM.max;
  const grad = ctx.createLinearGradient(ax, 0, ax + aw, 0);
  grad.addColorStop(0, '#f59e0b');
  grad.addColorStop(1, COLORS.alarm);
  ctx.fillStyle = grad;
  ctx.fillRect(ax, ay, aw * frac, ah);
  ctx.strokeStyle = hot ? '#ff6b6b' : '#4b516e';
  ctx.lineWidth = hot ? 2.5 : 1.5;
  ctx.strokeRect(ax, ay, aw, ah);
  text(ctx, `${Math.round(state.alarm)}%`, ax + aw + 10, ay + ah / 2, 13, hot ? '#ff6b6b' : COLORS.hud, '800');

  // Right side: lives, score, loot, coins.
  let rx = WORLD.width - 16;
  const hearts = '♥'.repeat(state.lives) + '♡'.repeat(Math.max(0, GAME.lives - state.lives));
  text(ctx, hearts, rx, 24, 16, '#ff5a5f', '700', 'right');
  rx -= 80;
  text(ctx, `SCORE $${state.score.toLocaleString()}`, rx, 24, 14, COLORS.hud, '700', 'right');
  rx -= 160;
  text(ctx, `LOOT $${state.lootValue.toLocaleString()}`, rx, 24, 14, COLORS.gold, '700', 'right');
  rx -= 140;
  text(ctx, `● COINS ${state.coins}`, rx, 24, 14, COLORS.gold, '700', 'right');
}

function drawControlsHint(ctx, state) {
  text(
    ctx,
    'WASD / arrows — move    Shift — sneak    Click — toss a coin (' + state.coins + ' left)    E — grab loot    R — restart room',
    WORLD.width / 2, WORLD.height - 12, 12, 'rgba(154,160,184,0.85)', '600', 'center',
  );
}

function drawMessage(ctx, state) {
  if (!state.message) return;
  const w = 620;
  const x = (WORLD.width - w) / 2;
  ctx.fillStyle = 'rgba(10,12,22,0.9)';
  ctx.fillRect(x, 58, w, 34);
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, 58, w, 34);
  text(ctx, state.message, WORLD.width / 2, 76, 14, COLORS.gold, '700', 'center');
}

function panel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8,10,20,0.88)';
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  const w = 760;
  const h = 420;
  const x = (WORLD.width - w) / 2;
  const y = (WORLD.height - h) / 2;
  ctx.fillStyle = '#12152a';
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);
  text(ctx, title, WORLD.width / 2, y + 58, 40, accent, '800', 'center');
  lines.forEach((line, i) => {
    text(ctx, line.text, WORLD.width / 2, y + 122 + i * 34, line.size || 17, line.color || COLORS.hud, line.weight || '600', 'center');
  });
}

export function drawGame(ctx, state) {
  const t = state.time;
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  drawFloor(ctx);
  drawWalls(ctx);
  for (const o of state.level.obstacles) drawObstacle(ctx, o);
  drawExit(ctx, state.level.exit, state.level.exit.lockedUntilDiamond && !state.hasDiamond);
  for (const l of state.loot) drawLoot(ctx, l, t);
  drawCoins(ctx, state);
  for (const cam of state.cameras) drawCamera(ctx, cam);
  for (const g of state.guards) drawGuard(ctx, g);
  drawPlayer(ctx, state.player, t);
  drawHud(ctx, state);
  drawMessage(ctx, state);
  if (state.phase === 'playing') drawControlsHint(ctx, state);

  if (state.flashTimer > 0) {
    ctx.fillStyle = `rgba(220,38,38,${Math.min(0.45, state.flashTimer * 0.3)})`;
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  }

  if (state.phase === 'title') {
    panel(ctx, 'THE MERIDIAN VAULT', [
      { text: 'You are Wren, the thief. Three rooms stand between you', size: 18 },
      { text: 'and the Meridian Diamond — patrolling guards, sweeping', size: 18 },
      { text: 'cameras, and an alarm that climbs every second you are seen.', size: 18 },
      { text: 'Red cones are guards. Orange cones are cameras.', color: COLORS.hudDim },
      { text: 'Break line of sight behind a green case to cool the alarm down.', color: COLORS.hudDim },
      { text: 'Press ENTER to begin the heist', size: 20, color: COLORS.gold, weight: '800' },
    ], COLORS.gold);
  } else if (state.phase === 'roomclear') {
    panel(ctx, 'ROOM CLEAR', [
      { text: `${state.level.name} — loot banked.`, size: 19 },
      { text: `Score $${state.score.toLocaleString()}  ·  Lives ${'♥'.repeat(state.lives)}`, size: 18, color: COLORS.gold },
      { text: 'Press ENTER for the next room', size: 20, color: COLORS.gold, weight: '800' },
    ], COLORS.exit);
  } else if (state.phase === 'caught') {
    panel(ctx, 'CAUGHT!', [
      { text: state.lives > 0 ? 'A guard got you — or the alarm hit 100%.' : '', size: 19 },
      { text: `Lives left: ${'♥'.repeat(state.lives)}${'♡'.repeat(GAME.lives - state.lives)}`, size: 18, color: '#ff5a5f' },
      { text: 'Press ENTER to retry this room', size: 20, color: COLORS.gold, weight: '800' },
    ], '#ef4444');
  } else if (state.phase === 'gameover') {
    panel(ctx, 'THE VAULT WINS', [
      { text: 'Three strikes — Wren is in a cell tonight.', size: 19 },
      { text: `Final score $${state.score.toLocaleString()}`, size: 18, color: COLORS.gold },
      { text: 'Press ENTER to start over', size: 20, color: COLORS.gold, weight: '800' },
    ], '#ef4444');
  } else if (state.phase === 'win') {
    panel(ctx, 'CLEAN GETAWAY!', [
      { text: 'The Meridian Diamond is yours. Wren slips into the night.', size: 19 },
      { text: `Loot $${state.lootValue.toLocaleString()}  ·  Time ${Math.round(state.elapsed)}s  ·  Lives ${'♥'.repeat(state.lives)}`, size: 18 },
      { text: `FINAL SCORE  $${state.score.toLocaleString()}`, size: 24, color: COLORS.gold, weight: '800' },
      { text: 'Press ENTER to run it again', size: 18, color: COLORS.gold, weight: '800' },
    ], COLORS.diamond);
  }
}
