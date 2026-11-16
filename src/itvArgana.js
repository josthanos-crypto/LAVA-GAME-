import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { cinta, malla } from './puenteRayas.js';
import { paveMaterial, asfalto } from './suelos.js';

/**
 * La estación de ITV de Arrecife, en la subida a San Bartolomé (Argana Alta), entre la carretera y el Hospital
 * Doctor José Molina Orosa (Version 137, pedido por José Manuel: «haz la ITV en la subida San Bartolomé»).
 *
 * La nave viene en el mapa de OpenStreetMap (40 × 17 m, cubierta gris azulada en la foto aérea), pero el juego la
 * levantaba como un bloque genérico de tiendas. La foto aérea (PNOA) enseña también las filas de espera pintadas
 * delante de la boca de entrada y una caseta con marquesina verde azulada al lado.
 *
 * Aquí se hace la estación: la nave abierta por las dos puntas con sus TRES LÍNEAS de inspección (se puede cruzar con
 * el coche), los fosos, los rodillos del frenómetro, los números de línea con su semáforo, los rótulos «ITV», la
 * caseta de recepción y las filas de espera con sus flechas.
 *
 * (Version 138) El recinto entero: firme de asfalto, aparcamiento entre la nave y la carretera, la VALLA DE REJILLA
 * que lo rodea y la PUERTA, que está al lado del local de Remar. (Version 139) Remar es la nave de ABAJO (la que
 * queda bajando hacia Arrecife), no la de arriba: lo corrigió José Manuel. La puerta va en esa punta del recinto.
 *
 * No lleva el nombre de la empresa que la explota ni horarios ni precios: solo «ITV» (no se inventan datos).
 * El sentido de paso (se entra por la punta de arriba, la de las filas pintadas) sale de la foto aérea; que lo
 * confirme José Manuel.
 *
 * Coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */

const C = [-1686.1, -1279.2];              // el centro de la nave (planta de OpenStreetMap)
const U = [-0.769, -0.638];                // a lo largo: de la salida (s = -L) a la entrada (s = +L)
const V = [-0.638, 0.769];                 // de través, hacia la carretera
const L = 19.9, W = 8.65, ALTO = 6.6, BOCA = 4.4;
const LINEAS = [-5.3, 0, 5.3];             // el eje de cada línea de inspección
const P = (s, v) => [C[0] + U[0] * s + V[0] * v, C[1] + U[1] * s + V[1] * v];

// el recinto (s a lo largo de la nave, v hacia la carretera), medido sobre el mapa y la foto aérea
const VALLA_V = 39;                        // la valla de la carretera (la calzada empieza en v = 42,6)
const VALLA_HOSP = -16.5;                  // la valla del lado del hospital
const FIN_S = -39;                         // el fondo, por la punta de la salida (la nave siguiente empieza en -42)
const VECINA_S = 29.7;                     // donde empieza la nave de arriba (no es de la ITV)
const REMAR_S = -41.9;                     // donde acaba la nave de abajo: el local de Remar
const COLA_S = 54;                         // el fondo de las filas de espera
const PUERTA = [-38.5, -31.3];             // la puerta del recinto, en la punta de abajo, pegada a la nave de Remar

const BLANCO = 0xf2f1ec, AZUL = 0x1c4f9c, GRIS = 0x8f9498, HORMIGON = 0x9a9b98, AMARILLO = 0xf2c200, OSCURO = 0x23262a;

/** antes de levantar la ciudad: fuera el bloque genérico */
export function tuneItvArgana(map) {
  for (const b of map.buildings || []) {
    if (!b.p || b.p.length < 4) continue;
    let x = 0, z = 0;
    for (const q of b.p.slice(0, -1)) { x += q[0]; z += q[1]; }
    x /= b.p.length - 1; z /= b.p.length - 1;
    if (Math.hypot(x - C[0], z - C[1]) < 4) b.skip = true;
  }
}

