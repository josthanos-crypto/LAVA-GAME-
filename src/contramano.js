/**
 * Aviso de dirección prohibida: mira si el coche del jugador va en contra del sentido de una calle de
 * sentido único (sentidos.js) y, si lleva un rato así, lo dice una vez. No multa ni llama a la policía.
 */
const CELL = 24;
const HOLD = 1.6;      // segundos seguidos a contramano antes de avisar
const COOLDOWN = 14;   // segundos entre avisos

export class Contramano {
  constructor(roads) {
    this.grid = new Map();
    this.bad = 0;
    this.quiet = 0;
    for (const r of roads) {
      if (!r.ow || r.ped || r.dirt || r.p.length < 2) continue;
      for (let i = 0; i + 1 < r.p.length; i++) {
        const [ax, az] = r.ow > 0 ? r.p[i] : r.p[i + 1], [bx, bz] = r.ow > 0 ? r.p[i + 1] : r.p[i];
        const L = Math.hypot(bx - ax, bz - az);
        if (L < 1) continue;
        const s = [ax, az, bx, bz, r.w / 2, (bx - ax) / L, (bz - az) / L];
        const x0 = Math.floor((Math.min(ax, bx) - s[4]) / CELL), x1 = Math.floor((Math.max(ax, bx) + s[4]) / CELL);
        const z0 = Math.floor((Math.min(az, bz) - s[4]) / CELL), z1 = Math.floor((Math.max(az, bz) + s[4]) / CELL);
        for (let cx = x0; cx <= x1; cx++) for (let cz = z0; cz <= z1; cz++) {
          const k = cx * 100003 + cz;
          if (!this.grid.has(k)) this.grid.set(k, []);
          this.grid.get(k).push(s);
        }
      }
    }
  }

  /** ¿el punto (x, z) con rumbo (fx, fz) va en contra de una calle de sentido único? */
  against(x, z, fx, fz) {
    const list = this.grid.get(Math.floor(x / CELL) * 100003 + Math.floor(z / CELL));
    if (!list) return false;
    let best = null, bd = Infinity;
    for (const s of list) {
      const dx = s[2] - s[0], dz = s[3] - s[1], L2 = dx * dx + dz * dz;
      const t = ((x - s[0]) * dx + (z - s[1]) * dz) / L2;
      // lejos de los extremos: en los cruces se pisan varias calles a la vez
      if (t < 0.12 || t > 0.88) continue;
      const d = Math.hypot(s[0] + dx * t - x, s[1] + dz * t - z);
      if (d < s[4] && d < bd) { bd = d; best = s; }
    }
    return !!best && best[5] * fx + best[6] * fz < -0.6;
  }

  /** se llama cada dt segundos con el coche del jugador; devuelve true cuando toca avisar */
  check(x, z, fx, fz, speed, dt) {
    this.quiet -= dt;
    this.bad = speed > 3 && this.against(x, z, fx, fz) ? this.bad + dt : 0;
    if (this.bad < HOLD || this.quiet > 0) return false;
    this.quiet = COOLDOWN;
    this.bad = 0;
    return true;
  }
}
