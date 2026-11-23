import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * (Version 163) La entrada de atrás del Hospital Molina Orosa, la que da al aparcamiento largo de la calle Santiago
 * Alemán, como en el vídeo «hospital hiperdino» de José Manuel (recursos\nuevas\clips_0-20s\01_hospital_hiperdino,
 * fotograma del segundo 4): desde el aparcamiento se ve un murete blanco con una barandilla verde de malla, detrás
 * el vial de la puerta con las plazas azules y el rayado amarillo, y al fondo la marquesina gris sobre columnas
 * redondas, con el vestíbulo de cristal y los tres lucernarios en pirámide con su linterna de cristal encima.
 *
 * En el mapa el pabellón de la entrada venía 6,4 m más ancho de la cuenta y llegaba hasta los coches aparcados
 * (medido sobre la ortofoto del IGN, `public/hospital/trasera.jpg`): no quedaba sitio para el vial.
 *  - `tuneHospitalEntradaTrasera(map)`: echa atrás esa cara del pabellón (`b.pAntes` guarda la planta vieja).
 *  - `buildHospitalEntradaTrasera(scene, colliders, map)`: el vial, el murete con la barandilla verde, la marquesina,
 *    la cristalera y los lucernarios.
 * En la realidad el vial queda más bajo que el aparcamiento; aquí va a su misma altura (el juego no hace ese escalón).
 */
const VIEJA = [[-1484, -1318], [-1521, -1383]];          // la cara que daba al aparcamiento, como venía
const RETIRO = 6.4;
const VERDE = 0x3f7d55, GRIS = 0x8f9396, HORMIGON = 0x9c9a94, BLANCO = 0xf1f0ec;

function caraNueva() {
  const [a, b] = VIEJA, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], n = [-u[1], u[0]];   // n mira al aparcamiento (este)
  const s = n[0] > 0 ? 1 : -1;
  return [[a[0] - n[0] * s * RETIRO, a[1] - n[1] * s * RETIRO], [b[0] - n[0] * s * RETIRO, b[1] - n[1] * s * RETIRO]];
}

export function tuneHospitalEntradaTrasera(map) {
  const cerca = (q, p) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 2.5;
  const b = (map.buildings || []).find(o => o.p.some(q => cerca(q, VIEJA[0])) && o.p.some(q => cerca(q, VIEJA[1])));
  if (!b || b.pAntes) return;
  const [na, nb] = caraNueva();
  b.pAntes = b.p;
  b.p = b.p.map(q => (cerca(q, VIEJA[0]) ? na : cerca(q, VIEJA[1]) ? nb : q));
  map.hospitalEntradaTrasera = { a: na, b: nb, alto: b.h || 3.4 };
}

/** la cristalera del vestíbulo: paños de cristal oscuro entre montantes grises, con la puerta en medio */
function cristalera(largo) {
  return canvasTex(1024, 128, (g, w, h) => {
    const cielo = g.createLinearGradient(0, 0, 0, h);
    cielo.addColorStop(0, '#5d7480'); cielo.addColorStop(0.55, '#2c3a42'); cielo.addColorStop(1, '#1d262b');
    g.fillStyle = cielo; g.fillRect(0, 0, w, h);
    // las sillas blancas de la sala de espera, detrás del cristal
    g.fillStyle = 'rgba(235,238,236,.5)';
    for (let x = 30; x < w; x += 46) g.fillRect(x, h * 0.62, 26, h * 0.2);
    g.fillStyle = '#7d8286';
    const paso = w / Math.round(largo / 1.6);
    for (let x = 0; x <= w; x += paso) g.fillRect(x - 2, 0, 4, h);
    g.fillRect(0, 0, w, 5); g.fillRect(0, h - 7, w, 7);
  });
}

