import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Kit, canvasTex } from './interiorKit.js';
import { charcoPromenade } from './zones.js';
import { sobreSuelo } from './piraguas.js';

/**
 * Los locales del paseo del Charco de San Ginés, en la orilla norte (avenida César Manrique), con las dos
 * fotos de José Manuel desde el fango con la marea baja. De oeste a este:
 *  - la heladería Antiu Xixona, en la esquina beige del final del bloque de Melecón, y el toldo blanco de
 *    la terraza de al lado;
 *  - la escalera de piedra que baja al Charco al final de la calle Lugo, con las barandillas azules de
 *    cruces a los lados y el pilar de piedra;
 *  - el edificio de las galerías acristaladas: tres plantas, balcones de cruces azules y azotea con
 *    barandas, depósitos y antenas;
 *  - la casita de una planta con las dos puertas azules (el número 2);
 *  - el Bar Restaurante Leito de Proa: toldo gris con el faldón azul, terraza con sombrillas blancas,
 *    pizarras, el rótulo, y detrás el bloque alto con las contraventanas azules y el cuarto de la azotea
 *    con la antena;
 *  - la esquina de las puertas verdes, donde la fachada gira hacia Juan de Quesada.
 * Las palmeras y las farolas del paseo van donde están en las fotos.
 * Los nombres son los de los rótulos de las fotos (y los de OpenStreetMap): Leito de Proa y Antiu Xixona.
 * El mapa trae la manzana como un bloque de 5 m: las fachadas van por delante de su pared y lo que sube,
 * encima. El orden y las proporciones son los de las fotos, ajustados al largo de la manzana del mapa.
 */

const WHITE = 0xf2f1ec, BLUE = 0x1d4f9c, BEIGE = 0xe0cfae, GREEN = 0x2e6b4c, RAIL = 0x9fc0e6;
const SCRIPT = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", "Comic Sans MS", cursive';
// la escalera al Charco: arriba, en el saliente del muro al final de la calle Lugo (el mapa del Charco lo trae)
const ESCALERA = { x: 499.0, z: 111.65, w: 2.4, top: 0.92, fondo: -1.0, n: 11 };

/** el marco de una fachada: s a lo largo (desde B), z hacia la calle */
function marco(B, A) {
  const len = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const U = [(A[0] - B[0]) / len, (A[1] - B[1]) / len], N = [-U[1], U[0]];
  return { B, len, U, N, W: (s, z) => [B[0] + U[0] * s + N[0] * z, B[1] + U[1] * s + N[1] * z], ry: Math.atan2(N[0], N[1]) };
}
// la manzana al paseo (de la calle Lugo a la esquina), la esquina hacia Juan de Quesada y el bloque de Melecón
const F = marco([508.9, 103.2], [539.4, 103.7]);
const F2 = marco([539.4, 103.7], [568.8, 73.8]);
const G = marco([431.2, 97.0], [495.4, 101.8]);

/** palmeras del paseo como en las fotos: [x, z, alto, giro]; la alta y delgada es la de delante de las galerías */
const PALMAS = [[492.6, 106.6, 8.4, 1.1], [494.9, 106.9, 9.2, 3.0], [515.0, 107.6, 12.5, 0.4], [522.8, 107.6, 8.6, 0.7], [538.3, 108.1, 8.9, 2.3]];
// las del paseo del Charco que no salen en las fotos (una caía encima de la escalera)
const SIN_PALMA = [[500.7, 108.9], [507.6, 106.3]];
// las farolas azules que faltaban: la de junto a la escalera y la de delante del Leito de Proa
const FAROLAS = [[496.6, 108.4, 0.14], [527.6, 109.4, -0.05]];

/**
 * antes de levantar la ciudad: las palmeras y farolas del paseo como en las fotos, y fuera los rótulos
 * rojos genéricos del mapa de los dos locales (se ponen los de verdad)
 */
export function tuneLocalesCharco(map) {
  const prom = charcoPromenade(map);
  if (prom?.palms) {
    for (let i = prom.palms.length - 1; i >= 0; i--) {
      const [x, z] = prom.palms[i];
      if (SIN_PALMA.some(([a, b]) => Math.hypot(a - x, b - z) < 1)) prom.palms.splice(i, 1);
    }
  }
  if (prom?.lamps) prom.lamps.push(...FAROLAS);
  map.extraPalms = map.extraPalms || [];
  map.extraPalms.push(...PALMAS);
  map.localesCharcoSigns = [];
  for (const name of ['Leito De Proa', 'Antiu Xixona Helados']) {
    const i = (map.signs || []).findIndex(s => s.name === name);
    if (i >= 0) map.localesCharcoSigns.push(map.signs.splice(i, 1)[0]);
  }
  map.localesCharco = true;
}

// ——— lo que se pinta en lienzo ———

/** galería acristalada: marco blanco, hojas con el montante de arriba, el cielo reflejado y alguna cortina */
function galeria(cols) {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#bccbd8');
    gr.addColorStop(0.5, '#7f95a8');
    gr.addColorStop(1, '#3d4b58');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    const cw = w / cols;
    for (let i = 0; i < cols; i++) {
      if ((i * 7) % 5 !== 1) continue;
      g.fillStyle = 'rgba(236,230,214,.55)';
      g.fillRect(i * cw, h * 0.24, cw, h * 0.76);
    }
    g.strokeStyle = '#f4f3ee';
    g.lineWidth = Math.max(4, cw * 0.12);
    g.strokeRect(0, 0, w, h);
    for (let i = 1; i < cols; i++) { g.beginPath(); g.moveTo(i * cw, 0); g.lineTo(i * cw, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, h * 0.24); g.lineTo(w, h * 0.24); g.stroke();
    g.lineWidth = Math.max(2, cw * 0.05);
    for (let i = 0; i < cols; i++) { g.beginPath(); g.moveTo(i * cw, h * 0.62); g.lineTo((i + 1) * cw, h * 0.62); g.stroke(); }
  };
}

