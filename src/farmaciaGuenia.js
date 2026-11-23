/**
 * La Farmacia Las Salinas, en la esquina de Calle Guenia con Calle Aniagua
 * (Calle Guenia 2, Local 60), como en la foto de Street View: un bloque blanco
 * de cinco plantas con la esquina cortada en chaflán, el bajo acristalado y la
 * banda verde FARMACIA dando la vuelta a la esquina, el rótulo blanco
 * «Farmacia Las Salinas» al otro lado y la cruz verde en banderola.
 *
 * El bloque es el del mapa (lado este de Guenia, al sur de Aniagua): addFarmaciaGuenia
 * lo marca antes de levantar la ciudad y aquí se monta el bajo: el escaparate, las
 * bandas y la cruz.
 */
import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { fit, SANS, SERIF } from './localesCommon.js';
import { windowGlow } from './realism.js';

// ── el solar, en metros del juego ──
// la esquina de Guenia (norte-sur) con Aniagua, que llega del este: la farmacia está en el
// bloque alto del lado este de Guenia, al sur de Aniagua (enfrente queda el colegio
// Antonio Zerolo, al oeste de Guenia). El bloque ya viene en el mapa: aquí solo se monta el bajo.
const CROSSING = [-753, 277];
const INSIDE = [-738, 300];          // un punto dentro de ese bloque
const GUENIA_LEN = 20;               // tramo de bajo comercial por Guenia

const inPoly = (P, x, z) => {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i][1] > z) !== (P[j][1] > z) && x < (P[j][0] - P[i][0]) * (z - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c;
  }
  return c;
};

/** las tres esquinas que hacen falta: la del cruce y el final de cada fachada */
function corners(b) {
  const P = b.p.slice(0, b.p.length - (b.p[0][0] === b.p[b.p.length - 1][0] && b.p[0][1] === b.p[b.p.length - 1][1] ? 1 : 0));
  let ci = 0;
  P.forEach((q, i) => { if (Math.hypot(q[0] - CROSSING[0], q[1] - CROSSING[1]) < Math.hypot(P[ci][0] - CROSSING[0], P[ci][1] - CROSSING[1])) ci = i; });
  const C = P[ci], prev = P[(ci + P.length - 1) % P.length], next = P[(ci + 1) % P.length];
  // la de Aniagua corre hacia el este (más x) y la de Guenia hacia el sur (más z)
  const [A, G0] = (next[0] - C[0]) > (prev[0] - C[0]) ? [next, prev] : [prev, next];
  const gl = Math.hypot(G0[0] - C[0], G0[1] - C[1]) || 1, k = Math.min(1, GUENIA_LEN / gl);
  const G = [C[0] + (G0[0] - C[0]) * k, C[1] + (G0[1] - C[1]) * k];
  return { C, A, G };
}

const GREEN = 0x0f6b3a, GREEN_DK = 0x0a4c29, WHITE = 0xf4f2ec;
const FRAME = 0x2b3138, GLASS = 0x14222c;

/** marca el bloque del mapa que lleva la farmacia en el bajo (antes de levantar la ciudad) */
export function addFarmaciaGuenia(map) {
  const b = (map.buildings || []).find(x => inPoly(x.p, INSIDE[0], INSIDE[1]));
  if (!b) return;
  b.farmacia = 'lasSalinas';
  b.s = 1;                       // bajo con comercios
  b.f = [246, 244, 238];         // estuco blanco
}

// ── lienzos de los rótulos ──

const txt = (g, text, x, y, maxW, size, color, weight = '800', family = SANS, style = '') => {
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  fit(g, text, x, y, maxW, size, weight, family, style);
};

/** banda verde con FARMACIA en blanco, como la de la foto */
const greenBand = (word) => canvasTex(1024, 176, (g, W, H) => {
  g.fillStyle = '#0f6b3a'; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = Math.max(4, H * 0.04);
  g.strokeRect(H * 0.07, H * 0.07, W - H * 0.14, H - H * 0.14);
  txt(g, word, W / 2, H * 0.53, W * 0.84, H * 0.6, '#ffffff', '800', SANS);
});

