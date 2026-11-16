import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import {
  marco, hueco, enMarco, aRasDelSuelo, sentados, estufa, puertaAzul, pizarraColgada, barDentro, cuarterones, WHITE, SERIF, AZUL_D,
} from './restaurantesCharco.js';

/**
 * Más locales de la orilla norte del lago grande del Charco de San Ginés, en la manzana de al oeste de la
 * calle Muelle (sigue a restaurantesCharco.js y usa sus piezas). Con fotos de internet de Google Maps, que
 * solo se miran (no van dentro del juego):
 *  - Martino's Gelato, la heladería artesanal (el mapa la traía como «Martinos»): la pared blanca con los
 *    dos huecos de marco azul marino, MARTINO'S GELATERIA con su logo redondo y GELATO ARTIGIANALE en letras
 *    negras, el cucurucho gigante de la puerta, la papelera negra y, dentro, las vitrinas de los helados y
 *    las lámparas de mimbre.
 *  - Estrella, en la esquina oeste de la manzana del Melecón (la de la heladería Antiu Xixona de
 *    localesCharco.js), con la foto de febrero de 2026: la columna azul de la esquina, el panel de lamas azules
 *    con «Estrella» en dorado y las dos estrellas, la fila de focos, los toldos azul marino con el borde
 *    blanco de ondas, las cristaleras y la puerta azules, el azulejo, la pizarra y la terraza de mesas de
 *    tablero de piedra con sillas de rejilla blancas, la estufa y gente.
 *  - Malecón Restaurante & Copas, en la misma manzana al este de Estrella (el mapa lo traía como «Melecón»):
 *    la pared con el zócalo gris, las cristaleras azules, el letrero de tablas de madera con el nombre en
 *    letra de mano y sus focos, y la terraza de sombrillas grises por fuera y naranjas por debajo, mesitas
 *    con farol, sillas de aluminio de cojín rojo, la pizarra de marco verde y gente.
 * Como en el otro archivo, la planta baja va por delante de la pared del bloque del mapa y lo de arriba se
 * queda como está.
 */

// la manzana de Chapó y Martino's (de la calle Muelle hacia el oeste): s desde la esquina oeste, z hacia el Charco
const C = marco([231.8, 36.0], [282.4, 24.1]);
const MARINO = 0x1f2f5a;
// la manzana del Melecón (la de la heladería Antiu Xixona): s desde la esquina oeste, z hacia el Charco
const E = marco([431.2, 97.0], [495.4, 101.8]);

/** antes de levantar la ciudad: fuera los rótulos rojos genéricos (y sus mesas) de los locales de aquí */
export function tuneRestaurantesCharco2(map) {
  map.restaurantesCharco2Signs = [];
  for (const name of ['Martinos', 'Estrella', 'Melecón']) {
    const i = (map.signs || []).findIndex(s => s.name === name);
    if (i >= 0) map.restaurantesCharco2Signs.push(map.signs.splice(i, 1)[0]);
  }
  map.restaurantesCharco2 = true;
}

// ——— Martino's Gelato ———

/** dentro de la heladería: paredes claras, el friso de listones de madera, las vitrinas de colores y las lámparas de mimbre */
function heladeriaDentro(conVitrina) {
  return (g, w, h) => {
    g.fillStyle = '#f1ece2';
    g.fillRect(0, 0, w, h);
    // el friso de listones de madera del fondo
    g.fillStyle = '#c99a5e';
    g.fillRect(w * 0.05, h * 0.18, w * 0.9, h * 0.32);
    g.strokeStyle = '#a87a44';
    g.lineWidth = 2;
    for (let x = w * 0.05; x < w * 0.95; x += 7) { g.beginPath(); g.moveTo(x, h * 0.18); g.lineTo(x, h * 0.5); g.stroke(); }
    // las lámparas de mimbre colgadas
    for (const x of [0.25, 0.5, 0.75]) {
      g.strokeStyle = '#3a3a3a';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h * 0.12); g.stroke();
      g.fillStyle = '#d0883a';
      g.beginPath(); g.ellipse(w * x, h * 0.15, w * 0.06, h * 0.035, 0, Math.PI, 0); g.fill();
      g.fillStyle = 'rgba(255,214,140,.35)';
      g.beginPath(); g.arc(w * x, h * 0.2, w * 0.1, 0, Math.PI * 2); g.fill();
    }
    if (conVitrina) {
      // la vitrina blanca con las bandejas de helado de colores
      g.fillStyle = '#fbfaf6';
      g.fillRect(w * 0.08, h * 0.6, w * 0.84, h * 0.25);
      const colores = ['#f3e3b0', '#7a4a2a', '#f08aa8', '#9fd27a', '#f2c23a', '#e8e2d4', '#c23a5a', '#5a3a22', '#f6b37a'];
      for (let i = 0; i < 9; i++) {
        g.fillStyle = colores[i];
        g.fillRect(w * 0.1 + i * w * 0.09, h * 0.555, w * 0.075, h * 0.05);
      }
      g.fillStyle = 'rgba(200,225,240,.35)';
      g.fillRect(w * 0.08, h * 0.5, w * 0.84, h * 0.06);
    }
    g.fillStyle = '#d9d3c8';
    g.fillRect(0, h * 0.85, w, h * 0.15);
  };
}