/** tablero de cruces (los frentes de los balcones y las barandas de la azotea) */
function cruces(n, fondo = '#2f5c9e', cruz = '#86abda', borde = '#23477e') {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    const pw = w / n, m = h * 0.1;
    g.strokeStyle = cruz;
    g.lineWidth = Math.max(3, h * 0.09);
    for (let i = 0; i < n; i++) {
      const x0 = i * pw + m, x1 = (i + 1) * pw - m;
      g.beginPath();
      g.moveTo(x0, m); g.lineTo(x1, h - m);
      g.moveTo(x0, h - m); g.lineTo(x1, m);
      g.stroke();
    }
    g.strokeStyle = borde;
    g.lineWidth = Math.max(4, h * 0.11);
    g.strokeRect(0, 0, w, h);
    for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(i * pw, 0); g.lineTo(i * pw, h); g.stroke(); }
  };
}

/** contraventanas azules de lamas: cerradas, o la ventana abierta con una hoja a cada lado */
function persiana(abierta) {
  return (g, w, h) => {
    const lamas = (x, ww) => {
      g.fillStyle = '#1d4f9c';
      g.fillRect(x, 0, ww, h);
      g.strokeStyle = '#143b78';
      g.lineWidth = 3;
      for (let y = 8; y < h; y += 10) { g.beginPath(); g.moveTo(x + 4, y); g.lineTo(x + ww - 4, y); g.stroke(); }
      g.lineWidth = 5;
      g.strokeRect(x + 2, 2, ww - 4, h - 4);
    };
    if (!abierta) {
      lamas(0, w / 2);
      lamas(w / 2, w / 2);
      return;
    }
    const sw = w * 0.22;
    g.fillStyle = '#f1f0ea';
    g.fillRect(0, 0, w, h);
    lamas(0, sw);
    lamas(w - sw, sw);
    g.fillStyle = '#2b3138';
    g.fillRect(sw + 4, 4, w - 2 * sw - 8, h - 8);
    g.fillStyle = 'rgba(190,205,220,.35)';
    g.fillRect(sw + 6, 6, (w - 2 * sw) / 2 - 8, h * 0.5);
    g.strokeStyle = '#1d4f9c';
    g.lineWidth = 5;
    g.strokeRect(sw + 2, 2, w - 2 * sw - 4, h - 4);
    g.beginPath(); g.moveTo(w / 2, 2); g.lineTo(w / 2, h - 2); g.stroke();
  };
}

/** ventana de cristal con su marco (y el visillo arriba) */
function ventana(cols, borde = '#1d4f9c') {
  return (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h);
    gr.addColorStop(0, '#8ca2b4');
    gr.addColorStop(1, '#2d3640');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(236,232,220,.5)';
    g.fillRect(w * 0.04, h * 0.05, w * 0.92, h * 0.24);
    g.strokeStyle = borde;
    g.lineWidth = Math.max(6, w * 0.035);
    g.strokeRect(0, 0, w, h);
    for (let i = 1; i < cols; i++) { g.beginPath(); g.moveTo(w * i / cols, 0); g.lineTo(w * i / cols, h); g.stroke(); }
  };
}

/** ventana enrejada de la planta baja: barrotes blancos delante del cristal y marco azul */
function reja(g, w, h) {
  g.fillStyle = '#2a3036';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(170,190,205,.35)';
  g.fillRect(0, 0, w, h * 0.4);
  g.strokeStyle = '#eef0f0';
  g.lineWidth = 5;
  for (let x = w / 11; x < w - 2; x += w / 11) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const y of [h * 0.34, h * 0.67]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.strokeStyle = '#1d4f9c';
  g.lineWidth = 9;
  g.strokeRect(0, 0, w, h);
}

/** puerta de madera pintada, de cuarterones o con cristales arriba, de una o dos hojas */
function puerta(color, oscuro, { cristal = false, hojas = 1 } = {}) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    const lw = w / hojas;
    for (let i = 0; i < hojas; i++) {
      const x0 = i * lw;
      g.strokeStyle = oscuro;
      g.lineWidth = 4;
      g.strokeRect(x0 + 3, 3, lw - 6, h - 6);
      if (cristal) {
        g.fillStyle = '#2a3238';
        g.fillRect(x0 + lw * 0.15, h * 0.07, lw * 0.7, h * 0.42);
        g.fillStyle = 'rgba(200,215,225,.35)';
        g.fillRect(x0 + lw * 0.17, h * 0.08, lw * 0.3, h * 0.2);
        g.strokeStyle = color;
        for (const f of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(x0 + lw * 0.15, h * (0.07 + 0.42 * f)); g.lineTo(x0 + lw * 0.85, h * (0.07 + 0.42 * f)); g.stroke(); }
        g.strokeStyle = oscuro;
        g.strokeRect(x0 + lw * 0.16, h * 0.56, lw * 0.68, h * 0.37);
      } else {
        for (const [y0, y1] of [[0.07, 0.45], [0.52, 0.93]]) g.strokeRect(x0 + lw * 0.16, h * y0, lw * 0.68, h * (y1 - y0));
      }
    }
    g.fillStyle = '#c9b27a';
    g.beginPath(); g.arc(hojas === 2 ? w / 2 + 8 : w * 0.82, h * 0.52, 4, 0, Math.PI * 2); g.fill();
  };
}

/** el hueco de la puerta abierta o del cristal oscuro del restaurante */
function oscuro(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#2c2824');
  gr.addColorStop(1, '#100e0d');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,214,150,.1)';
  g.fillRect(w * 0.2, h * 0.15, w * 0.6, h * 0.35);
  g.strokeStyle = '#1d4f9c';
  g.lineWidth = 8;
  g.strokeRect(0, 0, w, h);
}

/** el rótulo del restaurante: BAR RESTAURANTE y, debajo, Leito de Proa en letra de mano */
function rotuloLeito(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c4cad2';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1b3a78';
  g.font = `800 ${Math.round(h * 0.33)}px "Barlow", Arial, sans-serif`;
  g.fillText('BAR RESTAURANTE', w / 2, h * 0.3);
  g.fillStyle = '#22314f';
  g.font = `italic 700 ${Math.round(h * 0.42)}px ${SCRIPT}`;
  g.fillText('Leito de Proa', w / 2, h * 0.72);
}

