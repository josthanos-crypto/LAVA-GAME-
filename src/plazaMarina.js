import * as THREE from 'three';
import { paveMesh, plazaSlabs } from './suelos.js';
import { trocear } from './restaurantesCharco.js';

/**
 * La plaza del norte de la Marina Lanzarote (donde arrancan los pantalanes A, B y C y la pasarela), con la
 * foto aérea del puerto deportivo y la de las letras de marzo de 2025 de Google Maps (solo se miran, no van
 * dentro del juego): la franja del borde del muelle, que se veía del color del agua como el paseo, pasa a
 * ser de losas con el borde de piedra y su bordillo; y junto al agua, con los barcos detrás, las letras
 * grandes «marina» y «lanzarote» de color blanco roto sobre su jardinera alargada de hormigón, con las dos
 * palmeras jóvenes. El sitio de las letras es el de la foto (junto al agua de la plaza), a ojo.
 */

// el borde del agua de la plaza, del paseo (sur) a la pasarela (norte), sacado del mapa
const ORILLA = [[1015.1, 95.6], [994.9, 133.7], [979.5, 163.4], [967.4, 157.1], [967, 158.1], [956.2, 179],
  [944.4, 198.8], [945.6, 203], [946.7, 207], [994.4, 236.2]];
// lo que entra la franja de losas hacia la plaza desde el borde del agua, y su altura (la del paseo)
const ANCHO = 10, ALTO = 0.2;
// las letras: el centro en el borde de la plaza entre los pantalanes C y B, mirando hacia la plaza
const LETRAS = { x: 990.04, z: 150.02, mira: [0.888, 0.46] };

/** antes de levantar la ciudad: las dos palmeras de la jardinera de las letras */
export function tunePlazaMarina(map) {
  map.extraPalms = map.extraPalms || [];
  const { x, z, mira } = LETRAS, lat = [mira[1], -mira[0]];
  for (const [d, h, g] of [[-0.9, 5.2, 0.4], [0.7, 5.8, 2.2]]) map.extraPalms.push([x - mira[0] * 1.2 + lat[0] * d, z - mira[1] * 1.2 + lat[1] * d, h, g]);
  map.plazaMarina = true;
}

/** la normal de un tramo hacia la tierra (la plaza queda a ese lado yendo de sur a norte por la orilla) */
function haciaTierra(a, b) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return [(b[1] - a[1]) / L, -(b[0] - a[0]) / L];
}

/** la franja de losas: un cuadrilátero por tramo de orilla y una cuña en cada esquina para que no queden huecos */
function franja() {
  const tris = [];
  const normales = [];
  for (let i = 0; i < ORILLA.length - 1; i++) {
    const a = ORILLA[i], b = ORILLA[i + 1], n = haciaTierra(a, b);
    normales.push(n);
    const a2 = [a[0] + n[0] * ANCHO, a[1] + n[1] * ANCHO], b2 = [b[0] + n[0] * ANCHO, b[1] + n[1] * ANCHO];
    tris.push([a, b, b2], [a, b2, a2]);
  }
  for (let i = 1; i < ORILLA.length - 1; i++) {
    const p = ORILLA[i], n1 = normales[i - 1], n2 = normales[i];
    tris.push([p, [p[0] + n1[0] * ANCHO, p[1] + n1[1] * ANCHO], [p[0] + n2[0] * ANCHO, p[1] + n2[1] * ANCHO]]);
  }
  return paveMesh(trocear(tris, 2), ALTO, plazaSlabs(), 0xffffff);
}