/** el rótulo de la izquierda: MARTINO'S, GELATERIA debajo y el logo redondo con la copa de helado */
function rotuloMartinos(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1a1a1c';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.font = `700 ${Math.round(h * 0.32)}px ${SERIF}`;
  g.fillText("MARTINO'S", w * 0.36, h * 0.5);
  g.font = `700 ${Math.round(h * 0.15)}px Arial, sans-serif`;
  g.fillText('GELATERIA', w * 0.36, h * 0.8);
  // el logo: círculo blanco con el aro rojo oscuro y la copa con las bolas
  const cx = w * 0.82, cy = h * 0.42, r = h * 0.38;
  g.fillStyle = '#ffffff';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#7a2a2a';
  g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, r - 2, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(cx, cy, r * 0.72, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#c98a3a';
  g.beginPath(); g.moveTo(cx - r * 0.35, cy); g.lineTo(cx + r * 0.35, cy); g.lineTo(cx + r * 0.18, cy + r * 0.4); g.lineTo(cx - r * 0.18, cy + r * 0.4); g.fill();
  for (const [dx, col] of [[-0.18, '#f08aa8'], [0.18, '#f6e6c0'], [0, '#7a4a2a']]) {
    g.fillStyle = col;
    g.beginPath(); g.arc(cx + dx * r, cy - (dx === 0 ? r * 0.28 : r * 0.08), r * 0.2, 0, Math.PI * 2); g.fill();
  }
}

/** GELATO ARTIGIANALE en letras negras sobre la pared */
function rotuloGelato(g, w, h) {
  g.fillStyle = '#f2f1ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1a1a1c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.48)}px ${SERIF}`;
  g.fillText('GELATO', w / 2, h * 0.33);
  g.font = `700 ${Math.round(h * 0.3)}px ${SERIF}`;
  g.fillText('ARTIGIANALE', w / 2, h * 0.78);
}

/** el cucurucho gigante de la puerta: barquillo, bolas rosa y amarilla y el remolino de nata y chocolate */
function cucurucho(k, s, z) {
  k.cyl(s, 0, z, 0.03, 0.03, 0.42, 0x8a8f94, { seg: 6 });
  k.cyl(s, 0.4, z, 0.26, 0.03, 1.0, 0xd8a35a, { seg: 14 });
  k.ball(s - 0.11, 1.48, z, 0.17, 0xf08aa8, { seg: 12 });
  k.ball(s + 0.11, 1.5, z + 0.02, 0.17, 0xf2c23a, { seg: 12 });
  k.ball(s, 1.66, z, 0.2, 0xf4efe6, { sy: 0.6, seg: 12 });
  k.cyl(s, 1.7, z, 0.04, 0.17, 0.2, 0x4a2a1a, { seg: 12 });
  k.cyl(s, 1.88, z, 0.02, 0.1, 0.16, 0xf4efe6, { seg: 12 });
  k.block(s, z, 0.5, 0.5);
}

/** Martino's Gelato (en el marco C): pared blanca, los dos huecos de marco azul marino, los rótulos y el cucurucho */
function martinos(k) {
  // la pared sale 15 cm, para quedar por delante de la cornisa de la fachada del mapa
  const s0 = 40.4, s1 = 48.2, sm = (s0 + s1) / 2, Z = 0.15;
  k.box(sm, 0, Z / 2, s1 - s0, 3.7, Z, WHITE);
  // la puerta de la izquierda y la entrada grande, con los marcos azul marino gruesos
  hueco(k, 41.6, 0, 1.25, 2.5, canvasTex(160, 320, heladeriaDentro(false)), { borde: MARINO, z: Z - 0.01 });
  hueco(k, 44.9, 0, 3.0, 2.6, canvasTex(384, 336, heladeriaDentro(true)), { borde: MARINO, z: Z - 0.01 });
  for (const s of [43.3, 46.5]) k.box(s, 0, Z + 0.05, 0.16, 2.72, 0.12, MARINO);
  // los rótulos de letras negras encima de los huecos
  k.pic(42.0, 3.15, Z + 0.01, 2.2, 0.85, 0, 1, canvasTex(440, 170, rotuloMartinos));
  k.pic(45.0, 3.2, Z + 0.01, 2.6, 0.75, 0, 1, canvasTex(520, 150, rotuloGelato));
  // el cucurucho gigante y la papelera negra
  cucurucho(k, 40.75, Z + 0.45);
  k.cyl(43.0, 0, Z + 0.4, 0.2, 0.2, 0.8, 0x1d1d1f, { seg: 12 });
  k.block(43.0, Z + 0.4, 0.4, 0.4);
}

// ——— Estrella (en la esquina oeste de la manzana del Melecón, la de la heladería Antiu Xixona) ———

/** el panel de lamas azules con «Estrella» en dorado y las dos estrellas */
function panelEstrella(g, w, h) {
  g.fillStyle = '#2a5aa8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f4a8f';
  for (let y = 0; y < h; y += h / 9) g.fillRect(0, y, w, Math.max(2, h * 0.025));
  g.fillStyle = '#e8c45a';
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.56)}px ${SERIF}`;
  g.fillText('Estrella', w * 0.24, h * 0.56);
  // las dos estrellas de delante del nombre
  const estrella5 = (cx, cy, r) => {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.42 : r;
      g.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q);
    }
    g.closePath();
    g.fill();
  };
  estrella5(w * 0.14, h * 0.32, h * 0.12);
  estrella5(w * 0.19, h * 0.32, h * 0.12);
}

/** el faldón del toldo azul marino con el borde blanco de ondas */
function faldonOndas(g, w, h) {
  g.fillStyle = '#1c2a4a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, h * 0.82, w, h * 0.18);
  g.fillStyle = '#1c2a4a';
  const r = h * 0.2;
  for (let x = r; x < w; x += r * 2) { g.beginPath(); g.arc(x, h * 0.82, r, 0, Math.PI); g.fill(); }
}

/** el azulejo de dibujo de encima de la cristalera */
function azulejo(g, w, h) {
  g.fillStyle = '#efe8da';
  g.fillRect(0, 0, w, h);
  const t = h / 2;
  g.strokeStyle = '#2a5aa8';
  g.lineWidth = 2;
  for (let x = 0; x < w; x += t) {
    for (let y = 0; y < h; y += t) {
      g.beginPath(); g.arc(x + t / 2, y + t / 2, t * 0.35, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.moveTo(x, y + t / 2); g.lineTo(x + t / 2, y); g.lineTo(x + t, y + t / 2); g.lineTo(x + t / 2, y + t); g.closePath(); g.stroke();
    }
  }
}

/** el toldo azul marino de Estrella, en pendiente, con el faldón de ondas */
function toldoEstrella(k, s0, s1, yPared, fuera, Z) {
  const w = s1 - s0, sm = (s0 + s1) / 2, dy = 0.4, L = Math.hypot(fuera, dy);
  const tela = new THREE.BoxGeometry(w, 0.03, L);
  tela.rotateX(Math.atan2(dy, fuera));
  tela.translate(sm, yPared - dy / 2, Z + fuera / 2);
  k.add(tela, 0x1c2a4a);
  k.pic(sm, yPared - dy - 0.15, Z + fuera + 0.02, w, 0.32, 0, 1, canvasTex(512, 48, faldonOndas));
}

/** Estrella (en el marco E, de s 0,3 a 9,6): la columna azul de la esquina, cristaleras, puerta, el panel con el nombre y los focos */
function estrella(k) {
  const s0 = 0.3, s1 = 9.6, sm = (s0 + s1) / 2, Z = 0.15;
  k.box(sm, 0, Z / 2, s1 - s0, 4.3, Z, WHITE);
  // la columna azul de la esquina
  k.box(0.55, 0, Z + 0.15, 0.4, 4.4, 0.3, AZUL_D);
  // la pizarra de la pared, las dos cristaleras con el comedor, el azulejo y la puerta azul
  k.pic(1.6, 1.5, Z + 0.01, 0.8, 1.0, 0, 1, canvasTex(96, 120, pizarraColgada(23)));
  hueco(k, 3.4, 0, 2.4, 2.4, canvasTex(288, 288, barDentro), { borde: AZUL_D, z: Z - 0.01 });
  k.pic(3.4, 2.62, Z + 0.01, 2.4, 0.32, 0, 1, canvasTex(300, 40, azulejo));
  hueco(k, 5.3, 0, 0.95, 2.35, canvasTex(112, 280, puertaAzul(1)), { borde: AZUL_D, z: Z - 0.01 });
  hueco(k, 7.5, 0, 2.6, 2.4, canvasTex(312, 288, barDentro), { borde: AZUL_D, z: Z - 0.01 });
  // el panel de lamas azules con el nombre y la fila de focos de encima
  k.box(4.5, 3.05, Z + 0.06, 7.4, 1.15, 0.12, 0x2a5aa8);
  k.pic(4.5, 3.625, Z + 0.125, 7.4, 1.15, 0, 1, canvasTex(740, 115, panelEstrella));
  for (let s = 1.2; s < 8.3; s += 0.9) {
    k.box(s, 4.22, Z + 0.2, 0.05, 0.05, 0.3, 0x1d1d1f);
    k.ball(s, 4.2, Z + 0.36, 0.05, 0xfff2cc, { list: k.glow, seg: 6 });
  }
  // los toldos azul marino
  toldoEstrella(k, 0.85, 4.8, 2.95, 1.6, Z);
  toldoEstrella(k, 4.9, 9.5, 2.95, 1.6, Z);
}

/** la terraza de Estrella: mesas de tablero de piedra, sillas de rejilla blancas, la estufa y la pizarra de pie */
function terrazaEstrella(k, palmas) {
  const mesas = [];
  for (const z of [2.3, 4.0]) {
    for (const s of [1.6, 3.5, 5.4, 7.3, 9.2]) {
      const [x, wz] = E.W(s, z);
      if (palmas.some(([px, pz]) => Math.hypot(px - x, pz - wz) < 1.4)) continue;
      k.table(s, z, { w: 0.8, d: 0.7, h: 0.75, top: 0xd8d4cc, leg: 0x2a2c30 });
      k.chair(s - 0.55, z, Math.PI / 2, 0xe2e0da, { legs: 0x9a9ea4 });
      k.chair(s + 0.55, z, -Math.PI / 2, 0xe2e0da, { legs: 0x9a9ea4 });
      k.block(s, z, 0.8, 0.7);
      mesas.push([s, z]);
    }
  }
  estufa(k, 4.45, 3.15);
  for (const a of [0.2, -0.2]) {
    const g = new THREE.BoxGeometry(0.55, 0.9, 0.03);
    g.translate(0, 0.45, 0);
    g.rotateX(a);
    g.translate(0.9, 0, 1.7 + Math.sign(a) * 0.08);
    k.add(g, 0x23262a);
  }
  return mesas;
}

// la gente de Estrella (sin nombre: no hablan)
const CLIENTES_ESTRELLA = [
  { sex: 'm', skin: 0xe8c4a2, hair: 0xb07a3a, hairStyle: 'short', top: 0xc23a32, bottom: 0x3b4a66, height: 1.79 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0xd8c08a, hairStyle: 'bun', top: 0x2a2f3a, bottom: 0x2a2f3a, height: 1.64 },
  { sex: 'm', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'short', top: 0x1d1d1f, bottom: 0x22252a, height: 1.74 },
  { sex: 'f', skin: 0xc28a62, hair: 0x15110e, hairStyle: 'ponytail', top: 0xf2efe6, bottom: 0x1d2b44, height: 1.6 },
  { sex: 'f', skin: 0xe8c4a2, hair: 0x8c8580, hairStyle: 'bun', top: 0x6a8ab8, bottom: 0x3a3a40, height: 1.62 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));
const SENTADOS_ESTRELLA = [[0, 1], [1, -1], [3, 1], [5, -1], [6, 1]];

// ——— Malecón Restaurante & Copas (en la manzana del Melecón, al este de Estrella) ———

/** el letrero de tablas de madera con «Malecón» en letra de mano */
function rotuloMalecon(g, w, h) {
  g.fillStyle = '#9a6a3e';
  g.fillRect(0, 0, w, h);
  let s = 31;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < h; y += h / 5) {
    g.fillStyle = `rgb(${130 + r() * 40},${88 + r() * 30},${52 + r() * 20})`;
    g.fillRect(0, y + 1, w, h / 5 - 2);
    g.strokeStyle = 'rgba(60,35,18,.35)';
    g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const x = r() * w; g.beginPath(); g.moveTo(x, y + 2); g.lineTo(x + r() * 60, y + h / 5 - 2); g.stroke(); }
  }
  g.fillStyle = '#2a1a10';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.42)}px "Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive`;
  g.fillText('Malecón', w / 2, h * 0.45);
  g.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
  g.fillText('R E S T A U R A N T E   &   C O P A S', w / 2, h * 0.8);
}

