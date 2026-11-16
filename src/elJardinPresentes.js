import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, ventana, medianera } from './edificioReal.js';

/**
 * La Cafetería El Jardín de los Presentes, en la calle Teruel 25 (la acera de los impares, en la esquina con Parranda
 * de los Buches), con las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; la
 * gente no se pone; Google pone el sitio en la acera de enfrente): la casa blanca de tres plantas altas (11,4 m; el
 * bloque del mapa era de una planta, 4 m) que llega hasta la esquina. En el bajo, el frente del bar con el letrero
 * verde oscuro de «El Jardín de los Presentes» y sus rosas, la puerta de lamas de madera, la repisa de madera con los
 * taburetes y, delante, la terraza con el toldo rojo, los postes negros, los cristales del lado de la esquina y la
 * valla negra de aspas; luego la puerta de madera del portal 25 con el buzón verde, la señal azul de aparcamiento de
 * minusválidos, la ventana de reja negra y la puerta de reja de la Peluquería Raymar con su letrero azul; el zócalo de
 * piedra gris desde la puerta del bar hasta la esquina, y la placa de la calle. Arriba, la ventana con barandilla del
 * lado del bar en cada planta, las ventanitas de la escalera encima del portal y, en el cuerpo que sale un poco de la
 * pared encima de la peluquería, las ventanas grandes de madera oscura con la barandilla baja. Al lado, el solar con
 * el muro blanco a la calle y su puerta de chapa pintarrajeada, la tierra dentro y las paredes lisas de alrededor
 * (antes se veían por dentro las puertas y ventanas del bloque). El mapa no tenía rótulo suyo; salió de la lista de
 * cafeterías de Google.
 */

// la cara de la calle Teruel del bloque, de la esquina de Colombia (s 0) a la de Parranda de los Buches (s 41,6); el
// solar es la muesca del bloque, de s 15,46 a 28,02, y la casa del bar va de ahí a la esquina
const M = marco([-838.17, -177.35], [-876.55, -161.31]);
const Z = 0.12, ZF = Z + 0.3, YP = 3.9, TECHO = 11.4, BLANCO = 0xf2f2ee, MADERA = 0x3a2a22, NEGRO = 0x1c1c1e;
const E0 = 28.02, E1 = 41.6, FONDO = 7.8, MUESCA = 13.94, SALE = 0.12;
const SOLAR0 = 15.46, CUERPO = 35.85;
// la cara de Parranda de los Buches de la misma casa (s 0 en la esquina de Teruel, hacia el sur, hasta el Edificio
// Aurora en s 7,8), con N hacia la calle
const PAR = marco([-876.55, -161.31], [-846.38, -89.09]);

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y la casa a su altura */
export function tuneElJardinPresentes(map) {
  map.jardinPresentes = true;
  alzarEdificio(map, M, E0, E1, FONDO, TECHO, [242, 242, 238]);
}

// ——— lo que se pinta en lienzo ———

/** el letrero verde oscuro con «El Jardín de los Presentes» en letra de mano y las rosas de los lados */
function letrero(g, w, h) {
  g.fillStyle = '#1f3a2a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c9b27a';
  g.lineWidth = 3;
  g.strokeRect(4, 4, w - 8, h - 8);
  const rosa = (x, y, r) => {
    g.fillStyle = '#3e6a34';
    g.beginPath(); g.ellipse(x - r, y + r * 0.6, r * 0.9, r * 0.4, -0.5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + r, y + r * 0.6, r * 0.9, r * 0.4, 0.5, 0, Math.PI * 2); g.fill();
    for (const [c, q] of [['#a8242c', 1], ['#c8343a', 0.7], ['#e05050', 0.4]]) { g.fillStyle = c; g.beginPath(); g.arc(x, y, r * q, 0, Math.PI * 2); g.fill(); }
  };
  rosa(h * 0.45, h * 0.45, h * 0.2);
  rosa(w - h * 0.45, h * 0.45, h * 0.2);
  rosa(w - h * 0.85, h * 0.62, h * 0.14);
  g.fillStyle = '#efe2b8';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.42)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('El Jardín de los Presentes', w / 2, h * 0.52, w - h * 1.8);
}

