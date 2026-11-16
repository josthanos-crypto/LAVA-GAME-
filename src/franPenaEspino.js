import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales, galeria } from './edificioReal.js';
import { Z, ZF, BLANCO, VERDE, pared, pretil } from './rapadurasSur.js';

/**
 * Lo pidió José Manuel (13/11/2026): en la calle Peña del Espino 24 (Altavista), la puerta de la casa abierta y Fran,
 * un chico alto, rubio, flaco y de pelo largo, que sale y entra; cuando te acercas andando, le preguntas por el
 * supermercado Los Bobos, por la cancha de baloncesto, por la de fútbol y por si van a hacer un asadero en el cuartito.
 * La casa, con la vista de la calle de Google de julio de 2025: blanca, de dos plantas, con la puerta verde de dos hojas,
 * la ventana verde, el zócalo de piedra y la galería verde de arriba. Las respuestas de Fran se pueden cambiar en DICHOS.
 */

// la cara de la manzana a la calle Peña del Espino (s del norte al sur; N al oeste, a la calle)
const M = marco([292.63, -1874.9], [284.62, -1830.0]);
const S0 = 26.3, S1 = 33.4, PUERTA = 29.8;
// dónde se para Fran en la acera (z hacia la calle) y dónde está dentro
const FUERA = 1.9, DENTRO = 0.0;
// lo que se hablan: el jugador pregunta y Fran contesta
const DICHOS = [
  ['fran', '¡Eh! ¿Qué pasa?'],
  ['yo', '¿Qué pasa, Fran? ¿Vamos al supermercado Los Bobos?'],
  ['fran', '¡Jajaja! Cuando quieras, yo me apunto.'],
  ['yo', '¿Y la cancha de baloncesto?'],
  ['fran', 'La del instituto, aquí abajo. ¡Echamos unas canastas!'],
  ['yo', '¿Y la de fútbol?'],
  ['fran', 'Justo al lado. Luego nos echamos un partido.'],
  ['yo', '¿Y vais a hacer un asadero en el cuartito?'],
  ['fran', '¡Claro que sí! Trae tú el carbón.'],
];

/** antes de levantar la ciudad */
export function tuneFranPenaEspino(map) {
  map.franPenaEspino = true;
}