/** el rótulo de la heladería, en letra de mano oscura sobre blanco */
function rotuloAntiu(g, w, h) {
  g.fillStyle = '#f3f1ea';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#2a2320';
  g.font = `italic 700 ${Math.round(h * 0.6)}px ${SCRIPT}`;
  g.fillText('antiu xixona', w / 2, h * 0.52);
}

/** el faldón azul del toldo con RESTAURANTE en blanco */
function faldon(g, w, h) {
  g.fillStyle = '#1f4a8f';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.6)}px "Barlow", Arial, sans-serif`;
  g.fillText('RESTAURANTE', h * 0.6, h * 0.56);
}

/** la pared alta del bloque de detrás: encalada, con la mancha gris de la humedad y los churretes */
function paredSucia(g, w, h) {
  g.fillStyle = '#efeee9';
  g.fillRect(0, 0, w, h);
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const gr = g.createLinearGradient(0, h * 0.35, 0, h * 0.78);
  gr.addColorStop(0, 'rgba(120,118,112,0)');
  gr.addColorStop(0.5, 'rgba(120,118,112,.26)');
  gr.addColorStop(1, 'rgba(120,118,112,.05)');
  g.fillStyle = gr;
  g.fillRect(0, h * 0.35, w, h * 0.43);
  for (let i = 0; i < 140; i++) {
    g.fillStyle = `rgba(110,108,102,${0.05 + r() * 0.12})`;
    g.fillRect(r() * w, h * (0.45 + r() * 0.2), 1 + r() * 3, h * (0.05 + r() * 0.2));
  }
}

/** la carta pegada en la pared: papel blanco con renglones (sin platos ni precios) */
function carta(g, w, h) {
  g.fillStyle = '#f7f6f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1b3a78';
  g.fillRect(w * 0.1, h * 0.06, w * 0.8, h * 0.1);
  g.fillStyle = '#9a9a96';
  for (let y = h * 0.24; y < h * 0.92; y += h * 0.07) g.fillRect(w * 0.1, y, w * (0.5 + ((y * 7) % 3) * 0.12), 2);
}

/** el escaparate de la heladería: cristal oscuro con la vitrina iluminada */
function escaparate(g, w, h) {
  g.fillStyle = '#1f2428';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,236,200,.35)';
  g.fillRect(w * 0.08, h * 0.55, w * 0.84, h * 0.2);
  for (let i = 0; i < 8; i++) {
    g.fillStyle = ['#f1d9a8', '#e8a4b8', '#a8d8a0', '#f4f0e6'][i % 4];
    g.fillRect(w * (0.1 + i * 0.1), h * 0.6, w * 0.08, h * 0.08);
  }
  g.strokeStyle = '#2f5fae';
  g.lineWidth = 8;
  g.strokeRect(0, 0, w, h);
  g.beginPath(); g.moveTo(w * 0.62, 0); g.lineTo(w * 0.62, h); g.stroke();
}

/** el número de la casa: azulejo blanco con el 2 azul */
function numero(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1d4f9c';
  g.lineWidth = 4;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#1d4f9c';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.6)}px Arial, sans-serif`;
  g.fillText('2', w / 2, h * 0.55);
}

