import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { paveMesh, polyTris, asfalto } from './suelos.js';

/**
 * Conforama de Playa Honda, en la Avenida Mamerto Cabrera (foto de Street View de julio de
 * 2025, «la entrada a Conforama»): la nave de la tienda con el rótulo en la fachada y el
 * emblema redondo en el bloque alto de la esquina, el aparcamiento delante con sus plazas
 * pintadas, y —lo que se ve al llegar— el ramal que sale de la avenida hacia el aparcamiento,
 * con el triángulo de chevrones en el asfalto, la isleta de bordillo blanco y baldosa táctil,
 * el quitamiedos de la mediana y la señal azul de girar a la derecha.
 *
 * La planta es la de OpenStreetMap (el nodo de Conforama cae dentro de esta nave), así que la
 * posición y el choque son los del edificio real: se quita el bloque genérico (`skip`) y se
 * levanta el de verdad. El aparcamiento va en la franja llana que queda entre la nave y la
 * avenida: el patio del fondo es una hondonada del terreno y ahí la arena tapaba el asfalto.
 */

// las cuatro esquinas de la nave en el mapa (noreste, sureste, noroeste, suroeste)
const NE = [-3846.1, 416.7], SE = [-3834.8, 526.5], NW = [-3882.5, 420.5], SW = [-3871.3, 530.2];
const LEN = Math.hypot(SE[0] - NE[0], SE[1] - NE[1]);      // 110,4 m de largo
const WID = Math.hypot(NW[0] - NE[0], NW[1] - NE[1]);      // 36,6 m de fondo
const U = [(SE[0] - NE[0]) / LEN, (SE[1] - NE[1]) / LEN];  // el eje largo, de norte a sur
const W = [(NW[0] - NE[0]) / WID, (NW[1] - NE[1]) / WID];  // hacia el oeste (hacia dentro)
// las cajas llevan el ancho (w) a lo largo de la fachada: rotateY gira la x hacia U con este ángulo
const RY = Math.atan2(U[0], U[1]) + Math.PI / 2;
const P = (u, v) => [NE[0] + U[0] * u + W[0] * v, NE[1] + U[1] * u + W[1] * v];
const ESTE = [-W[0], -W[1]];   // normal de la fachada que da al aparcamiento
const SUR = [U[0], U[1]];      // normal del testero que da a la avenida

const ALTO = 8.4;              // la nave
const ALTO_SUR = 10.8;         // el bloque alto de la esquina (el del emblema)
const SUR0 = LEN - 26;         // dónde empieza el bloque alto
const CRUDO = 0xe9e6df, GRIS = 0x4a4d51, OSCURO = 0x33363a, CRISTAL = 0x2b343a;
const ALU = 0x8f969c, LINEA = 0xe9e7e0, BORDILLO = 0xd7d5cd;
const ROJO_HEX = '#c8102e';     // el rojo de la marca, para los lienzos

// el aparcamiento: la franja entre la nave y la avenida, y la boca que cruza la acera
const LOT = [[-3838, 531], [-3802, 531], [-3802, 547], [-3846, 547], [-3846, 536]];
const MOUTH = [[-3838, 546], [-3806, 546], [-3806, 551.5], [-3838, 551.5]];
const SUELO = 0.55;            // el asfalto, por encima de la acera (la tierra de alrededor sube hacia la nave)
const BOCA = [-3822, 548];     // centro de la boca (la isleta y la señal)

/** quita la nave genérica del mapa: este modelo trae la de verdad */
export function tuneConforama(map) {
  for (const b of map.buildings || []) {
    let cx = 0, cz = 0;
    for (const q of b.p) { cx += q[0]; cz += q[1]; }
    cx /= b.p.length; cz /= b.p.length;
    if (Math.hypot(cx - (NE[0] + SE[0] + NW[0] + SW[0]) / 4, cz - (NE[1] + SE[1] + NW[1] + SW[1]) / 4) < 12) {
      b.skip = true; b.conforama = true;
    }
  }
}

