const clamp1 = (v) => Math.max(-1, Math.min(1, v));

// mando (Xbox, PlayStation...): cada botón pulsa una tecla del juego, así funciona todo lo que ya va con teclado.
// Orden «standard»: A, B, X, Y, LB, RB, LT, RT, Vista, Menú, stick izq., stick der., cruceta ↑ ↓ ← →
// (LT y RT no son teclas: frenan y aceleran a fondo o poco a poco, como el joystick táctil)
export const PAD_KEYS = [' ', 'k', 'j', 'f', 'z', 'x', null, null, 'g', 'Escape', 'i', 'c', 'n', 'r', 't', 'o'];
const DEAD = 0.18;
const dead = (v) => (Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD));

export class Input {
  constructor() {
    this.keys = new Set();
    this.onceHandlers = {};
    // joystick táctil (x: +1 izquierda, y: +1 adelante)
    this.axis = { x: 0, y: 0 };
    // mando: stick izquierdo (x, y como el táctil) y gatillos (t: RT − LT)
    this.pad = { x: 0, y: 0, t: 0 };
    this.padDown = [];
    this.onPad = null; // (nombre del mando) al conectarlo
    // paused: con el mapa grande abierto las teclas no mueven el juego
    this.paused = false;
    window.addEventListener('keydown', (e) => {
      if (e.repeat || this.paused) return;
      // escribiendo en un buscador, las letras no son teclas del juego
      if (e.target instanceof HTMLElement && e.target.matches('input[type=text], input[type=search], textarea')) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (this.onceHandlers[k]) this.onceHandlers[k]();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener('blur', () => this.keys.clear());
    window.addEventListener('gamepadconnected', (e) => this.onPad?.(e.gamepad.id));
    const poll = () => {
      // si el navegador no deja leer el mando (p. ej. dentro de una página que no lo permite), se deja de mirar
      try { this.pollPad(); } catch { return; }
      requestAnimationFrame(poll);
    };
    if (navigator.getGamepads) requestAnimationFrame(poll);
  }
  on(key, fn) { this.onceHandlers[key.toLowerCase()] = fn; }
  /** el mando vibra con los golpes (f de 0 a 1), si lo sabe hacer */
  rumble(f) {
    const act = this.gamepad?.vibrationActuator;
    if (!act?.playEffect || f < 0.05) return;
    const s = Math.min(1, f);
    act.playEffect('dual-rumble', { duration: 90 + s * 220, strongMagnitude: s, weakMagnitude: s * 0.6 })?.catch?.(() => {});
  }
  pollPad() {
    const pads = [...(navigator.getGamepads() || [])].filter((p) => p && p.connected);
    const gp = pads.find((p) => p.mapping === 'standard') || pads[0];
    this.gamepad = gp || null;
    if (!gp) { this.pad.x = this.pad.y = this.pad.t = 0; return; }
    this.pad.x = -dead(gp.axes[0] || 0);
    this.pad.y = -dead(gp.axes[1] || 0);
    const val = (i) => gp.buttons[i]?.value ?? 0;
    this.pad.t = val(7) - val(6);
    PAD_KEYS.forEach((key, i) => {
      const on = !!(key && gp.buttons[i]?.pressed);
      if (on === !!this.padDown[i]) return;
      // con el mapa abierto, Vista lo cierra (Escape); la tecla se suelta con la misma que se pulsó
      const k = on ? (i === 8 && this.paused ? 'Escape' : key) : this.padDown[i];
      this.padDown[i] = on ? k : null;
      window.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { key: k }));
    });
  }
  get throttle() {
    return clamp1((this.keys.has('w') || this.keys.has('arrowup') ? 1 : 0)
      - (this.keys.has('s') || this.keys.has('arrowdown') ? 1 : 0) + this.axis.y + this.pad.y + this.pad.t);
  }
  get steer() {
    return clamp1((this.keys.has('a') || this.keys.has('arrowleft') ? 1 : 0)
      - (this.keys.has('d') || this.keys.has('arrowright') ? 1 : 0) + this.axis.x + this.pad.x);
  }
  get handbrake() { return this.keys.has(' '); }
}