/** el borde del muelle: la cara de piedra que baja al agua y el bordillo claro de arriba */
function bordeMuelle(group) {
  const piedra = new THREE.MeshStandardMaterial({ color: 0x5c5a56, roughness: 0.95 });
  const bordillo = new THREE.MeshStandardMaterial({ color: 0xd4d0c6, roughness: 0.8 });
  for (let i = 0; i < ORILLA.length - 1; i++) {
    const a = ORILLA[i], b = ORILLA[i + 1];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ry = -Math.atan2(b[1] - a[1], b[0] - a[0]);
    const cara = new THREE.Mesh(new THREE.BoxGeometry(L + 0.3, ALTO + 0.8, 0.3), piedra);
    cara.position.set((a[0] + b[0]) / 2, (ALTO - 0.8) / 2, (a[1] + b[1]) / 2);
    cara.rotation.y = ry;
    const remate = new THREE.Mesh(new THREE.BoxGeometry(L + 0.3, 0.05, 0.4), bordillo);
    remate.position.set((a[0] + b[0]) / 2, ALTO + 0.02, (a[1] + b[1]) / 2);
    remate.rotation.y = ry;
    for (const m of [cara, remate]) { m.receiveShadow = true; group.add(m); }
  }
}

/** una fila de letras en un lienzo transparente: blanco roto, en letra redonda */
function texturaLetras(texto, sombra) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = sombra ? '#b8b2a2' : '#f4eee0';
  g.textAlign = 'center';
  g.textBaseline = 'alphabetic';
  g.font = `700 ${Math.round(c.height * 0.92)}px "Century Gothic", "Futura", "Segoe UI", Arial, sans-serif`;
  g.fillText(texto, c.width / 2, c.height * 0.8);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** una fila de letras con grosor: varias capas del mismo lienzo, la de delante clara y las de dentro en sombra */
function filaLetras(texto, ancho, alto) {
  const fila = new THREE.Group();
  const clara = new THREE.MeshStandardMaterial({ map: texturaLetras(texto, false), transparent: true, alphaTest: 0.5, roughness: 0.6, side: THREE.DoubleSide });
  const sombra = new THREE.MeshStandardMaterial({ map: texturaLetras(texto, true), transparent: true, alphaTest: 0.5, roughness: 0.8, side: THREE.DoubleSide });
  const plano = new THREE.PlaneGeometry(ancho, alto);
  for (let i = 0; i <= 6; i++) {
    const m = new THREE.Mesh(plano, i === 0 || i === 6 ? clara : sombra);
    m.position.z = -i * 0.025;
    fila.add(m);
  }
  return fila;
}

/** las letras «marina lanzarote» sobre su jardinera de hormigón */
function letras(group) {
  const { x, z, mira } = LETRAS;
  const cartel = new THREE.Group();
  const hormigon = new THREE.MeshStandardMaterial({ color: 0xbdb9b0, roughness: 0.95 });
  // la jardinera alargada de delante y la de detrás, de donde salen las palmeras
  const base = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.55, 0.9), hormigon);
  base.position.set(0, ALTO + 0.275, 0);
  const atras = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 1.6), hormigon);
  atras.position.set(-0.2, ALTO + 0.3, -1.3);
  const tierra = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.02, 1.4), new THREE.MeshStandardMaterial({ color: 0x3a2e26, roughness: 1 }));
  tierra.position.set(-0.2, ALTO + 0.61, -1.3);
  cartel.add(base, atras, tierra);
  // «lanzarote» abajo, apoyada en la jardinera, y «marina» arriba, sobre dos patas finas
  const abajo = filaLetras('lanzarote', 6.6, 1.65);
  abajo.position.set(0, ALTO + 0.55 + 0.7, 0.2);
  const arriba = filaLetras('marina', 4.0, 1.4);
  arriba.position.set(-0.6, ALTO + 0.55 + 1.85, 0.0);
  for (const dx of [-1.8, 0.6]) {
    const pata = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.4, 0.07), new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.6 }));
    pata.position.set(dx, ALTO + 0.55 + 1.2, -0.1);
    cartel.add(pata);
  }
  cartel.add(abajo, arriba);
  cartel.position.set(x, 0, z);
  cartel.rotation.y = Math.atan2(mira[0], mira[1]);
  group.add(cartel);
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildPlazaMarina(scene, map) {
  if (!map?.plazaMarina) return null;
  const group = new THREE.Group();
  group.name = 'plazaMarina';
  const suelo = franja();
  if (suelo) group.add(suelo);
  bordeMuelle(group);
  letras(group);
  scene.add(group);
  return { group };
}
