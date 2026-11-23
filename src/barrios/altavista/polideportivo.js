/**
 * El edificio de la piscina del Parque Deportivo Municipal Puerto del Arrecife (rotonda de la Rambla Medular con León
 * y Castillo, enfrente del Open Mall): beis con la franja de ventanas azules, como en las vistas de la calle. Por
 * dentro lo monta ../../localesPolideportivo.js.
 */

const CENTRO = [234, -739];

export function tunePolideportivo(map) {
  const b = map.buildings.find((q) => {
    const n = q.p.length;
    const cx = q.p.reduce((s, p) => s + p[0], 0) / n, cz = q.p.reduce((s, p) => s + p[1], 0) / n;
    return Math.hypot(cx - CENTRO[0], cz - CENTRO[1]) < 6;
  });
  if (!b) return;
  b.f = [226, 214, 190];
  b.h = 8;
  b.polideportivo = true;
}