/** sombrilla cuadrada grande gris por fuera y naranja por debajo, con el faldón naranja */
function sombrillaMalecon(k, s, z) {
  k.cyl(s, 0, z, 0.24, 0.27, 0.08, 0x3a3d42, { seg: 10 });
  k.cyl(s, 0.08, z, 0.03, 0.03, 2.6, 0xc8c2b4, { seg: 6 });
  const fuera = new THREE.ConeGeometry(1.95, 0.5, 4, 1, true);
  fuera.rotateY(Math.PI / 4);
  fuera.translate(s, 2.62, z);
  k.add(fuera, 0x5f7478);
  const dentro = new THREE.ConeGeometry(1.88, 0.48, 4, 1, true);
  dentro.rotateY(Math.PI / 4);
  dentro.translate(s, 2.58, z);
  k.add(dentro, 0xd2603a);
  for (const [dx, dz, w, d] of [[0, 1.37, 2.76, 0.02], [0, -1.37, 2.76, 0.02], [1.37, 0, 0.02, 2.76], [-1.37, 0, 0.02, 2.76]]) k.box(s + dx, 2.2, z + dz, w, 0.16, d, 0xc8502e);
  k.ball(s, 2.3, z, 0.08, 0xfff0c8, { list: k.glow, seg: 8 });
  k.block(s, z, 0.32, 0.32);
}

