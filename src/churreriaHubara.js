import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { alzarEdificio, cristales, medianera } from './edificioReal.js';

/**
 * La Churrería Hubara Cafetería, en la calle Triana 78, cerca de la esquina con Teruel y Garajonay, con las vistas de
 * la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la gente no se pone). El edificio entero,
 * desde la esquina hasta el paso de los pilares: moderno, el bajo y tres plantas (13 m; el bloque del mapa era de
 * 9,3 m), forrado de placas color beis gris con un tramo color salmón; en la primera y la segunda planta, los balcones
 * de cristal con el pasamanos de acero (algunos con el toldo rojo recogido) y las ventanas de marco oscuro; en la
 * tercera, los cajones que salen por encima de cada balcón. El bajo es de granito negro, con la plataforma un poco
 * más alta que la acera y su barandilla de tubos de acero: a la izquierda, la tienda de congelados 5 Océanos con su
 * banda azul (sin el dibujo del logotipo); en medio, la Churrería Hubara con el letrero rojo de «CHURRERÍA HUBARA
 * CAFETERÍA», la taza y el tenedor dibujados, los dos faldoncitos rojos de encima de los escaparates, la puerta de
 * lamas de madera y los escaparates de marco de madera con los cartelitos; y a la derecha, el pilar de piedra con su
 * remate en punta del paso de entrada. El mapa no tenía rótulo suyo; salió de la lista de churrerías de Google.
 */

// la cara de Triana del bloque, de la esquina de Teruel (s 0) hacia el este, con N hacia la calle
const M = marco([-947.61, -83.47], [-864.28, -21.43]);
const Z = 0.12, ZF = Z + 0.3, YB = 4.4, TECHO = 13.0, BEIS = 0xc4b8a8, SALMON = 0xd8a07a, GRANITO = 0x2a2a2c;
const E0 = 0, E1 = 27, FONDO = 14;
// los balcones de cristal de la primera y la segunda planta (de s a s), con el cajón de la tercera encima
const BALCONES = [[0.6, 4.6], [5.2, 6.4], [7.4, 11.4], [12.0, 17.4], [17.6, 18.7], [20.0, 20.8], [21.8, 25.9]];
const TOLDOS = [[7.4, 11.4, 2], [12.0, 17.4, 1], [17.6, 18.7, 1]];

/** antes de levantar la ciudad: la marca de que se monta y el edificio a su altura */
export function tuneChurreriaHubara(map) {
  map.churreriaHubara = true;
  alzarEdificio(map, M, E0, E1, FONDO, TECHO, [196, 184, 168]);
}

// ——— lo que se pinta en lienzo ———

/** las placas de la fachada, beis gris o salmón, con sus juntas */
function placas(color) {
  return (g, w, h) => {
    g.fillStyle = color;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,70,60,.25)';
    g.lineWidth = 1;
    for (let y = 0; y < h; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let x = 0; x < w; x += 46) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  };
}