function malla() {
  const t = canvasTex(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.strokeStyle = 'rgba(165,172,170,1)'; g.lineWidth = 2;
    for (let k = 0; k <= 64; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 64); g.stroke(); }
    for (let k = 0; k <= 64; k += 32) { g.beginPath(); g.moveTo(0, k); g.lineTo(64, k); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function buildHospitalEntradaTrasera(scene, colliders, map) {
  const dato = map?.hospitalEntradaTrasera;
  if (!dato) return null;
  // s va del norte (0) al sur; z, de la fachada hacia el aparcamiento
  const M = marco(dato.a, dato.b), L = M.len, H = dato.alto;
  const k = new Kit();
  const S0 = 12, S1 = L - 14;            // el tramo con marquesina y cristalera
  const FONDO = 3.3, VIAL = RETIRO - 0.25;

  // el vial de la puerta: asfalto en trozos cortos (sigue el terreno), acera junto a la fachada, las plazas azules
  // y el rayado amarillo de delante de la puerta
  for (let s = 2; s < L; s += 4) {
    k.box(s, 0.1, (FONDO + VIAL) / 2, 4.02, 0.045, VIAL - FONDO, 0x34373b, { list: k.shell });
    k.box(s, 0.1, FONDO / 2, 4.02, 0.14, FONDO, 0xc9c5ba, { list: k.shell });
  }
  const medio = (S0 + S1) / 2;
  for (const s of [medio - 9, medio - 6.2]) {
    k.box(s, 0.165, VIAL - 1.5, 2.5, 0.012, 2.6, 0x4f86c6, { list: k.shell });
    for (const o of [-1.3, 1.3]) k.box(s + o, 0.17, VIAL - 1.5, 0.1, 0.012, 2.6, 0xeeeeea, { list: k.shell });
  }
  for (let s = medio - 2.5; s < medio + 9; s += 1.4) k.box(s, 0.165, FONDO + 0.95, 0.16, 0.012, 1.7, 0xe2c21e, { ry: 0.7, list: k.shell });

  // el murete blanco con la barandilla verde: postes, dos barras y la malla
  const Z = VIAL;
  k.box(L / 2, 0.1, Z, L - 4, 0.85, 0.22, BLANCO);
  for (let s = 2; s <= L - 2 + 0.01; s += (L - 4) / 26) k.box(s, 0.95, Z, 0.07, 1.25, 0.07, VERDE);
  for (const y of [1.55, 2.15]) k.box(L / 2, y, Z, L - 4, 0.07, 0.07, VERDE);
  k.seg(2, Z, L - 2, Z);

  // la marquesina: losa gris sobre columnas redondas, con su canto
  const HM = Math.min(H - 0.25, 3.05);
  k.box(medio, HM, FONDO / 2, S1 - S0, 0.3, FONDO + 0.3, HORMIGON);
  k.box(medio, HM - 0.08, FONDO + 0.12, S1 - S0, 0.1, 0.1, 0x6f7376);
  for (let s = S0 + 1; s <= S1 - 1 + 0.01; s += (S1 - S0 - 2) / 7) { k.cyl(s, 0.2, FONDO - 0.35, 0.16, 0.16, HM - 0.2, GRIS, { seg: 10 }); k.block(s, FONDO - 0.35, 0.34, 0.34); }
  // la cristalera del vestíbulo, pegada a la fachada
  k.pic(medio, 0.24 + (HM - 0.3) / 2, 0.04, S1 - S0 - 0.6, HM - 0.3, 0, 1, cristalera(S1 - S0));

  // los tres lucernarios: pirámide gris truncada y, encima, la linterna de cristal con su marco verde y su tapa
  for (const s of [medio - 11, medio, medio + 11]) {
    const base = new THREE.CylinderGeometry(0.95, 2.5, 1.25, 4, 1);
    base.rotateY(Math.PI / 4);
    base.translate(s, H + 0.62, -3.4);
    k.add(base, 0x8a8377);
    k.box(s, H + 1.25, -3.4, 1.25, 0.9, 1.25, 0xb9d2cc);
    for (const [ds, dz] of [[-0.62, -0.62], [0.62, -0.62], [-0.62, 0.62], [0.62, 0.62]]) k.box(s + ds, H + 1.25, -3.4 + dz, 0.09, 0.9, 0.09, VERDE);
    k.box(s, H + 2.15, -3.4, 1.5, 0.1, 1.5, 0x8a5a44);
  }

  const group = enMarco(k, M, 'hospitalEntradaTrasera', colliders);
  // la malla de la barandilla (se ve a través)
  const tex = malla();
  tex.repeat.set((L - 4) / 0.6, 2);
  const paño = new THREE.Mesh(new THREE.PlaneGeometry(L - 4, 1.2),
    new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.3 }));
  paño.position.set(L / 2, 1.55, Z);
  group.add(paño);
  scene.add(group);
  return group;
}