/** Malecón (en el marco E, de s 33,5 a 42,5): pared con zócalo gris, cristaleras azules y el letrero de madera con sus focos */
function malecon(k) {
  const s0 = 33.5, s1 = 42.5, sm = (s0 + s1) / 2, Z = 0.15;
  k.box(sm, 0, Z / 2, s1 - s0, 3.95, Z, WHITE);
  k.box(sm, 0, Z + 0.01, s1 - s0, 0.9, 0.02, 0x8b9094);
  hueco(k, 35.0, 0, 1.4, 2.4, canvasTex(176, 288, barDentro), { borde: AZUL_D, z: Z + 0.01 });
  hueco(k, 37.4, 0, 2.0, 2.5, canvasTex(240, 300, barDentro), { borde: AZUL_D, z: Z + 0.01 });
  hueco(k, 40.1, 0.9, 1.6, 1.5, canvasTex(192, 180, cuarterones(3, 2)), { borde: AZUL_D, z: Z + 0.01 });
  hueco(k, 41.7, 0, 0.95, 2.35, canvasTex(112, 280, puertaAzul(1)), { borde: AZUL_D, z: Z + 0.01 });
  // el letrero de madera y los dos focos que lo alumbran
  k.box(38.6, 2.95, Z + 0.04, 2.5, 0.95, 0.08, 0x6b4a2a);
  k.pic(38.6, 3.425, Z + 0.085, 2.4, 0.86, 0, 1, canvasTex(480, 172, rotuloMalecon));
  for (const s of [37.9, 39.3]) {
    k.box(s, 3.98, Z + 0.15, 0.04, 0.04, 0.3, 0x1d1d1f);
    k.ball(s, 3.95, Z + 0.3, 0.05, 0xfff2cc, { list: k.glow, seg: 6 });
  }
}

