import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, trocear } from './restaurantesCharco.js';
import { cristales, alturaBloque } from './edificioReal.js';
import { paveMesh, polyTris, asfalto } from './suelos.js';
import { ZF, pared } from './rapadurasSur.js';

/**
 * El Supermercado Eurospar Altavista (calle Mosta, junto a la LZ-1) y su aparcamiento, con las fotos del sitio de 2021 y
 * 2023, la vista de la calle de Google de julio de 2025 desde la LZ-1 y la foto aérea de GRAFCAN de 2024-2026 (solo se
 * miran, no van dentro del juego). El mapa tenía el edificio como un bloque genérico de 6 m con ventanas, y el
 * aparcamiento era la foto aérea. De verdad:
 * - el edificio blanco y bajo (7 m), con la esquina roja del oeste, la franja roja de la entrada con «EUROSPAR» en
 *   blanco, las cristaleras, las letras rojas «EUROSPAR» arriba a los dos lados (sin el dibujo de la marca), los carteles
 *   rojos de la derecha y el letrero «pasión por la alimentación»;
 * - delante, el aparcamiento asfaltado con las plazas en espiga pintadas de blanco, las de minusválidos en azul junto a
 *   la entrada, los dos pasos de cebra que van a la puerta y los coches aparcados donde se ven en la foto aérea.
 */

// la fachada (s del oeste al este; N al sur, al aparcamiento), de 70,6 m
const F = marco([486.6, -1628.3], [556.2, -1616.6]);
const ALTO = 7.0;
// el aparcamiento, por los bordillos (en metros del mapa)
const LOT = [[474.0, -1628.0], [486.6, -1628.3], [556.2, -1616.6], [586.7, -1613.3], [593.3, -1593.3], [557.5, -1577.5], [474.0, -1591.2]];
// las filas dobles de plazas en espiga: el eje de cada una, a tantos metros de la fachada
const FILAS = [12.5, 28.5];
const FONDO = 5.0, ANCHO = 2.6, GIRO = Math.PI / 3;
// los pasos de cebra, de la fachada al fondo: s de cada uno
const CEBRAS = [3.5, 55.5];
const ROJO = 0xd0202a, BLANCO = 0xf4f4f2;

function dentro(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [ax, az] = p[i], [bx, bz] = p[j];
    if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
  }
  return c;
}

/** las plazas: [s, z del eje, lado (−1 hacia la fachada, 1 hacia fuera), x, z del centro en el mapa, rumbo] */
function plazas() {
  const out = [];
  const paso = ANCHO / Math.sin(GIRO), dx = Math.cos(GIRO) * FONDO;
  for (const eje of FILAS) {
    for (const lado of [-1, 1]) {
      for (let s = -14; s < 100; s += paso) {
        const sc = s + dx / 2, zc = eje + lado * FONDO / 2;
        const esquinas = [[s, eje], [s + dx, eje + lado * FONDO], [s + paso, eje], [s + paso + dx, eje + lado * FONDO]].map(([a, b]) => F.W(a, b));
        if (!esquinas.every(([x, z]) => dentro(LOT, x, z))) continue;
        if (CEBRAS.some(c => Math.abs(sc + paso / 2 - c) < 2.5)) continue;
        const [x, z] = F.W(sc + paso / 2, zc);
        const [ax, az] = F.W(0, 0), [bx, bz] = F.W(dx, lado * FONDO);
        out.push({ s, eje, lado, x, z, rumbo: Math.atan2(bx - ax, bz - az) });
      }
    }
  }
  return out;
}
const PLAZAS = plazas();
// los coches: en las plazas donde la foto aérea muestra coches (más llenas cerca de la entrada), no en todas
export const EUROSPAR_SPOTS = PLAZAS.filter((p, i) => {
  const cerca = Math.abs(p.s - 30) < 28;
  return ((i * 7919) % 100) < (cerca ? 45 : 18);
}).map(p => [+p.x.toFixed(2), +p.z.toFixed(2), +p.rumbo.toFixed(3)]);

/** antes de levantar la ciudad: el edificio a su altura y en blanco, y las plazas para los coches aparcados */
export function tuneEurosparAltavista(map) {
  alturaBloque(map, 530, -1650, ALTO, [244, 244, 242]);
  if (Array.isArray(map.lotSpots)) map.lotSpots.push(...EUROSPAR_SPOTS);
  map.eurosparAltavista = true;
}

/** letras rojas (o blancas) sobre el fondo que se diga */
function letras(texto, color, fondo, peso = 900) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `italic ${peso} ${Math.round(h * 0.78)}px "Arial Black", Arial, sans-serif`;
    g.fillText(texto, w / 2, h * 0.55, w * 0.96);
  };
}

/** un cartel rojo de la fachada, con su marco blanco y una franja clara */
function cartel(g, w, h) {
  g.fillStyle = '#c81e28';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f4f4f2';
  g.lineWidth = 6;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = 'rgba(255,255,255,0.85)';
  g.fillRect(w * 0.12, h * 0.62, w * 0.76, h * 0.12);
  g.fillStyle = 'rgba(255,210,80,0.9)';
  g.beginPath();
  g.arc(w * 0.5, h * 0.35, h * 0.16, 0, Math.PI * 2);
  g.fill();
}

