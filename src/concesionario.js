import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';

/**
 * El concesionario de la entrada a Playa Honda, a pie de la LZ-301 (fotos de Street View de
 * julio de 2025): edificio blanco en la esquina, con dos ventanales oscuros a la carretera,
 * el rótulo «VEHÍCULOS DE OCASIÓN» en dos líneas encima del de la izquierda, el panel
 * «LG AUTOMOCIÓN» en la fachada de la esquina, los escalones del ventanal derecho, la
 * explanada de asfalto con plazas pintadas y dos furgonetas blancas.
 *
 * Colocación (skill `level-design`, medir antes de colocar): calzada de 12 m, acera de 2,2,
 * coche a 50 km/h. La fachada se retira 13 m de la acera —lo justo para la explanada— y el
 * rótulo va a 4,1 m con letras de 0,55 m: se lee a 40 m, lo que se tarda desde la rotonda.
 *
 * Materiales (skill `threejs-materials-lighting`): cristal `MeshStandardMaterial` con
 * metalness 0,9 y roughness 0,06 (recoge el entorno del cielo), blanco rugoso y rótulos de
 * lienzo con `colorSpace = SRGB`, que ya pone `canvasTex`.
 *
 * v77: movido de encima de la LZ-301 a la acera de la Avenida Mamerto Cabrera
 * (sitio aproximado, pendiente de fotos). La explanada y el murete se miden desde FRENTE.
 * Version 132: a su sitio de verdad, el de la ficha de Google Maps de «LG Automoción Lanzarote»
 * (28.95784, −13.58820): la casa de la esquina de la avenida, con la avenida al este y al sur.
 * El bloque genérico del mapa en ese sitio se quita (tuneConcesionario).
 */

const CX = -3727;
const FRENTE = 531, FONDO = 521;      // z de la fachada y del fondo

/** antes de levantar la ciudad: fuera el bloque genérico del mapa donde va el concesionario */
export function tuneConcesionario(map) {
  for (const b of map.buildings || []) {
    if (!b.p) continue;
    let cx = 0, cz = 0;
    for (const q of b.p) { cx += q[0]; cz += q[1]; }
    cx /= b.p.length; cz /= b.p.length;
    if (Math.hypot(cx - CX, cz - (FRENTE + FONDO) / 2) < 8) b.skip = true;
  }
}
const W = 14, ALTO = 5.0;
const BLANCO = 0xf2f0ea, GRIS = 0xb0aca4, NEGRO = 0x181b1e, ASFALTO = 0x3f4044;

/** ventanal oscuro: marco, montantes y el cristal (que se añade aparte, con su material) */
function ventanal(k, x, z, w, h, y = 0.35) {
  k.box(x, y, z + 0.02, w + 0.24, h + 0.14, 0.2, NEGRO, { list: k.shell });
  const n = Math.max(2, Math.round(w / 1.3));
  for (let i = 0; i <= n; i++) k.box(x - w / 2 + (i * w) / n, y, z + 0.13, 0.08, h, 0.06, NEGRO, { list: k.shell });
  return { x, z, w, h, y };
}

/** una furgoneta blanca de reparto, de cajas (los modelos de coche tumban la pestaña aquí) */
function furgoneta(k, x, z) {
  const BLANCO_F = 0xf1f0ec, CRISTAL_F = 0x2f3a42, RUEDA = 0x1b1c1e, Y = 0.18;
  k.box(x, Y + 0.42, z, 2.02, 1.62, 4.9, BLANCO_F, { list: k.shell });
  k.box(x, Y + 0.42, z - 2.75, 1.98, 1.12, 0.9, BLANCO_F, { list: k.shell });
  k.box(x, Y + 1.18, z - 2.34, 1.86, 0.62, 0.06, CRISTAL_F, { list: k.shell });
  for (const sx of [-1, 1]) k.box(x + sx * 1.02, Y + 1.5, z - 0.9, 0.04, 0.55, 1.1, CRISTAL_F, { list: k.shell });
  for (const [sx, sz] of [[-1, 1.45], [1, 1.45], [-1, -2.1], [1, -2.1]]) {
    k.cyl(x + sx * 0.92, Y + 0.34, z + sz, 0.34, 0.34, 0.24, RUEDA, { seg: 12, rx: Math.PI / 2, list: k.shell });
  }
}

