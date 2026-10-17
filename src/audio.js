import { sound } from './sound.js';

/**
 * Motor sintetizado: el grave de las explosiones (diente de sierra y cuadrada,
 * con su petardeo) y, por encima, un armónico agudo y el aire de la marcha,
 * que es lo que se oye en el altavoz del móvil. Con marchas: las revoluciones
 * suben con la velocidad y caen al cambiar. A pie, el motor se apaga.
 */

// velocidades (m/s) a las que se cambia de marcha; el deportivo llega a 47
const GEARS = [0, 8, 16, 25, 35, 48];

export class EngineSound {
  constructor() { this.n = null; }

  start() {
    sound.unlock();
    this.build();
  }

  build() {
    const ctx = sound.ctx;
    if (this.n || !ctx) return;
    const n = (this.n = {});
    n.bus = ctx.createGain();
    n.bus.gain.value = 0;
    n.bus.connect(sound.out);
    n.lp = ctx.createBiquadFilter();
    n.lp.type = 'lowpass';
    n.lp.frequency.value = 900;
    n.lp.Q.value = 1.2;
    n.lp.connect(n.bus);
    // petardeo: cada explosión de los cilindros empuja el volumen
    n.puff = ctx.createGain();
    n.puff.gain.value = 0.7;
    n.puff.connect(n.lp);
    n.lfo = ctx.createOscillator();
    n.lfo.frequency.value = 20;
    const depth = ctx.createGain();
    depth.gain.value = 0.3;
    n.lfo.connect(depth).connect(n.puff.gain);
    n.lfo.start();
    const voice = (type, gain, to) => {
      const o = ctx.createOscillator();
      o.type = type;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g).connect(to);
      o.start();
      return o;
    };
    n.o1 = voice('sawtooth', 0.5, n.puff);
    n.o2 = voice('square', 0.22, n.puff);
    n.o3 = voice('sawtooth', 0.16, n.lp);
    // aire y rodadura: ruido filtrado que sube con la velocidad
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1100;
    bp.Q.value = 0.6;
    n.air = ctx.createGain();
    n.air.gain.value = 0;
    noise.connect(bp).connect(n.air).connect(n.bus);
    noise.start();
  }

  /** speed en m/s, throttle de -1 a 1; on: vas en el coche */
  update(speed, throttle, on = true) {
    this.build();
    if (!this.n) return;
    const n = this.n, t = sound.ctx.currentTime;
    const s = Math.abs(speed);
    let gear = GEARS.length - 2;
    for (let i = 1; i < GEARS.length; i++) if (s < GEARS[i]) { gear = i - 1; break; }
    const inGear = Math.min(1, (s - GEARS[gear]) / (GEARS[gear + 1] - GEARS[gear]));
    const gas = Math.max(0, throttle);
    const rpm = Math.min(1, 0.16 + inGear * 0.62 + gas * 0.14 + (gear ? 0.08 : 0));
    const f = 34 + rpm * 150;   // explosiones por segundo
    n.o1.frequency.setTargetAtTime(f, t, 0.06);
    n.o2.frequency.setTargetAtTime(f * 0.5, t, 0.06);
    n.o3.frequency.setTargetAtTime(f * 2.01, t, 0.06);
    n.lfo.frequency.setTargetAtTime(f * 0.5, t, 0.06);
    n.lp.frequency.setTargetAtTime(650 + rpm * 2400 + gas * 500, t, 0.08);
    n.bus.gain.setTargetAtTime(on ? 0.12 + rpm * 0.16 + gas * 0.06 : 0, t, on ? 0.08 : 0.25);
    n.air.gain.setTargetAtTime(on ? Math.min(1, s / 40) * 0.3 : 0, t, 0.15);
  }
}
