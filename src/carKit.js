import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { carShape, brandOf, modelName } from './carModels.js';
import { logoCanvas, MARCAS } from './marcas.js';
import { sound } from './sound.js';

/**
 * Lo que hace que un coche se sienta de verdad por dentro y por fuera:
 *  · intermitentes naranjas en las cuatro esquinas y en las aletas (el jugador y el tráfico),
 *  · la puerta del conductor, que se abre al subir y al bajar,
 *  · el puesto del conductor para ir en primera persona: salpicadero, relojes, volante que gira,
 *    pilares, techo y retrovisor,
 *  · el cartel con el logotipo, la marca y el modelo al subirte.
 * En España se conduce por la derecha y el conductor va a la izquierda: en el coche, +x es la izquierda.
 */

// ── utilidades ──
const bounds = (ring) => {
  let x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const [x, y] of ring) { x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return { x1, y0, y1 };
};
/** caja colocada (para unir en una sola malla) */
const boxAt = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
/** la pintura del coche usa colores por vértice: las piezas nuevas los llevan en blanco */
function white(g) {
  const n = g.getAttribute('position').count;
  g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3).fill(1), 3));
  return g;
}
/** viga entre dos puntos (pilares del parabrisas, marcos) */
function beam(a, b, w, d, mat) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, d, len), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.lookAt(b);
  return m;
}
/** silueta en el costado (z, y) mirando hacia fuera (+x) o hacia dentro (−x) */
function sideShape(pts, out) {
  const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(out ? -z : z, y)));
  return sh;
}
function sideGeo(pts, out, depth = 0) {
  const sh = sideShape(pts, out);
  const g = depth ? new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }) : new THREE.ShapeGeometry(sh);
  g.rotateY(out ? Math.PI / 2 : -Math.PI / 2);
  return g;
}

// ── sonidos cortos: el tic-tac del intermitente y la puerta ──
let noiseBuf = null;
function knock(freq, dur, gain, q = 0.7) {
  if (!sound.live) return;
  const ctx = sound.ctx, t = ctx.currentTime;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.4), ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
  src.connect(f).connect(g).connect(sound.out);
  src.start(t, Math.random() * 0.3);
  src.stop(t + dur + 0.02);
}
/** tic (se enciende) y tac (se apaga), como el relé de un coche */
export function blinkTick(on) { knock(on ? 3400 : 2300, on ? 0.018 : 0.022, on ? 0.35 : 0.28, 6); }
function doorSound(open) {
  if (open) { knock(1400, 0.06, 0.35, 3); knock(500, 0.09, 0.3, 1.5); }
  else { knock(180, 0.22, 1.1, 0.9); knock(1200, 0.04, 0.4, 2); }
}

// ── intermitentes ──
const LAMP_OFF = new THREE.Color(0xc27417), LAMP_ON = new THREE.Color(0xffc25a);
/**
 * pone los intermitentes al coche (una vez): delante, detrás y un repetidor en cada aleta.
 * Después, group.userData.indicate(izquierdo, derecho) los enciende o los apaga.
 */
