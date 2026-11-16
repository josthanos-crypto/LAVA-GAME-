import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';
import { tira, lienzoCorrido, juntarLienzos } from './kitFachada.js';

/**
 * La Escuela de Arte Pancho Lasso, en la esquina de la Rambla Medular con la calle Salvador Allende (la entrada da a la
 * Travesía Alfredo Kraus), con las vistas de la calle de Google de julio de 2025 (y una de 2018 para el lado de Alfredo
 * Kraus; solo se miran). El edificio blanco de tres plantas con las filas corridas de ventanas; en la esquina, el cuerpo
 * rojo sobre el zócalo de piedra con las letras blancas «ESCUELA DE ARTE» y «Pancho Lasso»; delante del jardín, el muro
 * de piedra con la verja gris y las palmeras; en Salvador Allende, el muro de piedra con la verja blanca, el porche en
 * sombra y la torre roja de la escalera con los tramos negros. La cara de Ginés de la Hoz no sale en las fotos: se queda
 * como la ponía el mapa, del mismo blanco.
 */

const PLANTA = [[-519.28, -468.89], [-494.43, -434.68], [-521.59, -414.94], [-534.03, -432.06], [-565.45, -409.24], [-577.85, -426.32]];
const H = 12, BAJO = 4.8, Z = 0.25;
const ROJO = 0xa9493b, BLANCO = 0xeeebe3;

// las caras con N hacia fuera
const SALVADOR = marco(PLANTA[0], PLANTA[5]);
const ESQUINA = marco(PLANTA[5], PLANTA[4]);
const RAMBLA = marco(PLANTA[4], PLANTA[3]);
const JARDIN = marco(PLANTA[3], PLANTA[2]);
const KRAUS = marco(PLANTA[2], PLANTA[1]);

// la verja del jardín: del cuerpo rojo a la acera de la Rambla, por la acera y subiendo por Alfredo Kraus
const VERJA = [RAMBLA.W(8.5, 0), [-556, -406.5], [-537, -402], [-524, -411.5]];
const PALMAS = [[-553, -410, 9], [-543, -406.5, 11], [-531, -409, 8.5], [-547, -419, 10]];

export function tuneEscuelaArte(map) {
  if (!alturaBloque(map, -533, -436, H, [238, 235, 227])) return;
  map.escuelaArte = true;
  map.extraPalms = map.extraPalms || [];
  PALMAS.forEach(([x, z, h], i) => map.extraPalms.push([x, z, h, i * 1.3]));
}

// ——— lienzos ———

function azar(semilla) {
  let s = semilla;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function piedra(g, w, h) {
  const r = azar(7);
  g.fillStyle = '#6f6b66';
  g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 10 + r() * 8) {
    for (let x = -r() * 20; x < w; x += 14 + r() * 18) {
      const t = 120 + r() * 40 | 0;
      g.fillStyle = `rgb(${t},${t - 4},${t - 10})`;
      g.fillRect(x + 1.5, y + 1.5, 12 + r() * 16, 8 + r() * 6);
    }
  }
}