/** banda blanca con el nombre completo en verde */
const whiteBand = () => canvasTex(1024, 176, (g, W, H) => {
  g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, W, H);
  txt(g, 'Farmacia Las Salinas', W / 2, H * 0.53, W * 0.9, H * 0.46, '#0f6b3a', '600', SERIF);
});

/** el chaflán: banda verde con la cruz blanca */
const cornerBand = () => canvasTex(512, 176, (g, W, H) => {
  g.fillStyle = '#0f6b3a'; g.fillRect(0, 0, W, H);
  const s = H * 0.14, cx = W * 0.2, cy = H * 0.5;
  g.fillStyle = '#ffffff';
  g.fillRect(cx - s / 2, cy - s * 1.7, s, s * 3.4);
  g.fillRect(cx - s * 1.7, cy - s / 2, s * 3.4, s);
  txt(g, '24 HORAS', W * 0.62, H * 0.53, W * 0.6, H * 0.4, '#ffffff', '700', SANS);
});

/**
 * Una cara del bajo, en su marco local: x corre a lo largo de la fachada desde
 * `o`, z hacia fuera. Devuelve lo que el grupo necesita para colocarse.
 */
function face(A, B, nWant) {
  const dx = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dx, dz);
  let n = [dz / L, -dx / L];
  if (n[0] * nWant[0] + n[1] * nWant[1] < 0) n = [-n[0], -n[1]];
  const U = [n[1], -n[0]];
  const o = (U[0] * dx + U[1] * dz) > 0 ? A : B;
  return { o, n, U, L };
}

/** el escaparate: cristal oscuro con montantes negros y un zócalo */
function shopfront(k, L, { door = -1 } = {}) {
  k.box(L / 2, 0.12, 0.09, L, 2.98, 0.1, GLASS, { list: k.shell });
  k.box(L / 2, 0.0, 0.12, L, 0.16, 0.16, 0x30241c);
  // montantes cada 2,2 m y los dos extremos
  const n = Math.max(2, Math.round(L / 2.2));
  for (let i = 0; i <= n; i++) k.box((L * i) / n, 0.12, 0.14, 0.09, 2.98, 0.16, FRAME);
  k.box(L / 2, 3.1, 0.14, L, 0.1, 0.16, FRAME);
  // la puerta: hoja de cristal con su marco claro
  if (door >= 0) {
    const x = Math.min(L - 1.2, Math.max(1.2, door));
    k.box(x, 0.12, 0.17, 1.9, 2.6, 0.06, 0x24343e);
    for (const [dx, w, h] of [[-0.95, 0.08, 2.6], [0.95, 0.08, 2.6], [0, 1.9, 0.08]]) {
      k.box(x + dx, dx === 0 ? 2.72 : 0.12, 0.2, w, h, 0.1, 0xd8d5cb);
    }
    k.box(x - 0.72, 1.2, 0.24, 0.05, 0.5, 0.05, 0xc9c6bd);   // manilla
  }
}

/** una cara entera: escaparate, banda del rótulo y cornisa */
function storey(k, L, { band = 'green', text = 'FARMACIA', door = -1, whiteAt = 0 } = {}) {
  shopfront(k, L, { door });
  // la banda del rótulo, un pelín por delante del cristal
  if (band === 'split' && whiteAt > 0) {
    k.box(whiteAt / 2, 3.22, 0.16, whiteAt, 1.14, 0.16, GREEN);
    k.pic(whiteAt / 2, 3.79, 0.25, whiteAt - 0.1, 1.02, 0, 1, greenBand(text), { glow: 0.25 });
    const w = L - whiteAt;
    if (w > 1) {
      k.box(whiteAt + w / 2, 3.22, 0.16, w, 1.14, 0.16, WHITE);
      k.pic(whiteAt + w / 2, 3.79, 0.25, w - 0.1, 1.02, 0, 1, whiteBand(), { glow: 0.06 });
    }
  } else {
    k.box(L / 2, 3.22, 0.16, L, 1.14, 0.16, GREEN);
    k.pic(L / 2, 3.79, 0.25, L - 0.1, 1.02, 0, 1, band === 'corner' ? cornerBand() : greenBand(text), { glow: 0.25 });
  }
  // cornisa y el suelo de la planta alta
  k.box(L / 2, 4.36, 0.14, L, 0.16, 0.3, 0xf7f5ef);
}

