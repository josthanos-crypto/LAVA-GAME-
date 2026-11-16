import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMaterial, asfalto } from './suelos.js';
import { terrainY } from './terrain.js';

/**
 * HiperDino Argana — Calle Tenderete 7 (Argana Alta).
 *
 * El supermercado del recorrido de José Manuel del 25/10/2026 (fotogramas f_0121–f_0180
 * del vídeo IMG_5153): la nave blanca alargada, el rótulo verde de HiperDino sobre una
 * marquesina corrida de verdad (forjado profundo sobre columnas finas y el frente
 * acristalado entero debajo), el bloque alto del extremo de la calle, el muro de lamas
 * blancas hacia la acera, el aparcamiento delante con las plazas pintadas, los carros
 * metálicos apilados junto a la pared y el paso de cebra en la calle.
 *
 * La fachada de la tienda (escaparate corrido, marquesina, entrada de clientes y el rótulo
 * grande) da a la CALLE IGUAZÚ: es el testero del bloque alto, el lado corto de la nave. El
 * muelle de carga, con el portón grande y su marquesina de chapa (MUELLE), da a la CALLE
 * TENDERETE, por el lado largo, que por lo demás es pared blanca con pilares y ventanas altas.
 * El MediaMarkt (centroComercialArgana.js) está pegado al mismo testero, a un lado, y comparte el
 * aparcamiento de Iguazú.
 *
 * La planta es la del edificio de OpenStreetMap (el nodo del HiperDino, calle Tenderete 7,
 * cae dentro de esta nave), así que la posición y el choque son los reales: se quita el
 * bloque genérico (`skip`) y se levanta este.
 *
 * El aparcamiento va un poco por encima de la acera del mapa (0,34 m, si no la acera asoma
 * por encima del asfalto) y sigue la cuesta del terreno: el suelo sube hacia Tenderete, y
 * si fuera plano el terreno asomaba por encima del asfalto en la parte de la calle.
 *
 * Coordenadas: la fachada larga va de A (−1320,8 · −1455,3) a D (−1270,3 · −1365,2) y da
 * al aparcamiento y a la calle; el fondo (B–C) queda hacia el noroeste.
 */

const A = [-1320.8, -1455.3];
const D = [-1270.3, -1365.2];
const B = [-1360.9, -1432.8];
const LEN = Math.hypot(D[0] - A[0], D[1] - A[1]);            // 103,3 m de fachada
const WID = Math.hypot(B[0] - A[0], B[1] - A[1]);            // 46,0 m de fondo
const U = [(D[0] - A[0]) / LEN, (D[1] - A[1]) / LEN];        // a lo largo de la fachada
const N = [U[1], -U[0]];                                     // hacia fuera (aparcamiento y calle)
const RY = Math.atan2(U[0], U[1]) + Math.PI / 2;
const RY2 = RY + Math.PI / 2;                                // el ancho va por el fondo (piezas del testero)
/** punto en coordenadas de la nave: u a lo largo de la fachada, v hacia el aparcamiento */
const P = (u, v) => [A[0] + U[0] * u + N[0] * v, A[1] + U[1] * u + N[1] * v];
const CENTRO = P(LEN / 2, -WID / 2);

const ALTO = 7.4;                 // la nave (desde la calle se ve un piso y la franja de ventanas)
const ESQ = 26;                   // el bloque alto del extremo de la calle
const ALTO_ESQ = 9.3;
const MUELLE = LEN * 0.62;        // el muelle de carga: el portón grande y su marquesina
const CANAL_Y = 4.62;             // el forjado de la marquesina (base del canto)
const CANAL_V = 3.8;              // lo que vuela la marquesina sobre la acera
const SUELO = 0.34;               // el asfalto, por encima de la acera del mapa
const BLANCO = 0xf2f0e9, CLARO = 0xd9d6cd;
const METAL = 0xa9adb0, ALU = 0xa8b0b4, CRISTAL = 0x51636c;
const VERDE = '#126b47';          // el verde del rótulo, como el de la nave de verdad
const ACERO = 0x7d8489;
const PLAZA = 2.55;
const FILAS = [[6.2, 11.2], [22.0, 27.0], [33.4, 38.0]];     // las tres filas de plazas
const V_LAMAS = 42;

