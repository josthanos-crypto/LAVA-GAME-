import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barDentro } from './restaurantesCharco.js';
import { alzarEdificio, alturaBloque, cristales, medianera } from './edificioReal.js';

/**
 * La manzana de la Rambla Medular 40, en la acera norte, entre Senador Rafael Stinga y Doctor Juan Negrín (enfrente
 * del Kokoxili), con la foto aérea y las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del
 * juego; la gente no se pone). El mapa la tenía como un bloque gris de 6 m; de verdad son tres edificios de oficinas y
 * locales de bajo y una planta alta: a la izquierda, el blanco del Restaurante Gopi, con las letras doradas de «GOPI»,
 * los letreritos de «HAMBURGUESERÍA» y «PIZZERÍA», el toldo granate corrido de «RESTAURANTE GOPI», y los otros locales
 * de cristal (la inmobiliaria y la academia, sin sus letreros de marca); en medio, el de ladrillo gris oscuro con el
 * soportal del bajo, la banda negra del letrero (sin la marca de la agencia) y la franja de lamas blancas de arriba; y
 * a la derecha, otro blanco con la entrada de cristal de las oficinas hasta la esquina redonda de Juan Negrín. Arriba,
 * en los blancos, las ventanas altas de lamas grises.
 */

// la cara de la Rambla del bloque del mapa, de la esquina de Rafael Stinga (s 0) a la de Juan Negrín, N hacia la calle
const M = marco([-846.2, -382.3], [-784.6, -398.8]);
const Z = 0.12, ZF = Z + 0.3, YB = 3.6, TECHO = 8.0, BLANCO = 0xf2f0ec, LADRILLO = 0x4a4c50;
const OSC0 = 34.4, OSC1 = 44.7;

/** antes de levantar la ciudad: el bloque a la altura de los edificios blancos y, en medio, el de ladrillo */
export function tuneRamblaMedular40(map) {
  map.ramblaMedular40 = true;
  const p = M.W(10, -5);
  alturaBloque(map, p[0], p[1], TECHO, [242, 240, 236]);
  alzarEdificio(map, M, OSC0, OSC1, 14, 8.8, [74, 76, 80]);
}

// ——— lo que se pinta en lienzo ———

/** las lamas grises de las ventanas altas */
function lamas(g, w, h) {
  g.fillStyle = '#3a3c3e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a9c9a';
  for (let y = 3; y < h - 2; y += 7) g.fillRect(4, y, w - 8, 4);
  g.strokeStyle = '#7a7c7a';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** el ladrillo gris oscuro */
function ladrillo(g, w, h) {
  g.fillStyle = '#4a4c50';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let y = 0, f = 0; y < h; y += 8, f++) {
    for (let x = f % 2 ? -12 : 0; x < w; x += 24) {
      const v = 60 + Math.floor(r() * 26);
      g.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
      g.fillRect(x + 1, y + 1, 22, 6);
    }
  }
}

/** la franja de lamas blancas del edificio de ladrillo */
function lamasBlancas(g, w, h) {
  g.fillStyle = '#2a2c30';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e8e4';
  for (let y = 2; y < h; y += 6) g.fillRect(0, y, w, 3);
  g.fillStyle = '#4a4c50';
  for (let x = 0; x < w; x += w / 6) g.fillRect(x, 0, 5, h);
}

/** un local de cristal con el marco gris: vacío, con carteles o con la oficina dentro */
function local(tipo) {
  return (g, w, h) => {
    g.fillStyle = '#3a4650';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.14)';
    g.fillRect(0, 0, w * 0.3, h);
    if (tipo === 1) { g.fillStyle = '#f4f2ee'; g.fillRect(w * 0.6, h * 0.15, w * 0.3, h * 0.7); g.fillStyle = '#e06a2a'; g.fillRect(w * 0.62, h * 0.4, w * 0.26, h * 0.4); }
    if (tipo === 2) { g.fillStyle = '#e8e4dc'; g.fillRect(0, h * 0.75, w, h * 0.25); }
    g.strokeStyle = '#8a8c8a';
    g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
    for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo((w / 3) * i, 0); g.lineTo((w / 3) * i, h); g.stroke(); }
  };
}

