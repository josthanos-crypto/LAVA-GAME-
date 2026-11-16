import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque, ventana as ventanaAlta } from './edificioReal.js';

/**
 * Ali's Kebab (Valterra), en la esquina de la calle La Rosa con Tarragona, con la vista de la calle de Google de julio
 * de 2025 (solo se mira, no va dentro del juego; la gente no se pone; Google lo pone en el solar de enfrente y solo
 * tiene fotos de dentro y de los platos): el bajo del edificio alto de granito gris, con la franja de granito negro
 * abajo; las dos ventanas del local con el cristal de arriba y los carteles de los platos abajo (aquí con colores, sin
 * las fotos); la rejilla blanca del aire; las dos ventanas redondas; el farol de pared; el letrero de bandera blanco de
 * «DONER KEBAB» con el asador dibujado en la esquina; las ventanitas de lamas y el portón blanco del garaje; y encima
 * los voladizos color crema de los balcones de rejas negras. Encima, el edificio de verdad (vista de la calle mirando
 * hacia arriba): el bajo y tres plantas (13,4 m; el bloque del mapa lo traía a 18,6), la esquina de granito gris de
 * arriba abajo con sus tres ventanas redondas, los dos cuerpos color crema que salen un poco, con dos balcones de
 * hierro negro por planta, sus cornisas y el remate de balaustres de la azotea, y la franja de granito de en medio.
 */

// la cara de la calle Tarragona del edificio alto (d desde la esquina de La Rosa hacia el sur); la vista de la calle
// pone las dos ventanas del local en d 3,3 y 5,5 (el mapa no tenía rótulo suyo)
const M = marco([293.36, -354.62], [322.26, -282.3]);
const L = 77.88;
// el marco va de sur a norte: se pasa de d (desde la esquina) a la medida del marco
const m = d => L - d;
const Z = 0.12, ZF = Z + 0.3, GRIS = 0x8e8c88, CREMA = 0xe2d4b8;
// el edificio de verdad: el bajo (4,2 m) y tres plantas de 2,9 m, con la azotea a 13,4 m
const ALTO = 13.4, PLANTAS = [4.4, 7.3, 10.2], CUERPOS = [[3.4, 7.3], [8.0, 12.5]];

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y la manzana a su altura */
export function tuneAlisKebab(map) {
  map.alisKebab = true;
  // la manzana a su altura de verdad (bajo y tres plantas) y con el crema de las fachadas de la calle
  alturaBloque(map, ...M.W(m(6), -4), ALTO, [226, 212, 186]);
}

// ——— lo que se pinta en lienzo ———

/** el granito gris moteado con las líneas de las placas */
function granito(g, w, h) {
  g.fillStyle = '#8e8c88';
  g.fillRect(0, 0, w, h);
  let s = 29;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 25; i++) { g.fillStyle = r() < 0.5 ? 'rgba(50,50,50,.35)' : 'rgba(220,220,215,.35)'; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  g.strokeStyle = 'rgba(60,60,58,.5)';
  g.lineWidth = 1;
  for (let y = 0; y < h; y += h / 8) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** el granito negro brillante de la franja de abajo */
function negro(g, w, h) {
  g.fillStyle = '#2a2a2c';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(160,170,180,.12)';
  g.fillRect(0, h * 0.2, w, h * 0.35);
  g.strokeStyle = 'rgba(120,120,125,.45)';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += h / 3) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += h / 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** una ventana del local: el cristal de arriba con el salón dentro y el cartel de los platos abajo */
function ventana(tono) {
  return (g, w, h) => {
    g.fillStyle = '#f2f2ee';
    g.fillRect(0, 0, w, h);
    // el cristal de arriba, con el techo y las luces del salón
    g.fillStyle = '#5a5e60';
    g.fillRect(w * 0.06, h * 0.03, w * 0.88, h * 0.4);
    g.fillStyle = '#d8d0b0';
    g.fillRect(w * 0.06, h * 0.03, w * 0.88, h * 0.08);
    g.fillStyle = '#c8d830';
    g.fillRect(w * 0.12, h * 0.15, w * 0.1, h * 0.25);
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.fillRect(w * 0.06, h * 0.03, w * 0.35, h * 0.4);
    g.strokeStyle = '#f2f2ee';
    g.lineWidth = 4;
    g.beginPath(); g.moveTo(w / 2, h * 0.03); g.lineTo(w / 2, h * 0.43); g.stroke();
    // la franja clara de en medio con la pegatina naranja redonda
    g.fillStyle = '#c8ccc8';
    g.fillRect(w * 0.06, h * 0.45, w * 0.88, h * 0.1);
    g.fillStyle = '#e87a2a';
    g.beginPath(); g.arc(w * 0.5, h * 0.5, h * 0.035, 0, Math.PI * 2); g.fill();
    // el cartel de abajo: los platos, con colores
    g.fillStyle = tono;
    g.fillRect(w * 0.06, h * 0.58, w * 0.88, h * 0.39);
    let s = tono.length * 7;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 9; i++) {
      g.fillStyle = ['#e8c070', '#c86a3a', '#f2e0a8', '#6a9a3a', '#8a4a2a'][i % 5];
      g.beginPath(); g.ellipse(w * (0.15 + r() * 0.7), h * (0.63 + r() * 0.3), w * (0.08 + r() * 0.08), h * (0.03 + r() * 0.04), r() * 3, 0, Math.PI * 2); g.fill();
    }
  };
}

