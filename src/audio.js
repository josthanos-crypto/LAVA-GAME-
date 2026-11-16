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

  /** speed en m/s, throttle de -1 a 1; on: vas en el coche; load: cuesta arriba (hasta 1) o abajo (hasta −1) */
  update(speed, throttle, on = true, load = 0) {
    this.build();
    if (!this.n) return;
    // un NaN que llegue aquí (una pendiente rara del terreno, un golpe) rompería el
    // AudioParam y con él el fotograma entero: se sanea y el juego nunca se corta por esto
    if (!Number.isFinite(speed)) speed = 0;
    if (!Number.isFinite(throttle)) throttle = 0;
    if (!Number.isFinite(load)) load = 0;
    const n = this.n, t = sound.ctx.currentTime;
    const s = Math.abs(speed);
    let gear = GEARS.length - 2;
    for (let i = 1; i < GEARS.length; i++) if (s < GEARS[i]) { gear = i - 1; break; }
    const inGear = Math.min(1, (s - GEARS[gear]) / (GEARS[gear + 1] - GEARS[gear]));
    const gas = Math.max(0, throttle);
    // cuesta arriba el motor se esfuerza (más ronco y más fuerte); cuesta abajo sin gas, retiene
    const strain = Math.max(0, load) * Math.max(0.35, gas);
    const hold = Math.max(0, -load) * (1 - gas);
    const rpm = Math.min(1, 0.16 + inGear * 0.62 + gas * 0.14 + (gear ? 0.08 : 0) - strain * 0.05 + hold * 0.06);
    const f = 34 + rpm * 150;   // explosiones por segundo
    n.o1.frequency.setTargetAtTime(f, t, 0.06);
    n.o2.frequency.setTargetAtTime(f * 0.5, t, 0.06);
    n.o3.frequency.setTargetAtTime(f * 2.01, t, 0.06);
    n.lfo.frequency.setTargetAtTime(f * 0.5, t, 0.06);
    n.lp.frequency.setTargetAtTime(650 + rpm * 2400 + gas * 500 + strain * 700, t, 0.08);
    n.bus.gain.setTargetAtTime(on ? 0.12 + rpm * 0.16 + gas * 0.06 + strain * 0.06 : 0, t, on ? 0.08 : 0.25);
    n.air.gain.setTargetAtTime(on ? Math.min(1, s / 40) * 0.3 : 0, t, 0.15);
  }
}

/**
 * el turbo salto del roadster: un soplido que sube (ruido con un filtro que se abre y se cierra)
 * y un zumbido eléctrico que sube mientras el coche vuela y baja al caer. T: segundos en el aire
 */
export function turboSound(T = 4) {
  const ctx = sound.ctx;
  if (!sound.live || !ctx) return;
  const t0 = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(0.55, t0 + 0.12);
  out.gain.exponentialRampToValueAtTime(0.14, t0 + 1.4);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + T);
  out.connect(sound.out);
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(300, t0);
  bp.frequency.exponentialRampToValueAtTime(2600, t0 + 0.9);
  bp.frequency.exponentialRampToValueAtTime(450, t0 + T);
  noise.connect(bp).connect(out);
  noise.start(t0);
  noise.stop(t0 + T);
  const hum = ctx.createOscillator();
  hum.type = 'sawtooth';
  hum.frequency.setValueAtTime(120, t0);
  hum.frequency.exponentialRampToValueAtTime(520, t0 + T / 2);
  hum.frequency.exponentialRampToValueAtTime(150, t0 + T);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1400;
  const hg = ctx.createGain();
  hg.gain.value = 0.1;
  hum.connect(lp).connect(hg).connect(out);
  hum.start(t0);
  hum.stop(t0 + T);
}

/** el siseo del aire comprimido de los propulsores del roadster: una ráfaga corta de ruido agudo. fuerza: 0..1 */
let hissBuf = null;
export function hissSound(fuerza = 0.6) {
  const ctx = sound.ctx;
  if (!sound.live || !ctx) return;
  const t0 = ctx.currentTime, dur = 0.22 + fuerza * 0.2;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t0);
  out.gain.exponentialRampToValueAtTime(0.06 + fuerza * 0.14, t0 + 0.03);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  out.connect(sound.out);
  // el ruido se genera una sola vez (medio segundo) y cada siseo empieza en un punto distinto
  if (!hissBuf) {
    hissBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.5), ctx.sampleRate);
    const d = hissBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = hissBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2400;
  noise.connect(hp).connect(out);
  noise.start(t0, Math.random() * 0.05);
  noise.stop(t0 + dur);
}