/** la puerta de lamas de madera oscura del bar, con la señal roja del extintor */
function puertaLamas(g, w, h) {
  g.fillStyle = '#3a2a22';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a1e18';
  for (let y = h * 0.06; y < h * 0.94; y += h / 40) g.fillRect(w * 0.08, y, w * 0.84, h / 80);
  g.strokeStyle = '#4a3628';
  g.lineWidth = w * 0.06;
  g.strokeRect(w * 0.03, w * 0.03, w * 0.94, h - w * 0.06);
  g.fillStyle = '#f4f4f0';
  g.fillRect(w * 0.3, h * 0.12, w * 0.4, h * 0.11);
  g.fillStyle = '#c82a2a';
  g.beginPath(); g.arc(w * 0.5, h * 0.175, w * 0.12, 0, Math.PI * 2); g.fill();
}

/** la puerta de madera oscura del portal 25, con los cuarterones y el arco de arriba */
function puertaPortal(g, w, h) {
  g.fillStyle = '#3a261e';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#25180f';
  g.lineWidth = 5;
  g.beginPath(); g.arc(w / 2, h * 0.2, w * 0.3, Math.PI, 0); g.lineTo(w * 0.8, h * 0.3); g.lineTo(w * 0.2, h * 0.3); g.closePath(); g.stroke();
  for (const y of [0.36, 0.56, 0.76]) for (const x of [0.12, 0.54]) g.strokeRect(w * x, h * y, w * 0.34, h * 0.16);
  g.fillStyle = '#c8a050';
  g.fillRect(w * 0.8, h * 0.52, w * 0.06, h * 0.03);
}

/** las piedras grises del zócalo, puestas en hiladas de piezas largas */
function piedra(g, w, h) {
  g.fillStyle = '#8c8a86';
  g.fillRect(0, 0, w, h);
  let s = 41;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const fila = h / 5;
  for (let y = 0; y < h; y += fila) {
    let x = -r() * 40;
    while (x < w) {
      const l = 30 + r() * 50, v = 110 + Math.floor(r() * 70);
      g.fillStyle = `rgb(${v},${v - 2},${v - 6})`;
      g.fillRect(x + 1, y + 1, l - 2, fila - 2);
      x += l;
    }
  }
}

/** una reja negra de volutas delante del cristal oscuro (la ventana y la puerta de la peluquería) */
function reja(puerta) {
  return (g, w, h) => {
    g.fillStyle = '#2c3036';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(0, 0, w * 0.35, h);
    g.strokeStyle = '#121214';
    g.lineWidth = Math.max(3, w * 0.03);
    g.strokeRect(2, 2, w - 4, h - 4);
    const n = puerta ? 6 : 5;
    for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo((w / n) * i, 0); g.lineTo((w / n) * i, h); g.stroke(); }
    g.lineWidth = Math.max(2, w * 0.018);
    const c = h * (puerta ? 0.4 : 0.5);
    for (const sx of [-1, 1]) {
      g.beginPath(); g.arc(w / 2 + sx * w * 0.14, c, w * 0.12, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(w / 2 + sx * w * 0.14, c - w * 0.2, w * 0.07, 0, Math.PI * 1.5); g.stroke();
      g.beginPath(); g.arc(w / 2 + sx * w * 0.14, c + w * 0.2, w * 0.07, Math.PI, Math.PI * 2.5); g.stroke();
    }
    if (puerta) { g.beginPath(); g.moveTo(0, h * 0.7); g.lineTo(w, h * 0.7); g.stroke(); }
  };
}