/** la rejilla blanca de lamas del aire */
function rejilla(g, w, h) {
  g.fillStyle = '#ecece8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#b8b8b4';
  for (let y = 5; y < h - 3; y += 7) g.fillRect(4, y, w - 8, 2);
  g.fillRect(w / 2 - 1, 0, 2, h);
}

/** el letrero de bandera de «DONER KEBAB» con el asador */
function doner(g, w, h) {
  g.fillStyle = '#f6f4ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8282a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.11)}px Georgia, serif`;
  g.fillText('DONER', w / 2, h * 0.1, w * 0.9);
  g.fillText('KEBAB', w / 2, h * 0.9, w * 0.9);
  // el asador: la carne en cono, dorada, con su pincho
  g.fillStyle = '#6a6a6a';
  g.fillRect(w / 2 - 2, h * 0.18, 4, h * 0.62);
  g.fillStyle = '#c8822a';
  g.beginPath(); g.moveTo(w * 0.28, h * 0.24); g.lineTo(w * 0.72, h * 0.24); g.lineTo(w * 0.6, h * 0.72); g.lineTo(w * 0.4, h * 0.72); g.closePath(); g.fill();
  g.strokeStyle = '#8a4a1a';
  g.lineWidth = 2;
  for (let y = 0.3; y < 0.7; y += 0.06) { g.beginPath(); g.moveTo(w * 0.3, h * y); g.lineTo(w * 0.7, h * y); g.stroke(); }
  g.fillStyle = '#e83a1a';
  for (const x of [0.38, 0.5, 0.62]) { g.beginPath(); g.moveTo(w * (x - 0.06), h * 0.8); g.quadraticCurveTo(w * x, h * 0.66, w * (x + 0.06), h * 0.8); g.fill(); }
  g.strokeStyle = '#b8b8b4';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** el portón blanco del garaje */
function garaje(g, w, h) {
  g.fillStyle = '#ecece6';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.12)';
  g.lineWidth = 1;
  for (let y = 6; y < h; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

// ——— las piezas ———

/** un ojo de buey con su marco blanco */
function redonda(k, d, y, r) {
  k.cyl(m(d), y, ZF + 0.0, r + 0.07, r + 0.07, 0.1, 0xf2f2ee, { seg: 20, rx: Math.PI / 2 });
  k.cyl(m(d), y, ZF + 0.03, r, r, 0.1, 0x4a5a66, { seg: 20, rx: Math.PI / 2 });
}

/** el bajo del edificio y la esquina: el granito, la franja negra, las ventanas, la rejilla, el letrero y el garaje */
function fachada(k) {
  const d0 = -0.2, d1 = 12.5, c = m((d0 + d1) / 2), Lf = d1 - d0;
  k.box(c, 0, Z + 0.15, Lf, ALTO, 0.3, GRIS);
  k.block(c, Z + 0.15, Lf, 0.3);
  k.pic(c, ALTO / 2, ZF + 0.003, Lf, ALTO, 0, 1, canvasTex(760, 800, granito));
  k.pic(c, 0.95, ZF + 0.006, Lf, 1.9, 0, 1, canvasTex(760, 114, negro));
  // la rejilla del aire, abajo junto a la esquina
  k.pic(m(1.6), 0.95, ZF + 0.012, 1.15, 0.65, 0, 1, canvasTex(110, 62, rejilla));
  // las dos ventanas del local
  for (const [d, tono] of [[3.3, '#4a3a2a'], [5.5, '#3a3a2a']]) {
    k.box(m(d), 0.9, ZF + 0.03, 1.55, 2.95, 0.06, 0xf2f2ee);
    k.pic(m(d), 2.375, ZF + 0.065, 1.45, 2.85, 0, 1, canvasTex(140, 280, ventana(tono)), { glow: 0.15 });
  }
  // las tres ventanas redondas de la esquina, el farol y el letrero de bandera
  for (const y of [3.9, 7.2, 10.3]) redonda(k, 1.6, y, 0.32);
  k.box(m(2.35), 3.25, ZF + 0.12, 0.2, 0.42, 0.2, 0x2a2a2c);
  k.box(m(2.35), 3.35, ZF + 0.12, 0.14, 0.24, 0.14, 0xf2e8c8, { list: k.glow });
  k.box(m(0.3), 3.0, ZF + 0.55, 0.1, 1.15, 0.65, 0xf6f4ee);
  k.pic(m(0.3) + 0.055, 3.575, ZF + 0.55, 0.63, 1.13, 1, 0, canvasTex(110, 200, doner));
  k.pic(m(0.3) - 0.055, 3.575, ZF + 0.55, 0.63, 1.13, -1, 0, canvasTex(110, 200, doner));
  k.box(m(0.3), 4.2, ZF + 0.12, 0.05, 0.05, 0.4, 0x6a6a6a);
  // las ventanitas de lamas y el portón del garaje
  for (const d of [8.3, 8.9, 9.5]) k.pic(m(d), 3.0, ZF + 0.012, 0.45, 0.6, 0, 1, canvasTex(40, 54, rejilla));
  k.pic(m(10.8), 1.25, ZF + 0.012, 2.6, 2.5, 0, 1, canvasTex(240, 230, garaje));
}

/** un balcón de hierro negro delante de una puertaventana */
function balconHierro(k, d, y) {
  const s = m(d), z = ZF + 0.42;
  k.box(s, y - 0.08, ZF + 0.3, 1.2, 0.1, 0.3, 0xd8cab0);
  for (const yy of [y + 0.02, y + 0.95]) k.box(s, yy, z, 1.15, 0.04, 0.04, 0x1e1e20);
  for (let t = -0.55; t <= 0.551; t += 0.1) k.box(s + t, y + 0.02, z, 0.02, 0.93, 0.02, 0x1e1e20);
  for (const t of [-0.575, 0.575]) k.box(s + t, y + 0.02, ZF + 0.31, 0.03, 0.95, 0.22, 0x1e1e20);
}

/** los dos cuerpos crema de las plantas de arriba con sus balcones, las cornisas y el remate de la azotea */
function plantas(k) {
  for (const [a, b] of CUERPOS) {
    const cc = m((a + b) / 2), w = b - a;
    // el cuerpo crema, que sale un poco del granito, y el voladizo de la primera planta
    k.box(cc, 4.2, ZF + 0.08, w, ALTO - 4.2 - 0.3, 0.16, CREMA);
    k.box(cc, 3.95, ZF + 0.4, w + 0.2, 0.3, 0.8, CREMA);
    k.box(cc, 3.85, ZF + 0.45, w + 0.3, 0.1, 0.9, 0xd8cab0);
    // las puertaventanas con su balcón de hierro, dos por planta
    for (const y of PLANTAS) for (const d of [a + w * 0.28, b - w * 0.28]) {
      ventanaAlta(k, m(d), y + 0.1, 0.85, 1.85, Z + 0.16, { carpinteria: '#f4f2ec' });
      balconHierro(k, d, y + 0.1);
    }
    // las cornisas entre plantas y la de arriba
    for (const y of [7.15, 10.05]) k.box(cc, y, ZF + 0.2, w + 0.1, 0.12, 0.2, 0xd8cab0);
    k.box(cc, ALTO - 0.3, ZF + 0.22, w + 0.3, 0.3, 0.3, 0xd8cab0);
    // el remate de la azotea: los pilarcitos y los balaustres
    k.box(cc, ALTO, ZF + 0.05, w, 0.12, 0.25, 0xe8dcc4);
    k.box(cc, ALTO + 0.85, ZF + 0.05, w, 0.1, 0.28, 0xe8dcc4);
    for (const d of [a + 0.15, a + w / 2, b - 0.15]) k.box(m(d), ALTO, ZF + 0.05, 0.3, 0.95, 0.3, 0xe8dcc4);
    for (let d = a + 0.4; d < b - 0.3; d += 0.18) k.cyl(m(d), ALTO + 0.12, ZF + 0.05, 0.04, 0.06, 0.73, 0x2a2a2c, { seg: 6 });
  }
  // el pretil de granito de la esquina y de la franja de en medio
  k.box(m(1.6), ALTO, Z + 0.15, 3.8, 0.6, 0.3, GRIS);
  k.box(m(7.65), ALTO, Z + 0.15, 0.7, 0.6, 0.3, GRIS);
}

/** se monta con lo demás de Valterra */
export function buildAlisKebab(scene, colliders, map) {
  if (!map?.alisKebab) return null;
  const k = new Kit();
  fachada(k);
  plantas(k);
  const group = enMarco(k, M, 'alisKebab', colliders);
  scene.add(group);
  return { group };
}