export function addIndicators(group) {
  // sin intermitentes (los quitó José Manuel): no se pone ninguna luz
  if (group) return;
  const ud = group.userData;
  if (ud.indicate || !ud.carType || !ud.body) return;
  const M = carShape(ud.carType), s = M.s;
  // delante: por debajo del faro, en la esquina (o donde el frontal ya pinta el naranja)
  const f = bounds(M.ringF), hF = f.y1 - f.y0, ly = f.y1 - Math.min(0.11, hF * 0.28);
  let fx = f.x1 - 0.12, fy = Math.max(f.y0 + 0.12, ly - 0.085);
  const fl = s.front?.lights;
  if (fl === 'square' || fl === 'van') { fx = f.x1 - 0.37; fy = ly - (fl === 'van' ? 0.18 : 0.165); }
  if (fl === 'none') fy = f.y0 + 0.2;
  // detrás: junto a los pilotos
  const r = bounds(M.ringR), belt = M.secR.yt, rs = s.rear || {};
  const top = Math.min(r.y1, belt + 0.02), hR = top - r.y0;
  const ty = rs.window || rs.cargo ? belt - 0.08 : top - Math.min(0.12, hR * 0.32);
  let rx = r.x1 - 0.12, ry = ty - 0.1;
  if (rs.lights === 'vertical') { rx = r.x1 - 0.11; ry = ty - 0.02; }
  else if (rs.lights === 'wide' || rs.lights === 'slim') { rx = r.x1 - 0.14; ry = ty + 0.01; }
  else if (rs.lights === 'round4') { rx = r.x1 - 0.33; ry = ty; }
  ry = Math.max(r.y0 + 0.1, ry);
  // repetidor en la aleta delantera, detrás de la rueda
  const zs = Math.min(s.zf - 0.3, s.wheels[0] + s.archR + 0.14), c = M.at(zs);
  const mats = [];
  for (const sx of [1, -1]) {
    const geo = mergeGeometries([
      boxAt(0.1, 0.05, 0.02, sx * fx, fy, s.zf + 0.012),
      boxAt(0.1, 0.05, 0.02, sx * rx, ry, s.zr - 0.012),
      boxAt(0.014, 0.028, 0.075, sx * (c.hw + 0.006), c.yo - 0.11, zs),
    ], false);
    const mat = new THREE.MeshStandardMaterial({ color: LAMP_OFF, emissive: 0xff8a10, emissiveIntensity: 0, roughness: 0.25, metalness: 0.1 });
    const m = new THREE.Mesh(geo, mat);
    m.name = sx > 0 ? 'intermitenteIzq' : 'intermitenteDer';
    ud.body.add(m);
    mats.push(mat);
  }
  const state = [false, false];
  ud.indicate = (left, right) => {
    [left, right].forEach((on, i) => {
      if (state[i] === !!on) return;
      state[i] = !!on;
      mats[i].emissiveIntensity = on ? 2.6 : 0;
      mats[i].color.copy(on ? LAMP_ON : LAMP_OFF);
    });
  };
}

/** fase del parpadeo (todos los intermitentes del juego van más o menos a 85 por minuto) */
export const blinkPhase = (t) => (t % 0.7) < 0.38;

// ── la puerta del conductor ──
let holeTex = null;
/** lo que se ve con la puerta abierta: el hueco oscuro del habitáculo con el asiento */
function holeTexture() {
  if (holeTex) return holeTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#2a2c30');
  g.addColorStop(1, '#0c0d0f');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  // el asiento: respaldo atrás (a la derecha de quien mira) y la banqueta
  x.fillStyle = '#3b3631';
  x.beginPath(); x.roundRect ? x.roundRect(150, 40, 70, 150, 18) : x.rect(150, 40, 70, 150); x.fill();
  x.beginPath(); x.roundRect ? x.roundRect(60, 150, 150, 46, 14) : x.rect(60, 150, 150, 46); x.fill();
  x.fillStyle = '#4a443e';
  x.beginPath(); x.roundRect ? x.roundRect(168, 14, 44, 34, 10) : x.rect(168, 14, 44, 34); x.fill();
  // el volante asomando delante
  x.strokeStyle = '#141416';
  x.lineWidth = 10;
  x.beginPath(); x.ellipse(52, 96, 14, 40, 0, 0, Math.PI * 2); x.stroke();
  holeTex = new THREE.CanvasTexture(c);
  holeTex.colorSpace = THREE.SRGBColorSpace;
  return holeTex;
}
const DOOR_CARD = new THREE.MeshStandardMaterial({ color: 0x2c2d30, roughness: 0.85 });
const TRIM = new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.55, metalness: 0.2 });
const DOOR_GLASS = new THREE.MeshStandardMaterial({ color: 0x2a3a48, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.5, side: THREE.DoubleSide, depthWrite: false });
const CHROME = new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.2, metalness: 1 });

