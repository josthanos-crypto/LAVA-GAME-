/**
 * Rasgos de la cara (Version 133). Antes todas las personas tenían la misma cabeza (solo cambiaban el color
 * de piel, el pelo y la barba). Ahora cada una lleva un tipo de cara: ancho de mandíbula, barbilla, pómulos,
 * nariz, labios, ojos y cejas. Los protagonistas tienen la suya, fija; a la gente de la calle le toca una
 * al azar según su aspecto. Todas son inventadas: no retratan a nadie.
 *
 * Valores alrededor de 1 (1 = la cara de siempre). humanHead.js los aplica al modelar la cabeza.
 */

const BASE = {
  mand: 1,     // ancho de la mandíbula
  barb: 1,     // largo de la barbilla
  pom: 1,      // pómulos
  frente: 1,   // alto de la frente
  nariz: 1,    // tamaño de la nariz
  naz: 1,      // ancho de la nariz
  boca: 1,     // ancho de la boca
  labio: 1,    // grosor de los labios
  ojo: 1,      // tamaño de los ojos
  sep: 1,      // separación de los ojos
  ceja: 1,     // grosor de las cejas
  cejaY: 0,    // altura de las cejas (m)
  cejaArco: 1, // cuánto se arquean
};

const tipo = (id, cambios) => ({ ...BASE, ...cambios, id });

// caras de la gente de la calle
const CALLE = [
  tipo('a', {}),
  tipo('b', { mand: 1.08, barb: 1.06, nariz: 1.12, naz: 1.08, ceja: 1.15, labio: 0.9 }),
  tipo('c', { mand: 0.93, barb: 0.95, pom: 1.4, nariz: 0.9, ojo: 1.06, labio: 1.1 }),
  tipo('d', { mand: 1.03, barb: 1.1, frente: 1.04, nariz: 1.05, naz: 0.9, boca: 0.94, sep: 0.97 }),
  tipo('e', { mand: 0.97, pom: 1.2, nariz: 0.95, naz: 1.14, labio: 1.18, boca: 1.05, cejaY: 0.001 }),
  tipo('f', { mand: 1.1, barb: 0.94, nariz: 1.16, ceja: 1.25, cejaY: -0.0012, cejaArco: 0.7, ojo: 0.95 }),
  tipo('g', { mand: 0.9, barb: 1.04, frente: 1.05, nariz: 0.88, naz: 0.92, ojo: 1.08, sep: 1.03, labio: 0.95 }),
  tipo('h', { mand: 1.02, pom: 1.3, nariz: 1.08, naz: 1.1, boca: 1.08, labio: 1.08, ceja: 0.9 }),
];

// las de los protagonistas (cada uno, la suya)
const PROPIAS = {
  // Noah, el surfero: cara larga y afilada, nariz recta, sonrisa ancha
  noah: tipo('noah', { mand: 0.94, barb: 1.1, pom: 1.25, nariz: 1.04, naz: 0.92, boca: 1.1, labio: 0.92, ceja: 0.95, cejaArco: 1.2 }),
  // Michael: mandíbula ancha, cejas rectas y pobladas, nariz fuerte
  michael: tipo('michael', { mand: 1.12, barb: 1.04, frente: 0.98, nariz: 1.14, naz: 1.06, boca: 0.98, labio: 0.86, ojo: 0.96, ceja: 1.3, cejaY: -0.001, cejaArco: 0.6 }),
  // José: cara redonda y amable, nariz ancha, labios llenos
  jose: tipo('jose', { mand: 1.06, barb: 0.92, pom: 1.35, nariz: 1.0, naz: 1.16, boca: 1.04, labio: 1.12, ojo: 1.02, ceja: 1.1 }),
  // Iria: óvalo fino, ojos grandes, cejas altas y arqueadas
  iria: tipo('iria', { mand: 0.9, barb: 0.96, pom: 1.3, frente: 1.03, nariz: 0.86, naz: 0.9, boca: 0.98, labio: 1.15, ojo: 1.12, sep: 1.02, ceja: 0.85, cejaY: 0.0012, cejaArco: 1.3 }),
};

/** el tipo de cara de una persona: o.cara = nombre de protagonista, índice, o nada (sale de su aspecto) */
export function rasgosDe(o) {
  if (typeof o.cara === 'string' && PROPIAS[o.cara]) return PROPIAS[o.cara];
  if (typeof o.cara === 'number') return CALLE[Math.abs(Math.floor(o.cara)) % CALLE.length];
  // sin indicar: una fija para cada combinación de piel, pelo y ropa (así la misma persona no cambia de cara)
  const n = ((o.skin >>> 3) * 7 + (o.hair >>> 2) * 13 + ((o.top ?? 0) >>> 4) * 5 + (o.sex === 'f' ? 3 : 0) + Math.round((o.height || 1.78) * 100)) >>> 0;
  return CALLE[n % CALLE.length];
}
