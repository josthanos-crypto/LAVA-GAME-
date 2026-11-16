import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';

/**
 * CASH LEE supermercado en la Avenida Mamerto Cabrera, entre Conforama y la rotonda
 * (foto de referencia: fachada blanca con azulejo azul/red abajo, gran rótulo CASH LEE,
 * escaparates, el letrero "LEE" en azul sobre fondo rojo). Medidas aproximadas:
 * calzada de ~12 m, ancho de fachada ~14 m, altura ~5.5 m.
 * v77: movido de encima de la LZ-301 a la acera de la Avenida (sitio aproximado, pendiente de fotos).
 */

const CX = -3678;      // v77: en la acera de la Avenida Mamerto Cabrera
const FRENTE = 536;    // z del frente (hacia la calzada)
const FONDO = 526;     // z del fondo (hacia la rotonda/parking)
const W = 14;          // ancho de la fachada
const ALTO = 5.5;      // altura de la nave
const BLANCO = 0xf2f0ea;      // blanco paredes
const GRIS_CLARO = 0xd0d0d0;  // gris clarito
const NEGRO = 0x181b1e;       // negro para montantes/ventanales
const CRISTAL = 0x2f3a42;     // cristal oscuro
const AZUL_LEE = 0x0000ff;    // azul para el rótulo "LEE"
const ROJO_LEE = 0xff0000;    // rojo para el fondo "CASH"
const LINEA = 0xe9e7e0;       // linea de pintura

/** un ventanal floor-to-ceiling con marco negro */
function ventanal(k, x, z, w, h, y = 0.4) {
  k.box(x, y, z, w + 0.3, h + 0.2, 0.25, NEGRO, { list: k.shell });
  k.box(x + 0.15, y + 0.1, z + 0.1, w - 0.3, h - 0.2, 0.15, CRISTAL, { list: k.shell });
  const n = Math.max(2, Math.round(w / 1.3));
  for (let i = 1; i < n; i++) {
    k.box(x - w / 2 + (i * w) / n, y, z + 0.13, 0.08, h, 0.06, NEGRO, { list: k.shell });
  }
  return { x, z, w, h, y };
}

/** rótulo CASH LEE en dos líneas */
function rotuloTexto(k, x, z, w, h, texto1, texto2, altoLetra = 0.5) {
  const canvasW = 512;
  const canvasH = 128;
  k.pic(x, z + h - 0.1, w, altoLetra * 2.2, canvasW, canvasH, ROJO_LEE, canvasTex(canvasW, canvasH, (g, cw, ch) => {
    g.fillStyle = '#ffffff';
    g.textBaseline = 'top';
    g.font = `bold ${Math.round(altoLetra * 100)}px Arial`;
    g.fillText(texto1, w * 0.1, h * 0.1);
    g.fillText(texto2, w * 0.1, h * 0.1 + altoLetra * 1.3);
  }));
}

/** CASH LEE con el nombre estilizado */
function cajaSupermercadoLEE(k, x, z, w, h) {
  // base de la caja
  k.box(x, 0.8, z, w, 0.8, 3.5, BLANCO, { list: k.shell });
  // cornisita
  k.box(x, ALTO, z + 3.2, w, 0.3, 0.4, GRIS_CLARO, { list: k.shell });
  // rótulo CASH LEE en la fachada frontal
  rotuloTexto(k, x + 0.5, z + 0.2, w - 1, 0.8, 'CASH', 'LEE', 0.5);
}

/** farola estilo avenida delante del supermercado */
function farolaAV(k, x, z) {
  k.cyl(x, 0, z, 0.1, 0.1, 4.5, 0x5b5f63, { seg: 8 });
  k.block(x, z, 0.2, 0.2);
  k.cyl(x, 4.3, z, 0.15, 0.15, 0.3, 0xffa500, { seg: 8 });
}

export function buildCashLee(scene, colliders) {
  const k = new Kit();

  // volumen blanco de la nave con cornisa
  k.box(CX, 0, (FRENTE + FONDO) / 2, W, ALTO, FRENTE - FONDO, BLANCO, { list: k.shell });
  k.box(CX, ALTO, (FRENTE + FONDO) / 2, W + 0.4, 0.35, FRENTE - FONDO + 0.4, 0xe6e4dd, { list: k.shell });

  // ventanales a lo largo de la fachada de la carretera
  const numVentanales = Math.max(1, Math.round((FRENTE - FONDO) / 7));
  for (let i = 0; i < numVentanales; i++) {
    const zF = FRENTE - i * 7;
    const wV = Math.min(4.5, FRENTE - Math.max(FONDO, zF - 6));
    if (zF > FONDO) ventanal(k, CX - W / 2, zF, wV, 3.2);
  }

  // rótulo CASH LEE en la parte alta de la fachada
  const rotuloY = ALTO - 0.3;
  rotuloTexto(k, CX + 1, (FRENTE + FONDO) / 2, W - 2, 0.8, 'CASH', 'LEE', 0.8);

  // la "caja" CASH LEE delante de la entrada
  cajaSupermercadoLEE(k, CX + 1, (FRENTE + FONDO) / 2 - 1, W - 2, 2.5);

  // farola delante de la entrada
  farolaAV(k, CX + W / 2, (FRENTE + FONDO) / 2 - 0.5);

  // el grupo completo
  const lot = k.build('cashLee');
  scene.add(lot.group);

  // colisión: perímetro del edificio
  for (const sg of lot.segs) colliders.addSegment(...sg);

  console.log('buildCashLee: nave', lot.group.name, 'añadida a la escena');
}
