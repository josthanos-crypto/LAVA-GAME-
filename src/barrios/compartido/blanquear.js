/**
 * Segunda fila de casas: los edificios genéricos que quedan detrás de las casas hechas calle a calle (kitCalles.js) se pintan
 * con el color de fachada del barrio, para que no desentonen. Solo toca los genéricos de la caja que no llevan color propio,
 * ni modelo propio, ni rótulo de negocio.
 */

const centro = (p) => {
  let sx = 0, sz = 0;
  for (const q of p) { sx += q[0]; sz += q[1]; }
  return [sx / p.length, sz / p.length];
};

export function blanquear(map, caja, { f = [243, 241, 236], c = null } = {}) {
  if (!Array.isArray(map?.buildings)) return 0;
  let n = 0;
  for (const b of map.buildings) {
    if (b.k !== 'gen' || b.altavistaCalle || b.skip || b.ownFront || b.ownRoof || b.edificioReal || b.s || b.f) continue;
    if (!Array.isArray(b.p) || !b.p.length) continue;
    const [x, z] = centro(b.p);
    if (x < caja.x0 || x > caja.x1 || z < caja.z0 || z > caja.z1) continue;
    b.f = f;
    if (c && !b.c) b.c = c;
    n++;
  }
  return n;
}