/** las letras doradas de «GOPI» */
function gopi(g, w, h) {
  g.fillStyle = '#f2f0ec';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c89a3a';
  g.strokeStyle = '#6a4a1a';
  g.lineWidth = 3;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 900 ${Math.round(h * 0.85)}px Georgia, serif`;
  g.strokeText('GOPI', w / 2, h * 0.55);
  g.fillText('GOPI', w / 2, h * 0.55);
}

/** un letrerito rojo sobre blanco (hamburguesería, pizzería) */
function rotulito(texto) {
  return (g, w, h) => {
    g.fillStyle = '#f2f0ec';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#b02a2a';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `800 ${Math.round(h * 0.7)}px Arial, sans-serif`;
    g.fillText(texto, w / 2, h * 0.55, w * 0.95);
  };
}

/** el toldo granate de «RESTAURANTE GOPI» */
function toldo(g, w, h) {
  g.fillStyle = '#6a2228';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4ece0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `800 ${Math.round(h * 0.5)}px Arial, sans-serif`;
  for (const x of [0.3, 0.8]) g.fillText('RESTAURANTE GOPI', w * x, h * 0.55, w * 0.4);
}

// ——— las piezas ———

/** los edificios blancos: la pared, la cornisa del bajo, los locales y las ventanas de lamas de arriba */
function blanco(k, s0, s1, locales) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, TECHO, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  k.box(c, YB - 0.15, ZF + 0.12, L, 0.2, 0.3, 0xdcdad4);
  for (const [a, b, t] of locales) k.pic((a + b) / 2, 0.15 + (YB - 0.4) / 2, ZF + 0.012, b - a - 0.2, YB - 0.4, 0, 1, canvasTex(Math.round((b - a) * 40), 130, t === 'bar' ? barDentro : local(t)), { glow: t === 'bar' ? 0.2 : 0 });
  for (let s = s0 + 2.2; s < s1 - 1; s += 4.4) k.pic(s, YB + 2.0, ZF + 0.012, 1.4, 2.4, 0, 1, canvasTex(56, 96, lamas));
  k.box(c, TECHO - 0.15, ZF + 0.04, L, 0.15, 0.08, 0xdcdad4);
}

/** el de ladrillo oscuro: el soportal, la banda negra del letrero y la franja de lamas blancas */
function oscuro(k) {
  const c = (OSC0 + OSC1) / 2, L = OSC1 - OSC0, TE = 8.8;
  k.box(c, YB, Z + 0.15, L, TE - YB, 0.3, LADRILLO);
  k.pic(c, (YB + TE) / 2, ZF + 0.004, L, TE - YB, 0, 1, canvasTex(Math.round(L * 30), 160, ladrillo));
  k.pic(c, YB + 2.4, ZF + 0.01, L - 1.0, 1.6, 0, 1, canvasTex(Math.round(L * 30), 50, lamasBlancas));
  // el soportal: los cristales del fondo, los pilares grises delante con el techo y la banda negra del letrero
  k.pic(c, (YB - 0.8) / 2, ZF + 0.01, L, YB - 0.8, 0, 1, canvasTex(Math.round(L * 30), 100, local(2)));
  k.box(c, 0, ZF + 0.9, L, 0.02, 1.8, 0xb8b4ac);
  for (let s = OSC0 + 0.3; s <= OSC1 - 0.2; s += (L - 0.6) / 3) { k.box(s, 0, ZF + 1.6, 0.5, YB - 0.8, 0.5, 0x8a8c8e); k.block(s, ZF + 1.6, 0.5, 0.5); }
  k.box(c, YB - 0.8, ZF + 0.9, L, 0.8, 1.9, 0x1a1a1c);
  medianera(k, OSC0 - 0.07, TECHO, TE, 14, Z, 0x5a5c60);
  medianera(k, OSC1 + 0.07, TECHO, TE, 14, Z, 0x5a5c60);
}

/** el Restaurante Gopi: las letras, los letreritos y el toldo granate */
function restaurante(k, a, b) {
  const c = (a + b) / 2;
  k.pic(a + 1.6, YB + 0.6, ZF + 0.02, 2.6, 0.9, 0, 1, canvasTex(260, 90, gopi));
  k.pic(c + 1.2, YB + 0.85, ZF + 0.02, 2.6, 0.3, 0, 1, canvasTex(260, 30, rotulito('HAMBURGUESERÍA')));
  k.pic(b - 1.0, YB + 0.5, ZF + 0.02, 1.6, 0.3, 0, 1, canvasTex(160, 30, rotulito('PIZZERÍA')));
  k.box(c, YB - 0.6, ZF + 0.6, b - a, 0.06, 1.2, 0x6a2228);
  k.pic(c, YB - 0.85, ZF + 1.21, b - a, 0.5, 0, 1, canvasTex(Math.round((b - a) * 40), 40, toldo));
}

/** se monta con lo demás de Arrecife Centro */
export function buildRamblaMedular40(scene, colliders, map) {
  if (!map?.ramblaMedular40) return null;
  const k = new Kit();
  blanco(k, 0, OSC0, [[0.2, 9.5, 2], [9.5, 13.0, 0], [13.0, 17.5, 1], [17.5, 26.5, 'bar'], [26.5, OSC0, 0]]);
  restaurante(k, 17.5, 26.5);
  oscuro(k);
  blanco(k, OSC1, M.len, [[OSC1, 52, 2], [52, 57, 0], [57, M.len - 0.5, 2]]);
  k.cyl(M.len, 0, -0.6, 0.9, 0.9, TECHO, BLANCO, { seg: 18 });
  const group = enMarco(k, M, 'ramblaMedular40', colliders);
  scene.add(group);
  return { group };
}