function rojo(g, w, h) {
  g.fillStyle = '#a9493b';
  g.fillRect(0, 0, w, h);
  const r = azar(3);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(${r() < 0.5 ? '70,25,20' : '200,120,100'},${0.08 + r() * 0.08})`;
    g.fillRect(r() * w, r() * h, 2 + r() * 5, 2 + r() * 5);
  }
}

function blanco(g, w, h) {
  g.fillStyle = '#eeebe3';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,115,100,.12)';
  for (let y = 0; y < h; y += 9) g.fillRect(0, y, w, 1);
}

/** las filas corridas de ventanas: cristal oscuro con los montantes blancos */
function cinta(g, w, h) {
  g.fillStyle = '#e8e6e0';
  g.fillRect(0, 0, w, h);
  const c = g.createLinearGradient(0, 0, 0, h);
  c.addColorStop(0, '#5d6d76');
  c.addColorStop(1, '#2f3a40');
  g.fillStyle = c;
  g.fillRect(0, 5, w, h - 10);
  g.fillStyle = '#e8e6e0';
  for (let x = 0; x <= w; x += w / 4) g.fillRect(x - 2, 0, 4, h);
  g.fillRect(0, h * 0.62, w, 3);
}

/** el bajo de Salvador Allende: el porche en sombra con sus pilares */
function porche(g, w, h) {
  g.fillStyle = '#4b4d4c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a5e5f';
  g.fillRect(0, h * 0.15, w, h * 0.85);
  g.fillStyle = '#d9d6cf';
  for (let x = w / 8; x < w; x += w / 2) g.fillRect(x - 6, 0, 12, h);
  g.fillStyle = 'rgba(30,32,34,.5)';
  g.fillRect(0, 0, w, h * 0.12);
}

/** el lado de Alfredo Kraus: el beis de nervios verticales */
function nervios(g, w, h) {
  g.fillStyle = '#d6cbb4';
  g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 10) {
    g.fillStyle = 'rgba(110,98,80,.3)'; g.fillRect(x, 0, 2, h);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 2, 0, 1, h);
  }
}

let PIEDRA, ROJO_T, BLANCO_T, CINTA, PORCHE, NERVIOS;

// ——— piezas ———

/** la pared de arriba, blanca, con las dos filas de ventanas entre s0 y s1 */
function plantasAltas(k, L, s0 = 0, s1 = L, tex = BLANCO_T) {
  const zp = Z + 0.012;
  lienzoCorrido(k, 0, L, BAJO, H, zp, tex);
  for (const y of [5.5, 8.7]) lienzoCorrido(k, s0, s1, y, y + 1.4, zp + 0.006, CINTA);
  for (const y of [BAJO, 8.0, H - 0.3]) tira(k, 0, L, y - 0.08, Z + 0.06, 0.16, 0.12, 0xdedad0, k.solid);
}

function muro(k, L) {
  tira(k, 0, L, 0, Z / 2, H, Z, BLANCO);
  k.block(L / 2, Z / 2, L, Z);
}

function letras() {
  const tex = canvasTex(1024, 288, (g, w, h) => {
    g.fillStyle = '#f7f5f0';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.36)}px Georgia, 'Times New Roman', serif`;
    g.fillText('ESCUELA DE ARTE', w / 2, h * 0.27, w * 0.98);
    g.font = `italic 700 ${Math.round(h * 0.34)}px Georgia, 'Times New Roman', serif`;
    g.fillText('Pancho Lasso', w * 0.56, h * 0.72, w * 0.7);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.97), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.3, roughness: 0.6 }));
  m.position.set(4.3, 3.85, Z + 0.09);
  return m;
}

/** la esquina de la Rambla: el cuerpo rojo sobre el zócalo de piedra; el resto, rojo abajo con ventanas */
function rambla(k) {
  const L = RAMBLA.len, zp = Z + 0.012;
  muro(k, L);
  lienzoCorrido(k, 0, 8.5, 0, 1.5, zp, PIEDRA);
  lienzoCorrido(k, 0, 8.5, 1.5, BAJO + 0.6, zp, ROJO_T);
  tira(k, 0, 8.5, 1.45, Z + 0.1, 0.1, 0.2, 0xb8b2a8, k.solid);
  lienzoCorrido(k, 8.5, L, 0, BAJO, zp, ROJO_T);
  for (let s = 11; s < L - 2; s += 4) k.pic(s, 2.2, zp + 0.006, 2.4, 1.3, 0, 1, CINTA);
  plantasAltas(k, L, 1, L - 1);
}

/** la punta del suroeste, hacia el cruce: piedra abajo y rojo hasta la primera planta */
function esquina(k) {
  const L = ESQUINA.len, zp = Z + 0.012;
  muro(k, L);
  lienzoCorrido(k, 0, L, 0, 2.6, zp, PIEDRA);
  lienzoCorrido(k, 0, L, 2.6, BAJO + 0.6, zp, ROJO_T);
  plantasAltas(k, L, 2, L - 2);
}

