/**
 * Todo el sonido del juego sale por aquí: un solo AudioContext con el volumen
 * general y el botón de silencio (el navegador recuerda la elección; si no se
 * toca, hay sonido). El móvil solo deja arrancar el audio con un toque: se
 * enciende al pulsar Conducir y, si el sistema lo corta (una llamada, salir de la
 * app), vuelve con el siguiente toque. En el iPhone se pide sesión de
 * reproducción para que suene aunque el móvil esté en silencio.
 */

const KEY = 'atg-sonido';
const VOLUME = 0.9;
const IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function readMuted() {
  try { return localStorage.getItem(KEY) === 'no'; } catch { return false; }
}

/** medio segundo de silencio en WAV: el <audio> mudo que en el iPhone abre la sesión de reproducción */
function silentWav() {
  const rate = 8000, n = rate / 2, v = new DataView(new ArrayBuffer(44 + n));
  const text = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  text(0, 'RIFF'); v.setUint32(4, 36 + n, true); text(8, 'WAVEfmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  text(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
  return URL.createObjectURL(new Blob([v.buffer], { type: 'audio/wav' }));
}

function setSession(type) {
  try { if (navigator.audioSession) navigator.audioSession.type = type; } catch { /* el navegador no la tiene */ }
}

class Sound {
  constructor() {
    this.ctx = null;
    this.out = null;          // entrada de la mezcla: todos los sonidos se conectan aquí
    this.muted = readMuted();
    this.started = false;     // ya se pulsó Conducir
    this.onChange = null;     // (muted) → el botón y el menú
    this.tag = null;
    for (const ev of ['touchend', 'pointerup', 'keydown']) {
      addEventListener(ev, () => this.wake(), { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.tag?.pause();
      else this.wake();
    });
  }

  /** ¿está sonando? (los sonidos sueltos no se crean si no) */
  get live() { return !!this.ctx && !this.muted; }

  /** enciende (o vuelve a encender) el sonido; hay que llamarlo dentro de un toque o una tecla */
  unlock() {
    this.started = true;
    if (this.muted) return;
    setSession('playback');
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try { this.ctx = new AC({ latencyHint: 'interactive' }); } catch { return; }
      this.out = this.ctx.createGain();
      this.out.gain.value = VOLUME;
      // limitador: aunque coincidan motor, sirena y tiros, no satura
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -10;
      limiter.ratio.value = 6;
      this.out.connect(limiter).connect(this.ctx.destination);
    }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    this.out.gain.setTargetAtTime(VOLUME, this.ctx.currentTime, 0.05);
    if (IOS) {
      if (!this.tag) {
        this.tag = Object.assign(document.createElement('audio'), { src: silentWav(), loop: true });
        this.tag.setAttribute('playsinline', '');
      }
      this.tag.play().catch(() => {});
    }
  }

  /** tras una llamada o al volver a la app: si debería sonar y no suena, se reanuda */
  wake() {
    if (!this.started || this.muted) return;
    if (!this.ctx || this.ctx.state !== 'running' || (this.tag && this.tag.paused)) this.unlock();
  }

  setMuted(muted) {
    this.muted = muted;
    try { localStorage.setItem(KEY, muted ? 'no' : 'si'); } catch { /* sin almacenamiento: vale para esta partida */ }
    if (muted) {
      const ctx = this.ctx;
      if (ctx) {
        this.out.gain.setTargetAtTime(0, ctx.currentTime, 0.04);
        // en silencio se para del todo: no gasta batería y deja sonar la música del móvil
        setTimeout(() => { if (this.muted) ctx.suspend().catch(() => {}); }, 300);
      }
      this.tag?.pause();
      setSession('auto');
    } else {
      this.unlock();
    }
    this.onChange?.(muted);
  }

  /** quita o pone el sonido; devuelve si queda en silencio */
  toggle() {
    this.setMuted(!this.muted);
    return this.muted;
  }
}

export const sound = new Sound();