export function buildConcesionario(scene, colliders) {
  const k = new Kit();

  // el volumen blanco y su cornisa
  k.box(CX, 0, (FRENTE + FONDO) / 2, W, ALTO, FRENTE - FONDO, BLANCO, { list: k.shell });
  k.box(CX, ALTO, (FRENTE + FONDO) / 2, W + 0.4, 0.35, FRENTE - FONDO + 0.4, 0xe6e4dd, { list: k.shell });
  // el pilar de la esquina, que en la foto sobresale
  k.box(CX + W / 2 - 0.5, 0, FRENTE + 0.25, 1.3, ALTO + 0.15, 0.9, BLANCO, { list: k.shell });

  // los dos ventanales de la fachada de la carretera, separados por un paño blanco
  const izq = ventanal(k, CX - 3.6, FRENTE, 4.6, 3.1);
  const der = ventanal(k, CX + 1.1, FRENTE, 3.0, 2.7, 0.45);

  // el rótulo, en dos líneas, encima del ventanal izquierdo
  k.pic(CX - 3.6, 4.25, FRENTE + 0.22, 5.4, 1.05, 0, 1, canvasTex(640, 128, (g, w, h) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#20242a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(h * 0.33)}px "Barlow Condensed", Arial, sans-serif`;
    g.fillText('VEHÍCULOS', w / 2, h * 0.3);
    g.fillText('DE OCASIÓN', w / 2, h * 0.68);
  }));

  // el panel de la marca en la fachada de la esquina (mira al este, a quien llega)
  k.pic(CX + W / 2 + 0.06, 3.15, (FRENTE + FONDO) / 2, 5.6, 2.3, 1, 0, canvasTex(640, 264, (g, w, h) => {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#141414'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${Math.round(h * 0.42)}px "Arial Black", Arial, sans-serif`;
    g.fillText('LG', w / 2, h * 0.38);
    g.font = `700 ${Math.round(h * 0.15)}px "Barlow Condensed", Arial, sans-serif`;
    g.fillText('AUTOMOCIÓN', w / 2, h * 0.76);
  }));

  // los escalones del ventanal derecho
  for (let i = 0; i < 2; i++) {
    k.box(CX + 1.1, 0.02 + i * 0.15, FRENTE + 0.55 - i * 0.3, 3.6 + i * 0.3, 0.16, 0.7, 0xf4f2ec, { list: k.shell });
  }

  // la marquesina corta sobre el ventanal izquierdo
  k.box(CX - 3.6, 3.75, FRENTE + 0.75, 5.6, 0.22, 1.5, 0xf6f4ee, { list: k.solid });

  // la puerta de taller a la derecha y el zócalo
  k.box(CX + W / 2 - 2.4, 0, FRENTE + 0.03, 2.2, 2.6, 0.1, GRIS, { list: k.shell });
  k.box(CX, 0, FRENTE + 0.04, W, 0.2, 0.1, GRIS, { list: k.shell });

  // la explanada de asfalto (18 cm por encima del suelo: la malla de tierra es gruesa)
  const FX0 = CX - 15, FX1 = CX + 15, FZ0 = FRENTE, FZ1 = FRENTE + 15;
  k.box((FX0 + FX1) / 2, 0.02, (FZ0 + FZ1) / 2, FX1 - FX0, 0.16, FZ1 - FZ0, ASFALTO, { list: k.shell });
  for (let i = 0; i <= 6; i++) {
    const x = CX - 7.5 + i * 2.5;
    k.box(x, 0.2, FZ0 + 2.6, 0.09, 0.02, 4.7, 0xdcdcd6, { list: k.shell });
  }
  k.box(CX - 0.05, 0.2, FZ0 + 4.9, 15.1, 0.02, 0.09, 0xdcdcd6, { list: k.shell });
  k.box((FX0 + FX1) / 2, 0.02, FZ1, FX1 - FX0, 0.3, 0.35, 0xd9d7cf, { list: k.shell });
  k.box(FX0, 0.02, (FZ0 + FZ1) / 2, 0.35, 0.3, FZ1 - FZ0, 0xd9d7cf, { list: k.shell });

  // el murete blanco del oeste, con pilastras
  const MX = FX0 + 0.2;
  const MZ1 = FRENTE + 13;
  k.box(MX, 0, (FZ0 + MZ1) / 2, 0.35, 0.95, MZ1 - FZ0, BLANCO, { list: k.shell });
  for (let z = FZ0 + 0.6; z < MZ1; z += 4.2) k.box(MX, 0, z, 0.55, 1.15, 0.55, BLANCO, { list: k.shell });

  // dos furgonetas: una al oeste del escaparate y otra en la esquina, como en las fotos
  furgoneta(k, CX - 9.2, FZ0 + 3.2);
  furgoneta(k, CX + 10.2, FZ0 + 4.4);

  // el choque: el edificio y el murete (la explanada se pisa)
  k.block(CX, (FRENTE + FONDO) / 2, W, FRENTE - FONDO);
  k.seg(MX, FZ0, MX, MZ1);

  const { group, segs } = k.build('concesionario');

  // los cristales, con su material: es lo que recoge el reflejo del cielo
  const vidrio = new THREE.MeshStandardMaterial({ color: 0x1d2b34, metalness: 0.9, roughness: 0.06, envMapIntensity: 1.1 });
  for (const v of [izq, der]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(v.w - 0.1, v.h - 0.12), vidrio);
    m.position.set(v.x, v.y + v.h / 2, FRENTE + 0.15);
    group.add(m);
  }

  scene.add(group);
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);

  return { group, vans: 2 };
}