/** monta la puerta del conductor (izquierda), cerrada y escondida hasta que se abra */
export function addDoor(group) {
  const ud = group.userData;
  if (ud.door !== undefined) return ud.door;
  ud.door = null;
  if (!ud.carType || !ud.body) return null;
  const M = carShape(ud.carType), s = M.s;
  if (!s.doors || s.doors.length < 2) return null;
  const zF = s.doors[0] - 0.012, zR = s.doors[1] + 0.012;
  const c = M.at((zF + zR) / 2);
  const out = c.hw + s.bulge * s.width * 0.75;   // por fuera del costado abombado
  const y0 = c.ybo + 0.05, yB = c.yt - 0.01;
  const archF = s.wheels[0] - s.archR - 0.02;
  const panel = [[zR, y0], [Math.min(zF, archF), y0]];
  if (archF < zF) panel.push([zF, y0 + (yB - y0) * 0.45]);
  panel.push([zF, yB], [zR, yB]);
  const hasWin = !s.open && c.cab > 0.15;
  const yT = c.yr - 0.07;
  const zTF = Math.max(zR + 0.3, zF - (yT - yB) * 1.05);
  const win = hasWin ? [[zR, yB], [zF, yB], [zTF, yT], [zR, yT]] : null;

  const door = new THREE.Group();
  const put = (geo, mat) => { const m = new THREE.Mesh(geo.translate(-out, 0, -zF), mat); door.add(m); return m; };
  // chapa (del color del coche), su cara de dentro, el reposabrazos y la manilla
  put(white(sideGeo(panel, true, 0.05).translate(out - 0.05, 0, 0)), ud.paint);
  put(sideGeo(panel, false).translate(out - 0.052, 0, 0), DOOR_CARD);
  put(boxAt(0.07, 0.04, (zF - zR) * 0.5, out - 0.09, y0 + (yB - y0) * 0.58, (zF + zR) / 2), TRIM);
  put(boxAt(0.02, 0.025, 0.13, out + 0.008, yB - 0.1, zR + 0.2), CHROME);
  if (win) {
    // la ventanilla con su marco negro (cuatro listones alrededor del cristal)
    const x = out - 0.025, P = win.map(([z, y]) => new THREE.Vector3(x, y, z));
    for (let i = 0; i < 4; i++) {
      const m = beam(P[i], P[(i + 1) % 4], 0.03, 0.035, TRIM);
      m.position.x -= out;
      m.position.z -= zF;
      door.add(m);
    }
    put(sideGeo(win, true).translate(out - 0.025, 0, 0), DOOR_GLASS);
  }
  const up = !!s.doorUp;   // puerta que se levanta hacia arriba y afuera (el roadster), con la bisagra en el borde de arriba
  const pivot = new THREE.Group();
  pivot.position.set(out, up ? yB : 0, zF);
  if (up) door.position.y = -yB;
  pivot.add(door);
  pivot.visible = false;
  // el hueco que deja la puerta al abrirse (por encima, el cristal de la carrocería ya parece el habitáculo)
  const hg = sideGeo(panel, true);
  const pos = hg.getAttribute('position'), uv = hg.getAttribute('uv');
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (zF - pos.getZ(i)) / (zF - zR), 0.25 + 0.75 * (pos.getY(i) - y0) / (yB - y0));
  const hole = new THREE.Mesh(hg.translate(out + 0.004, 0, 0), new THREE.MeshStandardMaterial({ map: holeTexture(), roughness: 0.9 }));
  hole.visible = false;
  for (const m of [...door.children, hole]) { m.castShadow = true; m.receiveShadow = true; }
  ud.body.add(pivot, hole);
  // el roadster lleva las dos puertas: la del otro lado es la misma, en espejo
  let pivot2 = null, hole2 = null;
  if (up) {
    pivot2 = pivot.clone();
    pivot2.position.x = -out;
    pivot2.scale.x = -1;
    hole2 = hole.clone();
    hole2.scale.x = -1;
    ud.body.add(pivot2, hole2);
  }
  ud.door = {
    open: 0,
    set(a) {
      this.open = a;
      if (up) {
        // se levanta girando sobre el borde de arriba, hasta casi plana sobre el coche, y se estira un poco
        pivot.rotation.z = Math.sign(out) * a * 1.95;
        pivot.scale.y = 1 + a * 1.1;
      } else pivot.rotation.y = -a * 1.15;   // hasta unos 66°, hacia fuera
      pivot.visible = a > 0.002;
      hole.visible = a > 0.03;
      if (pivot2) {
        pivot2.rotation.z = -pivot.rotation.z;
        pivot2.scale.y = pivot.scale.y;
        pivot2.visible = pivot.visible;
        hole2.visible = hole.visible;
      }
    },
    // distancia del centro del coche al hueco de la puerta, y dónde cae a lo largo
    side: out, mid: (zF + zR) / 2,
  };
  return ud.door;
}

