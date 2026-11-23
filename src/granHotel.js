import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, barra } from './restaurantesCharco.js';

/**
 * El Arrecife Gran Hotel & Spa, la torre de 17 plantas del Reducto (Parque Islas Canarias), con las fotos de
 * internet de Google Maps (las de los 360° de 2018 y las del hotel; solo se miran, no van dentro del juego).
 * El mapa ya trae la torre (62 m, la planta en cruz con las esquinas metidas) y el zócalo de dos plantas.
 * La torre del juego se pintaba por encima de cualquier piel que se le pusiera, así que se esconden sus
 * paredes (solo se dejan de ver: siguen chocando como antes) y se pone la piel de las fotos con su azotea:
 *  - la torre: cristal verde azulado con la rejilla de las plantas, los chaflanes de las esquinas blancos y
 *    dos franjas blancas de arriba abajo en cada cara, como en las fotos (va por el contorno de fuera de la
 *    planta en cruz, que es como se ve la torre desde la calle);
 *  - la entrada del norte, en el zócalo: el aplacado de piedra beis con la franja de cristal de arriba, el
 *    monolito gris con ARRECIFE / GRAN HOTEL & SPA y las estrellas, la cristalera con la puerta giratoria, la
 *    marquesina de cristal con las columnas negras inclinadas, las jardineras redondas y los bolardos.
 */

// el zócalo, de la esquina este a la oeste de su fachada norte (z hacia la calle, al norte)
const P = marco([-393.2, 540.4], [-470.3, 552.8]);
// el ancho de cada franja blanca de las caras de la torre
const FRANJA = 1.4;

/** antes de levantar la ciudad: se apuntan la torre y el zócalo del mapa (no se tocan) */
export function tuneGranHotel(map) {
  const dentro = (poly, x, z) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, az] = poly[i], [bx, bz] = poly[j];
      if ((az > z) !== (bz > z) && x < ax + ((z - az) * (bx - ax)) / (bz - az)) c = !c;
    }
    return c;
  };
  const torre = (map.buildings || []).find(b => !b.skip && b.h > 40 && dentro(b.p, -436, 578));
  if (torre) map.granHotel = { p: torre.p, h: torre.h };
}

// ——— lo que se pinta en lienzo ———

/** cristal verde azulado con los forjados y los montantes (una baldosa: 4 m de ancho y dos plantas) */
function cristalTorre(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, '#6fb2b4');
  gr.addColorStop(0.5, '#3f8088');
  gr.addColorStop(1, '#5a9ea2');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  // el cielo reflejado, más claro arriba de cada planta
  for (const y0 of [0, h / 2]) {
    const r = g.createLinearGradient(0, y0, 0, y0 + h / 2);
    r.addColorStop(0, 'rgba(230,245,245,.28)');
    r.addColorStop(1, 'rgba(230,245,245,0)');
    g.fillStyle = r;
    g.fillRect(0, y0, w, h / 2);
  }
  // los forjados (la banda opaca de cada planta) y los montantes
  g.fillStyle = '#2c5c62';
  for (const y0 of [0, h / 2]) g.fillRect(0, y0 + h / 2 - h * 0.06, w, h * 0.06);
  g.fillStyle = '#dfe6e4';
  for (let x = 0; x <= w; x += w / 3) g.fillRect(x - 2, 0, 4, h);
  for (const y0 of [0, h / 2]) g.fillRect(0, y0, w, 3);
}

/** el panel blanco de las esquinas metidas, con las juntas y la ventana estrecha */
function blancoTorre(g, w, h) {
  g.fillStyle = '#ecedea';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#c9ccc8';
  g.lineWidth = 2;
  for (const y of [0, h / 2]) { g.beginPath(); g.moveTo(0, y + 1); g.lineTo(w, y + 1); g.stroke(); }
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.fillStyle = '#3f7a80';
  for (const y0 of [0, h / 2]) g.fillRect(w * 0.42, y0 + h * 0.08, w * 0.16, h * 0.3);
}

/** el aplacado de piedra beis del zócalo, en placas */
function piedraBeis(g, w, h) {
  g.fillStyle = '#d6c4a2';
  g.fillRect(0, 0, w, h);
  let s = 9;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pw = w / 4, ph = h / 6;
  for (let y = 0; y < h; y += ph) {
    for (let x = 0; x < w; x += pw) {
      const v = 200 + r() * 26;
      g.fillStyle = `rgb(${v + 14},${v - 2},${v - 34})`;
      g.fillRect(x + 1, y + 1, pw - 2, ph - 2);
    }
  }
}

/** la franja de cristal verde de la planta de arriba del zócalo */
function franjaCristal(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#9cc9c4');
  gr.addColorStop(1, '#4d8a8a');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#e4ebe8';
  for (let x = 0; x <= w; x += w / 24) g.fillRect(x, 0, 3, h);
}