/** el granito negro del bajo, con sus motas */
function granito(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  let s = 31;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 40; i++) { g.fillStyle = r() < 0.5 ? 'rgba(90,90,96,.5)' : 'rgba(10,10,12,.5)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  g.strokeStyle = 'rgba(0,0,0,.4)';
  for (let x = 0; x < w; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el letrero rojo de «CHURRERÍA HUBARA CAFETERÍA», con la taza y el tenedor */
function letreroHubara(g, w, h) {
  g.fillStyle = '#b02a2a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f0d8b0';
  g.lineWidth = 3;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillStyle = '#f4e4c4';
  g.font = `800 ${Math.round(h * 0.42)}px "Arial Black", Arial, sans-serif`;
  g.fillText('CHURRERÍA', w * 0.12, h * 0.55, w * 0.2);
  g.fillText('CAFETERÍA', w * 0.88, h * 0.55, w * 0.2);
  g.font = `900 ${Math.round(h * 0.72)}px Georgia, serif`;
  g.lineWidth = 4;
  g.strokeStyle = '#6a1414';
  g.strokeText('HUBARA', w * 0.5, h * 0.55, w * 0.4);
  g.fillText('HUBARA', w * 0.5, h * 0.55, w * 0.4);
  // la taza y el tenedor, en círculos color crema
  for (const [x, dibujo] of [[0.25, 'taza'], [0.75, 'tenedor']]) {
    const cx = w * x, cy = h * 0.5, r = h * 0.36;
    g.fillStyle = '#f4e4c4';
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a1e1e';
    if (dibujo === 'taza') {
      g.fillRect(cx - r * 0.45, cy - r * 0.3, r * 0.75, r * 0.65);
      g.lineWidth = 3; g.strokeStyle = '#8a1e1e';
      g.beginPath(); g.arc(cx + r * 0.35, cy, r * 0.2, -Math.PI / 2, Math.PI / 2); g.stroke();
    } else {
      g.fillRect(cx - r * 0.35, cy - r * 0.6, r * 0.12, r * 1.2);
      for (const dx of [0.1, 0.25, 0.4]) g.fillRect(cx + r * dx, cy - r * 0.6, r * 0.07, r * 0.5);
      g.fillRect(cx + r * 0.2, cy - r * 0.15, r * 0.12, r * 0.75);
    }
  }
}

/** la banda azul de 5 Océanos, sin el dibujo del logotipo */
function letreroOceanos(g, w, h) {
  g.fillStyle = '#1e3a9a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f4f0';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  for (const x of [0.25, 0.75]) {
    g.font = `800 ${Math.round(h * 0.5)}px Arial, sans-serif`;
    g.fillText('5 OCÉANOS', w * x, h * 0.42, w * 0.3);
    g.font = `600 ${Math.round(h * 0.16)}px Arial, sans-serif`;
    g.fillText('BOUTIQUE DE CONGELADOS', w * x, h * 0.8, w * 0.3);
  }
  g.strokeStyle = '#a8d0f4';
  g.lineWidth = 3;
  for (const x of [0.47, 0.97]) {
    const cx = w * x, cy = h * 0.5, r = h * 0.28;
    for (let a = 0; a < 3; a++) { const t = (a * Math.PI) / 3; g.beginPath(); g.moveTo(cx - Math.cos(t) * r, cy - Math.sin(t) * r); g.lineTo(cx + Math.cos(t) * r, cy + Math.sin(t) * r); g.stroke(); }
  }
}

/** el faldoncito rojo de encima de un escaparate, con las ondas blancas */
function faldon(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.fillStyle = '#b02a2a';
  g.fillRect(0, 0, w, h * 0.6);
  for (let x = 0; x < w; x += 20) { g.beginPath(); g.arc(x + 10, h * 0.6, 10, 0, Math.PI); g.fill(); }
  g.fillStyle = '#f4f0e8';
  g.fillRect(0, h * 0.2, w, h * 0.08);
}

/** un escaparate de marco de madera, con los cartelitos pegados y la sala detrás */
function escaparateMadera(g, w, h) {
  barDentro(g, w, h);
  g.fillStyle = 'rgba(230,236,240,.25)';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(250,250,245,.8)';
  for (const [x, y] of [[0.15, 0.3], [0.55, 0.25], [0.35, 0.55]]) g.fillRect(w * x, h * y, w * 0.12, h * 0.15);
  g.strokeStyle = '#6a4a30';
  g.lineWidth = 6;
  g.strokeRect(3, 3, w - 6, h - 6);
  for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo((w / 3) * i, 0); g.lineTo((w / 3) * i, h); g.stroke(); }
}

/** el escaparate de los congelados: los arcones y las neveras detrás del cristal */
function escaparateFrio(g, w, h) {
  g.fillStyle = '#3a4a58';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8e4ec';
  g.fillRect(0, h * 0.62, w, h * 0.18);
  g.fillStyle = '#9ab4c8';
  for (let x = 0; x < w; x += w / 5) g.fillRect(x + 4, h * 0.2, w / 5 - 8, h * 0.35);
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w * 0.3, h);
}