const swings = [];
/** cierra las puertas de golpe (al despegar el roadster van cerradas, como el de la película) */
export function closeDoorNow(group) {
  const door = group?.userData?.door;
  if (!door) return;
  for (let i = swings.length - 1; i >= 0; i--) if (swings[i].door === door) swings.splice(i, 1);
  door.set(0);
}

/** abre la puerta del conductor, la deja abierta un momento y la cierra */
export function swingDoor(group, hold = 0.3) {
  const door = addDoor(group);
  if (!door) return null;
  const old = swings.find(w => w.door === door);
  if (old) { old.t = Math.min(old.t, 0.3); old.hold = hold; return door; }
  swings.push({ door, t: 0, hold, shut: false });
  doorSound(true);
  return door;
}
const OPEN_T = 0.32, CLOSE_T = 0.3;
export function updateDoors(dt) {
  for (let i = swings.length - 1; i >= 0; i--) {
    const w = swings[i];
    w.t += dt;
    const ease = (k) => 1 - (1 - k) ** 3;
    let a;
    if (w.t < OPEN_T) a = ease(w.t / OPEN_T);
    else if (w.t < OPEN_T + w.hold) a = 1;
    else a = 1 - Math.min(1, (w.t - OPEN_T - w.hold) / CLOSE_T) ** 2;
    w.door.set(Math.max(0, a));
    if (w.t >= OPEN_T + w.hold + CLOSE_T) { w.door.set(0); doorSound(false); swings.splice(i, 1); }
  }
}

// ── primera persona: el puesto del conductor ──
const DASH = new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.8 });
const DASH_TOP = new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: 0.9 });
const LEATHER = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.55 });
const LINER = new THREE.MeshStandardMaterial({ color: 0xcdc7bb, emissive: 0x16140f, roughness: 0.95, side: THREE.DoubleSide });
const MIRROR = new THREE.MeshStandardMaterial({ color: 0x9fb4c6, roughness: 0.05, metalness: 1 });
// desde dentro, la carrocería no se dibuja (se vería por el revés) pero sigue dando sombra al habitáculo
const SHADOW_ONLY = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });

/** dibuja los relojes: velocidad, revoluciones, intermitentes, luces y el logo en medio */
function drawGauges(ctx, st, marca) {
  const W = 512, H = 200;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#07080a';
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, 0, W, H, 40) : ctx.rect(0, 0, W, H); ctx.fill();
  const dial = (cx, max, val, step, label, red) => {
    const cy = 108, R = 86, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
    ctx.fillStyle = '#121418';
    ctx.beginPath(); ctx.arc(cx, cy, R + 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d7dde3';
    ctx.fillStyle = '#d7dde3';
    ctx.font = '600 15px "Barlow Condensed", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let v = 0; v <= max + 1e-6; v += step / 2) {
      const a = a0 + (a1 - a0) * v / max, major = Math.abs(v / step - Math.round(v / step)) < 1e-6;
      ctx.strokeStyle = red && v >= red ? '#ff3b2a' : '#d7dde3';
      ctx.lineWidth = major ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (R - (major ? 14 : 8)), cy + Math.sin(a) * (R - (major ? 14 : 8)));
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
      if (major) ctx.fillText(String(Math.round(v)), cx + Math.cos(a) * (R - 28), cy + Math.sin(a) * (R - 28));
    }
    ctx.fillStyle = '#8b939b';
    ctx.font = '600 13px "Barlow Condensed", Arial, sans-serif';
    ctx.fillText(label, cx, cy + 40);
    const a = a0 + (a1 - a0) * Math.min(1, Math.max(0, val / max));
    ctx.strokeStyle = '#ff4a1a';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - Math.cos(a) * 12, cy - Math.sin(a) * 12); ctx.lineTo(cx + Math.cos(a) * (R - 10), cy + Math.sin(a) * (R - 10)); ctx.stroke();
    ctx.fillStyle = '#2a2d32';
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
  };
  dial(110, 240, st.kmh, 40, 'km/h');
  dial(402, 8, st.rpm, 1, 'x1000 rpm', 6.5);
  // en medio: el logotipo, la velocidad en números y la marcha
  ctx.drawImage(logoCanvas(marca, 128), 256 - 30, 26, 60, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 34px "Barlow Condensed", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(Math.round(st.kmh)), 256, 112);
  ctx.fillStyle = '#ffb02e';
  ctx.font = '700 22px "Barlow Condensed", Arial, sans-serif';
  ctx.fillText(st.gear, 256, 146);
  // la luz de cruce
  ctx.fillStyle = st.lights ? '#3d8bff' : '#14202e';
  ctx.beginPath(); ctx.arc(256, 178, 8, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
  ctx.fillRect(258, 172, 12, 2); ctx.fillRect(258, 177, 12, 2); ctx.fillRect(258, 182, 12, 2);
}

