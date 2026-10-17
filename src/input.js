const clamp1 = (v) => Math.max(-1, Math.min(1, v));

export class Input {
  constructor() {
    this.keys = new Set();
    this.onceHandlers = {};
    // joystick táctil (x: +1 izquierda, y: +1 adelante)
    this.axis = { x: 0, y: 0 };
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (this.onceHandlers[k]) this.onceHandlers[k]();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
  }
  on(key, fn) { this.onceHandlers[key.toLowerCase()] = fn; }
  get throttle() {
    return clamp1((this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0)
      - (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) + this.axis.y);
  }
  get steer() {
    return clamp1((this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0)
      - (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) + this.axis.x);
  }
  get handbrake() { return this.keys.has(' '); }
}
