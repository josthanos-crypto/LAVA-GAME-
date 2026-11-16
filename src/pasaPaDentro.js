import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alturaBloque } from './edificioReal.js';

/**
 * El Bar Cafetería Pasa Pa Dentro, en la calle Chafaris 9 (Valterra), con la vista de la calle de Google de julio de
 * 2025 (solo se mira, no va dentro del juego; la gente no se pone; Google no tiene fotos suyas): la casa de dos plantas
 * con el bajo color rosado y la planta de arriba blanca con las ventanas de marco marrón; la entrada ancha del bar con
 * la persiana blanca subida y el bar dentro (la nevera azul, los carteles y la barra); delante, la pérgola de hierro
 * negro sin toldo con la barandilla baja y la mesa; al lado, la puerta blanca de cuarterones en punta y la puerta
 * oscura; más allá, la tienda de la puerta de cristal y la ventanita de los carteles; y a los dos lados, las casas
 * viejas encaladas con sus puertas y ventanas verdes. El bar no tiene letrero en la foto y no se le pone. La manzana
 * entera (vista de la calle por Chafaris y por Sevilla) es de casas de una y dos plantas, de unos 6,5 m, y el bloque
 * del mapa la traía a 8 m: se baja a 6,6 m y se pinta de blanco. La casa vieja del sur tiene dos plantas, con el
 * portón y la puerta verdes abajo y las dos contraventanas verdes arriba.
 */

// la cara de la calle Chafaris del bloque (d desde la esquina del norte hacia el sur); la vista de la calle pone la
// entrada del bar en d 5 (Google la pone en d 6,8; el mapa no tenía rótulo suyo)
const M = marco([123.49, -627.21], [107.97, -662.99]);
const L = 39.0;
// el marco va de sur a norte: se pasa de d (desde la esquina del norte) a la medida del marco
const m = d => L - d;
const Z = 0.12, ZF = Z + 0.3, BLANCO = 0xf4f4f0, ROSA = 0xdcc0ac, NEGRO = 0x1e1e20, MARRON = 0x8a4a2a;

/** antes de levantar la ciudad: la marca de que se monta (el mapa no tenía rótulo suyo) y la manzana a su altura */
export function tunePasaPaDentro(map) {
  map.pasaPaDentro = true;
  // la manzana a su altura de verdad (casas de una y dos plantas) y encalada
  alturaBloque(map, ...M.W(m(8), -2), 6.6, [242, 241, 236]);
}

// ——— lo que se pinta en lienzo ———

/** la cal vieja de las casas terreras */
function cal(g, w, h) {
  g.fillStyle = '#f2f2ec';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) {
    g.fillStyle = r() < 0.6 ? 'rgba(200,196,186,.3)' : 'rgba(170,166,156,.2)';
    g.beginPath(); g.ellipse(r() * w, r() * h, 2 + r() * 8, 1 + r() * 4, 0, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = 'rgba(160,150,135,.25)';
  g.fillRect(0, h * 0.9, w, h * 0.1);
}

/** el bar por la entrada: la nevera azul, los carteles de colores, las botellas y la barra */
function bar(g, w, h) {
  g.fillStyle = '#4a4440';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8e4dc';
  g.fillRect(0, 0, w, h * 0.12);
  g.fillStyle = '#3a6ab8';
  g.fillRect(w * 0.62, h * 0.35, w * 0.22, h * 0.45);
  g.fillStyle = '#9ac8e8';
  g.fillRect(w * 0.65, h * 0.4, w * 0.16, h * 0.32);
  for (const [x, y, c] of [[0.1, 0.18, '#e8c84a'], [0.3, 0.2, '#d84a8a'], [0.45, 0.16, '#4ab88a']]) { g.fillStyle = c; g.fillRect(w * x, h * y, w * 0.12, h * 0.16); }
  for (let x = w * 0.08; x < w * 0.55; x += 6) { g.fillStyle = ['#8a5a30', '#2a5a2a', '#c8a050'][Math.round(x) % 3]; g.fillRect(x, h * 0.42, 3, h * 0.08); }
  g.fillStyle = '#6a4a34';
  g.fillRect(0, h * 0.58, w * 0.58, h * 0.3);
  g.fillStyle = '#8a8478';
  g.fillRect(0, h * 0.9, w, h * 0.1);
}

/** la persiana blanca subida, enrollada en su caja */
function persiana(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#d8d8d4';
  for (let y = 4; y < h; y += 6) g.fillRect(0, y, w, 1.5);
}

/** la puerta blanca de cuarterones en punta */
function puertaBlanca(g, w, h) {
  g.fillStyle = '#f4f4f0';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.18)';
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  for (const x0 of [0, w / 2]) {
    g.beginPath(); g.moveTo(x0 + 4, 6); g.lineTo(x0 + w / 4, h * 0.25); g.lineTo(x0 + w / 2 - 4, 6); g.stroke();
    g.beginPath(); g.moveTo(x0 + 4, h * 0.25); g.lineTo(x0 + w / 4, h * 0.5); g.lineTo(x0 + w / 2 - 4, h * 0.25); g.stroke();
    g.beginPath(); g.moveTo(x0 + 4, h - 6); g.lineTo(x0 + w / 4, h * 0.75); g.lineTo(x0 + w / 2 - 4, h - 6); g.stroke();
  }
}