/** el zaguán oscuro que se ve por la puerta abierta, con las dos hojas verdes abiertas hacia dentro */
function zaguan(g, w, h) {
  g.fillStyle = '#2a2420';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#4a3e34';
  g.fillRect(w * 0.28, h * 0.12, w * 0.44, h * 0.6);
  g.fillStyle = '#7a6a58';
  g.beginPath();
  g.moveTo(0, h); g.lineTo(w, h); g.lineTo(w * 0.72, h * 0.72); g.lineTo(w * 0.28, h * 0.72);
  g.closePath(); g.fill();
  g.fillStyle = '#2f7a3e';
  for (const lado of [0, 1]) {
    const x0 = lado ? w : 0, x1 = lado ? w * 0.8 : w * 0.2;
    g.beginPath();
    g.moveTo(x0, h * 0.02); g.lineTo(x1, h * 0.14); g.lineTo(x1, h * 0.86); g.lineTo(x0, h);
    g.closePath(); g.fill();
  }
  g.strokeStyle = '#225c2e';
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** el zócalo de piedra */
function piedra(g, w, h) {
  g.fillStyle = '#8a7a68';
  g.fillRect(0, 0, w, h);
  let s = 17;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 40; i++) {
    const v = 100 + r() * 60;
    g.fillStyle = `rgb(${Math.round(v + 10)},${Math.round(v)},${Math.round(v - 14)})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h, 4 + r() * 6, 3 + r() * 4, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
}

/** la fachada de la casa, con la puerta abierta */
function casa(k) {
  pared(k, S0, S1, 6.6, (g, w, h) => { g.fillStyle = '#f0f0ec'; g.fillRect(0, 0, w, h); });
  pretil(k, S0, S1, 6.6);
  k.pic((S0 + S1) / 2, 0.45, ZF + 0.008, S1 - S0, 0.9, 0, 1, canvasTex(Math.round((S1 - S0) * 30), 27, piedra));
  // la puerta verde abierta, la ventana verde y el escalón
  hueco(k, PUERTA, 0.12, 1.6, 2.4, canvasTex(96, 144, zaguan), { borde: 0x225c2e, z: ZF });
  k.box(PUERTA, 0, ZF + 0.25, 2.0, 0.12, 0.5, 0xd8d4ca);
  hueco(k, 27.6, 1.0, 1.3, 1.3, canvasTex(78, 78, cristales('#2f7a3e', 2)), { borde: 0x225c2e, z: ZF });
  hueco(k, 32.2, 1.0, 0.9, 1.1, canvasTex(54, 66, cristales('#2f7a3e', 2)), { borde: 0x225c2e, z: ZF });
  // la galería verde de arriba
  galeria(k, S0 + 0.4, S1 - 0.4, 3.4, Z, { sale: 0.6, alto: 2.0, color: VERDE });
}

/** Fran: alto, flaco, rubio, de pelo largo; con las piernas y los brazos que se mueven al andar */
function figura() {
  const g = new THREE.Group();
  const mat = (hex) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85 });
  const PIEL = mat(0xe8c4a8), PELO = mat(0xe0c070), VAQUERO = mat(0x3a4a6a), CAMISETA = mat(0x2c2e32), ZAPA = mat(0x1e1e20);
  const pieza = (geo, m, x, y, z) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; return o; };
  const cadera = 0.98;
  const piernas = [-0.09, 0.09].map((x) => {
    const p = new THREE.Group();
    p.position.set(x, cadera, 0);
    p.add(pieza(new THREE.CylinderGeometry(0.06, 0.055, 0.9, 8), VAQUERO, 0, -0.45, 0));
    p.add(pieza(new THREE.BoxGeometry(0.1, 0.07, 0.24), ZAPA, 0, -0.93, 0.05));
    g.add(p);
    return p;
  });
  g.add(pieza(new THREE.BoxGeometry(0.34, 0.62, 0.19), CAMISETA, 0, cadera + 0.31, 0));
  const brazos = [-0.215, 0.215].map((x) => {
    const b = new THREE.Group();
    b.position.set(x, cadera + 0.58, 0);
    b.add(pieza(new THREE.CylinderGeometry(0.045, 0.045, 0.3, 8), CAMISETA, 0, -0.15, 0));
    b.add(pieza(new THREE.CylinderGeometry(0.04, 0.035, 0.42, 8), PIEL, 0, -0.5, 0));
    g.add(b);
    return b;
  });
  g.add(pieza(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 8), PIEL, 0, cadera + 0.67, 0));
  g.add(pieza(new THREE.SphereGeometry(0.11, 14, 12), PIEL, 0, cadera + 0.82, 0.01));
  // el pelo largo y rubio: la parte de arriba, la melena de atrás hasta los hombros y los mechones de los lados
  const casco = new THREE.SphereGeometry(0.122, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
  g.add(pieza(casco, PELO, 0, cadera + 0.84, -0.005));
  g.add(pieza(new THREE.BoxGeometry(0.23, 0.42, 0.07), PELO, 0, cadera + 0.62, -0.1));
  for (const x of [-0.1, 0.1]) g.add(pieza(new THREE.BoxGeometry(0.04, 0.3, 0.12), PELO, x, cadera + 0.7, -0.02));
  g.userData = { piernas, brazos };
  return g;
}

/** se monta con lo demás */
export function buildFranPenaEspino(scene, colliders, map) {
  if (!map?.franPenaEspino) return null;
  const k = new Kit();
  casa(k);
  const fachada = enMarco(k, M, 'franPenaEspinoCasa', colliders);
  scene.add(fachada);
  // Fran va en un grupo con el mismo marco que la fachada: x a lo largo de la calle, z hacia la acera
  const marcoFran = new THREE.Group();
  marcoFran.name = 'franPenaEspino';
  marcoFran.position.set(M.B[0], 0, M.B[1]);
  marcoFran.rotation.y = M.ry;
  const fran = figura();
  marcoFran.add(fran);
  scene.add(marcoFran);
  andar(marcoFran, fran);
  return { fachada, fran: marcoFran };
}

/**
 * Lo que hace Fran: sale por la puerta, se queda un rato en la acera mirando a la calle y vuelve a entrar, una y otra
 * vez. Si te acercas andando, sale (o se queda fuera), se vuelve hacia ti y habláis; cuando te vas lejos, sigue a lo suyo.
 */
function andar(marcoFran, fran) {
  const { piernas, brazos } = fran.userData;
  const w = (s, z) => M.W(s, z);
  let fase = 'dentro', t = 0, z = DENTRO, paso = 0, hablado = false, ultimo = performance.now();
  const colocar = (zz, mira) => {
    fran.position.set(PUERTA, 0, zz);
    fran.rotation.y = mira;
    fran.visible = zz > 0.3;
  };
  const balancear = (dt, andando) => {
    paso += dt * (andando ? 7 : 0);
    const a = andando ? Math.sin(paso) * 0.5 : 0;
    piernas[0].rotation.x = a; piernas[1].rotation.x = -a;
    brazos[0].rotation.x = -a * 0.8; brazos[1].rotation.x = a * 0.8;
  };
  const cerca = () => {
    const g = window.__game;
    if (!g?.onFoot?.pos || (g.getMode && g.getMode() === 'car')) return Infinity;
    const [x, zz] = w(PUERTA, FUERA);
    return Math.hypot(g.onFoot.pos.x - x, g.onFoot.pos.y - zz);
  };
  const miraJugador = () => {
    const g = window.__game, [x, zz] = w(PUERTA, FUERA);
    const dx = g.onFoot.pos.x - x, dz = g.onFoot.pos.y - zz;
    return Math.atan2(dx, dz) - M.ry;
  };
  const hablar = () => {
    const g = window.__game;
    if (!g?.dialog || g.dialog.busy) return;
    const yo = g.missions?.charName?.() || 'Tú';
    g.dialog.play(DICHOS.map(([quien, texto]) => (quien === 'fran' ? { who: 'Fran', text: texto } : { who: yo, text: texto, player: true })));
  };
  const vuelta = (ahora) => {
    if (!marcoFran.parent) return;
    const dt = Math.min(0.25, (ahora - ultimo) / 1000);
    ultimo = ahora;
    const d = cerca();
    if (d > 12) hablado = false;
    const quiereHablar = d < 4.5 && !hablado;
    t += dt;
    if (fase === 'dentro') {
      balancear(dt, false);
      colocar(DENTRO, 0);
      if (t > 3 || quiereHablar) { fase = 'sale'; t = 0; }
    } else if (fase === 'sale') {
      z = Math.min(FUERA, z + dt * 1.2);
      balancear(dt, true);
      colocar(z, 0);
      if (z >= FUERA) { fase = 'fuera'; t = 0; }
    } else if (fase === 'fuera') {
      balancear(dt, false);
      if (d < 6) {
        colocar(FUERA, miraJugador());
        if (quiereHablar) { hablar(); hablado = true; }
        t = 0;
      } else {
        colocar(FUERA, Math.sin(t * 0.4) * 0.6);
        if (t > 6) { fase = 'entra'; t = 0; }
      }
    } else if (fase === 'entra') {
      z = Math.max(DENTRO, z - dt * 1.2);
      balancear(dt, true);
      colocar(z, Math.PI);
      if (quiereHablar) { fase = 'sale'; t = 0; }
      else if (z <= DENTRO) { fase = 'dentro'; t = 0; }
    }
    requestAnimationFrame(vuelta);
  };
  requestAnimationFrame(vuelta);
}