/** una placa de rótulo: «Conforama» en gris oscuro sobre el muro crudo */
function rotulo(w, h, texto, { color = '#33363a', fondo = '#e9e6df', sombra = true } = {}) {
  return canvasTex(w, h, (g, cw, ch) => {
    g.fillStyle = fondo; g.fillRect(0, 0, cw, ch);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(ch * 0.64)}px "Barlow", Arial, Helvetica, sans-serif`;
    if (sombra) { g.fillStyle = 'rgba(0,0,0,.14)'; g.fillText(texto, cw / 2, ch * 0.5 + ch * 0.045); }
    g.fillStyle = color;
    g.fillText(texto, cw / 2, ch * 0.5);
  });
}

/** el emblema redondo: aro rojo y «conforama» dentro, sobre placa blanca */
function emblema() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#e9e6df'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.46, 0, Math.PI * 2); g.fill();
    g.strokeStyle = ROJO_HEX; g.lineWidth = w * 0.075;
    g.beginPath(); g.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); g.stroke();
    g.fillStyle = ROJO_HEX; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `700 ${Math.round(w * 0.15)}px "Barlow", Arial, sans-serif`;
    g.fillText('conforama', w / 2, h / 2 - w * 0.01);
    g.font = `600 ${Math.round(w * 0.072)}px "Barlow", Arial, sans-serif`;
    g.fillStyle = '#6a6d72';
    g.fillText('LANZAROTE', w / 2, h / 2 + w * 0.14);
  });
}

/** el triángulo de chevrones del ramal, pintado en el asfalto (fondo transparente) */
function chevrones() {
  return canvasTex(512, 200, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    // el triángulo: punta a la derecha (por donde entra el coche) y base a la izquierda
    g.beginPath();
    g.moveTo(w * 0.97, h * 0.5);
    g.lineTo(w * 0.1, h * 0.04);
    g.lineTo(w * 0.1, h * 0.96);
    g.closePath();
    g.fillStyle = 'rgba(238,236,230,0.94)';
    g.fill();
    g.fillStyle = 'rgba(58,60,62,0.6)';
    g.beginPath();
    g.moveTo(w * 0.9, h * 0.5);
    g.lineTo(w * 0.17, h * 0.12);
    g.lineTo(w * 0.17, h * 0.88);
    g.closePath();
    g.fill();
    // los chevrones, apuntando a la salida
    g.strokeStyle = 'rgba(240,238,232,0.95)';
    g.lineWidth = h * 0.1;
    for (let i = 0; i < 5; i++) {
      const x = w * (0.74 - i * 0.13);
      g.beginPath();
      g.moveTo(x, h * 0.24);
      g.lineTo(x - w * 0.07, h * 0.5);
      g.lineTo(x, h * 0.76);
      g.stroke();
    }
  });
}

/** la señal azul redonda de obligación de girar a la derecha */
function senalAzul() {
  return canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#1f5fa8'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.47, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = w * 0.045;
    g.beginPath(); g.arc(w / 2, h / 2, w * 0.41, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = '#ffffff'; g.lineWidth = w * 0.105; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(w * 0.39, h * 0.75); g.lineTo(w * 0.39, h * 0.47); g.lineTo(w * 0.62, h * 0.47);
    g.stroke();
    g.fillStyle = '#ffffff'; g.beginPath();
    g.moveTo(w * 0.75, h * 0.47); g.lineTo(w * 0.58, h * 0.35); g.lineTo(w * 0.58, h * 0.59);
    g.closePath(); g.fill();
  });
}

/** el quitamiedos de la mediana: postes cada 6 m y la chapa a 0,72 m */
function quitamiedos() {
  const g = new THREE.Group();
  const acero = new THREE.MeshStandardMaterial({ color: 0x9aa1a6, metalness: 0.65, roughness: 0.42 });
  const X0 = -3820, X1 = -3738, Z = 563.5;
  const n = Math.round((X1 - X0) / 3);
  const chapa = new THREE.InstancedMesh(new THREE.BoxGeometry(3.06, 0.32, 0.07), acero, n);
  const poste = new THREE.InstancedMesh(new THREE.BoxGeometry(0.11, 0.9, 0.13), acero, Math.ceil(n / 2));
  const m = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    m.makeTranslation(X0 + 1.5 + i * 3, 0.72, Z);
    chapa.setMatrixAt(i, m);
    if (i % 2 === 0) {
      m.makeTranslation(X0 + 1.5 + i * 3, 0.45, Z);
      poste.setMatrixAt(Math.round(i / 2), m);
    }
  }
  chapa.castShadow = poste.castShadow = true;
  g.add(chapa, poste);
  return g;
}

export function buildConforama(scene, colliders) {
  const k = new Kit();

  // ── la nave: el cuerpo largo y el bloque alto de la esquina ──
  const cNave = P(SUR0 / 2, WID / 2);
  k.box(cNave[0], 0, cNave[1], SUR0, ALTO, WID, CRUDO, { ry: RY, list: k.shell });
  const cSur = P((SUR0 + LEN) / 2, WID / 2);
  k.box(cSur[0], 0, cSur[1], LEN - SUR0, ALTO_SUR, WID, CRUDO, { ry: RY, list: k.shell });
  // remate de la azotea (cornisa)
  k.box(cNave[0], ALTO, cNave[1], SUR0 + 0.3, 0.35, WID + 0.3, 0xdcd9d2, { ry: RY, list: k.shell });
  k.box(cSur[0], ALTO_SUR, cSur[1], LEN - SUR0 + 0.3, 0.4, WID + 0.3, 0xdcd9d2, { ry: RY, list: k.shell });

  // una pieza pegada a una fachada: u a lo largo de la nave, v hacia fuera (0 = el muro)
  const bx = (u, v, y, w, h, d, hex, list = k.shell) => {
    const [x, z] = P(u, v);
    k.box(x, y, z, w, h, d, hex, { ry: RY, list });
  };

  // ── fachada este (la que se ve desde la LZ-301) ──
  bx(SUR0 / 2, -0.07, 0, SUR0 - 1.6, 1.75, 0.14, OSCURO);           // el zócalo oscuro
  bx((SUR0 + LEN) / 2, -0.07, 0, LEN - SUR0 - 1.6, 1.9, 0.14, OSCURO);
  bx(LEN / 2, -0.07, 1.75, LEN - 1.6, 0.22, 0.16, GRIS);            // la banda gris
  bx(SUR0 / 2, -0.09, 4.35, SUR0 - 1.2, 0.95, 0.18, GRIS);          // la franja oscura de la fachada
  bx((SUR0 + LEN) / 2, -0.09, 4.35, LEN - SUR0 - 1.2, 0.95, 0.18, GRIS);
  for (let u = 6; u < SUR0 - 6; u += 6.4) {
    bx(u + 1.5, -0.12, 0.55, 4.6, 2.5, 0.1, CRISTAL);               // escaparates
    for (const du of [-2.3, 0, 2.3]) bx(u + 1.5 + du, -0.16, 0.55, 0.09, 2.5, 0.08, ALU);
    bx(u + 1.5, -0.16, 0.55, 4.6, 0.09, 0.08, ALU);
  }
  // el rótulo grande de la fachada larga y el pequeño del otro extremo
  const [r1x, r1z] = P(SUR0 - 20, -0.05);
  k.pic(r1x, 6.4, r1z, 17, 2.6, ESTE[0], ESTE[1], rotulo(768, 118, 'Conforama'));
  const [r2x, r2z] = P(18, -0.05);
  k.pic(r2x, 6.2, r2z, 11, 1.7, ESTE[0], ESTE[1], rotulo(512, 80, 'Conforama'));

  // ── testero sur (u = LEN): la entrada, la marquesina y los rótulos que se ven al llegar ──
  const VENT = WID * 0.36;          // la puerta, hacia el lado del aparcamiento
  // una pieza en el testero: v a lo ancho de la nave (desde el este), y a la altura
  const fin = (v, y, largo, h, hex, d = 0.16, list = k.shell) => {
    const [x, z] = P(LEN + d / 2, v);
    k.box(x, y, z, d, h, largo, hex, { ry: RY, list });
  };
  fin(WID / 2, 0, WID - 1.4, 1.9, OSCURO);                          // el zócalo del testero
  fin(WID / 2, 1.9, WID - 1.4, 0.22, GRIS);
  fin(WID / 2, 4.35, WID - 1.2, 0.95, GRIS, 0.2);                   // la franja oscura
  // el escaparate corrido del testero y la puerta
  for (let v = 3; v < WID - 3; v += 3.6) {
    if (Math.abs(v - VENT) < 3.4) continue;
    fin(v, 0.5, 3.0, 2.7, CRISTAL, 0.1);
    fin(v - 1.6, 0.5, 0.09, 2.7, ALU, 0.14);
  }
  fin(VENT, 0, 6.2, 3.4, 0x1f2a30, 0.12);
  for (const dv of [-3.0, 0, 3.0]) fin(VENT + dv, 0, 0.14, 3.4, 0x6f767c, 0.18);
  // la marquesina sobre la puerta y el rótulo en su canto
  const [mqx, mqz] = P(LEN + 1.7, VENT);
  k.box(mqx, 4.2, mqz, 3.4, 0.3, 11, 0xf2efe8, { ry: RY });
  const [fpx, fpz] = P(LEN + 3.45, VENT);
  k.pic(fpx, 4.36, fpz, 5.2, 0.55, SUR[0], SUR[1], rotulo(512, 52, 'conforama', { color: '#f2efe8', fondo: ROJO_HEX, sombra: false }));
  // el nombre en grande y el emblema, en el testero, a la vista desde la avenida
  const [r3x, r3z] = P(LEN + 0.09, WID / 2 + 5);
  k.pic(r3x, 6.5, r3z, 16, 2.7, SUR[0], SUR[1], rotulo(768, 118, 'Conforama'));
  const [e1x, e1z] = P(LEN + 0.09, 6.5);
  k.pic(e1x, 8.3, e1z, 4.4, 4.4, SUR[0], SUR[1], emblema());
  // y el emblema de la esquina en la fachada este (la que da al aparcamiento)
  const [e2x, e2z] = P(SUR0 + 6, -0.06);
  k.pic(e2x, 8.2, e2z, 4.0, 4.0, ESTE[0], ESTE[1], emblema());

  // los muelles de carga, en el testero norte (no se ven desde la avenida)
  for (let v = 6; v < WID - 4; v += 9) {
    const [dx, dz] = P(-0.08, v + 2);
    k.box(dx, 0, dz, 0.16, 3.4, 3.6, 0x8d9298, { ry: RY, list: k.shell });
    k.box(dx - 0.06, 3.4, dz, 0.2, 0.22, 3.9, 0x6d7278, { ry: RY, list: k.shell });
  }
  // la azotea: las cajas de climatización
  for (const [u, v] of [[14, 9], [34, 24], [62, 12], [86, 20]]) {
    const [hx, hz] = P(u, v);
    k.box(hx, ALTO, hz, 3.4, 1.2, 2.4, 0xb9bcb8, { ry: RY, list: k.shell });
  }
  // el choque de la nave y del bloque alto
  k.block(cNave[0], cNave[1], SUR0, WID, RY);
  k.block(cSur[0], cSur[1], LEN - SUR0, WID, RY);

  // ── el aparcamiento: dos filas de plazas con el pasillo en medio ──
  const raya = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0);
    k.box((x0 + x1) / 2, SUELO + 0.02, (z0 + z1) / 2, 0.1, 0.012, L + 0.06, LINEA,
      { ry: Math.atan2(x1 - x0, z1 - z0), list: k.shell });
  };
  const PASO = 2.5;
  for (let x = -3834.5; x < -3804; x += PASO) {
    raya(x, 531.4, x, 536.0);      // fila del norte, de morro a la tienda
    raya(x + PASO, 531.4, x + PASO, 536.0);
    raya(x, 542.0, x, 546.6);      // fila del sur, de morro a la avenida
    raya(x + PASO, 542.0, x + PASO, 546.6);
  }
  for (const z of [536.0, 542.0]) {
    k.box(-3820, SUELO + 0.02, z, 36, 0.012, 0.1, LINEA, { list: k.shell });
  }

  // los bordillos del aparcamiento (rebajados en la boca)
  const curba = (x0, z0, x1, z1) => {
    const L = Math.hypot(x1 - x0, z1 - z0);
    k.box((x0 + x1) / 2, SUELO - 0.22, (z0 + z1) / 2, L, 0.26, 0.22, BORDILLO,
      { ry: Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2, list: k.shell });
  };
  curba(-3838.4, 530.8, -3801.8, 530.8);
  curba(-3801.8, 530.8, -3801.8, 546.8);
  curba(-3846.4, 536.2, -3846.4, 547.2);
  curba(-3846.4, 547.2, -3838.6, 547.2);
  curba(-3805.8, 547.2, -3801.8, 547.2);

  // ── el pintado del ramal, tumbado sobre el asfalto de la avenida ──
  const chev = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 7.4),
    new THREE.MeshBasicMaterial({ map: chevrones(), transparent: true, depthWrite: false, opacity: 0.92 }),
  );
  chev.rotation.x = -Math.PI / 2;
  chev.rotation.z = Math.atan2(3, 22);
  chev.position.set(-3796, 0.26, 551.8);
  chev.renderOrder = 2;
  scene.add(chev);

  // ── la isleta de la boca, con el bordillo blanco y la baldosa táctil ──
  const isX = -3802, isZ = 549.2, isR = 0.1;
  k.box(isX, SUELO - 0.2, isZ, 7.4, 0.24, 3.4, BORDILLO, { ry: isR, list: k.shell });
  k.box(isX, SUELO + 0.04, isZ, 6.8, 0.02, 2.9, 0xc9c5ba, { ry: isR, list: k.shell });
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 2; j++) {
      k.box(isX - 2.7 + i * 0.9, SUELO + 0.06, isZ - 0.9 + j * 0.55, 0.34, 0.03, 0.34, 0xbf9440, { ry: isR, list: k.shell });
    }
  }
  // el bolardo de la punta
  k.cyl(isX + 2.6, SUELO + 0.04, isZ + 0.6, 0.09, 0.11, 0.9, 0x5b5f63, { seg: 10 });
  k.cyl(isX + 2.6, SUELO + 0.9, isZ + 0.6, 0.1, 0.1, 0.12, 0xe8e5de, { seg: 10 });

  // ── la señal azul, en la mediana, a la vista de quien llega ──
  k.cyl(-3788, 0, 563.2, 0.055, 0.055, 2.75, 0x9aa0a6, { seg: 8 });
  const disco = new THREE.Mesh(
    new THREE.CircleGeometry(0.44, 24),
    new THREE.MeshStandardMaterial({ map: senalAzul(), transparent: true, roughness: 0.5, side: THREE.DoubleSide }),
  );
  disco.position.set(-3788, 2.6, 563.15);
  disco.rotation.y = Math.PI / 2;
  scene.add(disco);

  scene.add(quitamiedos());

  const { group, segs } = k.build('conforama');
  scene.add(group);
  if (colliders) for (const sg of segs) colliders.addSegment(...sg);

  // el asfalto, encima de la acera (con el bordillo rebajado en la boca)
  const tex = asfalto();
  for (const [poly, name] of [[LOT, 'conforamaAparcamiento'], [MOUTH, 'conforamaBoca']]) {
    const m = paveMesh(polyTris(poly), SUELO, tex, 0xffffff);
    if (m) { m.name = name; scene.add(m); }
  }

  return { group, plazas: 2 * Math.round(42 / PASO), isleta: true, senal: true };
}
