import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, ventana, medianera } from './edificioReal.js';

/**
 * El Restaurante Ca'Puchi, de perritos calientes y hamburguesas, en la calle Doctor Gregorio Marañón 5 (Titerroy),
 * con la vista de la calle de Google de julio de 2025 y la foto de enero de 2020 (solo se miran, no van dentro del
 * juego; la gente no se pone): la casa blanca; las dos persianas blancas grandes del local (en la foto está cerrado)
 * con la estrella de «Ca'Puchi» pintada; el toldo plano color arena sobre sus postes negros; la valla negra de aspas
 * de la terraza; el letrero de «HOT DOGS» con las rayas rojas y blancas y las estrellas en el azul; y el perrito
 * caliente gigante colgado en la esquina de arriba. A la derecha, el zócalo de baldosas color teja, las dos ventanas
 * de persiana marrón y la puerta naranja de madera; a la izquierda, la puerta y la ventana verdes del vecino.
 * Encima del local, el edificio de verdad (vista de la calle de julio de 2025 mirando hacia arriba; el bloque del mapa
 * era de una planta, 4 m): blanco, el bajo y dos plantas (9,2 m), con tres ventanas en la primera (una de madera
 * abierta y dos de aluminio), dos en la segunda y la columna de pavés de la escalera, los cables corridos por encima
 * del bajo y el pretil de la azotea; las casas de los lados se quedan de una planta, y la de la puerta verde lleva
 * su cuarto de azotea con la antena parabólica.
 */

// la cara de la calle (s de este a oeste); la vista de la calle pone el local en s 67,4–74,2 y la casa de las
// persianas marrones antes (el mapa no tenía rótulo suyo)
const M = marco([-791.26, -711.99], [-728, -758.49]);
const L = 78.5;
const Z = 0.12, ZF = Z + 0.3, YP = 3.6, BLANCO = 0xf4f4f0, NEGRO = 0x1e1e20;
// el marco va de oeste a este: se pasa de s (de este a oeste, como en la foto) a la medida del marco
const m = s => L - s;
// el edificio de verdad, ya en la medida del marco: encima del local, de s 4,2 a 12,4, con la azotea a 9,2 m
const E0 = 4.2, E1 = 12.4, FONDO = 9, TECHO = 9.2, YB = 4.0;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y el edificio a su altura */
export function tuneCaPuchi(map) {
  map.caPuchi = true;
  alzarEdificio(map, M, E0, E1, FONDO, TECHO, [244, 244, 240]);
}

// ——— lo que se pinta en lienzo ———

