// The Meridian Vault — keyboard + mouse input.
// Tracks held keys and hands the game one clean input frame per tick:
// a move vector, sneak, and at most one coin target (world coordinates).

export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressedKeys = new Set(); // edge-triggered: keys pressed since the last frame()
    this.coinQueue = []; // world-space click points waiting to be thrown
    this.onFirstGesture = null; // fired once, for unlocking audio
    this._gestured = false;
    this.canvas = canvas;

    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      this.keys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      this.pressedKeys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      this._gesture();
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    });
    window.addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('mousedown', (e) => {
      this._gesture();
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
      this.coinQueue.push({ x, y });
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _gesture() {
    if (!this._gestured) {
      this._gestured = true;
      if (this.onFirstGesture) this.onFirstGesture();
    }
  }

  _held(...names) {
    return names.some((n) => this.keys.has(n));
  }

  // Consume one frame of input. Call once per tick.
  frame() {
    const moveX = (this._held('d', 'ArrowRight') ? 1 : 0) - (this._held('a', 'ArrowLeft') ? 1 : 0);
    const moveY = (this._held('s', 'ArrowDown') ? 1 : 0) - (this._held('w', 'ArrowUp') ? 1 : 0);
    const coin = this.coinQueue.shift() || null;
    const enterPressed = this.pressedKeys.has('Enter');
    const restartPressed = this.pressedKeys.has('r');
    this.pressedKeys.clear();
    return {
      moveX,
      moveY,
      sneak: this._held('Shift'),
      coin,
      interact: this._held('e'),
      restart: restartPressed,
      enter: enterPressed,
    };
  }

}