/** Salvador Allende: el muro de piedra con la verja blanca, el porche y la torre roja de la escalera */
function salvador(k) {
  const L = SALVADOR.len, zp = Z + 0.012;
  muro(k, L);
  // la punta del norte, ciega y blanca
  lienzoCorrido(k, 0, 14, 0, H, zp, BLANCO_T);
  lienzoCorrido(k, 14, L, 0, BAJO, zp, PORCHE);
  lienzoCorrido(k, 14, L, BAJO, H, zp, BLANCO_T);
  for (const y of [5.5, 8.7]) lienzoCorrido(k, 16, 56, y, y + 1.4, zp + 0.006, CINTA);
  for (const y of [BAJO, 8.0, H - 0.3]) tira(k, 14, L, y - 0.08, Z + 0.06, 0.16, 0.12, 0xdedad0, k.solid);
  // la torre roja de la escalera, con los tramos negros por fuera
  // (el mapa no tiene acera de este lado: la torre sale poco y la verja va donde estaría el bordillo)
  const t0 = 58, t1 = 64, f = 0.4;
  k.box((t0 + t1) / 2, 0, Z + f / 2, t1 - t0, H - 0.6, f, ROJO);
  for (let i = 0; i < 4; i++) {
    const y = 1.2 + i * 2.6, s = i % 2 ? t1 - 1.6 : t0 + 1.6;
    k.box(s, y, Z + f + 0.3, 3.2, 0.12, 0.6, 0x1d1d1d);
    k.box((t0 + t1) / 2, y + 1.25, Z + f + 0.3, t1 - t0, 0.06, 0.6, 0x1d1d1d);
    k.box((t0 + t1) / 2, y + 2.25, Z + f + 0.6, t1 - t0, 0.05, 0.05, 0x1d1d1d);
  }
  k.box(t0 - 0.2, 0, Z + f + 0.6, 0.08, H - 1.5, 0.08, 0x1d1d1d);
  k.box(t1 + 0.2, 0, Z + f + 0.6, 0.08, H - 1.5, 0.08, 0x1d1d1d);
  // el muro de piedra de la acera con la verja blanca encima
  const zm = Z + 1.3;
  for (const [a, b] of [[2, L - 0.5]]) {
    lienzoCorrido(k, a, b, 0, 1.3, zm + 0.16, PIEDRA);
    tira(k, a, b, 0, zm, 1.3, 0.3, 0x77736d);
    k.block((a + b) / 2, zm, b - a, 0.3);
    tira(k, a, b, 3.0, zm, 0.05, 0.05, 0xf0f0ec, k.solid);
    for (let s = a + 0.1; s < b; s += 0.15) k.box(s, 1.3, zm, 0.035, 1.75, 0.035, 0xf0f0ec);
    for (let s = a; s <= b; s += 2.5) k.box(s, 1.3, zm, 0.1, 1.8, 0.1, 0xf0f0ec);
  }
}

function jardin(k) {
  const L = JARDIN.len;
  muro(k, L);
  lienzoCorrido(k, 0, L, 0, BAJO, Z + 0.012, ROJO_T);
  plantasAltas(k, L, 1.5, L - 1.5);
}

/** Alfredo Kraus: el bajo rojo con ventanas y arriba el beis de nervios */
function kraus(k) {
  const L = KRAUS.len, zp = Z + 0.012;
  muro(k, L);
  lienzoCorrido(k, 0, L, 0, BAJO, zp, ROJO_T);
  for (let s = 3; s < L - 2; s += 4.2) k.pic(s, 2.3, zp + 0.006, 2.6, 1.5, 0, 1, CINTA);
  plantasAltas(k, L, 1.5, L - 1.5, NERVIOS);
}

/** la verja del jardín: el muro de piedra y la verja gris de barrotes */
function verja(k, L) {
  lienzoCorrido(k, 0, L, 0, 1.2, 0.16, PIEDRA);
  tira(k, 0, L, 0, 0, 1.2, 0.3, 0x77736d);
  k.block(L / 2, 0, L, 0.3);
  tira(k, 0, L, 1.2, 0, 0.08, 0.36, 0xb8b2a8, k.solid);
  tira(k, 0, L, 2.95, 0, 0.05, 0.05, 0x9da2a4, k.solid);
  for (let s = 0.1; s < L; s += 0.14) k.box(s, 1.28, 0, 0.035, 1.7, 0.035, 0x9da2a4);
  for (let s = 0; s <= L; s += 2.5) k.box(s, 1.28, 0, 0.09, 1.75, 0.09, 0x9da2a4);
}

export function buildEscuelaArte(scene, colliders, map) {
  if (!map?.escuelaArte) return null;
  PIEDRA = canvasTex(192, 96, piedra);
  ROJO_T = canvasTex(128, 128, rojo);
  BLANCO_T = canvasTex(128, 128, blanco);
  CINTA = canvasTex(256, 72, cinta);
  PORCHE = canvasTex(256, 128, porche);
  NERVIOS = canvasTex(160, 160, nervios);
  const caras = [[SALVADOR, salvador], [ESQUINA, esquina], [RAMBLA, rambla], [JARDIN, jardin], [KRAUS, kraus]];
  const grupos = caras.map(([M, f], i) => {
    const k = new Kit();
    f(k);
    juntarLienzos(k);
    const g = enMarco(k, M, 'escuelaArte' + i, colliders);
    if (M === RAMBLA) g.add(letras());
    scene.add(g);
    return g;
  });
  for (let i = 0; i < VERJA.length - 1; i++) {
    const M = marco(VERJA[i], VERJA[i + 1]);
    const k = new Kit();
    verja(k, M.len);
    juntarLienzos(k);
    const g = enMarco(k, M, 'escuelaArteVerja' + i, colliders);
    scene.add(g);
    grupos.push(g);
  }
  return grupos;
}