/** la fachada del supermercado */
function fachada(k) {
  const L = F.len;
  pared(k, 0, L, ALTO, (g, w, h) => { g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, 0, ZF + 0.02, L, 0.45, 0.06, 0x9a9c9e);
  // la esquina roja del oeste
  k.box(1.5, 0, ZF + 0.06, 3.0, ALTO + 0.4, 0.14, ROJO);
  // la cristalera de la entrada bajo la franja roja
  k.pic(21, 1.45, ZF + 0.012, 26, 2.8, 0, 1, canvasTex(1040, 112, cristales('#d8dadc', 12, 'rgba(60,70,80,.3)')));
  for (let s = 8; s <= 34.01; s += 2.6) k.box(s, 0, ZF + 0.05, 0.08, 2.9, 0.08, 0xd8dadc);
  k.box(21, 2.9, ZF + 0.05, 26.2, 0.1, 0.1, 0xd8dadc);
  // la franja roja de encima de la entrada, saliente, con «EUROSPAR» en blanco
  k.box(21, 3.0, ZF + 0.6, 30, 1.0, 1.2, ROJO);
  k.pic(21, 3.5, ZF + 1.215, 8.0, 0.75, 0, 1, canvasTex(640, 60, letras('EUROSPAR', '#ffffff', '#d0202a')));
  // las letras rojas grandes de arriba, a los dos lados
  k.pic(13, 5.6, ZF + 0.03, 9.0, 1.3, 0, 1, canvasTex(720, 104, letras('EUROSPAR', '#d0202a', '#f4f4f2')));
  k.pic(55, 5.6, ZF + 0.03, 9.0, 1.3, 0, 1, canvasTex(720, 104, letras('EUROSPAR', '#d0202a', '#f4f4f2')));
  // a la derecha: los carteles rojos y el letrero gris
  for (const s of [40.5, 46.5, 64.5]) k.pic(s, 1.8, ZF + 0.02, 4.4, 2.4, 0, 1, canvasTex(220, 120, cartel));
  k.pic(55.5, 2.1, ZF + 0.02, 9.0, 0.8, 0, 1, canvasTex(720, 64, letras('pasión por la alimentación', '#6a6c70', '#f4f4f2', 600)));
}

/** las rayas blancas de las plazas en espiga, las azules de minusválidos, los ejes y los pasos de cebra */
function rayas(k) {
  const raya = (a, b, c, d, hex = BLANCO) => {
    const len = Math.hypot(c - a, d - b);
    k.box((a + c) / 2, 0.205, (b + d) / 2, 0.12, 0.01, len, hex, { ry: Math.atan2(c - a, d - b) });
  };
  const paso = ANCHO / Math.sin(GIRO), dx = Math.cos(GIRO) * FONDO;
  for (const p of PLAZAS) {
    for (const s0 of [p.s, p.s + paso]) raya(s0, p.eje, s0 + dx, p.eje + p.lado * FONDO);
    const azul = p.lado === -1 && p.eje === FILAS[0] && p.s > 22 && p.s < 32;
    if (azul) k.box(p.s + paso / 2 + dx / 2, 0.203, p.eje - FONDO / 2, paso * 0.8, 0.008, FONDO * 0.8, 0x2a6ab8, { ry: 0 });
  }
  for (const eje of FILAS) raya(-14, eje, 100, eje);
  for (const c of CEBRAS) for (let z = 1; z < 38; z += 1.0) raya(c - 1.5, z, c + 1.5, z);
}

/** se monta con lo demás */
export function buildEurosparAltavista(scene, colliders, map) {
  if (!map?.eurosparAltavista) return null;
  const kf = new Kit(), kr = new Kit();
  fachada(kf);
  rayas(kr);
  const grupos = [enMarco(kf, F, 'eurosparAltavista', colliders), enMarco(kr, F, 'eurosparAparcamientoRayas', null)];
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(LOT), 2), 0.2, asfalto(), 0xd8d8d8);
  if (suelo) { suelo.name = 'eurosparAparcamiento'; scene.add(suelo); }
  // en la versión web el juego ya había leído map.lotSpots antes de las piezas: los coches se ponen aquí
  const coches = [];
  const g = typeof window !== 'undefined' ? window.__game : null;
  const yaEstan = Array.isArray(map.lotSpots) && map.lotSpots.includes(EUROSPAR_SPOTS[0]);
  if (g?.makeCar && !yaEstan) {
    const tipos = ['sedan', 'hatch', 'suv', 'compact', 'van'];
    EUROSPAR_SPOTS.forEach(([x, z, h], i) => {
      let c;
      try { c = g.makeCar(tipos[i % tipos.length], undefined, {}); } catch (e) { c = g.makeCar('sedan'); }
      c.group.position.set(x, 0.16, z);
      c.group.rotation.y = h;
      scene.add(c.group);
      coches.push(c.group);
    });
  }
  return { grupos, suelo, coches };
}