/**
 * La cruz verde en banderola, doble cara, que se enciende de noche.
 * `k` es el kit de la cara y `x` la posición sobre ella.
 */
function greenCross(scene, group, face, x, y) {
  const [wx, wz] = [
    face.o[0] + face.U[0] * x + face.n[0] * 0.9,
    face.o[1] + face.U[1] * x + face.n[1] * 0.9,
  ];
  const mat = new THREE.MeshStandardMaterial({ color: 0x19c35a, emissive: 0x19c35a, emissiveIntensity: 0, roughness: 0.4 });
  const back = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.7 });
  const yaw = Math.atan2(face.n[0], face.n[1]) + Math.PI / 2;
  const g = new THREE.Group();
  g.name = 'farmaciaCruz';
  g.position.set(wx, y, wz);
  g.rotation.y = yaw;
  // marco de acero que la sujeta a la pared
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.0), new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.6 }));
  arm.position.set(0, 0.35, -0.45);
  g.add(arm);
  // la placa blanca y la cruz verde por las dos caras
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.96, 0.1), back);
  plate.castShadow = true;
  g.add(plate);
  const barV = new THREE.BoxGeometry(0.2, 0.78, 0.06);
  const barH = new THREE.BoxGeometry(0.78, 0.2, 0.06);
  for (const z of [0.06, -0.06]) {
    const v = new THREE.Mesh(barV, mat); v.position.z = z; g.add(v);
    const h = new THREE.Mesh(barH, mat); h.position.z = z; g.add(h);
  }
  (group || scene).add(g);
  return mat;
}

/** el bajo de la farmacia, sobre el bloque que ya dibuja la ciudad */
export function buildFarmaciaGuenia(scene, map) {
  const b = (map.buildings || []).find(x => x.farmacia);
  if (!b) return { update() {} };
  const group = new THREE.Group();
  group.name = 'farmaciaLasSalinas';

  const put = (faceObj, name, build) => {
    const k = new Kit();
    build(k);
    const { group: g } = k.build(name);
    g.position.set(faceObj.o[0], 0, faceObj.o[1]);
    g.rotation.y = Math.atan2(faceObj.n[0], faceObj.n[1]);
    group.add(g);
    return g;
  };

  const { C, A, G } = corners(b);
  // la cara de Aniagua (mirando al parque, al norte): FARMACIA en la esquina y el
  // rótulo blanco con el nombre completo hacia el este
  const aniagua = face(C, A, [0, -1]);
  put(aniagua, 'farmacia · Aniagua', (k) => {
    storey(k, aniagua.L, { band: 'split', text: 'FARMACIA', door: 3.6, whiteAt: Math.min(9, aniagua.L * 0.6) });
  });

  // la cara de Guenia (al oeste, enfrente del colegio), la que se ve al llegar
  const guenia = face(C, G, [-1, 0]);
  put(guenia, 'farmacia · Guenia', (k) => {
    storey(k, guenia.L, { band: 'green', text: 'FARMACIA', door: 4.2 });
  });

  // la cruz verde, sobre la cara de Guenia, junto a la esquina
  const nearC = Math.hypot(guenia.o[0] - C[0], guenia.o[1] - C[1]) < 0.5;
  const crossMat = greenCross(scene, group, guenia, nearC ? 2.2 : guenia.L - 2.2, 5.6);
  scene.add(group);

  // los rótulos se encienden de noche, como los del resto de la ciudad
  const lit = [];
  group.traverse((o) => { if (o.material?.emissiveMap) lit.push(o.material); });
  return {
    group,
    update() {
      const n = windowGlow.value;
      for (const m of lit) m.emissiveIntensity = 0.12 + n * 1.8;
      crossMat.emissiveIntensity = n * 2.4;
    },
  };
}