/** una persiana blanca, con la estrella de «Ca'Puchi» si se pide */
function persiana(estrella) {
  return (g, w, h) => {
    g.fillStyle = '#ecece8';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#cfcfcb';
    for (let y = 4; y < h; y += 7) g.fillRect(0, y, w, 2);
    if (!estrella) return;
    const cx = w * 0.55, cy = h * 0.38, r = h * 0.2;
    g.fillStyle = '#c82a2a';
    g.beginPath();
    for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, q = j % 2 ? r * 0.5 : r; g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    g.closePath(); g.fill();
    g.fillStyle = '#f4f4f0';
    g.beginPath(); g.ellipse(cx, cy, r * 0.7, r * 0.3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1e3a8a';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `italic 700 ${Math.round(r * 0.32)}px Georgia, serif`;
    g.fillText("Ca'Puchi", cx, cy);
  };
}

/** el letrero de «HOT DOGS» con las rayas y el azul de las estrellas */
function hotDogs(g, w, h) {
  for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#f4f4f0' : '#c82a2a'; g.fillRect(0, i * h / 7, w, h / 7 + 1); }
  g.fillStyle = '#1e3a8a';
  g.fillRect(0, 0, w * 0.18, h * 0.57);
  g.fillStyle = '#f4f4f0';
  for (let y = 0.1; y < 0.5; y += 0.14) for (let x = 0.02; x < 0.17; x += 0.035) g.fillRect(w * x, h * y, 2, 2);
  g.fillStyle = '#1e1e20';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.62)}px "Arial Black", Arial, sans-serif`;
  g.lineWidth = 4;
  g.strokeStyle = '#f4f4f0';
  g.strokeText('HOT DOGS', w * 0.58, h * 0.55);
  g.fillText('HOT DOGS', w * 0.58, h * 0.55);
}

/** las baldosas color teja del zócalo */
function baldosas(g, w, h) {
  g.fillStyle = '#d89a7a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(120,70,50,.4)';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += h / 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += h / 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la persiana marrón de una ventana */
function marron(g, w, h) {
  g.fillStyle = '#6a4632';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a2e20';
  for (let y = 5; y < h; y += 8) g.fillRect(4, y, w - 8, 3);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** una puerta: la naranja de madera o la verde del vecino */
function puerta(color) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,.25)';
    g.lineWidth = 2;
    for (let x = 6; x < w; x += 9) { g.beginPath(); g.moveTo(x, h * 0.05); g.lineTo(x, h * 0.95); g.stroke(); }
    g.fillStyle = '#c8a050';
    g.fillRect(w * 0.82, h * 0.5, w * 0.06, h * 0.04);
  };
}

// ——— las piezas ———

/** la pared blanca, el local, el letrero, el perrito gigante y la casa de las persianas marrones */
function fachada(k) {
  const s0 = 58.5, s1 = 77.5;
  k.box((m(s0) + m(s1)) / 2, 0, Z + 0.15, s1 - s0, YP, 0.3, BLANCO);
  k.block((m(s0) + m(s1)) / 2, Z + 0.15, s1 - s0, 0.3);
  // las dos persianas del local y el machón del medio con el cajetín
  k.pic(m(68.8), 1.2, ZF + 0.01, 2.6, 2.4, 0, 1, canvasTex(220, 200, persiana(true)));
  k.pic(m(72.6), 1.2, ZF + 0.01, 2.5, 2.4, 0, 1, canvasTex(210, 200, persiana(false)));
  k.box(m(70.6), 1.2, ZF + 0.03, 0.3, 0.45, 0.06, 0xe8e6e0);
  // el letrero de «HOT DOGS»
  k.box(m(69.9), 2.9, ZF + 0.03, 2.4, 0.5, 0.08, 0xc82a2a);
  k.pic(m(69.9), 3.15, ZF + 0.075, 2.38, 0.48, 0, 1, canvasTex(400, 80, hotDogs));
  // el perrito caliente gigante de la esquina: el pan y la salchicha con la mostaza
  const px = m(73.6), py = 3.6, pz = ZF + 0.5;
  k.box(px - 0.05, py - 0.5, ZF + 0.25, 0.08, 0.08, 0.5, 0x6a6c70);
  for (const dx of [-0.17, 0.17]) {
    const pan = new THREE.CylinderGeometry(0.17, 0.17, 1.6, 10);
    pan.rotateZ(0.35);
    pan.translate(px + dx, py, pz);
    k.add(pan, 0xd89a5a);
  }
  const salchicha = new THREE.CylinderGeometry(0.13, 0.13, 1.8, 10);
  salchicha.rotateZ(0.35);
  salchicha.translate(px, py, pz + 0.08);
  k.add(salchicha, 0xc8502a);
  const mostaza = new THREE.BoxGeometry(0.06, 1.5, 0.06);
  mostaza.rotateZ(0.35);
  mostaza.translate(px, py, pz + 0.21);
  k.add(mostaza, 0xf2c82a);
  // la casa de las persianas marrones: el zócalo de baldosas, dos ventanas y la puerta naranja
  k.pic(m(62.5), 0.45, ZF + 0.006, 8.0, 0.9, 0, 1, canvasTex(400, 45, baldosas));
  for (const s of [65.4, 63.6]) k.pic(m(s), 1.55, ZF + 0.012, 1.1, 1.1, 0, 1, canvasTex(110, 110, marron));
  k.pic(m(61.4), 1.15, ZF + 0.012, 1.0, 2.3, 0, 1, canvasTex(100, 220, puerta('#c8642a')));
  k.box(m(62.2), 1.55, ZF + 0.04, 0.3, 0.35, 0.08, 0x3a3a3c);
  // la puerta y la ventana verdes del vecino
  k.pic(m(76.2), 1.15, ZF + 0.012, 0.95, 2.3, 0, 1, canvasTex(90, 220, puerta('#2a8a4a')));
  k.box(m(75.2), 1.2, ZF + 0.012, 0.9, 1.0, 0.02, 0x2a8a4a);
}

/** la terraza: el toldo plano color arena sobre los postes negros y la valla de aspas */
function terraza(k) {
  const a = m(74.2), b = m(67.4), fuera = 2.8, zf = ZF + fuera, alto = 2.65;
  const c = (a + b) / 2, W = b - a;
  k.box(c, alto, ZF + fuera / 2, W + 0.2, 0.08, fuera + 0.1, 0xd8c8a8);
  k.box(c, alto - 0.15, zf + 0.04, W + 0.2, 0.18, 0.04, 0xc8b898);
  for (const s of [a, (a + b) / 2, b]) { k.box(s, 0, zf, 0.08, alto, 0.08, NEGRO); k.block(s, zf, 0.1, 0.1); }
  // la valla negra de aspas, por delante y por los dos lados
  const valla = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0), n = Math.max(1, Math.round(len / 1.4));
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, mx = x0 + (x1 - x0) * (t0 + t1) / 2, mz = z0 + (z1 - z0) * (t0 + t1) / 2, seg = len / n;
      for (const sg of [1, -1]) {
        const d = new THREE.BoxGeometry(Math.hypot(seg, 0.8), 0.03, 0.03);
        d.rotateZ(sg * Math.atan2(0.8, seg));
        d.rotateY(-ang);
        d.translate(mx, 0.5, mz);
        k.add(d, NEGRO);
      }
    }
    for (const y of [0.08, 0.92]) {
      const r = new THREE.BoxGeometry(len, 0.04, 0.04);
      r.rotateY(-ang);
      r.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
      k.add(r, NEGRO);
    }
    k.block((x0 + x1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.1, Math.abs(z1 - z0) + 0.1);
  };
  valla(a, zf, b, zf);
  valla(a, ZF + 0.3, a, zf);
  valla(b, ZF + 0.3, b, zf);
}

/** el edificio de encima del local: las dos plantas blancas con sus ventanas, el pavés, los cables y el pretil */
function plantas(k) {
  const c = (E0 + E1) / 2;
  paredAlta(k, E0, E1, YP, TECHO, Z, BLANCO);
  // la primera planta: la ventana de madera abierta y las dos de aluminio
  ventana(k, 5.4, 4.5, 0.9, 1.15, Z, { carpinteria: '#8a6a4a', hojas: 1, alfeizar: 0xe8e6e0 });
  k.box(5.4 + 0.42, 4.5, ZF + 0.3, 0.05, 1.1, 0.55, 0x8a6a4a);
  for (const s of [8.0, 10.8]) ventana(k, s, 4.5, 1.1, 1.15, Z, { carpinteria: '#dcdcd8', alfeizar: 0xe8e6e0 });
  // la segunda planta: dos ventanas de aluminio y la columna de pavés de la escalera
  for (const s of [5.6, 8.0]) ventana(k, s, 7.3, 1.0, 1.0, Z, { carpinteria: '#dcdcd8', alfeizar: 0xe8e6e0 });
  k.box(10.8, 6.9, ZF + 0.01, 0.65, 1.5, 0.04, 0xd8dcd8);
  for (let y = 6.95; y < 8.4; y += 0.24) for (const ds of [-0.16, 0.16]) k.box(10.8 + ds, y, ZF + 0.035, 0.27, 0.2, 0.02, 0xb8c4c8);
  // los cables corridos por encima del bajo, de punta a punta de la fachada, y el pretil de la azotea
  for (const y of [3.62, 3.7]) k.box(m(67.9), y, ZF + 0.04, 19, 0.03, 0.03, 0x2a2a2c);
  k.box(c, TECHO - 0.15, ZF + 0.04, E1 - E0, 0.15, 0.08, 0xe8e6e0);
  // las medianeras lisas de los dos lados, que asoman por encima de las casas de una planta
  // (por fuera de las caras del bloque levantado, que el juego pinta con ventanas)
  for (const t of [E0 - 0.07, E1 + 0.07]) medianera(k, t, YB, TECHO, FONDO, Z, 0xeeeeea);
  // el cuarto de azotea de la casa de la puerta verde, con la antena parabólica
  k.box(2.0, YB, Z - 2.5, 2.4, 2.0, 2.6, BLANCO);
  k.box(2.0, YB + 2.0, Z - 2.5, 2.5, 0.1, 2.7, 0xe0deda);
  const plato = new THREE.SphereGeometry(0.35, 12, 6, 0, Math.PI * 2, 0, 0.9);
  plato.rotateX(Math.PI / 2);
  plato.translate(1.4, YB + 2.45, Z - 1.1);
  k.add(plato, 0xe8e6e0);
  k.box(1.4, YB + 2.0, Z - 1.2, 0.04, 0.45, 0.04, 0x8a8a8a);
}

/** se monta con lo demás de Titerroy */
export function buildCaPuchi(scene, colliders, map) {
  if (!map?.caPuchi) return null;
  const k = new Kit();
  fachada(k);
  plantas(k);
  terraza(k);
  const group = enMarco(k, M, 'caPuchi', colliders);
  scene.add(group);
  return { group };
}