/** el letrero azul de la Peluquería Raymar, con las tijeras y el secador */
function letreroPelu(g, w, h) {
  g.fillStyle = '#2a64b0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8eef6';
  g.lineWidth = 2;
  g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#f4f6fa';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.13)}px Arial, sans-serif`;
  g.fillText('PELUQUERÍA', w * 0.55, h * 0.2);
  g.font = `italic 700 ${Math.round(h * 0.4)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.fillText('Raymar', w * 0.52, h * 0.52, w * 0.8);
  // las tijeras y el secador, en blanco, abajo
  g.strokeStyle = '#f4f6fa';
  g.lineWidth = 3;
  g.beginPath(); g.arc(w * 0.16, h * 0.78, h * 0.05, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(w * 0.24, h * 0.8, h * 0.05, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(w * 0.18, h * 0.74); g.lineTo(w * 0.32, h * 0.66); g.moveTo(w * 0.23, h * 0.75); g.lineTo(w * 0.33, h * 0.7); g.stroke();
  g.fillStyle = '#f4f6fa';
  g.fillRect(w * 0.38, h * 0.72, w * 0.12, h * 0.07);
  g.fillRect(w * 0.42, h * 0.78, w * 0.03, h * 0.12);
}

/** la placa de la calle de Parranda de los Buches, en azul sobre blanco */
function placaParranda(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e4a9a';
  g.lineWidth = 4;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#1e4a9a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.18)}px Arial, sans-serif`;
  g.fillText('Calle', w / 2, h * 0.25);
  g.font = `800 ${Math.round(h * 0.22)}px Arial, sans-serif`;
  g.fillText('PARRANDA DE', w / 2, h * 0.52, w * 0.9);
  g.fillText('LOS BUCHES', w / 2, h * 0.78, w * 0.9);
}

/** la placa de la calle: «Calle TERUEL» en azul sobre blanco */
function placa(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#1e4a9a';
  g.lineWidth = 4;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.fillStyle = '#1e4a9a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.2)}px Arial, sans-serif`;
  g.fillText('Calle', w / 2, h * 0.3);
  g.font = `800 ${Math.round(h * 0.36)}px Arial, sans-serif`;
  g.fillText('TERUEL', w / 2, h * 0.66, w * 0.9);
}

/** la señal azul de aparcamiento de minusválidos */
function senalP(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f5fbf';
  g.fillRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `900 ${Math.round(h * 0.6)}px Arial, sans-serif`;
  g.fillText('P', w * 0.42, h * 0.45);
  g.beginPath(); g.arc(w * 0.75, h * 0.62, w * 0.06, 0, Math.PI * 2); g.fill();
  g.lineWidth = 3;
  g.strokeStyle = '#f4f4f0';
  g.beginPath(); g.arc(w * 0.72, h * 0.82, w * 0.09, 0, Math.PI * 2); g.stroke();
}