/** la tienda de la puerta de cristal, con las estanterías dentro */
function tienda(g, w, h) {
  g.fillStyle = '#3a3e42';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#8a7a64';
  for (let y = 0.2; y < 0.85; y += 0.16) g.fillRect(w * 0.15, h * y, w * 0.7, 3);
  for (let i = 0; i < 18; i++) { g.fillStyle = ['#c8a050', '#e8e0d0', '#5a6a8a', '#a84a3a'][i % 4]; g.fillRect(w * (0.18 + (i % 6) * 0.11), h * (0.12 + Math.floor(i / 6) * 0.16), w * 0.07, h * 0.07); }
  g.fillStyle = 'rgba(255,255,255,.15)';
  g.fillRect(0, 0, w * 0.35, h);
  g.strokeStyle = '#c8ccd0';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** la ventanita de los carteles pegados */
function ventanita(g, w, h) {
  g.fillStyle = '#3a3e42';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2f2ee';
  g.fillRect(w * 0.5, h * 0.15, w * 0.35, h * 0.7);
  g.fillStyle = '#e8c84a';
  g.fillRect(w * 0.55, h * 0.2, w * 0.25, h * 0.15);
  g.strokeStyle = '#f2f2ee';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** una puerta o ventana verde de tablas */
function verde(g, w, h) {
  g.fillStyle = '#2a7a3a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(0,0,0,.3)';
  g.lineWidth = 2;
  for (let x = 5; x < w; x += 8) { g.beginPath(); g.moveTo(x, 4); g.lineTo(x, h - 4); g.stroke(); }
  g.strokeRect(2, 2, w - 4, h - 4);
}

/** una ventana de arriba con su marco marrón */
function ventanaAlta(g, w, h) {
  g.fillStyle = '#2a2e32';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(200,215,225,.3)';
  g.fillRect(0, 0, w, h * 0.6);
  g.fillStyle = 'rgba(180,200,190,.5)';
  g.fillRect(0, h * 0.6, w, h * 0.4);
  g.strokeStyle = '#8a4a2a';
  g.lineWidth = 7;
  g.strokeRect(3, 3, w - 6, h - 6);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

// ——— las piezas ———

/** una casa vieja encalada de una planta, con sus puertas y ventanas verdes */
function casaVieja(k, d0, d1, alto, huecos) {
  const c = m((d0 + d1) / 2), w = d1 - d0;
  k.box(c, 0, Z + 0.15, w, alto, 0.3, BLANCO);
  k.block(c, Z + 0.15, w, 0.3);
  k.pic(c, alto / 2, ZF + 0.003, w, alto, 0, 1, canvasTex(Math.round(w * 40), Math.round(alto * 40), cal));
  for (const [d, y, ww, hh] of huecos) k.pic(m(d), y, ZF + 0.01, ww, hh, 0, 1, canvasTex(Math.round(ww * 60), Math.round(hh * 60), verde));
}

/** la casa del bar: el bajo rosado, la planta blanca, el bar, las puertas, la tienda y la ventanita */
function casaBar(k) {
  const d0 = 3.4, d1 = 14.6, c = m((d0 + d1) / 2), w = d1 - d0;
  k.box(c, 0, Z + 0.15, w, 6.6, 0.3, BLANCO);
  k.block(c, Z + 0.15, w, 0.3);
  k.box(c, 0, ZF + 0.005, w, 3.2, 0.02, ROSA);
  // la entrada del bar con la persiana subida
  k.pic(m(5.0), 1.15, ZF + 0.01, 1.7, 2.3, 0, 1, canvasTex(170, 230, bar), { glow: 0.2 });
  k.box(m(5.0), 2.3, ZF + 0.02, 1.9, 0.45, 0.12, 0xece8e0);
  k.pic(m(5.0), 2.525, ZF + 0.085, 1.88, 0.43, 0, 1, canvasTex(160, 36, persiana));
  for (const d of [4.1, 5.9]) k.box(m(d), 0, ZF + 0.02, 0.1, 2.75, 0.06, 0xf2f2ee);
  // la puerta blanca en punta, la puerta oscura, la tienda y la ventanita
  k.pic(m(7.3), 1.05, ZF + 0.01, 1.3, 2.1, 0, 1, canvasTex(130, 210, puertaBlanca));
  k.box(m(9.0), 0, ZF + 0.01, 0.9, 2.15, 0.03, 0x3a2a22);
  k.pic(m(11.3), 1.1, ZF + 0.01, 1.4, 2.2, 0, 1, canvasTex(140, 220, tienda), { glow: 0.1 });
  k.box(m(10.4), 1.3, ZF + 0.02, 0.22, 0.28, 0.02, 0xf2f2ee);
  k.pic(m(13.4), 1.45, ZF + 0.01, 1.1, 0.75, 0, 1, canvasTex(110, 75, ventanita));
  // las ventanas de marco marrón de la planta de arriba
  for (const [d, y, ww, hh] of [[5.6, 4.6, 1.6, 1.5], [8.6, 4.8, 0.8, 0.95], [12.4, 5.9, 0.8, 0.35]]) {
    k.pic(m(d), y, ZF + 0.01, ww, hh, 0, 1, canvasTex(Math.round(ww * 70), Math.round(hh * 70), ventanaAlta));
    k.box(m(d), y - hh / 2 - 0.05, ZF + 0.05, ww + 0.2, 0.06, 0.1, MARRON);
  }
}

/** la pérgola de hierro negro de la terraza, con la barandilla baja y la mesa */
function terraza(k) {
  const a = m(3.6), b = m(6.6), z0 = ZF + 0.1, z1 = ZF + 2.6, alto = 2.4, c = (a + b) / 2, zc = (z0 + z1) / 2;
  const w = Math.abs(b - a), d = z1 - z0;
  for (const s of [a, b]) for (const z of [z0, z1]) { k.box(s, 0, z, 0.07, alto, 0.07, NEGRO); k.block(s, z, 0.1, 0.1); }
  for (const z of [z0, z1]) k.box(c, alto, z, w + 0.07, 0.07, 0.07, NEGRO);
  for (const s of [a, b]) k.box(s, alto, zc, 0.07, 0.07, d, NEGRO);
  // la barandilla baja por delante y por el lado del norte (la entrada, por el lado del sur)
  for (const [x0, x1, za, zb] of [[a, b, z1, z1], [a, a, z0 + 0.4, z1]]) {
    const xm = (x0 + x1) / 2, zm = (za + zb) / 2, ww = Math.abs(x1 - x0) + 0.05, dd = Math.abs(zb - za) + 0.05;
    k.box(xm, 0.95, zm, ww, 0.04, dd, NEGRO);
    k.box(xm, 0.1, zm, ww, 0.04, dd, NEGRO);
    const n = Math.round(Math.max(ww, dd) / 0.12);
    for (let i = 0; i <= n; i++) { const t = i / n; k.box(x0 + (x1 - x0) * t, 0.1, za + (zb - za) * t, 0.02, 0.85, 0.02, NEGRO); }
    k.block(xm, zm, ww + 0.05, dd + 0.05);
  }
  k.table(c, zc + 0.3, { w: 0.7, d: 0.7, h: 0.74, top: 0x3a3a3c, leg: NEGRO });
  k.chair(c - 0.5, zc + 0.3, Math.PI / 2, 0x3a3a3c, { legs: NEGRO });
  k.chair(c + 0.5, zc + 0.3, -Math.PI / 2, 0x3a3a3c, { legs: NEGRO });
}

/** se monta con lo demás de Valterra */
export function buildPasaPaDentro(scene, colliders, map) {
  if (!map?.pasaPaDentro) return null;
  const k = new Kit();
  // la casa vieja del norte, con la puerta y la ventana verdes
  casaVieja(k, 0, 3.4, 3.2, [[1.2, 1.05, 0.95, 2.1], [2.7, 1.6, 0.5, 0.5]]);
  casaBar(k);
  terraza(k);
  // la casa vieja del sur, de dos plantas: el portón y la puerta verdes abajo y las dos contraventanas arriba
  casaVieja(k, 14.6, 23.0, 6.6, [[16.0, 0.95, 2.0, 1.9], [17.7, 1.05, 0.7, 2.1], [19.3, 4.6, 0.75, 0.85], [20.7, 4.6, 0.75, 0.85]]);
  const group = enMarco(k, M, 'pasaPaDentro', colliders);
  scene.add(group);
  return { group };
}
