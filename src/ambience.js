import { SegmentGrid } from './collision.js';
import { sound } from './sound.js';

/**
 * Ambiente: de fondo, el rumor lejano de la ciudad (tráfico y gente) y, cerca
 * de la orilla o del Charco, las olas, que rompen y se retiran. Así a pie
 * también se oye Arrecife.
 */

const NEAR = 90;   // metros a los que empiezan a oírse las olas

function noiseBuffer(ctx, secs, brown) {
  const len = Math.floor(ctx.sampleRate * secs);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    // ruido marrón: grave, como un rumor; el blanco, como la espuma
    last = (last + 0.02 * w) / 1.02;
    d[i] = brown ? last * 3.5 : w;
  }
  return buf;
}

export class Ambience {
  constructor(map) {
    this.coast = new SegmentGrid();
    const sea = map.sea;
    if (sea) for (const ring of [sea.outer, ...(sea.holes || [])]) this.coast.addPolygon(ring);
    for (const w of map.inlandWater || []) this.coast.addPolygon(w);
    this.n = null;
    this.t = 0;
    this.check = 0;
    this.sea = 0;   // cercanía al agua: 0 lejos, 1 en la orilla
  }

  build() {
    const ctx = sound.ctx;
    if (this.n || !ctx) return;
    const loop = (buf) => {
      const s = ctx.createBufferSource();
      s.buffer = buf;
      s.loop = true;
      s.start();
      return s;
    };
    const city = ctx.createBiquadFilter();
    city.type = 'bandpass';
    city.frequency.value = 420;
    city.Q.value = 0.5;
    const cityGain = ctx.createGain();
    cityGain.gain.value = 0;
    loop(noiseBuffer(ctx, 4, true)).connect(city).connect(cityGain).connect(sound.out);
    const surf = ctx.createBiquadFilter();
    surf.type = 'lowpass';
    surf.frequency.value = 700;
    const seaGain = ctx.createGain();
    seaGain.gain.value = 0;
    loop(noiseBuffer(ctx, 3, false)).connect(surf).connect(seaGain).connect(sound.out);
    this.n = { cityGain, seaGain, surf };
  }

  /** distancia a la orilla más cercana (como mucho NEAR) */
  shoreDist(x, z) {
    let best = NEAR;
    this.coast.forEachNear(x, z, NEAR, (s) => {
      const dx = s.bx - s.ax, dz = s.bz - s.az, l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / l2));
      best = Math.min(best, Math.hypot(x - s.ax - dx * t, z - s.az - dz * t));
    });
    return best;
  }

  /** indoor: dentro de un local, la calle se oye muy de lejos */
  update(dt, x, z, inCar, indoor = false) {
    this.build();
    if (!this.n) return;
    this.t += dt;
    if ((this.check -= dt) <= 0) {
      this.check = 0.4;
      this.sea = 1 - this.shoreDist(x, z) / NEAR;
    }
    const t = sound.ctx.currentTime;
    // las olas rompen cada seis o siete segundos, unas más fuertes que otras
    const swell = 0.5 + 0.5 * Math.sin(this.t * 0.9 + Math.sin(this.t * 0.31) * 1.7);
    const near = this.sea * this.sea;
    this.n.seaGain.gain.setTargetAtTime(near * (0.06 + 0.22 * swell) * (indoor ? 0.2 : inCar ? 0.6 : 1), t, 0.3);
    this.n.surf.frequency.setTargetAtTime(500 + 900 * swell, t, 0.3);
    // dentro del coche (y más aún dentro de un local) lo de fuera se oye menos
    this.n.cityGain.gain.setTargetAtTime((indoor ? 0.03 : inCar ? 0.05 : 0.09) * (1 - near * 0.6), t, 0.5);
  }
}
