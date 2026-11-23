/**
 * Pone boca arriba los triángulos de una malla plana que han quedado del revés (Version 134).
 *
 * Las calzadas se hacen siguiendo la línea de cada calle; en las curvas cerradas y en las bocas de las rotondas
 * (las del Cabildo, la subida a San Francisco Javier) algún triángulo sale girado al revés. La tarjeta gráfica no
 * pinta lo que mira hacia abajo, así que quedaba un agujero con forma de cuña y por él asomaba la foto aérea como
 * una mancha gris borrosa encima del asfalto.
 *
 * La geometría tiene que venir sin índices (tres vértices seguidos por triángulo). Devuelve cuántos ha girado.
 */
export function caraArriba(geometry) {
  if (geometry.index) return 0;
  const pos = geometry.getAttribute('position');
  if (!pos) return 0;
  const P = pos.array;
  const otros = Object.values(geometry.attributes).filter(a => a !== pos && !a.isInterleavedBufferAttribute);
  const nor = geometry.getAttribute('normal');
  let girados = 0;
  for (let i = 0; i + 8 < P.length; i += 9) {
    // la componente vertical del producto de los dos lados: negativa = mira hacia abajo
    const ny = (P[i + 5] - P[i + 2]) * (P[i + 6] - P[i]) - (P[i + 3] - P[i]) * (P[i + 8] - P[i + 2]);
    if (ny >= 0) continue;
    // se cambian el segundo y el tercer vértice (con todo lo que llevan: posición, textura, normal...)
    const v = i / 3;
    for (const a of [pos, ...otros]) {
      const n = a.itemSize, A = a.array;
      for (let k = 0; k < n; k++) { const t = A[(v + 1) * n + k]; A[(v + 1) * n + k] = A[(v + 2) * n + k]; A[(v + 2) * n + k] = t; }
    }
    if (nor) for (let k = 0; k < 3; k++) { const j = (v + k) * 3; nor.array[j] = -nor.array[j]; nor.array[j + 1] = -nor.array[j + 1]; nor.array[j + 2] = -nor.array[j + 2]; }
    girados++;
  }
  if (girados) for (const a of [pos, ...otros]) a.needsUpdate = true;
  return girados;
}