/** la puerta de lamas de madera de la churrería */
function puertaLamas(g, w, h) {
  g.fillStyle = '#6a4a30';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a3220';
  for (let y = 6; y < h - 4; y += 8) g.fillRect(6, y, w - 12, 3);
  g.strokeStyle = '#5a3e28';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

// ——— las piezas ———

/** las paredes: el granito del bajo, las placas de arriba con el tramo salmón, la cornisa y las paredes lisas */
function paredes(k) {
  const c = (E0 + E1) / 2, L = E1 - E0;
  k.box(c, 0, Z + 0.15, L, TECHO, 0.3, BEIS);
  k.block(c, Z + 0.15, L, 0.3);
  k.pic(c, YB / 2, ZF + 0.004, L, YB, 0, 1, canvasTex(Math.round(L * 30), 132, granito));
  k.pic(c, (YB + TECHO) / 2, ZF + 0.004, L, TECHO - YB, 0, 1, canvasTex(Math.round(L * 30), 260, placas('#c4b8a8')));
  k.pic(21.0, (YB + TECHO - 2.6) / 2, ZF + 0.006, 3.4, TECHO - 2.6 - YB, 0, 1, canvasTex(100, 180, placas('#d8a07a')));
  k.box(c, YB - 0.05, ZF + 0.08, L, 0.12, 0.16, 0x1a1a1c);
  k.box(c, TECHO - 0.12, ZF + 0.06, L + 0.1, 0.12, 0.14, 0xb8ac9c);
  // las paredes lisas por encima del bloque de al lado y la de detrás
  medianera(k, E1 + 0.07, 9.0, TECHO, FONDO, Z, 0xc8bcac);
  k.box(c, 9.0, -FONDO - 0.07, L, TECHO - 9.0, 0.12, 0xc8bcac);
}

/** las plantas: los balcones de cristal con las ventanas detrás, los toldos rojos y los cajones de arriba */
function plantas(k) {
  for (const [s0, s1] of BALCONES) {
    const c = (s0 + s1) / 2, w = s1 - s0;
    for (const y of [YB + 0.2, YB + 3.2]) {
      // la ventana o puertaventana de marco oscuro y la losa del balcón con el cristal delante
      k.pic(c, y + 1.2, ZF + 0.008, w - 0.2, 2.3, 0, 1, canvasTex(Math.round(w * 40), 92, cristales('#3a3a3c', Math.max(2, Math.round(w / 1.2)), 'rgba(220,214,204,.5)')));
      k.box(c, y - 0.05, ZF + 0.55, w + 0.1, 0.18, 1.1, 0xb8ac9c);
      k.box(c, y + 0.13, ZF + 1.08, w, 0.95, 0.02, 0x9ab8c0, { list: k.glass });
      for (const t of [s0 + 0.02, s1 - 0.02]) k.box(t, y + 0.13, ZF + 0.55, 0.02, 0.95, 1.06, 0x9ab8c0, { list: k.glass });
      k.box(c, y + 1.08, ZF + 1.08, w + 0.04, 0.04, 0.05, 0xb8bcc0);
    }
    // el cajón de la tercera planta, que sale por encima del balcón
    k.box(c, TECHO - 2.4, ZF + 0.6, w + 0.3, 2.4, 1.2, BEIS);
    k.pic(c, TECHO - 1.2, ZF + 1.205, w + 0.3, 2.4, 0, 1, canvasTex(Math.round(w * 30), 72, placas('#c4b8a8')));
    k.pic(c, TECHO - 3.0, ZF + 0.008, w - 0.3, 1.0, 0, 1, canvasTex(Math.round(w * 40), 40, cristales('#3a3a3c', 2, 'rgba(220,214,204,.4)')));
  }
  // los toldos rojos recogidos de algunos balcones
  for (const [s0, s1, n] of TOLDOS) for (let i = 0; i < n; i++) {
    const y = YB + 2.55 + i * 3.0;
    k.box((s0 + s1) / 2, y, ZF + 0.25, s1 - s0, 0.18, 0.35, 0xc04030);
  }
}

/** el bajo: la plataforma con la barandilla, 5 Océanos, la Churrería Hubara y el pilar del paso */
function bajo(k) {
  // la plataforma un poco más alta que la acera, con el bordillo de granito y la barandilla de tubos
  k.box(13.5, 0, ZF + 0.85, 26.4, 0.4, 1.7, 0x6a6a6c);
  for (const [a, b] of [[0.4, 12.6], [14.9, 26.2]]) {
    for (const y of [0.75, 1.0, 1.25]) k.box((a + b) / 2, y, ZF + 1.68, b - a, 0.035, 0.035, 0xc8ccd0);
    for (let s = a; s <= b + 0.01; s += 2.1) k.box(s, 0.4, ZF + 1.68, 0.05, 0.9, 0.05, 0xc8ccd0);
    k.block((a + b) / 2, ZF + 1.68, b - a, 0.1);
  }
  for (const s of [12.6, 14.9]) k.box(s, 0, ZF + 1.6, 0.4, 1.0, 0.4, GRANITO);
  // 5 Océanos: la banda azul y los escaparates con los arcones de los congelados
  k.box(6.6, 3.55, ZF + 0.06, 12.4, 0.6, 0.1, 0x1e3a9a);
  k.pic(6.6, 3.85, ZF + 0.111, 12.4, 0.6, 0, 1, canvasTex(1000, 48, letreroOceanos));
  for (const s of [2.6, 6.6, 10.6]) k.pic(s, 1.85, ZF + 0.012, 3.6, 2.6, 0, 1, canvasTex(220, 160, escaparateFrio));
  // la Churrería Hubara: el letrero rojo, los faldoncitos, la puerta de lamas y los escaparates de madera
  k.box(18.5, 3.55, ZF + 0.08, 10.2, 0.62, 0.14, 0xb02a2a);
  k.pic(18.5, 3.86, ZF + 0.151, 10.2, 0.62, 0, 1, canvasTex(1000, 60, letreroHubara));
  k.pic(14.3, 1.55, ZF + 0.012, 1.15, 2.3, 0, 1, canvasTex(70, 140, puertaLamas));
  k.pic(16.4, 1.75, ZF + 0.012, 2.8, 2.5, 0, 1, canvasTex(210, 190, escaparateMadera), { glow: 0.15 });
  k.pic(21.5, 1.75, ZF + 0.012, 4.2, 2.5, 0, 1, canvasTex(300, 180, escaparateMadera), { glow: 0.15 });
  for (const [c, w] of [[16.4, 3.0], [21.5, 4.4]]) k.pic(c, 3.07, ZF + 0.2, w, 0.3, 0, 1, canvasTex(Math.round(w * 40), 16, faldon));
  for (const [c, w] of [[16.4, 3.0], [21.5, 4.4]]) k.box(c, 3.2, ZF + 0.1, w, 0.05, 0.25, 0xb02a2a);
  // el pilar de piedra del paso de entrada, con su remate en punta
  k.box(26.5, 0, ZF + 0.5, 0.9, 5.2, 0.9, 0xb8a080);
  k.box(26.5, 0, ZF + 0.5, 0.95, 1.0, 0.95, GRANITO);
  k.cyl(26.5, 5.2, ZF + 0.5, 0.0, 0.66, 0.8, 0x3a3a3c, { seg: 4, ry: Math.PI / 4 });
  k.block(26.5, ZF + 0.5, 0.9, 0.9);
}

/** se monta con lo demás de Arrecife Centro */
export function buildChurreriaHubara(scene, colliders, map) {
  if (!map?.churreriaHubara) return null;
  const k = new Kit();
  paredes(k);
  plantas(k);
  bajo(k);
  const group = enMarco(k, M, 'churreriaHubara', colliders);
  scene.add(group);
  return { group };
}
