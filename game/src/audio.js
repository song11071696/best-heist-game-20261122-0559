// The Meridian Vault — synthesized sound, no audio files.
// Every effect is a small WebAudio oscillator burst, and the alarm is a
// slow two-tone loop whose volume follows the alarm meter. Nothing is
// fetched; the context is created on the first user gesture.

export class SoundFX {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.alarmNodes = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.35;
    this.master.connect(this.ctx.destination);
  }

  _tone(freq, dur, type = 'sine', vol = 0.5, slideTo = null, delay = 0) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // One soft footstep tick. Called sparingly by main.js while moving.
  step(sneaking) {
    this._tone(sneaking ? 140 : 190, 0.06, 'triangle', sneaking ? 0.08 : 0.14, 90);
  }

  coinThrow() {
    this._tone(1200, 0.08, 'sine', 0.2, 900);
  }

  coinLand() {
    this._tone(2093, 0.09, 'sine', 0.3);
    this._tone(2637, 0.14, 'sine', 0.25, null, 0.07);
  }

  pickup() {
    this._tone(880, 0.1, 'sine', 0.35);
    this._tone(1318, 0.16, 'sine', 0.3, null, 0.08);
  }

  diamond() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => this._tone(f, 0.22, 'sine', 0.3, null, i * 0.07));
  }

  suspicious() {
    this._tone(330, 0.18, 'square', 0.12, 415);
  }

  chase() {
    this._tone(220, 0.3, 'sawtooth', 0.16, 440);
  }

  caught() {
    this._tone(392, 0.5, 'sawtooth', 0.25, 98);
    this._tone(196, 0.7, 'square', 0.14, 65, 0.12);
  }

  roomClear() {
    [392, 523, 659].forEach((f, i) => this._tone(f, 0.2, 'triangle', 0.3, null, i * 0.09));
  }

  win() {
    [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => this._tone(f, 0.25, 'triangle', 0.3, null, i * 0.1));
  }

  // The alarm loop: two alternating tones, louder as the meter climbs.
  // Call every frame with the current alarm (0-100); pass 0 to silence.
  setAlarm(level) {
    if (!this.ctx) return;
    if (level < 12) {
      if (this.alarmNodes) {
        try { this.alarmNodes.osc.stop(); } catch (_) { /* already stopped */ }
        this.alarmNodes = null;
      }
      return;
    }
    if (!this.alarmNodes) {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 620;
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 2.2;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 190;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(this.master);
      osc.start();
      lfo.start();
      this.alarmNodes = { osc, lfo, gain };
    }
    const target = 0.02 + (level / 100) * 0.11;
    this.alarmNodes.gain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.15);
  }
}