/** la terraza del Malecón: sombrillas grises y naranjas, mesitas con farol, sillas de aluminio de cojín rojo y la pizarra verde */
function terrazaMalecon(k, palmas) {
  const mesas = [];
  for (const z of [1.8, 3.4, 5.0]) {
    for (const s of [34.4, 36.2, 38.0, 39.8, 41.6]) {
      const [x, wz] = E.W(s, z);
      if (palmas.some(([px, pz]) => Math.hypot(px - x, pz - wz) < 1.4)) continue;
      k.table(s, z, { w: 0.65, d: 0.65, h: 0.74, top: 0x4a4e54, leg: 0xa8acb0 });
      k.chair(s - 0.5, z, Math.PI / 2, 0xa83a3a, { legs: 0xa8acb0 });
      k.chair(s + 0.5, z, -Math.PI / 2, 0xa83a3a, { legs: 0xa8acb0 });
      k.box(s, 0.74, z, 0.06, 0.09, 0.06, 0xffb870, { list: k.glow });
      k.block(s, z, 0.65, 0.65);
      mesas.push([s, z]);
    }
  }
  for (const [s, z] of [[35.3, 2.6], [39.0, 2.6], [37.1, 5.0]]) sombrillaMalecon(k, s, z);
  // la pizarra de pie con el marco verde
  for (const a of [0.2, -0.2]) {
    const g = new THREE.BoxGeometry(0.62, 1.0, 0.03);
    g.translate(0, 0.5, 0);
    g.rotateX(a);
    g.translate(42.6, 0, 3.0 + Math.sign(a) * 0.09);
    k.add(g, 0x3a7a3a);
  }
  k.box(42.6, 0.25, 3.18, 0.52, 0.7, 0.01, 0x1e2321);
  return mesas;
}