/** quita el bloque genérico del mapa: este modelo trae la nave de verdad */
export function tuneHiperdinoArgana(map) {
  for (const b of map.buildings || []) {
    const p = b.p || [];
    if (p.length < 3) continue;
    let cx = 0, cz = 0;
    for (const q of p) { cx += q[0]; cz += q[1]; }
    cx /= p.length; cz /= p.length;
    if (Math.hypot(cx - CENTRO[0], cz - CENTRO[1]) < 16) {
      b.skip = true;
      b.hiperdino = true;
    }
  }
  // el rótulo del mapa dentro de la nave no hace falta: el nombre va en la fachada
  const signs = map.signs || [];
  for (let i = signs.length - 1; i >= 0; i--) {
    const s = signs[i];
    if (Math.hypot(s.x - CENTRO[0], s.z - CENTRO[1]) < 70 && /dino/i.test(s.name || '')) signs.splice(i, 1);
  }
}

/** el rótulo: «HiperDino» en verde sobre placa blanca, con la hojita del logo */
function rotulo(texto, w = 768, h = 128) {
  return canvasTex(w, h, (g, cw, ch) => {
    // sin placa: el fondo es el mismo blanco de la fachada, así solo se ven las letras
    g.fillStyle = '#f2f0e9'; g.fillRect(0, 0, cw, ch);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `800 ${Math.round(ch * 0.5)}px "Barlow", Arial, Helvetica, sans-serif`;
    g.fillStyle = VERDE;
    g.fillText(texto, cw / 2, ch * 0.58);
    // la hojita verde, sobre la «i»
    g.fillStyle = '#3f9e3f';
    g.beginPath();
    g.ellipse(cw * 0.5, ch * 0.14, ch * 0.1, ch * 0.06, -0.5, 0, Math.PI * 2);
    g.fill();
  });
}