function lienzo(w, h, pinta) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pinta(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** el dintel de cada boca: banda azul con «ITV» y el número de cada línea sobre su hueco, con el semáforo en verde */
function dintel(alReves) {
  return lienzo(1024, 128, (c, w, h) => {
    c.fillStyle = '#1c4f9c'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; c.fillRect(0, h - 6, w, 6);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const orden = alReves ? [3, 2, 1] : [1, 2, 3];
    orden.forEach((n, i) => {
      const x = w * (0.5 + (LINEAS[i] / (2 * W)));
      c.fillStyle = '#ffffff'; c.font = 'bold 30px Arial, Helvetica, sans-serif';
      c.fillText('LÍNEA', x - 26, h * 0.3);
      c.font = 'bold 74px Arial, Helvetica, sans-serif';
      c.fillText(String(n), x - 26, h * 0.68);
      c.fillStyle = '#101214'; c.fillRect(x + 22, 22, 34, 84);
      c.fillStyle = '#3a1512'; c.beginPath(); c.arc(x + 39, 44, 12, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#35e06a'; c.beginPath(); c.arc(x + 39, 84, 12, 0, Math.PI * 2); c.fill();
    });
  });
}

/** el rótulo grande: blanco con «ITV» en azul y el nombre completo */
function rotulo() {
  return lienzo(1024, 160, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1c4f9c'; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10);
    c.textBaseline = 'middle';
    c.textAlign = 'left'; c.font = 'bold 120px Arial, Helvetica, sans-serif'; c.fillText('ITV', 34, h / 2 + 4);
    c.font = 'bold 44px Arial, Helvetica, sans-serif';
    c.fillText('INSPECCIÓN TÉCNICA', 300, h * 0.36);
    c.fillText('DE VEHÍCULOS', 300, h * 0.68);
  });
}

export function buildItvArgana(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'itvArgana';
  const piezas = [];
  /** caja de color con la base en y: w a lo largo de dir, d de través */
  const caja = (s, v, y, w, h, d, color, dir = U) => {
    const [x, z] = P(s, v);
    const g = new THREE.BoxGeometry(w, h, d).toNonIndexed();
    g.rotateY(Math.atan2(-dir[1], dir[0]));
    g.translate(x, y + h / 2, z);
    const c = new THREE.Color(color), n = g.getAttribute('position').count, col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    piezas.push(g);
  };
  const cartel = (s, v, y, w, h, n, tex, brilla = 0) => {
    const [x, z] = P(s, v);
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(Math.atan2(n[0], n[1]));
    g.translate(x, y, z);
    grupo.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: brilla })));
  };
  const muro = (s0, v0, s1, v1) => colliders?.addSegment(...P(s0, v0), ...P(s1, v1));
  const menosU = [-U[0], -U[1]], menosV = [-V[0], -V[1]];

  // ───────────── la nave ─────────────
  // las dos paredes largas, en cuatro paños (así siguen el suelo), con zócalo gris y franja azul
  for (const lado of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      const s = -L + (k + 0.5) * (2 * L / 4);
      caja(s, lado * W, 0, 2 * L / 4 + 0.02, ALTO, 0.25, BLANCO);
      caja(s, lado * (W + 0.02), 0, 2 * L / 4 + 0.02, 0.6, 0.3, GRIS);
      caja(s, lado * (W + 0.02), ALTO - 1.5, 2 * L / 4 + 0.02, 0.5, 0.3, AZUL);
      // ventanas altas corridas
      caja(s, lado * (W + 0.03), 3.4, 2 * L / 4 - 2.2, 0.9, 0.3, 0x35434d);
      // la cubierta (una vez)
      if (lado > 0) caja(s, 0, ALTO, 2 * L / 4 + 0.02, 0.3, 2 * W + 0.9, 0xb7c0c8);
    }
    muro(-L, lado * W, L, lado * W);
  }
  // las dos puntas: pilares entre las bocas y el dintel con los números de línea
  const pilares = [-W + 0.2, -(BOCA / 2 + 0.45), BOCA / 2 + 0.45, W - 0.2];
  for (const punta of [-1, 1]) {
    const s = punta * L;
    for (const v of pilares) { caja(s, v, 0, 0.45, ALTO - 1.9, 0.9, BLANCO); muro(s, v - 0.45, s, v + 0.45); }
    for (const v of pilares) caja(s + punta * 0.25, v, 0, 0.14, 1.1, 0.14, AMARILLO);       // protecciones amarillas
    caja(s, 0, ALTO - 1.9, 0.45, 1.9, 2 * W + 0.5, BLANCO);
    cartel(s + punta * 0.24, 0, ALTO - 1.0, 2 * W, 1.5, punta > 0 ? U : menosU, dintel(punta < 0), 0.25);
  }
  // por dentro: suelo de hormigón, y en cada línea las rayas amarillas, el foso y los rodillos del frenómetro.
  // Todo lo que va tumbado en el suelo se pone en trozos de 4 m como mucho: así sube con el terreno igual que el suelo
  // (una pieza larga solo se apoya en sus puntas y lo pequeño se hundía por debajo)
  const tira = (s0, s1, v, y, h, d, color) => {
    const n = Math.max(1, Math.ceil((s1 - s0) / 4)), l = (s1 - s0) / n;
    for (let i = 0; i < n; i++) caja(s0 + (i + 0.5) * l, v, y, l + 0.01, h, d, color);
  };
  for (let k = 0; k < 4; k++) tira(-L, L, -W + (k + 0.5) * (2 * W / 4), 0.09, 0.03, 2 * W / 4 + 0.01, HORMIGON);
  for (const v of LINEAS) {
    for (const d of [-1.55, 1.55]) tira(-L + 0.5, L - 0.5, v + d, 0.12, 0.012, 0.12, AMARILLO);
    tira(-6.5, 2.5, v, 0.12, 0.014, 0.95, OSCURO);                 // el foso
    for (const d of [-0.56, 0.56]) tira(-6.5, 2.5, v + d, 0.12, 0.05, 0.08, AMARILLO);   // su reborde
    for (const d of [-0.95, 0.95]) {                                // los rodillos, uno por rueda
      caja(9.5, v + d, 0.12, 1.1, 0.016, 0.8, 0x4c4f52);
      caja(9.5, v + d, 0.13, 0.9, 0.016, 0.6, 0x1b1d1f);
    }
    caja(13.5, v + 1.9, 0.12, 0.5, 1.25, 0.4, 0xd9dcde);            // el regloscopio de las luces
    for (const s of [-12, 0, 12]) caja(s, v, ALTO - 0.45, 2.4, 0.08, 0.25, 0xfff4d8);   // las luces del techo
  }
  // la cabina de los inspectores, entre dos líneas
  caja(-11, 2.65, 0.12, 3.2, 2.5, 0.9, 0xe3e6e8);
  caja(-11, 2.65, 1.3, 3.0, 0.9, 0.95, 0x35434d);

  // el rótulo grande, en la pared que da a la carretera y sobre la cubierta, en la punta de la entrada
  cartel(0, W + 0.2, ALTO - 0.4, 12.8, 2.0, V, rotulo(), 0.2);
  cartel(L + 0.26, 0, ALTO + 1.15, 9.6, 1.5, U, rotulo(), 0.2);
  caja(L, 0, ALTO, 0.3, 2.0, 10, 0xd9dcde);

  // ───────────── la caseta de recepción, con su marquesina verde azulada ─────────────
  {
    const s = 8.2, v = 21.3;
    caja(s, v, 0, 6, 3, 4, BLANCO);
    caja(s, v, 3, 8.4, 0.25, 6.4, 0x2a9d9a);
    caja(s, v + 2.02, 1.0, 3.6, 1.3, 0.1, 0x35434d);
    for (const [a, b] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) caja(s + a, v + b, 0, 0.14, 3, 0.14, GRIS);
    muro(s - 3, v - 2, s + 3, v - 2); muro(s + 3, v - 2, s + 3, v + 2); muro(s + 3, v + 2, s - 3, v + 2); muro(s - 3, v + 2, s - 3, v - 2);
  }
  // el poste con el rótulo, en la carretera, al lado de la puerta
  {
    const s = PUERTA[1] + 1.6, v = VALLA_V + 0.6;   // junto a la puerta del recinto
    caja(s, v, 0, 0.35, 6.2, 0.35, GRIS);
    caja(s, v, 4.4, 4.2, 1.8, 0.3, BLANCO, V);
    const tex = lienzo(384, 160, (c, w, h) => {
      c.fillStyle = '#1c4f9c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = 'bold 130px Arial, Helvetica, sans-serif'; c.fillText('ITV', w / 2, h / 2 + 6);
    });
    cartel(s - 0.17, v, 5.3, 4.0, 1.66, menosU, tex, 0.25);
    cartel(s + 0.17, v, 5.3, 4.0, 1.66, U, tex, 0.25);
  }

  // ───────────── el recinto: firme, filas de espera, aparcamiento, valla y puerta (Version 138) ─────────────
  // Medido sobre el mapa y la foto aérea: la carretera queda a 34 m de la pared de la nave (v = 42,6); la nave de
  // arriba empieza en s = 29,7; la de abajo (el local de Remar) acaba en s = -41,9 y junto a ella está la puerta.
  // Se entra por abajo, se sube por el aparcamiento hasta las filas de espera (más arriba, pegadas al lado del
  // hospital) y se cruza la nave de arriba abajo. (En la Version 138 la puerta estaba arriba, en el paso entre la nave
  // de la ITV y la de arriba, y el rótulo de Remar en la nave de arriba: era un error.)
  const blanco = [], flechas = [];
  const Y = 0.105;                 // el firme del recinto, por debajo del suelo de la nave
  const linea = (s0, v0, s1, v1, hw = 0.06) => {
    const n = Math.max(2, Math.ceil(Math.hypot(s1 - s0, v1 - v0) / 2)), pts = [];
    for (let i = 0; i <= n; i++) pts.push(P(s0 + (s1 - s0) * i / n, v0 + (v1 - v0) * i / n));
    cinta(blanco, pts, () => Y + 0.02, hw, false);
  };
  /** flecha pintada en (s, v) apuntando hacia (ds, dv) */
  const flecha = (s, v, ds, dv) => {
    const at = (f, d) => { const [x, z] = P(s + ds * f - dv * d, v + dv * f + ds * d); return [x, Y + 0.022, z]; };
    flechas.push(...at(1.3, 0), ...at(0.2, 0.6), ...at(0.2, -0.6));
    flechas.push(...at(0.2, 0.17), ...at(-1.2, 0.17), ...at(-1.2, -0.17), ...at(0.2, 0.17), ...at(-1.2, -0.17), ...at(0.2, -0.17));
  };
  // el firme de asfalto de todo el recinto, en losas de 4 m
  {
    const pos = [], uv = [];
    const losa = (s0, s1, v0, v1) => {
      const ns = Math.ceil((s1 - s0) / 4), nv = Math.ceil((v1 - v0) / 4);
      const pt = (i, j) => P(s0 + (s1 - s0) * i / ns, v0 + (v1 - v0) * j / nv);
      for (let i = 0; i < ns; i++) for (let j = 0; j < nv; j++) {
        for (const [x, z] of [pt(i, j), pt(i, j + 1), pt(i + 1, j), pt(i + 1, j), pt(i, j + 1), pt(i + 1, j + 1)]) { pos.push(x, Y, z); uv.push(x / 4, -z / 4); }
      }
    };
    losa(FIN_S, VECINA_S - 0.7, VALLA_HOSP, VALLA_V);          // la nave, el aparcamiento y el paso a las filas
    losa(VECINA_S - 0.7, COLA_S, VALLA_HOSP, 3.4);             // las filas de espera, detrás de la nave de arriba
    losa(PUERTA[0], PUERTA[1], VALLA_V, VALLA_V + 3.4);        // el vado de la puerta, hasta la calzada
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    const mat = paveMaterial(asfalto(), 0xd4d4d4);
    mat.side = THREE.DoubleSide;
    const firme = new THREE.Mesh(g, mat);
    firme.name = 'itvArganaFirme'; firme.receiveShadow = true;
    grupo.add(firme);
  }
  // las filas de espera (tres carriles) y sus flechas hacia la nave
  for (const v of [-14, -8.7, -3.3, 2]) linea(VECINA_S + 1.5, v, COLA_S - 2, v);
  for (const v of [-11.35, -6, -0.65]) for (const sx of [36, 46]) flecha(sx, v, -1, 0);
  // delante de cada boca, la raya de «espere», y a la salida las rayas y una flecha
  for (const v of LINEAS) linea(L + 1.6, v - 2.2, L + 1.6, v + 2.2, 0.15);
  for (const v of [-7.95, -2.65, 2.65, 7.95]) linea(-L - 1.5, v, -L - 8, v);
  for (const v of LINEAS) flecha(-L - 5, v, -1, 0);
  // el camino desde la puerta: una flecha hacia dentro, dos subiendo por el aparcamiento y dos hacia las filas
  flecha((PUERTA[0] + PUERTA[1]) / 2, VALLA_V - 4, 0, -1);
  for (const sx of [-22, 2]) flecha(sx, 27.5, 1, 0);
  for (const v of [26, 12]) flecha(25, v, 0, -1);
  // el aparcamiento, entre la nave y la carretera: una fila contra la valla y otra contra la nave
  let plazas = 0;
  for (let sx = PUERTA[1] + 2.5; sx <= VECINA_S - 2.5; sx += 2.5) { linea(sx, VALLA_V - 5.6, sx, VALLA_V - 0.6); plazas++; }
  linea(PUERTA[1] + 2.5, VALLA_V - 5.6, VECINA_S - 2.5, VALLA_V - 5.6);
  for (let sx = -L + 1; sx <= L - 1; sx += 2.5) { linea(sx, W + 1.4, sx, W + 6.4); plazas++; }
  linea(-L + 1, W + 6.4, L - 1, W + 6.4);
  grupo.userData.plazas = plazas - 2;

  // la valla de rejilla que rodea el recinto, con la puerta abierta en la punta de abajo, al lado de la nave de Remar
  {
    const ALTA = 2.0, PANEL = 2.5;
    const tex = lienzo(128, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = '#6f7a72'; c.lineWidth = 3;
      for (let x = 0; x <= w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
      for (let y = 0; y <= h; y += 21.3) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
    });
    tex.wrapS = THREE.RepeatWrapping;
    const pos = [], uv = [];
    const tramo = (s0, v0, s1, v1) => {
      const len = Math.hypot(s1 - s0, v1 - v0), n = Math.max(1, Math.round(len / PANEL));
      for (let i = 0; i < n; i++) {
        const a = P(s0 + (s1 - s0) * i / n, v0 + (v1 - v0) * i / n), b = P(s0 + (s1 - s0) * (i + 1) / n, v0 + (v1 - v0) * (i + 1) / n);
        pos.push(a[0], 0.1, a[1], b[0], 0.1, b[1], b[0], 0.1 + ALTA, b[1], a[0], 0.1, a[1], b[0], 0.1 + ALTA, b[1], a[0], 0.1 + ALTA, a[1]);
        uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
      }
      for (let i = 0; i <= n; i++) caja(s0 + (s1 - s0) * i / n, v0 + (v1 - v0) * i / n, 0.1, 0.07, ALTA + 0.1, 0.07, 0x5f6a62);
      muro(s0, v0, s1, v1);
    };
    tramo(PUERTA[1], VALLA_V, VECINA_S - 0.5, VALLA_V);        // por la carretera, de la puerta hacia arriba
    tramo(VECINA_S - 0.5, VALLA_V, VECINA_S - 0.5, 32.2);      // hasta la esquina de la nave de arriba
    tramo(VECINA_S + 0.3, 6.4, COLA_S, 3.4);                   // por detrás de la nave de arriba
    tramo(COLA_S, 3.4, COLA_S, VALLA_HOSP);                    // el fondo de las filas de espera
    tramo(COLA_S, VALLA_HOSP, FIN_S, VALLA_HOSP);              // el lado del hospital
    tramo(FIN_S, VALLA_HOSP, FIN_S, VALLA_V);                  // el fondo de la salida
    // las dos hojas de la puerta, abiertas hacia dentro
    for (const sx of PUERTA) {
      const dentro = sx === PUERTA[0] ? -1 : 1;
      const a = P(sx, VALLA_V), b = P(sx + dentro * 0.4, VALLA_V - 3.5);
      pos.push(a[0], 0.1, a[1], b[0], 0.1, b[1], b[0], 0.1 + ALTA, b[1], a[0], 0.1, a[1], b[0], 0.1 + ALTA, b[1], a[0], 0.1 + ALTA, a[1]);
      uv.push(0, 0, 1.4, 0, 1.4, 1, 0, 0, 1.4, 1, 0, 1);
      caja(sx, VALLA_V, 0.1, 0.14, ALTA + 0.3, 0.14, 0x4a534d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    const valla = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.35, transparent: false, side: THREE.DoubleSide, roughness: 0.7 }));
    valla.name = 'itvArganaValla';
    grupo.add(valla);
  }

  // el rótulo de la nave de abajo (Remar), que es por donde José Manuel dice que está la entrada
  {
    const tex = lienzo(512, 128, (c, w, h) => {
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1b4a9c'; c.fillRect(0, 0, w, 8); c.fillRect(0, h - 8, w, 8);
      c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'bold 92px Arial, Helvetica, sans-serif';
      c.fillText('REMAR', w / 2, h / 2 + 4);
    });
    cartel(REMAR_S - 9, 40.2 + 0.3, 4.3, 7.2, 1.8, V, tex, 0.15);          // en la fachada de la carretera
    cartel(REMAR_S + 0.3, 30, 4.3, 7.2, 1.8, U, tex, 0.15);               // en el testero que mira a la puerta de la ITV
  }

  const pintura = new THREE.MeshStandardMaterial({ color: 0xeceae2, roughness: 0.85, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  for (const [pos, nombre] of [[blanco, 'itvArganaRayas'], [flechas, 'itvArganaFlechas']]) {
    const m = malla(pos, pintura);
    if (m) { m.name = nombre; grupo.add(m); }
  }

  const m = new THREE.Mesh(mergeGeometries(piezas, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, side: THREE.DoubleSide }));
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  scene.add(grupo);
  return grupo;
}