/** el muro blanco del solar, con las manchas de la humedad, la grieta y dos firmas de pintada */
function muro(g, w, h) {
  g.fillStyle = '#eceae4';
  g.fillRect(0, 0, w, h);
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,140,125,${0.04 + r() * 0.06})`; g.fillRect(r() * w, h * 0.8 + r() * h * 0.2, 20 + r() * 60, 6 + r() * 20); }
  g.fillStyle = 'rgba(150,140,125,.18)';
  g.fillRect(0, h * 0.94, w, h * 0.06);
  g.strokeStyle = 'rgba(110,104,96,.5)';
  g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(w * 0.45, 0); g.lineTo(w * 0.452, h * 0.3); g.lineTo(w * 0.446, h * 0.6); g.stroke();
  const firma = (x, y, c) => {
    g.strokeStyle = c;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x, y);
    for (let i = 0; i < 9; i++) g.quadraticCurveTo(x + i * 9 + 5, y - 20 + r() * 40, x + i * 9 + 9, y + (r() - 0.5) * 16);
    g.stroke();
  };
  firma(w * 0.05, h * 0.62, 'rgba(120,120,128,.8)');
  firma(w * 0.7, h * 0.5, 'rgba(210,180,60,.85)');
}

/** la puerta de chapa gris del solar, llena de pintadas blancas */
function puertaChapa(g, w, h) {
  g.fillStyle = '#55585c';
  g.fillRect(0, 0, w, h);
  let s = 19;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  g.strokeStyle = 'rgba(236,236,232,.85)';
  g.lineWidth = 3;
  for (let j = 0; j < 4; j++) {
    const y = h * (0.15 + j * 0.2);
    g.beginPath(); g.moveTo(w * 0.1, y);
    for (let i = 0; i < 6; i++) g.quadraticCurveTo(w * (0.15 + i * 0.13), y - 15 + r() * 30, w * (0.2 + i * 0.13), y + (r() - 0.5) * 10);
    g.stroke();
  }
}

/** la barandilla negra baja de una ventana: el pasamanos y los barrotes */
function barandilla(k, s, y, w, z) {
  k.box(s, y + 0.62, z + 0.06, w + 0.1, 0.04, 0.05, NEGRO);
  k.box(s, y + 0.02, z + 0.06, w + 0.1, 0.04, 0.05, NEGRO);
  for (let x = s - w / 2; x <= s + w / 2 + 0.01; x += 0.12) k.box(x, y, z + 0.06, 0.02, 0.62, 0.02, NEGRO);
}

// ——— las piezas ———

/** el bajo: el bar, el portal 25, la señal, la ventana de reja y la peluquería */
function bajo(k) {
  const c = (E0 + E1) / 2, L = E1 - E0;
  k.box(c, 0, Z + 0.15, L, YP, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  // el zócalo de piedra gris, de la puerta del bar a la esquina
  k.box(36.6, 0, ZF + 0.01, 10.0, 1.1, 0.02, 0x8c8a86);
  k.pic(36.6, 0.55, ZF + 0.021, 10.0, 1.1, 0, 1, canvasTex(800, 88, piedra));
  // el frente del bar: el bar dentro tras el cristal, el marco verde y el letrero
  k.pic(29.3, 1.22, ZF + 0.01, 2.3, 2.4, 0, 1, canvasTex(230, 240, barDentro), { glow: 0.25 });
  for (const s of [28.12, 29.3, 30.48]) k.box(s, 0, ZF + 0.03, 0.08, 2.45, 0.06, 0x1f3a2a);
  k.box(29.3, 2.42, ZF + 0.03, 2.44, 0.08, 0.06, 0x1f3a2a);
  k.box(29.3, 2.55, ZF + 0.06, 2.62, 0.72, 0.12, 0x1f3a2a);
  k.pic(29.3, 2.91, ZF + 0.121, 2.62, 0.72, 0, 1, canvasTex(420, 116, letrero));
  // la puerta de lamas y la repisa de madera con los dos taburetes
  k.pic(31.15, 1.15, ZF + 0.012, 0.85, 2.3, 0, 1, canvasTex(90, 240, puertaLamas));
  k.box(30.75, 1.02, ZF + 0.18, 0.9, 0.05, 0.36, 0x6a4a32);
  k.box(30.75, 0, ZF + 0.3, 0.06, 1.02, 0.06, 0x4a3424);
  k.stool(30.45, ZF + 0.62, 0x2a1e18, { h: 0.78, top: 0x6a4a32 });
  k.stool(31.05, ZF + 0.62, 0x2a1e18, { h: 0.78, top: 0x6a4a32 });
  // el portal 25: la puerta de madera, el número, el buzón verde y la caja de la luz
  k.pic(33.1, 1.2, ZF + 0.012, 0.95, 2.4, 0, 1, canvasTex(95, 240, puertaPortal));
  k.box(33.1, 2.4, ZF + 0.02, 1.05, 0.06, 0.04, 0xe6e4de);
  k.box(33.1, 2.78, ZF + 0.01, 0.22, 0.14, 0.01, 0x6a5030);
  k.box(32.25, 1.7, ZF + 0.07, 0.32, 0.4, 0.14, 0x3a7a3a);
  k.box(32.3, 0.6, ZF + 0.04, 0.42, 0.45, 0.08, 0xd8d8d4);
  // la ventana de reja negra
  k.pic(37.8, 1.68, ZF + 0.012, 1.4, 1.65, 0, 1, canvasTex(140, 165, reja(false)));
  k.box(37.8, 0.82, ZF + 0.05, 1.55, 0.06, 0.12, 0xe6e4de);
  // la Peluquería Raymar: la puerta de reja, el letrero azul y el piloto de encima
  k.pic(40.45, 1.28, ZF + 0.012, 1.45, 2.55, 0, 1, canvasTex(145, 255, reja(true)));
  k.box(40.45, 2.55, ZF + 0.02, 1.6, 0.07, 0.04, NEGRO);
  k.box(40.4, 3.05, ZF + 0.02, 1.72, 0.86, 0.04, 0x2a64b0);
  k.pic(40.4, 3.48, ZF + 0.041, 1.72, 0.86, 0, 1, canvasTex(260, 130, letreroPelu));
  k.box(40.3, 3.62, ZF + 0.06, 0.18, 0.1, 0.12, 0x5a5a5c);
  // la placa de la calle en la esquina
  k.pic(41.15, 3.22, ZF + 0.02, 0.6, 0.32, 0, 1, canvasTex(150, 80, placa));
  // la señal de aparcamiento de minusválidos, en el bordillo
  k.cyl(35.9, 0, ZF + 0.55, 0.03, 0.03, 2.6, 0x9a9c9e, { seg: 8 });
  k.pic(35.9, 2.3, ZF + 0.58, 0.5, 0.6, 0, 1, canvasTex(100, 120, senalP));
  k.pic(35.9, 2.3, ZF + 0.52, 0.5, 0.6, 0, -1, canvasTex(100, 120, senalP));
  k.block(35.9, ZF + 0.55, 0.08, 0.08);
}

/** las plantas de arriba: las ventanas del lado del bar, las de la escalera, el cuerpo de encima de la peluquería */
function plantas(k) {
  paredAlta(k, E0, CUERPO, YP, TECHO, Z, BLANCO);
  // el cuerpo que sale un poco de la pared, con la moldura de abajo
  const cc = (CUERPO + E1) / 2, cw = E1 - CUERPO;
  k.box(cc, YP, Z + 0.15 + SALE / 2, cw, TECHO - YP, 0.3 + SALE, BLANCO);
  k.box(cc, YP - 0.14, ZF + SALE + 0.04, cw, 0.16, 0.12, 0xe6e4de);
  // la moldura de encima del bajo, por toda la fachada
  k.box((E0 + CUERPO) / 2, YP - 0.1, ZF + 0.03, CUERPO - E0, 0.12, 0.08, 0xe6e4de);
  for (const y of [4.4, 7.8]) {
    // el lado del bar: la ventana de madera oscura con su barandilla
    ventana(k, 29.15, y + 0.6, 1.15, 1.5, Z, { carpinteria: '#2e2622', alfeizar: 0xe6e4de });
    barandilla(k, 29.15, y + 0.6, 1.15, ZF);
    // el lado de la peluquería: la ventana grande de dos hojas con la barandilla baja
    ventana(k, 38.9, y + 0.9, 2.3, 1.9, Z + SALE, { carpinteria: '#2e2622', alfeizar: 0xe6e4de });
    barandilla(k, 38.9, y + 0.9, 2.3, ZF + SALE);
  }
  // las ventanitas de la escalera, encima del portal, a media planta
  for (const y of [4.15, 7.3]) ventana(k, 33.35, y, 0.6, 0.9, Z, { carpinteria: '#2e2622', hojas: 1, alfeizar: 0xe6e4de });
  // el pretil de la azotea con su moldura
  k.box((E0 + CUERPO) / 2, TECHO - 0.28, ZF + 0.04, CUERPO - E0, 0.14, 0.1, 0xe6e4de);
  k.box(cc, TECHO - 0.28, ZF + SALE + 0.04, cw, 0.14, 0.1, 0xe6e4de);
  // la medianera lisa que da al solar (por fuera de la cara del bloque levantado, que el juego pinta con ventanas)
  medianera(k, E0 - 0.07, 0, TECHO, FONDO, Z, 0xeeeeea);
  // lo que queda de la pared del solar detrás de la casa (la parte baja del bloque) y la pared de atrás de la casa
  k.box(E0 - 0.07, 0, -(FONDO + MUESCA) / 2, 0.12, 4.05, MUESCA - FONDO + 0.02, 0xeeeeea);
  k.box((E0 + E1) / 2, 4.0, -FONDO - 0.07, E1 - E0, TECHO - 4.0, 0.12, 0xe8e6e0);
}

/** la terraza delante del bar: el toldo rojo, los postes negros, los cristales del lado de la esquina y la valla */
function terraza(k) {
  const a = 27.5, b = 31.0, fuera = 2.6, zf = ZF + fuera, alto = 2.5;
  const c = (a + b) / 2, W = b - a;
  k.box(c, alto, ZF + fuera / 2, W + 0.1, 0.06, fuera + 0.05, 0x9c3434);
  // el faldón rojo por delante y por los lados
  k.box(c, alto - 0.3, zf + 0.03, W + 0.12, 0.36, 0.03, 0xa83a3a);
  for (const s of [a, b]) k.box(s, alto - 0.3, ZF + fuera / 2, 0.03, 0.36, fuera, 0xa83a3a);
  for (const s of [a, b]) for (const z of [ZF + 0.1, zf]) { k.box(s, 0, z, 0.07, alto, 0.07, NEGRO); k.block(s, z, 0.1, 0.1); }
  // los cristales del lado de la esquina, encima de la valla
  k.box(b, 1.0, ZF + fuera / 2, 0.02, 1.15, fuera - 0.15, 0xcfe0e6, { list: k.glass });
  // la valla negra de aspas, por delante y por los dos lados (con el paso del lado del solar)
  const valla = (s0, z0, s1, z1) => {
    const len = Math.hypot(s1 - s0, z1 - z0), ang = Math.atan2(z1 - z0, s1 - s0), n = Math.max(1, Math.round(len / 1.2));
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, mx = s0 + (s1 - s0) * t, mz = z0 + (z1 - z0) * t, seg = len / n;
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
      r.translate((s0 + s1) / 2, y, (z0 + z1) / 2);
      k.add(r, NEGRO);
    }
    k.block((s0 + s1) / 2, (z0 + z1) / 2, Math.abs(s1 - s0) + 0.1, Math.abs(z1 - z0) + 0.1);
  };
  valla(a, zf, b, zf);
  valla(b, ZF + 0.3, b, zf);
  valla(a, ZF + 1.2, a, zf);
  // las dos mesas con sus sillas de aluminio
  for (const s of [28.4, 30.1]) {
    k.table(s, ZF + 1.4, { w: 0.65, d: 0.65, h: 0.74, top: 0x8a8c8e, leg: 0xb8babc });
    k.chair(s - 0.48, ZF + 1.4, Math.PI / 2, 0xb8babc, { legs: 0xb8babc });
    k.chair(s + 0.48, ZF + 1.4, -Math.PI / 2, 0xb8babc, { legs: 0xb8babc });
  }
}

/** el solar: el muro blanco a la calle con la puerta de chapa, la tierra y las paredes lisas de alrededor */
function solar(k) {
  const c = (SOLAR0 + E0) / 2, L = E0 - SOLAR0;
  k.box(c, 0, Z + 0.12, L, 3.4, 0.24, 0xeceae4);
  k.block(c, Z + 0.12, L, 0.24);
  k.pic(c, 1.7, Z + 0.241, L, 3.4, 0, 1, canvasTex(Math.round(L * 40), 136, muro));
  k.box(c, 3.4, Z + 0.12, L + 0.02, 0.06, 0.3, 0xe2e0da);
  k.pic(26.7, 1.08, Z + 0.252, 0.88, 2.15, 0, 1, canvasTex(88, 215, puertaChapa));
  k.box(26.7, 2.15, Z + 0.25, 1.0, 0.05, 0.03, 0x45484c);
  // la tierra de dentro
  k.box(c, 0, Z - 8, L, 0.04, 16, 0x9c8a70);
  for (const [s, z, w] of [[18.2, -4, 0.5], [22.5, -9.5, 0.7], [25.4, -3.2, 0.4], [20.1, -12.6, 0.9]]) k.box(s, 0, z, w, w * 0.35, w * 0.8, 0xa8a094);
  // la pared lisa del lado de Colombia (la casa vecina) y la de detrás, con el tubo de chapa de la chimenea
  medianera(k, SOLAR0 + 0.07, 0, 4.05, 15.94, Z, 0xe4e0d8);
  const fondo = new THREE.BoxGeometry(12.75, 4.6, 0.14);
  fondo.translate(0, 2.3, 0);
  fondo.rotateY(-Math.atan2(2.0, 12.59));
  fondo.translate(21.75, 0, -14.94 + 0.1);
  k.add(fondo, 0xe8e6e0);
  k.cyl(25.0, 4.6, -13.75, 0.09, 0.09, 2.2, 0xa8aaac, { seg: 10 });
  k.cyl(25.0, 6.8, -13.75, 0.14, 0.1, 0.25, 0x9a9c9e, { seg: 10 });
}

/**
 * la cara de Parranda de los Buches (vista de la calle de julio de 2025): el zócalo de piedra gris, las dos ventanas
 * de reja negra y entre ellas la otra puerta de reja de la Peluquería Raymar con su letrero azul, la placa de la
 * calle en la esquina; arriba, el cuerpo que sale un poco de la pared en la esquina con una ventana en cada planta, y
 * los dos balconcitos curvos de barandilla negra con su puerta
 */
function parranda(k) {
  const L = FONDO;
  k.box(L / 2, 0, Z + 0.15, L, TECHO, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.box(L / 2, 0, ZF + 0.01, L, 1.1, 0.02, 0x8c8a86);
  k.pic(L / 2, 0.55, ZF + 0.021, L, 1.1, 0, 1, canvasTex(Math.round(L * 80), 88, piedra));
  for (const s of [2.5, 6.6]) {
    k.pic(s, 1.75, ZF + 0.012, 1.05, 1.15, 0, 1, canvasTex(105, 115, reja(false)));
    k.box(s, 1.13, ZF + 0.05, 1.2, 0.06, 0.12, 0xe6e4de);
  }
  k.pic(5.4, 1.15, ZF + 0.012, 0.85, 2.3, 0, 1, canvasTex(85, 230, reja(true)));
  k.box(5.4, 2.3, ZF + 0.02, 0.95, 0.06, 0.04, NEGRO);
  k.box(5.4, 2.5, ZF + 0.02, 0.85, 0.46, 0.04, 0x2a64b0);
  k.pic(5.4, 2.73, ZF + 0.041, 0.85, 0.46, 0, 1, canvasTex(170, 92, letreroPelu));
  k.pic(0.9, 2.6, ZF + 0.02, 0.5, 0.32, 0, 1, canvasTex(150, 96, placaParranda));
  // el cuerpo de la esquina, que sale un poco, con su moldura y una ventana con barandilla baja en cada planta
  k.box(2.15, YP, Z + 0.15 + SALE / 2, 4.3, TECHO - YP, 0.3 + SALE, BLANCO);
  k.box(2.15, YP - 0.14, ZF + SALE + 0.04, 4.3, 0.16, 0.12, 0xe6e4de);
  for (const y of [4.4, 7.8]) {
    ventana(k, 2.5, y + 0.95, 1.0, 1.0, Z + SALE, { carpinteria: '#2e2622', alfeizar: 0xe6e4de });
    barandilla(k, 2.5, y + 0.95, 1.0, ZF + SALE);
    // el balconcito curvo de barandilla negra con la puerta de madera detrás
    ventana(k, 5.4, y + 0.3, 0.75, 2.1, Z, { carpinteria: '#3a2a20', hojas: 1, alfeizar: 0xe6e4de });
    k.cyl(5.4, y + 0.2, ZF, 0.62, 0.62, 0.12, 0xe6e4de, { seg: 18 });
    for (let a = 0; a <= Math.PI; a += Math.PI / 10) k.box(5.4 + Math.cos(a) * 0.55, y + 0.32, ZF + Math.sin(a) * 0.55, 0.025, 0.9, 0.025, NEGRO);
    for (const h of [0.34, 1.2]) for (let a = 0; a < Math.PI; a += Math.PI / 10) {
      const b = a + Math.PI / 20;
      k.box(5.4 + Math.cos(b) * 0.55, y + h, ZF + Math.sin(b) * 0.55, 0.03, 0.03, 0.18, NEGRO, { ry: -b });
    }
  }
  k.box(L / 2, TECHO - 0.28, ZF + 0.04, L, 0.14, 0.1, 0xe6e4de);
}

/** se monta con lo demás de Arrecife Centro */
export function buildElJardinPresentes(scene, colliders, map) {
  if (!map?.jardinPresentes) return null;
  const k = new Kit();
  bajo(k);
  plantas(k);
  terraza(k);
  solar(k);
  const group = enMarco(k, M, 'elJardinPresentes', colliders);
  scene.add(group);
  const kp = new Kit();
  parranda(kp);
  const gp = enMarco(kp, PAR, 'elJardinPresentesParranda', colliders);
  scene.add(gp);
  return { group, parranda: gp };
}
