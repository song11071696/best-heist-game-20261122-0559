// The Meridian Vault — game loop and screens.
// Wires input, world, render and sound together. In shot mode
// (?shot=cover&seed=7) it stages one deterministic scene and paints a
// single frame, so screenshots are reproducible byte for byte.

import { WORLD } from './config.js';
import { createWorld, startGame, restartRoom, advanceRoom, updateWorld } from './world.js';
import { drawGame } from './render.js';
import { Input } from './input.js';
import { SoundFX } from './audio.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = WORLD.width;
canvas.height = WORLD.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seed = Number.parseInt(params.get('seed') || '7', 10) || 7;

const input = new Input(canvas);
const sfx = new SoundFX();
input.onFirstGesture = () => sfx.ensure();

// Exposed for play-testing and for the deterministic replay check:
// window.__game.state is the live world, window.__game.step runs it.
window.__game = { state: null, version: 'meridian-vault-1.0.0' };

if (shotName) {
  // Shot mode: one fixed frame, no loop, no timers, no randomness.
  const state = stageShot(shotName, seed);
  window.__game.state = state;
  drawGame(ctx, state);
  document.title = `The Meridian Vault — ${shotName}`;
} else {
  const state = createWorld();
  window.__game.state = state;
  window.__game.step = (frameInput, dt) => updateWorld(state, frameInput, dt);

  let last = performance.now();
  let enterHeld = false;
  let restartHeld = false;
  let stepTimer = 0;
  let prevSuspicious = 0;
  let prevChasing = 0;

  function playEvents() {
    for (const ev of state.events) {
      if (ev === 'coin-throw') sfx.coinThrow();
      else if (ev === 'coin-land') sfx.coinLand();
      else if (ev === 'pickup') sfx.pickup();
      else if (ev === 'diamond') sfx.diamond();
      else if (ev === 'caught' || ev === 'alarm-caught') sfx.caught();
      else if (ev === 'clear') sfx.roomClear();
      else if (ev === 'win') sfx.win();
    }
    state.events.length = 0;
  }

  function tick(now) {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    const frame = input.frame();

    // Enter advances screens; R restarts the room. Edge-triggered.
    if (frame.enter && !enterHeld) {
      sfx.ensure();
      if (state.phase === 'title') startGame(state);
      else if (state.phase === 'roomclear') advanceRoom(state);
      else if (state.phase === 'caught') restartRoom(state);
      else if (state.phase === 'gameover') startGame(state);
      else if (state.phase === 'win') startGame(state);
    }
    enterHeld = frame.enter;
    if (frame.restart && !restartHeld && state.phase === 'playing') {
      restartRoom(state);
    }
    restartHeld = frame.restart;

    if (state.phase === 'playing') {
      updateWorld(state, frame, dt);
      // Footsteps, throttled.
      stepTimer -= dt;
      if ((frame.moveX !== 0 || frame.moveY !== 0) && stepTimer <= 0) {
        sfx.step(frame.sneak);
        stepTimer = frame.sneak ? 0.55 : 0.34;
      }
      // A guard that just noticed you gets an audible cue.
      const suspicious = state.guards.filter((g) => g.mind === 'suspicious').length;
      const chasing = state.guards.filter((g) => g.mind === 'chase').length;
      if (chasing > prevChasing) sfx.chase();
      else if (suspicious > prevSuspicious) sfx.suspicious();
      prevSuspicious = suspicious;
      prevChasing = chasing;
      sfx.setAlarm(state.alarm);
    } else {
      sfx.setAlarm(0);
    }
    playEvents();
    drawGame(ctx, state);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
