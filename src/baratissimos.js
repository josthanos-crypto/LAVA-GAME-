import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';

/**
 * Fashion BARATISSIMOS en la Avenida Mamerto Cabrera, tras CASH LEE
 * (foto de referencia: fachada blanca con détail en rosa/pastel, gran rótulo "BARATISSIMOS",
 * logotipo de panda blanco y negro, ventanales estrechos). Medidas aproximadas:
 * ancho de fachada ~12 m, altura ~5.2 m.
 * v77: movido de encima de la LZ-301 a la acera de la Avenida (sitio aproximado, pendiente de fotos).
 */

const BX = -3653;      // v77: en la acera de la Avenida Mamerto Cabrera
const FRENTE = 540;    // z del frente (hacia la calzada)
const FONDO = 530;     // z del fondo
const W = 12;          // ancho de la fachada (un poco más estrecho)
const ALTO = 5.2;      // altura de la nave
const BLANCO = 0xf5e0dc;    // blanco muy cálido (parece pintado a mano)
const ROSA = 0xffc8dd;      // rosa pastel para detalhes
const NEGRO = 0x181b1e;     // negro para montantes
const MORADO = 0x9c27b0;    // morado/borde del rótulo
const AMARILLO = 0xffeb3b;  // amarillo para acentos
const LINEA = 0xe9e7e0;

/** ventanal estrecho de moda */
function ventanalModa(k, x, z, w, h, y = 0.35) {
  k.box(x, y, z, w + 0.2, h + 0.1, 0.2, NEGRO, { list: k.shell });
  k.box(x + 0.1, y + 0.05, z + 0.05, w - 0.2, h - 0.1, 0.1, MORADO, { list: k.shell });
  // divisiones cada 1.5 m
  const n = Math.max(2, Math.round(w / 1.5));
  for (let i = 1; i < n; i++) {
    k.box(x - w / 2 + (i * w) / n, y, z + 0.05, 0.06, h, 0.04, NEGRO, { list: k.shell });
  }
  return { x, z, w, h, y };
}

/** rótulo BARATISSIMOS con panda */
function rotuloPanda(k, x, z, w, h) {
  const canvasW = 512;
  const canvasH = 128;
  k.pic(x, z + h - 0.1, w, 1.0, canvasW, canvasH, MORADO, canvasTex(canvasW, canvasH, (g, cw, ch) => {
    g.fillStyle = '#ffffff';
    g.textBaseline = 'top';
    g.font = 'bold 72px Arial';
    // "BARATISSIMOS" en letras grandes
    g.fillText('BARATISSIMOS', w * 0.1, h * 0.15);
    // panda pequeño abajo a la derecha
    g.fillStyle = '#000000';
    g.fillRect(w * 0.7, h * 0.7, 32, 32);  // cabeza del panda
    g.fillStyle = '#ffffff';
    g.fillRect(w * 0.72, h * 0.74, 8, 8);  // ojo izquierdo
    g.fillRect(w * 0.78, h * 0.74, 8, 8);  // ojo derecho
    g.fillRect(w * 0.7, h * 0.82, 12, 6);  // naríz
  }));
}

/** tienda Fashion BARATISSIMOS */
function tiendaFashion(k, x, z, w, h) {
  // base de la tienda
  k.box(x, 0.8, z, w, 0.8, 3.0, BLANCO, { list: k.shell });
  // cornisita rosa
  k.box(x, ALTO, z + 2.8, w, 0.25, 0.3, ROSA, { list: k.shell });
  // rótulo con panda
  rotuloPanda(k, x + 0.5, z + 0.2, w - 1, 0.7);
}

export function buildBaratissimos(scene, colliders) {
  const k = new Kit();

  // volumen blanco/rosado de la nave con cornisa
  k.box(BX, 0, (FRENTE + FONDO) / 2, W, ALTO, FRENTE - FONDO, BLANCO, { list: k.shell });
  k.box(BX, ALTO, (FRENTE + FONDO) / 2, W + 0.3, 0.3, FRENTE - FONDO + 0.3, ROSA, { list: k.shell });

  // ventanales estrechos de moda a lo largo de la fachada
  const numVentanales = Math.max(1, Math.round((FRENTE - FONDO) / 5));
  for (let i = 0; i < numVentanales; i++) {
    const zF = FRENTE - i * 5;
    const wV = Math.min(3.0, FRENTE - Math.max(FONDO, zF - 4));
    if (zF > FONDO) ventanalModa(k, BX - W / 2 + 0.5, zF, wV, 2.8);
  }

  // rótulo BARATISSIMOS con panda
  rotuloPanda(k, BX + 1, (FRENTE + FONDO) / 2, W - 2, 0.8);

  // la tienda Fashion
  tiendaFashion(k, BX + 1, (FRENTE + FONDO) / 2 - 0.5, W - 2, 2.0);

  // farola diferente (más estilizada)
  k.cyl(BX + W / 2, 0, (FRENTE + FONDO) / 2 - 0.5, 0.08, 0.08, 4.0, 0xff69b4, { seg: 10 });
  k.block(BX + W / 2, 3.8, (FRENTE + FONDO) / 2 - 0.5, 0.15, 0.15, 0.2);

  // el grupo completo
  const lot = k.build('baratissimos');
  scene.add(lot.group);

  // colisión: perímetro del edificio
  for (const sg of lot.segs) colliders.addSegment(...sg);

  console.log('buildBaratissimos: nave', lot.group.name, 'añadida a la escena');
}