/** la cristalera de la entrada, con la puerta giratoria en medio */
function cristaleraEntrada(g, w, h) {
  g.fillStyle = '#3b4a4c';
  g.fillRect(0, 0, w, h);
  const luz = g.createLinearGradient(0, 0, 0, h);
  luz.addColorStop(0, 'rgba(255,236,200,.35)');
  luz.addColorStop(1, 'rgba(255,236,200,.05)');
  g.fillStyle = luz;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9aa4a6';
  for (let x = 0; x <= w; x += w / 8) g.fillRect(x - 2, 0, 4, h);
  g.fillRect(0, h * 0.72, w, 4);
  // la puerta giratoria
  g.strokeStyle = '#c8ced0';
  g.lineWidth = 4;
  g.beginPath(); g.arc(w / 2, h * 0.45, w * 0.1, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(w / 2, h * 0.2); g.lineTo(w / 2, h); g.stroke();
}

/** el monolito: ARRECIFE grande, GRAN HOTEL & SPA debajo, las cinco estrellas y el logo de líneas */
function rotuloHotel(g, w, h) {
  g.fillStyle = '#8b8984';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#7d7b76';
  for (let y = 0; y < h; y += h / 8) g.fillRect(0, y, w, 2);
  g.fillStyle = '#e8e6e0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // el logo: tres arcos de líneas
  g.strokeStyle = '#e8e6e0';
  g.lineWidth = 3;
  for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(w / 2, h * 0.3, h * (0.06 + i * 0.03), Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  g.font = `600 ${Math.round(h * 0.15)}px "Georgia", serif`;
  g.fillText('ARRECIFE', w / 2, h * 0.5);
  g.font = `500 ${Math.round(h * 0.07)}px Arial, sans-serif`;
  g.fillText('G R A N   H O T E L   &   S P A', w / 2, h * 0.64);
  g.font = `${Math.round(h * 0.06)}px Arial, sans-serif`;
  g.fillText('★ ★ ★ ★ ★', w / 2, h * 0.75);
}

// ——— las piezas ———

/** el contorno de fuera (envolvente convexa) de un polígono */
function envolvente(poly) {
  const pts = poly.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const giro = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lado = (lista) => {
    const h = [];
    for (const q of lista) { while (h.length >= 2 && giro(h[h.length - 2], h[h.length - 1], q) <= 0) h.pop(); h.push(q); }
    h.pop();
    return h;
  };
  return lado(pts).concat(lado(pts.slice().reverse()));
}

/**
 * forra por fuera el contorno de la torre: los chaflanes de las esquinas (los lados en diagonal) blancos y
 * los demás de cristal, con una franja blanca en medio de cada tramo
 */
function pielTorre(poly, h) {
  const pts = envolvente(poly);
  let area = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length]; area += x0 * z1 - x1 * z0; }
  const out = area > 0 ? 1 : -1, off = 0.6, piso = 3.6;
  const caras = { cristal: { pos: [], uv: [] }, blanco: { pos: [], uv: [] } };
  for (let i = 0; i < pts.length; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length];
    const L = Math.hypot(x1 - x0, z1 - z0);
    if (L < 0.2) continue;
    const nx = (out * (z1 - z0)) / L, nz = (-out * (x1 - x0)) / L;
    const P0 = [x0 + nx * off, z0 + nz * off], P1 = [x1 + nx * off, z1 + nz * off];
    const en = (t) => [P0[0] + (P1[0] - P0[0]) * t, P0[1] + (P1[1] - P0[1]) * t];
    // un trozo de la cara, de u0 a u1 metros desde su principio
    const trozo = (c, u0, u1, ancho) => {
      const a = en(u0 / L), b = en(u1 / L), y0 = 0, y1 = h + 0.5;
      const quad = [[a, y0, u0], [b, y0, u1], [b, y1, u1], [a, y0, u0], [b, y1, u1], [a, y1, u0]];
      for (const [[x, z], y, u] of quad) { c.pos.push(x, y, z); c.uv.push(u / ancho, y / (piso * 2)); }
    };
    const diagonal = Math.abs(x1 - x0) > 2.5 && Math.abs(z1 - z0) > 2.5;
    if (diagonal || L < 3 * FRANJA) trozo(caras.blanco, 0, L, L);
    else {
      const m = L / 2;
      trozo(caras.cristal, 0, m - FRANJA / 2, 4);
      trozo(caras.blanco, m - FRANJA / 2, m + FRANJA / 2, FRANJA);
      trozo(caras.cristal, m + FRANJA / 2, L, 4);
    }
  }
  const g = new THREE.Group();
  g.name = 'pielGranHotel';
  const malla = (c, tex, rough, metal) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(c.pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(c.uv, 2));
    geo.computeVertexNormals();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: rough, metalness: metal, side: THREE.DoubleSide }));
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  };
  g.add(malla(caras.cristal, canvasTex(192, 256, cristalTorre), 0.4, 0.05));
  g.add(malla(caras.blanco, canvasTex(96, 256, blancoTorre), 0.8, 0));
  return g;
}

/** una jardinera redonda de hormigón con flores */
function jardineraRedonda(k, s, z) {
  k.cyl(s, 0, z, 0.55, 0.45, 0.5, 0x9a9690, { seg: 16 });
  k.ball(s, 0.5, z, 0.42, 0x4a7a3a, { sy: 0.5, seg: 10 });
  for (let i = 0; i < 5; i++) k.ball(s + Math.cos(i * 1.3) * 0.25, 0.68, z + Math.sin(i * 1.3) * 0.25, 0.08, 0xe8c040, { seg: 6 });
  k.block(s, z, 1.1, 1.1);
}