/** piedra volcánica en mampostería, con la junta clara (la escalera y su pilar, como el muro de la foto) */
function texturaPiedra() {
  const S = 256, c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#a69d8f';
  g.fillRect(0, 0, S, S);
  let s = 29;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0; y < S; y += 32) {
    let x = -r() * 40;
    while (x < S) {
      const w = 30 + r() * 34, v = 70 + r() * 40;
      const pts = [[x + 3 + r() * 4, y + 3 + r() * 3], [x + w - 3 - r() * 4, y + 2 + r() * 4], [x + w - 2 - r() * 3, y + 29 - r() * 4], [x + 2 + r() * 4, y + 30 - r() * 3]];
      for (const dx of [0, S, -S]) {
        g.fillStyle = `rgb(${v},${v - 5},${v - 10})`;
        g.beginPath();
        pts.forEach(([px, py], i) => (i ? g.lineTo(px + dx, py) : g.moveTo(px + dx, py)));
        g.closePath();
        g.fill();
      }
      x += w;
    }
  }
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(20,18,16,${0.15 + r() * 0.3})`;
    g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// ——— las piezas ———

/** un hueco en la fachada: el lienzo y un marco un poco saliente (y el alféizar si va en alto) */
function hueco(k, s, y0, w, h, tex, { borde = BLUE, z = 0.04 } = {}) {
  for (const x of [s - w / 2 - 0.05, s + w / 2 + 0.05]) k.box(x, y0, z + 0.04, 0.1, h + 0.05, 0.08, borde);
  k.box(s, y0 + h, z + 0.04, w + 0.2, 0.1, 0.08, borde);
  if (y0 > 0) k.box(s, y0 - 0.08, z + 0.07, w + 0.3, 0.08, 0.16, 0xe8e5de);
  k.pic(s, y0 + h / 2, z + 0.022, w, h, 0, 1, tex);
}

/** un balcón: la losa que sale y el frente de cruces azules */
function balcon(k, s0, s1, y, fuera, n) {
  k.box((s0 + s1) / 2, y, fuera / 2 + 0.04, s1 - s0 + 0.1, 0.1, fuera, WHITE);
  k.box((s0 + s1) / 2, y + 0.1, fuera + 0.02, s1 - s0, 0.62, 0.04, 0x23477e);
  k.pic((s0 + s1) / 2, y + 0.41, fuera + 0.045, s1 - s0, 0.6, 0, 1, canvasTex(Math.min(1024, 128 * n), 64, cruces(n)));
}

/** una galería acristalada que sale de la fachada, con su remate */
function galeriaVolada(k, s0, s1, y0, y1, fuera, cols) {
  k.box((s0 + s1) / 2, y0, fuera / 2 + 0.04, s1 - s0, y1 - y0, fuera, WHITE);
  k.pic((s0 + s1) / 2, (y0 + y1) / 2, fuera + 0.045, s1 - s0 - 0.08, y1 - y0 - 0.08, 0, 1, canvasTex(Math.min(1024, 96 * cols), 256, galeria(cols)));
  k.box((s0 + s1) / 2, y1, fuera / 2 + 0.06, s1 - s0 + 0.12, 0.12, fuera + 0.06, 0xe6e4de);
}

/** el edificio de las galerías (fotos 2 y 1): tres plantas, de s 0,15 a 12,4 */
function edificioGalerias(k) {
  const s0 = 0.15, s1 = 12.4, D = 9, H = 9.2;
  k.box((s0 + s1) / 2, 0, -D / 2 + 0.04, s1 - s0, H, D, WHITE, { list: k.shell });
  // las líneas de los forjados y la bajante de la esquina
  for (const y of [3.35, 6.35]) k.box((s0 + s1) / 2, y, 0.07, s1 - s0, 0.1, 0.06, 0xe4e2dc);
  k.cyl(s0 + 0.08, 0, 0.12, 0.05, 0.05, H, 0x9a9a96, { seg: 6 });
  // planta baja: puerta azul, la ventana grande enrejada con su cajón azul, la puerta estrecha, rejas y otra puerta
  hueco(k, 1.05, 0, 0.9, 2.3, canvasTex(96, 220, puerta('#1d4f9c', '#123a75')));
  hueco(k, 3.3, 0.9, 2.5, 1.5, canvasTex(256, 160, reja));
  k.box(3.3, 2.52, 0.09, 2.7, 0.6, 0.1, BLUE);
  hueco(k, 5.15, 0, 0.75, 2.4, canvasTex(80, 240, puerta('#5f86c4', '#3f6aa8')), { borde: 0x3f6aa8 });
  hueco(k, 6.9, 1.1, 1.1, 1.0, canvasTex(128, 112, reja));
  hueco(k, 9.5, 1.1, 0.8, 0.9, canvasTex(96, 104, reja));
  hueco(k, 11.4, 0, 0.95, 2.3, canvasTex(96, 220, puerta('#1d4f9c', '#123a75')));
  // los apliques negros de la pared
  for (const [s, y] of [[2.0, 3.0], [4.6, 3.0], [8.4, 3.0], [10.6, 3.0], [1.4, 6.05], [7.2, 6.05]]) k.box(s, y, 0.12, 0.16, 0.22, 0.16, 0x1d1e20);
  // primera planta: la galería grande sobre su balcón de cruces, la ventana de contraventanas y la otra galería
  balcon(k, 0.35, 5.45, 3.45, 0.5, 5);
  galeriaVolada(k, 0.35, 5.45, 4.15, 6.05, 0.46, 9);
  hueco(k, 6.35, 4.35, 0.9, 1.1, canvasTex(128, 156, persiana(false)));
  balcon(k, 7.55, 12.25, 3.45, 0.5, 5);
  galeriaVolada(k, 7.55, 12.25, 4.15, 6.05, 0.46, 8);
  // las macetas de geranios del balcón
  for (const s of [1.3, 4.4, 9.2]) {
    k.box(s, 4.08, 0.62, 0.45, 0.16, 0.18, 0xa8452e);
    k.ball(s, 4.28, 0.62, 0.2, 0xc0392b, { sy: 0.6 });
  }
  // segunda planta: a la izquierda otra galería; a la derecha ventanas y puertas azules con sus balcones de cruces
  balcon(k, 0.35, 6.85, 6.45, 0.5, 6);
  galeriaVolada(k, 0.35, 6.85, 7.05, 8.95, 0.46, 11);
  for (const [sw, sd] of [[8.0, 9.3], [10.6, 11.85]]) {
    hueco(k, sw, 7.3, 0.8, 1.1, canvasTex(112, 152, ventana(2)));
    hueco(k, sd, 6.5, 0.6, 2.1, canvasTex(80, 240, puerta('#1d4f9c', '#123a75', { cristal: true })));
    balcon(k, sw - 0.6, sd + 0.45, 6.4, 0.6, 2);
  }
  // azotea: pretil, barandas de cruces, el cuarto de la escalera, depósitos y antenas
  k.box((s0 + s1) / 2, H, 0.0, s1 - s0, 0.45, 0.16, WHITE);
  for (const [a, b] of [[2.4, 5.6], [8.0, 12.0]]) k.pic((a + b) / 2, H + 0.75, 0.04, b - a, 0.55, 0, 1, canvasTex(512, 88, cruces(4, '#eef0f2', '#5f86c4', '#5f86c4')));
  k.box(4.5, H, -5.0, 3.0, 2.2, 3.0, WHITE);
  k.cyl(9.0, H, -4.0, 0.45, 0.45, 1.0, 0xe9e7e0, { seg: 12 }).cyl(10.2, H, -4.2, 0.4, 0.4, 0.9, 0xe9e7e0, { seg: 12 });
  k.box(11.2, H, -6.0, 1.2, 0.7, 0.8, 0x2f5fae);
  for (const [s, z, h] of [[1.5, -2.0, 2.4], [6.5, -6.0, 3.0]]) {
    k.cyl(s, H, z, 0.025, 0.025, h, 0x8a8f94, { seg: 5 });
    k.box(s, H + h - 0.4, z, 0.9, 0.03, 0.03, 0x8a8f94);
  }
}

/** la casita de las dos puertas azules (el número 2), de s 12,4 a 16,6 */
function casaPuertas(k) {
  const s0 = 12.4, s1 = 16.6, H = 3.9;
  k.box((s0 + s1) / 2, 0, -2.0 + 0.04, s1 - s0, H, 4.0, WHITE, { list: k.shell });
  k.box((s0 + s1) / 2, H, 0.02, s1 - s0 + 0.08, 0.3, 0.14, 0xe9e7e1);
  hueco(k, 13.35, 0, 1.1, 2.45, canvasTex(128, 240, puerta('#1d4f9c', '#123a75', { hojas: 2 })));
  k.pic(13.35, 2.75, 0.065, 1.1, 0.4, 0, 1, canvasTex(128, 48, ventana(3, '#1d4f9c')));
  k.box(13.35, 2.95, 0.08, 1.3, 0.08, 0.08, BLUE);
  hueco(k, 15.55, 0, 1.0, 2.6, canvasTex(112, 256, puerta('#1d4f9c', '#123a75', { hojas: 2 })));
  k.pic(13.35, 3.25, 0.06, 0.18, 0.18, 0, 1, canvasTex(48, 48, numero));
}

/** el Bar Restaurante Leito de Proa y el bloque alto de detrás, de s 16,6 a 30,5 */
function leitoDeProa(k) {
  const s0 = 16.6, s1 = 30.5;
  // planta baja encalada: la ventana azul, las puertas y cristales del bar, las cartas y la puerta azul del final
  k.box((s0 + s1) / 2, 0, 0.035, s1 - s0, 3.6, 0.07, WHITE, { list: k.shell });
  hueco(k, 17.3, 0.9, 0.9, 1.6, canvasTex(112, 192, ventana(2)));
  hueco(k, 18.9, 0, 1.2, 2.4, canvasTex(128, 240, oscuro));
  hueco(k, 21.5, 0.9, 2.2, 1.5, canvasTex(256, 176, ventana(3, '#d6d8da')), { borde: 0xd6d8da });
  hueco(k, 24.4, 0, 1.4, 2.4, canvasTex(144, 240, oscuro));
  hueco(k, 27.2, 0.9, 2.2, 1.5, canvasTex(256, 176, ventana(3, '#d6d8da')), { borde: 0xd6d8da });
  hueco(k, 29.6, 0, 0.9, 2.3, canvasTex(96, 220, puerta('#1d4f9c', '#123a75')));
  for (const s of [20.2, 25.8]) k.pic(s, 1.55, 0.08, 0.42, 0.58, 0, 1, canvasTex(64, 88, carta));
  // el toldo gris con su faldón azul (RESTAURANTE a la izquierda) y el cajón en la pared
  const a0 = 16.9, a1 = 30.2, fuera = 3.0, yIn = 3.2, yOut = 2.5;
  const L = Math.hypot(fuera, yIn - yOut), tela = new THREE.BoxGeometry(a1 - a0, 0.03, L);
  tela.rotateX(Math.atan2(yIn - yOut, fuera));
  tela.translate((a0 + a1) / 2, (yIn + yOut) / 2, fuera / 2 + 0.05);
  k.add(tela, 0x7f8a96);
  k.box((a0 + a1) / 2, yOut - 0.28, fuera + 0.06, a1 - a0, 0.28, 0.02, 0x1f4a8f);
  k.pic(a0 + 1.6, yOut - 0.14, fuera + 0.075, 3.0, 0.26, 0, 1, canvasTex(384, 34, faldon));
  k.box((a0 + a1) / 2, 3.12, 0.1, a1 - a0, 0.16, 0.16, 0xdedcd6);
  // primera planta: el rótulo, la ventanita, la ventana ancha de cuatro hojas, los cables y la guirnalda de carámbanos
  k.box((s0 + s1) / 2, 3.6, -3.0 + 0.04, s1 - s0, 3.6, 6.0, WHITE, { list: k.shell });
  k.box((s0 + s1) / 2, 7.2, 0.02, s1 - s0 + 0.08, 0.22, 0.14, 0xe6e4de);
  k.box(18.4, 3.62, 0.07, 2.7, 0.82, 0.05, 0xc4cad2);
  k.pic(18.4, 4.03, 0.098, 2.6, 0.74, 0, 1, canvasTex(512, 146, rotuloLeito));
  hueco(k, 18.1, 4.8, 0.85, 0.9, canvasTex(112, 120, ventana(2)));
  hueco(k, 21.6, 4.8, 2.4, 0.9, canvasTex(320, 120, ventana(4)));
  for (const y of [3.52, 6.6]) k.cyl(s0, y, 0.12, 0.012, 0.012, s1 - s0, 0x2a2a2a, { seg: 4, rx: Math.PI / 2, ry: Math.PI / 2 });
  k.cyl(17.0, 6.95, 0.14, 0.008, 0.008, 10.0, 0xd8d8d0, { seg: 3, rx: Math.PI / 2, ry: Math.PI / 2 });
  for (let s = 17.1, i = 0; s < 27; s += 0.22, i++) k.box(s, 6.95 - (0.12 + (i % 3) * 0.09), 0.14, 0.02, 0.12 + (i % 3) * 0.09, 0.02, 0xfff6dc, { list: k.glow });
  // el bloque alto de detrás (también encima de la casita de las puertas azules), con la mancha de humedad
  const b0 = 12.4, b1 = 28.0, zf = -2.5;
  k.box((b0 + 16.6) / 2, 3.9, zf - 3.5, 16.6 - b0, 3.3, 7.0, WHITE, { list: k.shell });
  k.box((b0 + b1) / 2, 7.2, zf - 3.5, b1 - b0, 5.1, 7.0, WHITE, { list: k.shell });
  k.pic((b0 + b1) / 2, 9.75, zf + 0.012, b1 - b0, 5.1, 0, 1, canvasTex(1024, 336, paredSucia));
  k.box((b0 + b1) / 2, 12.3, zf + 0.02, b1 - b0 + 0.08, 0.3, 0.16, 0xe8e6e0);
  hueco(k, 13.9, 8.3, 1.4, 0.6, canvasTex(192, 80, ventana(3)), { z: zf + 0.02 });
  hueco(k, 26.3, 7.8, 0.65, 1.0, canvasTex(96, 144, persiana(false)), { z: zf + 0.02 });
  hueco(k, 26.1, 9.9, 1.4, 1.0, canvasTex(192, 136, persiana(true)), { z: zf + 0.02 });
  hueco(k, 27.8, 9.9, 0.75, 1.0, canvasTex(96, 136, persiana(false)), { z: zf + 0.02 });
  // el cuarto de la azotea, con su ventanita, y la antena
  k.box(22.0, 12.3, -7.5, 5.0, 2.1, 4.0, WHITE, { list: k.shell });
  k.pic(20.4, 13.6, -5.488, 0.6, 0.35, 0, 1, canvasTex(64, 40, ventana(1, '#4a4f55')));
  k.cyl(23.5, 14.4, -7.0, 0.03, 0.03, 2.4, 0x8a8f94, { seg: 5 });
  for (const [y, w] of [[15.6, 1.1], [16.2, 0.8], [16.6, 0.5]]) k.box(23.5, y, -7.0, w, 0.03, 0.03, 0x8a8f94);
}

/** la esquina de las puertas verdes, donde la fachada gira hacia Juan de Quesada (en su propio marco) */
function esquinaVerde(k) {
  const s0 = 0.05, s1 = 9.0;
  k.box((s0 + s1) / 2, 0, 0.035, s1 - s0, 3.6, 0.07, WHITE, { list: k.shell });
  k.box((s0 + s1) / 2, 0, 0.075, s1 - s0, 0.8, 0.05, 0x55524d);
  k.box(0.9, 0, 0.09, 1.6, 2.6, 0.08, 0x5a5650);
  for (const s of [2.4, 5.2]) hueco(k, s, 0, 1.2, 2.5, canvasTex(128, 240, puerta('#2e6b4c', '#1f4d36', { cristal: true, hojas: 2 })), { borde: GREEN });
  hueco(k, 7.6, 1.1, 0.8, 1.0, canvasTex(96, 112, reja));
}

/** la heladería Antiu Xixona y el toldo blanco de la terraza de al lado (en el marco del bloque de Melecón) */
function heladeria(k) {
  const s0 = 58.6, s1 = 64.4;
  k.box((s0 + s1) / 2, 0, 0.035, s1 - s0, 4.05, 0.07, BEIGE, { list: k.shell });
  k.box((s0 + s1) / 2, 4.0, -4.0, s1 - s0, 2.9, 6.0, BEIGE, { list: k.shell });
  k.box((s0 + s1) / 2, 6.9, -1.0, s1 - s0 + 0.06, 0.25, 0.14, 0xd8c7a6);
  hueco(k, 59.6, 0, 0.9, 2.3, canvasTex(96, 220, puerta('#5a4636', '#3a2c22')), { borde: 0x3a2c22 });
  k.pic(62.3, 1.15, 0.075, 2.6, 2.3, 0, 1, canvasTex(256, 224, escaparate));
  k.box(62.3, 2.3, 0.12, 2.8, 0.38, 0.16, 0x2f5fae);
  k.box(62.3, 2.75, 0.08, 2.7, 0.62, 0.05, 0xd9d4c8);
  k.pic(62.3, 3.06, 0.108, 2.6, 0.56, 0, 1, canvasTex(512, 112, rotuloAntiu));
  // el toldo blanco de la terraza de al lado, con su faldón
  const a0 = 50.6, a1 = 58.3, fuera = 2.4, yIn = 2.9, yOut = 2.35;
  const L = Math.hypot(fuera, yIn - yOut), tela = new THREE.BoxGeometry(a1 - a0, 0.03, L);
  tela.rotateX(Math.atan2(yIn - yOut, fuera));
  tela.translate((a0 + a1) / 2, (yIn + yOut) / 2, fuera / 2 + 0.05);
  k.add(tela, 0xf1f1ee);
  k.box((a0 + a1) / 2, yOut - 0.22, fuera + 0.06, a1 - a0, 0.22, 0.02, 0xe9e9e4);
}

/** las sombrillas blancas cuadradas de la terraza */
function sombrilla(k, s, z) {
  k.cyl(s, 0, z, 0.22, 0.25, 0.08, 0x3a3d42, { seg: 10 });
  k.cyl(s, 0.08, z, 0.025, 0.025, 2.55, 0xd8d8d4, { seg: 6 });
  const tela = new THREE.ConeGeometry(1.55, 0.42, 4, 1, true);
  tela.rotateY(Math.PI / 4);
  tela.translate(s, 2.48, z);
  k.add(tela, 0xf4f4f0);
  for (const [dx, dz, w, d] of [[0, 1.1, 2.2, 0.02], [0, -1.1, 2.2, 0.02], [1.1, 0, 0.02, 2.2], [-1.1, 0, 0.02, 2.2]]) k.box(s + dx, 2.1, z + dz, w, 0.17, d, 0xf4f4f0);
  k.block(s, z, 0.3, 0.3);
}

/** una pizarra de pie (de las de caballete) */
function pizarra(k, s, z) {
  for (const a of [0.2, -0.2]) {
    const g = new THREE.BoxGeometry(0.55, 0.85, 0.03);
    g.translate(0, 0.42, 0);
    g.rotateX(a);
    g.translate(s, 0, z + Math.sign(a) * 0.08);
    k.add(g, 0x23262a);
  }
}

/** la terraza del Leito de Proa (en el marco de la manzana): mesas, sillas, sombrillas, pizarras y la carta amarilla */
function terrazaLeito(k, palmas) {
  const mesas = [];
  for (let s = 18.1; s < 30.0; s += 2.25) {
    for (const z of [1.2, 2.7, 4.2]) {
      const [x, wz] = F.W(s, z);
      if (palmas.some(([px, pz]) => Math.hypot(px - x, pz - wz) < 1.3)) continue;
      k.table(s, z, { w: 0.7, d: 0.7, h: 0.74, top: 0x3a3d42, leg: 0x8c9096 });
      k.chair(s - 0.6, z, Math.PI / 2, 0xb8bcc2, { legs: 0x8c9096 });
      k.chair(s + 0.6, z, -Math.PI / 2, 0xb8bcc2, { legs: 0x8c9096 });
      k.block(s, z, 0.7, 0.7);
      mesas.push([s, z]);
    }
  }
  for (const s of [19.6, 23.2, 27.6]) sombrilla(k, s, 4.3);
  pizarra(k, 16.3, 0.8);
  pizarra(k, 24.3, 0.6);
  k.cyl(18.6, 0, 0.75, 0.02, 0.02, 1.2, 0x8a8f94, { seg: 5 }).box(18.6, 1.15, 0.75, 0.45, 0.6, 0.03, 0xf0c419);
  return mesas;
}

// la gente comiendo en la terraza del Leito de Proa (sin nombre: no hablan), como en la foto
const CLIENTES = [
  { sex: 'f', skin: 0xe8c4a2, hair: 0x5a3a22, hairStyle: 'ponytail', top: 0xf2f2f0, bottom: 0x2a2f3a, height: 1.64 },
  { sex: 'm', skin: 0xc8916c, hair: 0x2a1d14, hairStyle: 'short', top: 0x2b6cb0, bottom: 0x2b2b30, height: 1.78, beard: true },
  { sex: 'f', skin: 0xd9a882, hair: 0x1e1712, hairStyle: 'bun', top: 0xc0392b, bottom: 0x1d2b44, height: 1.6 },
  { sex: 'm', skin: 0xf1d3b8, hair: 0xb07a3a, hairStyle: 'short', top: 0x3a8a4a, bottom: 0x3a3a40, height: 1.74 },
  { sex: 'm', skin: 0x9a6844, hair: 0x15110e, hairStyle: 'short', top: 0xe8e2d4, bottom: 0x22252a, height: 1.8 },
  { sex: 'f', skin: 0xc28a62, hair: 0x2a1d14, hairStyle: 'ponytail', top: 0x7a6a9a, bottom: 0x1f2a3a, height: 1.66 },
].map(l => ({ eyes: 0x3a2616, topStyle: 'tshirt', bottomStyle: 'pants', shoes: 0x2a2c30, shoeStyle: 'shoe', build: 1, ...l }));
// en qué mesas (por orden) y en qué silla: -1 la de la izquierda, 1 la de la derecha
const SENTADOS = [[0, -1], [0, 1], [4, -1], [7, 1], [9, -1], [9, 1]];

/** los clientes sentados, con el asiento a la altura del suelo que se ve */
function clientes(scene, locales, mesas) {
  if (!locales?.addStreetNpc) return [];
  const sitios = SENTADOS.filter(([m]) => mesas[m]).map(([m, side]) => [mesas[m][0] + side * 0.6, mesas[m][1], side]);
  const lift = sobreSuelo(scene, sitios.map(([s, z]) => F.W(s, z)));
  return sitios.map(([s, z, side], i) => {
    const look = CLIENTES[i % CLIENTES.length];
    // mirando a la mesa: la silla de la izquierda mira a lo largo de la fachada, la de la derecha al revés
    const face = Math.atan2(-side * F.U[0], -side * F.U[1]);
    return locales.addStreetNpc({
      name: '',
      look,
      at: F.W(s, z),
      face,
      pose: 'sit',
      // el asiento de la silla del kit (0,46 m) sobre el suelo que se ve; addStreetNpc ya suma 0,22
      y: lift[i] + 0.46 - 0.93 * look.height / 1.78 - 0.22,
    });
  });
}

/** las mesas blancas de la terraza de al lado de la heladería (en el marco del bloque de Melecón) */
function terrazaHeladeria(k) {
  for (let s = 51.6; s < 57.9; s += 2.0) {
    for (const z of [1.0, 2.3]) {
      k.table(s, z, { w: 0.65, d: 0.65, h: 0.74, top: 0xf2f2ef, leg: 0xe2e2df });
      k.chair(s - 0.55, z, Math.PI / 2, 0xf0f0ed, { legs: 0xdcdcd8 });
      k.chair(s + 0.55, z, -Math.PI / 2, 0xf0f0ed, { legs: 0xdcdcd8 });
      k.block(s, z, 0.65, 0.65);
    }
  }
}

/** la escalera de piedra que baja al Charco, con sus muretes, el pilar y las barandillas de cruces */
function escalera() {
  const { x, z, w, top, fondo, n } = ESCALERA;
  const rise = (top - fondo) / n, run = 0.3, bot = fondo - 0.35, L = run * n;
  const geos = [];
  // las juntas de la piedra, a escala del mundo en cada cara
  const uvMundo = (g) => {
    g.computeVertexNormals();
    const p = g.getAttribute('position'), nrm = g.getAttribute('normal'), uv = g.getAttribute('uv');
    for (let i = 0; i < p.count; i++) {
      const ax = Math.abs(nrm.getX(i)), ay = Math.abs(nrm.getY(i));
      const u = ax > 0.5 ? p.getZ(i) : p.getX(i), v = ay > 0.5 ? p.getZ(i) : p.getY(i);
      uv.setXY(i, u / 1.6, v / 1.6);
    }
    geos.push(g);
  };
  const piedra = (gx, gy, gz, gw, gh, gd) => {
    const g = new THREE.BoxGeometry(gw, gh, gd);
    g.translate(gx, gy + gh / 2, gz);
    uvMundo(g);
  };
  // el rellano de arriba (sobre el saliente del muro) y los peldaños bajando hacia el sur
  piedra(x, bot, z - 0.85, w + 0.8, top - bot, 1.7);
  for (let i = 0; i < n; i++) piedra(x, bot, z + run * (i + 0.5), w, top - rise * (i + 1) - bot, run);
  // los muretes de los lados, en rampa con la escalera (un palmo por encima de los peldaños)
  for (const side of [-1, 1]) {
    const g = new THREE.BoxGeometry(0.4, 1, L);
    const p = g.getAttribute('position');
    for (let i = 0; i < p.count; i++) {
      const t = (p.getZ(i) + L / 2) / L;
      p.setY(i, p.getY(i) > 0 ? top + 0.16 - (top - fondo) * t : bot);
    }
    g.translate(x + side * (w / 2 + 0.2), 0, z + L / 2);
    uvMundo(g);
  }
  // el pilar de la izquierda, arriba
  piedra(x - 1.6, top, z - 0.35, 0.62, 1.1, 0.62);
  const stone = new THREE.Mesh(mergeGeometries(geos, false), new THREE.MeshStandardMaterial({
    map: texturaPiedra(), roughness: 0.95, userData: { terrain: 'level' },
  }));
  stone.castShadow = true;
  stone.receiveShadow = true;
  stone.frustumCulled = false;
  // las barandillas azul claro de cruces, a cada lado de la escalera, por el borde del muro
  const k = new Kit();
  const baranda = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az), ry = Math.atan2(bz - az, bx - ax);
    const ux = (bx - ax) / L, uz = (bz - az) / L, panels = Math.max(1, Math.round(L / 1.0)), pw = L / panels;
    const at = (d) => [ax + ux * d, az + uz * d];
    for (const y of [top + 0.06, top + 0.9]) {
      const [mx, mz] = at(L / 2);
      k.box(mx, y, mz, L, 0.05, 0.05, RAIL, { ry: -ry });
    }
    for (let i = 0; i <= panels; i++) {
      const [px, pz] = at(i * pw);
      k.box(px, top, pz, 0.06, 0.95, 0.06, RAIL);
    }
    // las cruces de cada tramo
    const diag = Math.hypot(pw, 0.84), tilt = Math.atan2(pw, 0.84);
    for (let i = 0; i < panels; i++) {
      const [cx, cz] = at((i + 0.5) * pw);
      for (const sgn of [1, -1]) {
        const g = new THREE.BoxGeometry(0.035, diag, 0.035);
        g.rotateZ(sgn * tilt);
        g.rotateY(-ry);
        g.translate(cx, top + 0.5, cz);
        k.add(g, RAIL);
      }
    }
  };
  // por el borde del saliente del muro: a la izquierda, hacia el noroeste; a la derecha, hacia el este
  baranda(x - 1.95, z - 0.75, x - 4.0, z - 2.0);
  baranda(x + 1.35, z - 0.3, x + 5.2, z - 1.25);
  const { group } = k.build('barandasEscaleraCharco');
  aNivelDelMar(group);
  const out = new THREE.Group();
  out.name = 'escaleraCharco';
  out.add(stone, group);
  return out;
}

/** materiales a nivel del mar (copias: los del kit son de todos) */
function aNivelDelMar(root) {
  const cache = new Map();
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (!cache.has(o.material)) {
      const c = o.material.clone();
      c.userData = { ...c.userData, terrain: 'level' };
      cache.set(o.material, c);
    }
    o.material = cache.get(o.material);
    o.frustumCulled = false;
  });
}

/**
 * sube cada vértice lo que el suelo que se ve queda por encima del relieve en su sitio (sobreSuelo, cada
 * medio metro): en la rampa del paseo hacia el agua, si no, las mesas de la terraza quedaban hundidas
 */
function aRasDelSuelo(scene, root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const c = 0.5, x0 = box.min.x, z0 = box.min.z;
  const nx = Math.ceil((box.max.x - x0) / c) + 2, nz = Math.ceil((box.max.z - z0) / c) + 2;
  const pts = [];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) pts.push([x0 + i * c, z0 + j * c]);
  const L = sobreSuelo(scene, pts);
  const at = (x, z) => {
    const fx = Math.max(0, Math.min(nx - 1.001, (x - x0) / c)), fz = Math.max(0, Math.min(nz - 1.001, (z - z0) / c));
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
    return (L[j * nx + i] * (1 - u) + L[j * nx + i + 1] * u) * (1 - v) + (L[(j + 1) * nx + i] * (1 - u) + L[(j + 1) * nx + i + 1] * u) * v;
  };
  const v = new THREE.Vector3();
  root.traverse((o) => {
    if (!o.isMesh) return;
    const p = o.geometry.getAttribute('position'), inv = o.matrixWorld.clone().invert();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld);
      v.y += at(v.x, v.z);
      v.applyMatrix4(inv);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    p.needsUpdate = true;
    o.geometry.computeBoundingSphere();
  });
}

/** monta un kit en el marco de una fachada y le pone sus choques */
function enMarco(k, M, name, colliders) {
  const { group, segs } = k.build(name);
  group.position.set(M.B[0], 0, M.B[1]);
  group.rotation.y = M.ry;
  for (const [as, az, bs, bz] of segs) colliders?.addSegment(...M.W(as, az), ...M.W(bs, bz));
  return group;
}

/**
 * segunda fase (el suelo grueso ya está hecho, para la terraza, y los locales, para los clientes): las
 * fachadas, las terrazas con su gente y la escalera
 */
export function buildLocalesCharco(scene, colliders, map, locales) {
  if (!map?.localesCharco) return null;
  const group = new THREE.Group();
  group.name = 'localesCharco';
  // las fachadas de la manzana del paseo, la esquina verde y la heladería
  const kF = new Kit();
  edificioGalerias(kF);
  casaPuertas(kF);
  leitoDeProa(kF);
  group.add(enMarco(kF, F, 'fachadasCharcoNorte', colliders));
  const kV = new Kit();
  esquinaVerde(kV);
  group.add(enMarco(kV, F2, 'esquinaPuertasVerdes', colliders));
  const kG = new Kit();
  heladeria(kG);
  group.add(enMarco(kG, G, 'heladeriaAntiu', colliders));
  // las terrazas, a ras del suelo que se ve
  const palmas = [...PALMAS, ...(map._charcoProm?.palms || [])];
  const kT = new Kit();
  const mesas = terrazaLeito(kT, palmas);
  const terraza = enMarco(kT, F, 'terrazaLeitoDeProa', colliders);
  const kH = new Kit();
  terrazaHeladeria(kH);
  const terraza2 = enMarco(kH, G, 'terrazaHeladeria', colliders);
  group.add(terraza, terraza2);
  scene.add(group);
  aRasDelSuelo(scene, terraza);
  aRasDelSuelo(scene, terraza2);
  // la escalera al Charco, a nivel del mar (baja hasta el fango)
  group.add(escalera());
  const gente = clientes(scene, locales, mesas);
  return { group, gente };
}
