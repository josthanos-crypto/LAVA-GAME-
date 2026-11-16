import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';

/**
 * La pasarela de la Marina Lanzarote y el monolito de la esquina de la plaza del norte, con la foto aérea del
 * puerto deportivo de marzo de 2017 y la del monolito de enero de 2023 de Google Maps (solo se miran, no van
 * dentro del juego): la pasarela peatonal que sale de la esquina de la plaza y cruza el agua hasta la orilla
 * (unos 100 m), con el piso de hormigón gris claro, las barandillas metálicas a los dos lados y los pilotes; y
 * en la esquina, la laja alta de piedra volcánica con «marinalanzarote» en letras de acero, la piedra más
 * pequeña de al lado y, detrás, el mástil blanco con sus crucetas y la red de cables. En el mapa la pasarela
 * era un camino sobre el agua y el juego no la dibujaba: los peatones andaban por encima del mar.
 */

// la pasarela, de la esquina de la plaza (s 0) a la orilla, con la línea del mapa
const P = marco([945.59, 202.96], [851.71, 237]);
const ARRIBA = 0.3, PLAZA = 0.2, ANCHO = 3.0, HORMIGON = 0xc8c6c0, METAL = 0x8a8e94;
// el monolito: en la plaza junto al arranque de la pasarela, con la cara de las letras hacia la plaza
const M = marco([956.0, 200.3], [955.37, 199.52]);

/** antes de levantar la ciudad: no hay nada que quitar del mapa */
export function tunePasarelaMarina(map) {
  map.pasarelaMarina = true;
}

// ——— lo que se pinta en lienzo ———

/** la cara de la laja: la piedra parda con manchas claras y las letras de acero con el logo de cuadraditos */
function caraPiedra(g, w, h) {
  g.fillStyle = '#9a7656';
  g.fillRect(0, 0, w, h);
  let s = 13;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) {
    const v = r();
    g.fillStyle = v < 0.5 ? `rgba(222,200,160,${0.3 + r() * 0.35})` : `rgba(70,50,38,${0.3 + r() * 0.3})`;
    g.beginPath();
    g.ellipse(r() * w, r() * h, 3 + r() * 14, 2 + r() * 9, r() * 3, 0, Math.PI * 2);
    g.fill();
  }
  // el logo de cuadraditos y el nombre en letras de acero, a media altura
  g.fillStyle = '#c8ccd0';
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 3 !== 2) g.fillRect(w * 0.12 + i * 7, h * 0.38 + j * 7, 5, 5);
  g.font = `400 ${Math.round(w * 0.11)}px "Century Gothic", "Segoe UI", Arial, sans-serif`;
  g.textBaseline = 'middle';
  g.fillStyle = '#d8dce0';
  g.fillText('marinalanzarote', w * 0.1, h * 0.47);
}

// ——— las piezas ———

/** la pasarela: el piso, el canto, las barandillas con sus postes y los pilotes */
function pasarela(k, L) {
  k.box(L / 2, ARRIBA - 0.3, 0, L, 0.3, ANCHO, HORMIGON);
  for (const lado of [-1, 1]) k.box(L / 2, ARRIBA - 0.55, lado * (ANCHO / 2 - 0.1), L, 0.25, 0.2, 0x8a8882);
  for (let s = 3; s < L; s += 3) k.box(s, ARRIBA, 0, 0.03, 0.005, ANCHO, 0xa8a6a0);
  for (const lado of [-1, 1]) {
    const z = lado * (ANCHO / 2 - 0.05);
    for (let s = 0.2; s <= L; s += 2) k.box(s, ARRIBA, z, 0.05, 1.05, 0.05, METAL);
    k.box(L / 2, ARRIBA + 1.02, z, L, 0.05, 0.07, METAL);
    for (const y of [0.35, 0.7]) k.box(L / 2, ARRIBA + y, z, L, 0.02, 0.02, METAL);
  }
  for (let s = 6; s < L - 2; s += 8) for (const lado of [-1, 1]) k.cyl(s, -2.5, lado * 1.0, 0.22, 0.22, 2.3, 0x6a6862, { seg: 8 });
}

/** una laja de piedra volcánica: una caja con los bordes movidos para que quede irregular */
function laja(w, h, d, seed) {
  const g = new THREE.BoxGeometry(w, h, d, 3, 6, 1);
  let s = seed;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const borde = Math.abs(x) > w * 0.45 || y > h * 0.45;
    p.setXYZ(i, x + (borde ? (r() - 0.5) * 0.25 : 0), y + (y > h * 0.45 ? (r() - 0.6) * 0.5 : 0), z < 0 ? z + (r() - 0.5) * 0.2 : z);
  }
  g.translate(0, h / 2 + PLAZA, 0);
  g.computeVertexNormals();
  return g;
}

/** el monolito con las letras, la piedra pequeña y el mástil blanco con sus crucetas */
function monolito(k) {
  k.add(laja(1.9, 3.7, 0.8, 7), 0x9a7656);
  k.pic(0, PLAZA + 1.8, 0.41, 1.7, 3.2, 0, 1, canvasTex(340, 640, caraPiedra));
  k.block(0, 0, 1.9, 0.8);
  const pequena = laja(1.0, 2.1, 0.6, 19);
  pequena.translate(-3.2, 0, -0.6);
  k.add(pequena, 0x7a5e48);
  k.block(-3.2, -0.6, 1.0, 0.6);
  k.cyl(0, PLAZA, -2.4, 0.11, 0.14, 18, 0xf2f2ee, { seg: 10 });
  k.block(0, -2.4, 0.3, 0.3);
  for (const [y, a] of [[6.5, 2.6], [11, 2.0], [15, 1.3]]) k.box(0, PLAZA + y, -2.4, a, 0.08, 0.08, 0xf2f2ee);
}

/** la red de cables del mástil: desde el tope y las crucetas hasta un corro en el suelo */
function cables(group) {
  const pts = [];
  const tope = [0, PLAZA + 18, -2.4];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2, base = [Math.cos(a) * 3.2, PLAZA + 0.05, -2.4 + Math.sin(a) * 3.2];
    pts.push(...tope, ...base);
  }
  for (const [y, a] of [[6.5, 1.3], [11, 1.0], [15, 0.65]]) for (const lado of [-1, 1]) pts.push(lado * a, PLAZA + y, -2.4, ...tope);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  group.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x9aa0a6, transparent: true, opacity: 0.7 })));
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildPasarelaMarina(scene, colliders, map) {
  if (!map?.pasarelaMarina) return null;
  const group = new THREE.Group();
  group.name = 'pasarelaMarina';
  const kp = new Kit();
  pasarela(kp, P.len);
  group.add(enMarco(kp, P, 'pasarela', null));
  const km = new Kit();
  monolito(km);
  const piedras = enMarco(km, M, 'monolitoMarina', colliders);
  cables(piedras);
  group.add(piedras);
  scene.add(group);
  return { group };
}