/** la pantalla del medio del salpicadero: logotipo, marca y modelo */
function screenTexture(type) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 150;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 150);
  g.addColorStop(0, '#13202e'); g.addColorStop(1, '#070b10');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 150);
  x.drawImage(logoCanvas(brandOf(type), 128), 128 - 40, 14, 80, 80);
  x.fillStyle = '#e8eef4';
  x.font = '700 22px "Barlow Condensed", Arial, sans-serif';
  x.textAlign = 'center';
  x.fillText(modelName(type), 128, 116);
  x.fillStyle = '#7f8b96';
  x.font = '500 14px "Barlow Condensed", Arial, sans-serif';
  x.fillText(MARCAS[brandOf(type)]?.lema || '', 128, 138);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * monta el puesto del conductor (una vez por coche) y devuelve
 * { group, eye, update(datos) }: eye es dónde van los ojos, en las medidas del coche
 */
export function addCockpit(group) {
  const ud = group.userData;
  if (ud.cockpit !== undefined) return ud.cockpit;
  ud.cockpit = null;
  if (!ud.carType || !ud.body) return null;
  const type = ud.carType, M = carShape(type), s = M.s;
  const tg = s.topGlass[s.topGlass.length - 1] || [s.zf - 1.7, s.zf - 1.0];
  const zT = tg[0], zW = tg[1];                     // lo alto y la base del parabrisas
  const eyeZ = zW - 1.12;                           // los ojos, a algo más de un metro del parabrisas
  const cW = M.at(zW - 0.03), cT = M.at(zT + 0.02), cE = M.at(eyeZ);
  const ht = (c) => (c.hw - s.inset) * (1 - s.tumble);
  const dx = Math.min(0.37 * s.width / 1.8, cE.hw - 0.45);   // el conductor, a la izquierda
  const eyeY = cE.yt + Math.min(0.5, Math.max(0.17, (cE.yr - cE.yt) * 0.45));
  const yDash = Math.min(cW.yt + 0.05, eyeY - 0.14);
  const g = new THREE.Group();
  g.name = 'puestoConductor';
  const add = (m) => { g.add(m); return m; };

  // salpicadero con su tapa, el cuadro de relojes bajo la visera y la pantalla del medio
  const wDash = 2 * (cW.hw - s.inset - 0.04);
  add(new THREE.Mesh(boxAt(wDash, 0.3, 0.46, 0, yDash - 0.15, zW - 0.25), DASH));
  add(new THREE.Mesh(boxAt(wDash, 0.025, 0.48, 0, yDash, zW - 0.25), DASH_TOP));
  add(new THREE.Mesh(boxAt(0.44, 0.03, 0.16, dx, yDash + 0.075, zW - 0.5), DASH_TOP));
  add(new THREE.Mesh(boxAt(0.03, 0.09, 0.16, dx + 0.21, yDash + 0.03, zW - 0.5), DASH));
  add(new THREE.Mesh(boxAt(0.03, 0.09, 0.16, dx - 0.21, yDash + 0.03, zW - 0.5), DASH));
  const gc = document.createElement('canvas');
  gc.width = 512; gc.height = 200;
  const gctx = gc.getContext('2d');
  const gTex = new THREE.CanvasTexture(gc);
  gTex.colorSpace = THREE.SRGBColorSpace;
  const gauges = add(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.156), new THREE.MeshBasicMaterial({ map: gTex, transparent: true })));
  gauges.position.set(dx, yDash + 0.0, zW - 0.53);
  gauges.rotation.set(0.25, Math.PI, 0);   // inclinado hacia los ojos
  const screen = add(new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.13), new THREE.MeshBasicMaterial({ map: screenTexture(type) })));
  screen.position.set(0, yDash - 0.06, zW - 0.49);
  screen.rotation.set(0.15, Math.PI, 0);
  // rejillas de aire a los lados de la pantalla
  for (const sx of [-1, 1]) add(new THREE.Mesh(boxAt(0.1, 0.05, 0.02, sx * 0.17, yDash - 0.05, zW - 0.49), TRIM));

  // volante: aro, tres radios, centro con el logotipo y la columna
  const wheel = new THREE.Group();
  wheel.position.set(dx, eyeY - 0.3, eyeZ + 0.52);
  wheel.rotation.x = 0.42;
  const spin = new THREE.Group();
  wheel.add(spin);
  spin.add(new THREE.Mesh(new THREE.TorusGeometry(0.175, 0.021, 10, 32), LEATHER));
  spin.add(new THREE.Mesh(boxAt(0.13, 0.035, 0.018, 0.09, 0, 0), LEATHER));
  spin.add(new THREE.Mesh(boxAt(0.13, 0.035, 0.018, -0.09, 0, 0), LEATHER));
  spin.add(new THREE.Mesh(boxAt(0.04, 0.13, 0.018, 0, -0.09, 0), LEATHER));
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.064, 0.05, 20).rotateX(Math.PI / 2), DASH_TOP);
  spin.add(hub);
  const logoTex = new THREE.CanvasTexture(logoCanvas(brandOf(type), 128));
  logoTex.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }));
  logo.position.z = -0.027;
  logo.rotation.y = Math.PI;
  spin.add(logo);
  wheel.add(new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.3, 12).rotateX(Math.PI / 2).translate(0, 0, 0.17), DASH));
  add(wheel);

  // interior de verdad: los dos asientos con reposacabezas, la consola del medio
  // con su palanca y el espejo retrovisor interior
  const SEAT = new THREE.MeshStandardMaterial({ color: 0x33322f, roughness: 0.92 });
  const SEAT2 = new THREE.MeshStandardMaterial({ color: 0x3e3b36, roughness: 0.92 });
  const seatY = eyeY - 0.68;
  for (const sx of [dx, -dx]) {
    add(new THREE.Mesh(boxAt(0.5, 0.16, 0.52, sx, seatY, eyeZ - 0.05), SEAT));
    add(new THREE.Mesh(boxAt(0.5, 0.62, 0.14, sx, seatY + 0.36, eyeZ - 0.33), SEAT2));
    add(new THREE.Mesh(boxAt(0.26, 0.17, 0.1, sx, seatY + 0.78, eyeZ - 0.31), SEAT));
  }
  add(new THREE.Mesh(boxAt(0.26, 0.22, 0.85, 0, seatY + 0.05, eyeZ + 0.28), DASH));
  add(new THREE.Mesh(boxAt(0.05, 0.16, 0.05, 0, seatY + 0.24, eyeZ + 0.38), TRIM));
  if (!s.open) {
    const mir = new THREE.Mesh(boxAt(0.28, 0.08, 0.025, 0, cT.yr - 0.1, zT - 0.12), TRIM);
    mir.rotation.x = -0.15;
    add(mir);
  }

  // pilares del parabrisas, el marco de arriba, el techo y el retrovisor
  const pts = [1, -1].map(sx => [
    new THREE.Vector3(sx * (cW.hw - s.inset - 0.03), cW.yt + 0.02, zW),
    new THREE.Vector3(sx * (ht(cT) - 0.03), cT.yr - 0.025, zT),
  ]);
  for (const [a, b] of pts) add(beam(a, b, 0.075, 0.05, DASH));
  add(beam(pts[0][1], pts[1][1], 0.06, 0.05, s.open ? DASH : LINER));
  if (!s.open) {
    // forro del techo: de lo alto del parabrisas hasta detrás del conductor, siguiendo la chapa
    const zs = [zT, (zT + eyeZ) / 2, eyeZ, eyeZ - 0.6, eyeZ - 1.2].filter(z => z >= s.cabZ[0] + 0.05);
    const P = [];
    for (let i = 0; i < zs.length - 1; i++) {
      const [a, b] = [M.at(zs[i]), M.at(zs[i + 1])];
      if (a.cab < 0.15 || b.cab < 0.15) break;
      const ya = a.yr - 0.035, yb = b.yr - 0.035, wa = ht(a) - 0.02, wb = ht(b) - 0.02;
      P.push(wa, ya, zs[i], -wa, ya, zs[i], -wb, yb, zs[i + 1], wa, ya, zs[i], -wb, yb, zs[i + 1], wb, yb, zs[i + 1]);
    }
    if (P.length) {
      const lg = new THREE.BufferGeometry();
      lg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      // todo mirando hacia abajo: con normales por triángulo se veía una cuña oscura en cada tramo
      const nrm = new Float32Array(P.length);
      for (let i = 1; i < nrm.length; i += 3) nrm[i] = -1;
      lg.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
      add(new THREE.Mesh(lg, LINER));
    }
    // pilar central, si queda al lado del conductor
    const pz = s.pillars.find(p => p < eyeZ + 0.25 && p > eyeZ - 1.3);
    if (pz !== undefined) {
      const c = M.at(pz);
      for (const sx of [1, -1]) {
        add(beam(new THREE.Vector3(sx * (c.hw - s.inset - 0.03), c.yt, pz), new THREE.Vector3(sx * (ht(c) - 0.04), c.yr - 0.03, pz), 0.1, 0.06, LINER));
      }
    }
    // el retrovisor de dentro, colgado de lo alto del parabrisas (y nunca pegado a la cara)
    const mZ = Math.max(zT - 0.1, eyeZ + 0.45), mY = Math.min(M.at(mZ).yr, cT.yr + 0.05) - 0.11;
    add(new THREE.Mesh(boxAt(0.015, 0.07, 0.015, 0, mY + 0.06, mZ + 0.02), TRIM));
    add(new THREE.Mesh(boxAt(0.24, 0.07, 0.025, 0, mY, mZ), TRIM));
    const mirror = add(new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.055), MIRROR));
    mirror.position.set(0, mY, mZ - 0.014);
    mirror.rotation.y = Math.PI;
  }
  // el capó, del color del coche, asomando por delante del salpicadero
  {
    // malla con vértices compartidos: así el capó se ve curvo y suave, no a facetas
    const N = 8, zs = [];
    for (let z = zW - 0.03; z < s.zf - 0.12; z += 0.15) zs.push(z);
    if (zs.length > 1) {
      const P = [], I = [];
      for (const z of zs) {
        const c = M.at(z);
        for (let k = 0; k <= N; k++) {
          const u = -1 + 2 * k / N;
          P.push(u * (c.hw - 0.06), c.yt + s.crown * (1 - u * u) + 0.004, z);
        }
      }
      for (let i = 0; i < zs.length - 1; i++) {
        for (let k = 0; k < N; k++) {
          const a = i * (N + 1) + k, b = a + N + 1;
          I.push(a, b, a + 1, a + 1, b, b + 1);
        }
      }
      const hg = new THREE.BufferGeometry();
      hg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      hg.setIndex(I);
      hg.computeVertexNormals();
      add(new THREE.Mesh(white(hg), ud.paint));
    }
    // retrovisores de fuera: carcasa del color del coche y el espejo mirando hacia atrás
    const zm = (s.win ? s.win[1] : zW) - 0.1, cm = M.at(zm), xm = cm.hw - s.inset + 0.13;
    for (const sx of [1, -1]) {
      add(new THREE.Mesh(white(boxAt(0.15, 0.1, 0.11, sx * xm, cm.yo + 0.1, zm - 0.01)), ud.paint));
      const mf = add(new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.075), MIRROR));
      mf.position.set(sx * xm, cm.yo + 0.1, zm - 0.068);
      mf.rotation.y = Math.PI;
    }
  }
  // los paneles de las puertas a los lados, con el borde de la ventanilla
  const zA = eyeZ - 0.7, zB = zW - 0.12;
  for (const sx of [1, -1]) {
    const x = sx * (cE.hw - 0.07);
    const p = add(new THREE.Mesh(new THREE.PlaneGeometry(zB - zA, 0.44), DOOR_CARD));
    p.position.set(x, cE.yt - 0.21, (zA + zB) / 2);
    p.rotation.y = -sx * Math.PI / 2;
    add(new THREE.Mesh(boxAt(0.06, 0.04, zB - zA, x - sx * 0.02, cE.yt + 0.0, (zA + zB) / 2), DASH));
  }
  // el techo, los pilares y el salpicadero dan sombra dentro; los relojes y la pantalla no
  g.traverse(o => { if (o.isMesh) { o.castShadow = !(o.material.isMeshBasicMaterial); o.receiveShadow = true; } });
  g.visible = false;
  ud.body.add(g);

  const marca = brandOf(type);
  let tick = 0, last = '';
  const shell = ud.body.children.find(o => Array.isArray(o.material));   // la carrocería
  const shellMats = shell?.material;
  const st = { kmh: 0, rpm: 0, gear: 'N', left: false, right: false, lights: false };
  ud.cockpit = {
    group: g,
    eye: new THREE.Vector3(dx, eyeY, eyeZ),
    /** al ir dentro se ve el puesto del conductor y la carrocería solo da sombra */
    inside(on) {
      g.visible = on;
      if (shell) shell.material = on ? [SHADOW_ONLY, SHADOW_ONLY, SHADOW_ONLY] : shellMats;
    },
    update(dt, { steer = 0, kmh = 0, reverse = false, left = false, right = false, lights = false }) {
      spin.rotation.z = -steer * 4.2;   // a la izquierda, el aro gira al contrario de las agujas
      tick -= dt;
      if (tick > 0) return;
      tick = 1 / 15;
      // marchas inventadas para que la aguja de las revoluciones suba y baje
      const v = Math.abs(kmh), tops = [0, 25, 50, 80, 115, 155, 999];
      let gi = 1;
      while (gi < 6 && v > tops[gi]) gi++;
      st.kmh = v;
      st.gear = reverse ? 'R' : v < 1 ? 'N' : String(gi);
      st.rpm = v < 1 ? 0.9 : 1.2 + 5.6 * Math.min(1, (v - tops[gi - 1]) / (tops[gi] - tops[gi - 1] || 1));
      st.left = left; st.right = right; st.lights = lights;
      const key = `${Math.round(v)}|${st.gear}|${left}|${right}|${lights}|${st.rpm.toFixed(1)}`;
      if (key === last) return;
      last = key;
      drawGauges(gctx, st, marca);
      gTex.needsUpdate = true;
    },
  };
  drawGauges(gctx, st, marca);
  return ud.cockpit;
}

// ── el cartel al subirte: logotipo, marca, modelo y lema ──
let cardTimer = 0;
export function showCarCard(type) {
  const el = document.getElementById('carcard');
  const marca = brandOf(type);
  if (!el || !MARCAS[marca]) return;
  const cv = el.querySelector('canvas');
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.drawImage(logoCanvas(marca, 128), 0, 0, cv.width, cv.height);
  el.querySelector('.b').textContent = marca;
  el.querySelector('.m').textContent = modelName(type).slice(marca.length + 1);
  el.querySelector('.l').textContent = MARCAS[marca].lema;
  el.classList.add('on');
  clearTimeout(cardTimer);
  cardTimer = setTimeout(() => el.classList.remove('on'), 3200);
}
