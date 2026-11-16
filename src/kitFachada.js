import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Ayudas para las fachadas largas hechas con el Kit (hospital, Palacio de Deportes...).
 */

/** una pieza larga partida en trozos de `paso` m, para que cada trozo siga el relieve como las piezas cortas */
export function tira(k, s0, s1, y, z, h, d, hex, list = k.shell, paso = 5) {
  const n = Math.max(1, Math.ceil((s1 - s0) / paso)), w = (s1 - s0) / n;
  for (let i = 0; i < n; i++) k.box(s0 + w * (i + 0.5), y, z, w + 0.02, h, d, hex, { list });
}

/** un lienzo que se repite a lo largo de la fachada, en trozos de `paso` m (también siguen el relieve) */
export function lienzoCorrido(k, s0, s1, y0, y1, z, tex, paso = 5) {
  const n = Math.max(1, Math.ceil((s1 - s0) / paso)), w = (s1 - s0) / n;
  for (let i = 0; i < n; i++) k.pic(s0 + w * (i + 0.5), (y0 + y1) / 2, z, w + 0.01, y1 - y0, 0, 1, tex);
}

/** los planos que comparten lienzo van en una sola pieza (menos trabajo para el móvil) */
export function juntarLienzos(k) {
  const porLienzo = new Map();
  for (const p of k.pics) {
    const clave = `${p.tex.uuid}|${p.glow}`;
    if (!porLienzo.has(clave)) porLienzo.set(clave, { tex: p.tex, glow: p.glow, geos: [] });
    porLienzo.get(clave).geos.push(p.geo.index ? p.geo.toNonIndexed() : p.geo);
  }
  k.pics = [...porLienzo.values()].map(({ tex, glow, geos }) => ({ tex, glow, geo: geos.length > 1 ? mergeGeometries(geos, false) : geos[0] }));
}