// la gente del Malecón (sin nombre: no hablan)
const CLIENTES_MALECON = [
  { sex: 'm', skin: 0xc8916c, hair: 0x15110e, hairStyle: 'short', top: 0x2a3a5a, bottom: 0x22252a, height: 1.76 },
  { sex: 'f', skin: 0xe8c4a2, hair: 0x6a4a2a, hairStyle: 'ponytail', top: 0xf2d24a, bottom: 0x2a2f3a, height: 1.63 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0x8c8580, hairStyle: 'short', top: 0xe8e2d4, bottom: 0x4a4038, height: 1.71, beard: true },
  { sex: 'f', skin: 0xd9a882, hair: 0x2a1d14, hairStyle: 'bun', top: 0xc23a5a, bottom: 0x1d2b44, height: 1.6 },
  { sex: 'm', skin: 0x9a6844, hair: 0x2a1d14, hairStyle: 'short', top: 0x3a8a4a, bottom: 0x3b4a66, height: 1.8 },
  { sex: 'f', skin: 0xf1d3b8, hair: 0xd8c08a, hairStyle: 'ponytail', top: 0xf2efe6, bottom: 0x2a2f3a, height: 1.67 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));
const SENTADOS_MALECON = [[0, 1], [1, -1], [2, 1], [4, -1], [6, 1], [8, -1]];

/** segunda fase, con los locales ya hechos (como restaurantesCharco.js) */
export function buildRestaurantesCharco2(scene, colliders, map, locales) {
  if (!map?.restaurantesCharco2) return null;
  const group = new THREE.Group();
  group.name = 'restaurantesCharco2';
  const kM = new Kit();
  martinos(kM);
  group.add(enMarco(kM, C, 'martinosGelato', colliders));
  // Estrella y su terraza, a ras del suelo que se ve
  const kE = new Kit();
  estrella(kE);
  group.add(enMarco(kE, E, 'estrella', colliders));
  const palmas = [...(map.extraPalms || []), ...(map._charcoProm?.palms || [])];
  const kET = new Kit();
  const mesasE = terrazaEstrella(kET, palmas);
  const terrazaE = enMarco(kET, E, 'terrazaEstrella', colliders);
  group.add(terrazaE);
  // el Malecón y su terraza, en la misma manzana
  const kL = new Kit();
  malecon(kL);
  group.add(enMarco(kL, E, 'malecon', colliders));
  const kLT = new Kit();
  const mesasL = terrazaMalecon(kLT, palmas);
  const terrazaL = enMarco(kLT, E, 'terrazaMalecon', colliders);
  group.add(terrazaL);
  scene.add(group);
  aRasDelSuelo(scene, terrazaE);
  aRasDelSuelo(scene, terrazaL);
  const gente = sentados(scene, locales, E, mesasE, CLIENTES_ESTRELLA, SENTADOS_ESTRELLA);
  gente.push(...sentados(scene, locales, E, mesasL, CLIENTES_MALECON, SENTADOS_MALECON));
  return { group, gente };
}