/** la entrada del norte, en el marco P del zócalo */
function entrada(k) {
  const H = 6.2;
  // el aplacado de piedra beis y la franja de cristal de arriba, de s 28 a 62
  k.box(45, 0, 0.06, 34, H, 0.12, 0xd6c4a2);
  k.pic(45, 2.0, 0.125, 34, 4.0, 0, 1, canvasTex(1024, 128, piedraBeis));
  k.pic(45, 5.1, 0.125, 34, 1.9, 0, 1, canvasTex(1024, 64, franjaCristal));
  // la cristalera de la entrada con la puerta giratoria
  k.pic(46.5, 1.8, 0.13, 7.0, 3.6, 0, 1, canvasTex(512, 264, cristaleraEntrada));
  // el monolito gris con el nombre, a la izquierda de la entrada
  k.box(38.5, 0, 1.2, 6.0, 4.4, 1.6, 0x8b8984);
  k.pic(38.5, 2.2, 2.01, 6.0, 4.4, 0, 1, canvasTex(480, 352, rotuloHotel));
  // la marquesina de cristal sobre la entrada y sus columnas negras inclinadas
  const s0 = 42.0, s1 = 52.0, Y = 5.2, F = 7.0;
  k.box((s0 + s1) / 2, Y, F / 2, s1 - s0, 0.08, F, 0xb9d2d0);
  for (const z of [0.4, F - 0.2]) k.box((s0 + s1) / 2, Y - 0.25, z, s1 - s0, 0.25, 0.18, 0x1d1d1f);
  for (const s of [s0 + 0.1, s1 - 0.1]) k.box(s, Y - 0.25, F / 2, 0.18, 0.25, F, 0x1d1d1f);
  for (let i = 0; i < 7; i++) {
    const s = s0 + 0.6 + i * ((s1 - s0 - 1.2) / 6), lado = i % 2 ? 1 : -1;
    barra(k, [s + lado * 0.9, 0, F - 0.6], [s - lado * 0.3, Y - 0.2, F - 0.25], 0.14, 0x1d1d1f);
    k.block(s + lado * 0.9, F - 0.6, 0.3, 0.3);
  }
  // los tirantes de la marquesina a la pared
  for (const s of [s0 + 1.5, (s0 + s1) / 2, s1 - 1.5]) barra(k, [s, H - 0.2, 0.15], [s, Y + 0.05, F - 0.4], 0.04, 0x9aa0a4);
  // las jardineras redondas y los bolardos de delante (la avenida Mancomunidad empieza a unos 10 m)
  for (const s of [40.5, 53.5]) jardineraRedonda(k, s, 7.6);
  for (let s = 34; s <= 58; s += 2) { k.cyl(s, 0, 8.9, 0.08, 0.09, 0.8, 0x6a6e72, { seg: 8 }); k.block(s, 8.9, 0.2, 0.2); }
}

/** la azotea de la piel: el contorno de fuera, gris claro */
function azotea(poly, h) {
  const pts = envolvente(poly);
  const forma = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ShapeGeometry(forma);
  g.rotateX(-Math.PI / 2);
  g.translate(0, h + 0.55, 0);
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xbfc2c0, roughness: 0.9, side: THREE.DoubleSide }));
  m.receiveShadow = true;
  return m;
}

/**
 * esconde las paredes de la torre del juego (las mallas que van del suelo a más de 30 m dentro del sitio de la
 * torre); lo de encima de la azotea, como el rótulo, se queda
 */
function esconderTorreVieja(scene, poly, mias) {
  const xs = poly.map(p => p[0]), zs = poly.map(p => p[1]);
  const x0 = Math.min(...xs) - 3, x1 = Math.max(...xs) + 3, z0 = Math.min(...zs) - 3, z1 = Math.max(...zs) + 3;
  const caja = new THREE.Box3();
  let n = 0;
  scene.traverse((o) => {
    if (!o.isMesh || !o.geometry || mias.has(o)) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    caja.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    if (caja.min.x > x0 && caja.max.x < x1 && caja.min.z > z0 && caja.max.z < z1 && caja.min.y < 8 && caja.max.y > 30) { o.visible = false; n++; }
  });
  return n;
}

/** segunda fase: la piel de la torre y la entrada del zócalo */
export function buildGranHotel(scene, colliders, map) {
  if (!map?.granHotel) return null;
  const group = new THREE.Group();
  group.name = 'granHotel';
  group.add(pielTorre(map.granHotel.p, map.granHotel.h), azotea(map.granHotel.p, map.granHotel.h));
  const k = new Kit();
  entrada(k);
  group.add(enMarco(k, P, 'entradaGranHotel', colliders));
  scene.updateMatrixWorld(true);
  const mias = new Set();
  group.traverse(o => mias.add(o));
  const escondidas = esconderTorreVieja(scene, map.granHotel.p, mias);
  scene.add(group);
  return { group, escondidas };
}