/** el cartel del muelle, sobre la marquesina de chapa */
function letreroCarga(w = 512, h = 96) {
  return canvasTex(w, h, (g, cw, ch) => {
    g.fillStyle = '#2b2f31'; g.fillRect(0, 0, cw, ch);
    g.strokeStyle = '#e6e3da'; g.lineWidth = Math.max(3, ch * 0.06);
    g.strokeRect(g.lineWidth * 1.6, g.lineWidth * 1.6, cw - g.lineWidth * 3.2, ch - g.lineWidth * 3.2);
    g.fillStyle = '#f2f0e8'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(ch * 0.4)}px "Barlow", Arial, Helvetica, sans-serif`;
    g.fillText('CARGA Y DESCARGA', cw / 2, ch * 0.54);
  });
}

/** un carro de la compra apilado: la cesta de barrotes y las cuatro ruedas */
function carro(k, x, y, z, ry) {
  const list = k.solid;
  for (const [dx, dz] of [[-0.22, -0.32], [0.22, -0.32], [-0.22, 0.32], [0.22, 0.32]]) {
    const cx = x + dx * Math.cos(ry) - dz * Math.sin(ry);
    const cz = z + dx * Math.sin(ry) + dz * Math.cos(ry);
    k.box(cx, y, cz, 0.07, 0.88, 0.07, METAL, { list });
  }
  k.box(x, y + 0.88, z, 0.56, 0.06, 0.78, METAL, { ry, list });        // el fondo de la cesta
  k.box(x, y + 1.4, z, 0.6, 0.05, 0.82, METAL, { ry, list });          // el borde de arriba
  for (const [dx, dz] of [[-0.28, 0], [0.28, 0], [0, -0.38], [0, 0.38]]) {
    const cx = x + dx * Math.cos(ry) - dz * Math.sin(ry);
    const cz = z + dx * Math.sin(ry) + dz * Math.cos(ry);
    k.box(cx, y + 1.14, cz, 0.035, 0.5, 0.035, METAL, { list });
  }
}

// el terreno de la nave: 0 en el centro de la nave. El terreno se carga después de los
// imports, así que la referencia se toma al construir.
let BASE_Y = 0;
/** altura del asfalto en (x, z): sigue la cuesta pero nunca baja de SUELO */
const alto = (x, z) => Math.max(terrainY(x, z) - BASE_Y + SUELO, SUELO);

export function buildHiperdinoArgana(scene, colliders) {
  const k = new Kit();
  BASE_Y = terrainY(CENTRO[0], CENTRO[1]);

  /** una pieza pegada a la fachada que da al aparcamiento (v = 0 es el muro) */
  const fach = (u, v, y, w, h, d, hex, list = k.shell) => {
    const [x, z] = P(u, v);
    k.box(x, y, z, w, h, d, hex, { ry: RY, list });
  };

  // ── la nave: el cuerpo largo y el bloque alto del extremo de la calle ──
  const [cnx, cnz] = P((LEN - ESQ) / 2, -WID / 2);
  k.box(cnx, 0, cnz, LEN - ESQ, ALTO, WID, BLANCO, { ry: RY, list: k.shell });
  const [cex, cez] = P(LEN - ESQ / 2, -WID / 2);
  k.box(cex, 0, cez, ESQ, ALTO_ESQ, WID, BLANCO, { ry: RY, list: k.shell });
  // peto y cubierta de chapa
  k.box(cnx, ALTO, cnz, LEN - ESQ + 0.3, 0.42, WID + 0.3, CLARO, { ry: RY, list: k.shell });
  k.box(cex, ALTO_ESQ, cez, ESQ + 0.3, 0.46, WID + 0.3, CLARO, { ry: RY, list: k.shell });
  k.box(cnx, ALTO + 0.06, cnz, LEN - ESQ - 1.2, 0.06, WID - 1.2, 0xc3c1b9, { ry: RY, list: k.shell });
  k.box(cex, ALTO_ESQ + 0.06, cez, ESQ - 1.2, 0.06, WID - 1.2, 0xc3c1b9, { ry: RY, list: k.shell });

  // ── la cara de la Calle Tenderete: pared blanca con zócalo, pilares y franja de ventanas altas.
  // Aquí no hay tienda: solo el muelle de carga, más abajo ──
  const POR_W = 10.6, POR_H = 4.6;
  fach(LEN / 2 - 0.6, 0.06, 0, LEN - 2.4, 0.42, 0.1, 0xc9c6bd);
  for (let u = 5; u < LEN - ESQ - 2; u += 8.6) {
    if (Math.abs(u - MUELLE) < POR_W / 2 + 3) continue;
    fach(u, 0.1, 0.42, 0.5, ALTO - 0.8, 0.22, 0xe9e7df);
  }
  for (const [u0, u1] of [[3, MUELLE - 8], [MUELLE + 8, LEN - ESQ - 2]]) {
    fach((u0 + u1) / 2, 0.08, 5.1, u1 - u0, 0.9, 0.12, CRISTAL);
    fach((u0 + u1) / 2, 0.1, 5.04, u1 - u0, 0.08, 0.16, ALU);
    fach((u0 + u1) / 2, 0.1, 6.04, u1 - u0, 0.08, 0.16, ALU);
  }

  // ── el muelle de carga: el portón grande, su marquesina y la maniobra ──
  // el portón seccional, con sus paneles y las juntas horizontales
  fach(MUELLE, 0.1, 0, POR_W, POR_H, 0.14, 0xd3d6d7);
  for (let y = 0.55; y < POR_H - 0.2; y += 0.55) {
    fach(MUELLE, 0.13, y, POR_W - 0.06, 0.035, 0.05, 0x9aa0a2);
  }
  fach(MUELLE, 0.13, POR_H - 0.22, POR_W, 0.12, 0.06, 0x3a3f42);     // la junta de goma de arriba
  fach(MUELLE, 0.13, 0.02, POR_W, 0.16, 0.07, 0x6b7073);             // el umbral
  for (const du of [-POR_W / 2 - 0.18, POR_W / 2 + 0.18]) {
    fach(MUELLE + du, 0.16, 0, 0.34, POR_H + 0.3, 0.36, 0x6f757a);
  }
  fach(MUELLE, 0.16, POR_H, POR_W + 0.7, 0.46, 0.36, 0x6f757a);
  // la marquesina de chapa sobre el portón, con sus tirantes
  fach(MUELLE, 1.6, 5.15, POR_W + 3.4, 0.22, 3.2, 0xb9bdbd);
  for (const du of [-(POR_W / 2 + 1.4), POR_W / 2 + 1.4]) {
    const [bx, bz] = P(MUELLE + du, 2.7);
    k.box(bx, 4.35, bz, 0.12, 0.8, 0.12, ACERO, { ry: RY, list: k.shell });
  }
  // los topes de goma y los bolardos amarillos de la maniobra
  for (const du of [-3.6, 3.6]) {
    const [bx, bz] = P(MUELLE + du, 0.30);
    k.box(bx, 1.0, bz, 0.55, 0.5, 0.26, 0x2c2f31, { ry: RY, list: k.shell });
  }
  for (const du of [-6.6, -4.2, 4.2, 6.6]) {
    const [bx, bz] = P(MUELLE + du, 2.3);
    const y0 = alto(bx, bz);
    k.cyl(bx, y0, bz, 0.11, 0.11, 1.0, 0xd8b23a, { seg: 8 });
    k.block(bx, bz, 0.22, 0.22);
  }
  // la puerta del personal, junto al portón, y el cartel sobre la chapa
  fach(MUELLE + POR_W / 2 + 1.9, 0.11, 0, 1.1, 2.4, 0.1, 0x6d7378);
  const [lcx, lcz] = P(MUELLE, 0.08);
  k.pic(lcx, 5.8, lcz, 5.2, 0.62, N[0], N[1], letreroCarga());

  // ── el rótulo del bloque alto: el de la esquina, que también se ve desde Tenderete ──
  const [px, pz] = P(LEN - ESQ / 2, 0.08);
  k.pic(px, 8.35, pz, 12, 1.45, N[0], N[1], rotulo('HiperDino'));

  // ── la fachada de la Calle Iguazú: el testero del bloque alto, con el escaparate corrido, la
  // marquesina, la entrada de clientes y el rótulo grande. El MediaMarkt ocupa el trozo de v = −22 a −6;
  // la tienda va en el trozo libre, de v = −43,6 a −24 ──
  const FIN0 = -43.6, FIN1 = -24.0, ENT_B = -33.8, FIN_C = (FIN0 + FIN1) / 2, FIN_W = FIN1 - FIN0;
  /** pieza pegada al testero: a hacia fuera (hacia Iguazú), b a lo largo (v), w a lo ancho */
  const fin = (a, b, y, w, h, d, hex, list = k.shell) => {
    const [x, z] = P(LEN + a, b);
    k.box(x, y, z, w, h, d, hex, { ry: RY2, list });
  };
  const CRISTAL_ALTO = CANAL_Y - 0.62;
  const ANCHO_PUERTAS = 9.8;
  fin(0.06, FIN_C, 0, FIN_W, 0.42, 0.1, 0xc9c6bd);
  for (const [b0, b1] of [[FIN0, ENT_B - ANCHO_PUERTAS / 2 - 0.4], [ENT_B + ANCHO_PUERTAS / 2 + 0.4, FIN1]]) {
    const bc = (b0 + b1) / 2, bw = b1 - b0;
    fin(0.1, bc, 0.42, bw, CRISTAL_ALTO, 0.12, CRISTAL);
    fin(0.14, bc, 0.42, bw, 0.16, 0.18, ALU);
    fin(0.14, bc, CANAL_Y - 0.24, bw, 0.18, 0.18, ALU);
    fin(0.14, bc, 2.55, bw, 0.12, 0.16, ALU);
    for (let b = b0 + 1.2; b < b1; b += 2.4) fin(0.14, b, 0.42, 0.12, CRISTAL_ALTO, 0.16, ALU);
  }
  // la marquesina corrida: forjado, canto blanco y dos columnas finas
  fin(CANAL_V / 2, FIN_C, CANAL_Y - 0.26, FIN_W + 0.8, 0.26, CANAL_V, 0xf4f2ec);
  fin(CANAL_V - 0.09, FIN_C, CANAL_Y - 0.92, FIN_W + 0.8, 0.66, 0.18, 0xf7f5ee);
  for (const b of [FIN0 + 1.2, FIN1 - 1.2]) {
    const [cx, cz] = P(LEN + CANAL_V - 0.42, b);
    const y0 = alto(cx, cz);
    k.cyl(cx, y0, cz, 0.13, 0.13, CANAL_Y - 0.26 - y0, 0xd7d5cc, { seg: 10 });
  }
  // la entrada de clientes: el zaguán en sombra y las dos puertas correderas de cristal
  fin(0.05, ENT_B, 0, ANCHO_PUERTAS + 0.8, CANAL_Y - 0.3, 0.1, 0x232a2d);
  for (const db of [-2.5, 2.5]) {
    fin(0.12, ENT_B + db, 0.08, 3.0, CANAL_Y - 0.6, 0.08, 0x82979f);
    fin(0.14, ENT_B + db, 0.08, 3.0, 0.09, 0.1, ALU);
    fin(0.14, ENT_B + db, CANAL_Y - 0.62, 3.0, 0.1, 0.1, ALU);
    fin(0.14, ENT_B + db - 1.45, 0.08, 0.1, CANAL_Y - 0.6, 0.12, ALU);
    fin(0.14, ENT_B + db + 1.45, 0.08, 0.1, CANAL_Y - 0.6, 0.12, ALU);
  }
  for (const db of [-ANCHO_PUERTAS / 2 - 0.1, -0.55, 0.55, ANCHO_PUERTAS / 2 + 0.1]) {
    fin(0.16, ENT_B + db, 0.05, 0.16, CANAL_Y - 0.28, 0.18, 0x8e979b);
  }
  fin(0.16, ENT_B, CANAL_Y - 0.42, ANCHO_PUERTAS + 0.9, 0.22, 0.2, 0x8e979b);
  const [fx2, fz2] = P(LEN + 1.15, ENT_B);
  k.box(fx2, alto(fx2, fz2) + 0.01, fz2, 7.4, 0.02, 1.8, 0x55585a, { ry: RY2, list: k.shell });
  // los carros metálicos apilados junto a la pared, a un lado de la entrada
  for (const [b, n] of [[ENT_B + 7.4, 5], [ENT_B + 9.0, 4], [ENT_B - 8.4, 6]]) {
    for (let i = 0; i < n; i++) {
      const [x, z] = P(LEN + 1.6, b + i * 0.32);
      carro(k, x, alto(x, z), z, RY2);
    }
  }
  // el rótulo grande de HiperDino sobre la marquesina, mirando a la Calle Iguazú
  const [gx, gz] = P(LEN + 0.12, ENT_B);
  k.pic(gx, 6.3, gz, 16.5, 1.9, U[0], U[1], rotulo('HiperDino'));

  // ── la azotea: las cajas de climatización y los lucernarios ──
  for (const [u, v] of [[16, -12], [40, -30], [62, -16], [88, -34]]) {
    const [hx, hz] = P(u, v);
    k.box(hx, ALTO + 0.1, hz, 3.2, 1.1, 2.2, 0xb9bcb8, { ry: RY, list: k.shell });
  }
  for (const u of [30, 55, 78]) {
    const [sx, sz] = P(u, -WID / 2);
    k.box(sx, ALTO + 0.1, sz, 3.4, 0.14, 3.4, 0xd5dde0, { ry: RY, list: k.shell });
  }

  // ── el suelo del solar, siguiendo la cuesta ──
  const tex = asfalto();
  /** rejilla sobre el rectángulo (u0..u1, v0..v1) a la altura del terreno */
  const rejilla = (u0, u1, v0, v1) => {
    const nu = Math.max(1, Math.ceil((u1 - u0) / 1.6)), nv = Math.max(1, Math.ceil((v1 - v0) / 1.6));
    const ps = [];
    for (let i = 0; i <= nu; i++) {
      for (let j = 0; j <= nv; j++) {
        const [x, z] = P(u0 + (u1 - u0) * i / nu, v0 + (v1 - v0) * j / nv);
        ps.push({ x, z, y: alto(x, z) });
      }
    }
    const at = (i, j) => ps[i * (nv + 1) + j];
    const pos = [], uv = [], mpt = tex.userData.mpt || 4;
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        for (const p of [at(i, j), at(i + 1, j + 1), at(i, j + 1), at(i, j), at(i + 1, j), at(i + 1, j + 1)]) {
          pos.push(p.x, p.y, p.z);
          uv.push(p.x / mpt, -p.z / mpt);
        }
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.computeVertexNormals();
    return geo;
  };
  const asfaltar = (u0, u1, v0, v1, color, name) => {
    const m = new THREE.Mesh(rejilla(u0, u1, v0, v1), paveMaterial(tex, color));
    m.name = name; m.receiveShadow = true; scene.add(m);
  };
  asfaltar(0, LEN, 0, 4.4, 0xcfccc3, 'hiperdinoAcera');
  asfaltar(2, LEN - 2, 4.4, V_LAMAS, 0xffffff, 'hiperdinoAparcamiento');

  /** una raya de las plazas, tumbada sobre el asfalto */
  const raya = (u0, v0, u1, v1) => {
    const [x0, z0] = P(u0, v0), [x1, z1] = P(u1, v1);
    const largo = Math.hypot(x1 - x0, z1 - z0);
    const y = Math.max(alto(x0, z0), alto(x1, z1)) + 0.02;
    k.box((x0 + x1) / 2, y, (z0 + z1) / 2, 0.1, 0.012, largo + 0.06, 0xeceae2,
      { ry: Math.atan2(x1 - x0, z1 - z0), list: k.shell });
  };
  for (let u = 6; u < LEN - 6; u += PLAZA) {
    // delante del portón no se pinta plaza: es la zona de maniobra del camión
    if (Math.abs(u - MUELLE) < 8.4) continue;
    for (const [a, b] of FILAS) raya(u, a, u, b);
  }
  // la zona de carga, marcada en el firme: dos líneas y la boca de la rampa
  for (const du of [-7.4, 7.4]) raya(MUELLE + du, 0.9, MUELLE + du, 12.6);
  raya(MUELLE - 7.4, 12.6, MUELLE + 7.4, 12.6);

  // ── el muro de lamas blancas hacia la acera de Tenderete, con el hueco de la entrada de camiones ──
  const modulo = 2.4;
  for (const [u0, u1] of [[2.4, MUELLE - 7.2], [MUELLE + 7.2, LEN - 2.4]]) {
    for (let u = u0; u < u1 - 0.3; u += modulo) {
      const ue = Math.min(u + modulo, u1);
      const [x0, z0] = P(u, V_LAMAS), [x1, z1] = P(ue, V_LAMAS);
      const y0 = alto(x0, z0), ym = (y0 + alto(x1, z1)) / 2;
      k.box(x0, y0, z0, 0.16, 2.45, 0.16, 0xe4e2d9, { ry: RY, list: k.shell });
      k.box((x0 + x1) / 2, ym + 2.22, (z0 + z1) / 2, ue - u, 0.16, 0.16, 0xeceadf, { ry: RY, list: k.shell });
      k.box((x0 + x1) / 2, ym + 0.16, (z0 + z1) / 2, ue - u, 0.16, 0.16, 0xe9e7db, { ry: RY, list: k.shell });
      for (let t = u + 0.08; t < ue; t += 0.14) {
        const [x, z] = P(t, V_LAMAS);
        k.box(x, alto(x, z) + 0.22, z, 0.06, 2.0, 0.05, 0xf3f1ea, { ry: RY, list: k.shell });
      }
      k.block((x0 + x1) / 2, (z0 + z1) / 2, ue - u, 0.22, RY);
    }
  }

  // el choque de la nave
  k.block(CENTRO[0], CENTRO[1], LEN, WID, RY);

  const { group, segs } = k.build('hiperdinoArgana');
  scene.add(group);
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);

  return { group, plazas: Math.round((LEN - 12) / PLAZA) * FILAS.length };
}
