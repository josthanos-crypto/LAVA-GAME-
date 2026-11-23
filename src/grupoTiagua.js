import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, trocear } from './restaurantesCharco.js';
import { alturaBloque, cristales } from './edificioReal.js';
import { paveMesh, polyTris, tierra } from './suelos.js';

/**
 * Las empresas del Grupo Tiagua que pidió José Manuel (09/11/2026), cada una en el sitio que le da Google Maps y como
 * sale en las vistas de la calle de Google de julio de 2025 (solo se miran, no van dentro del juego; los logotipos no se
 * ponen, solo los nombres en letra normal):
 * - Mármoles Brito, en la Carretera Los Castillos 60: la nave blanca con la fila de ventanas marrones arriba, el rótulo
 *   oscuro de «MARMOLES BRITO», las ventanas y la puerta de abajo, las placas oscuras y el zócalo gris;
 * - Grupo Tiagua (Excavaciones y Transportes Tiagua), en la Carretera de Las Caletas 38, junto a la rotonda de Los
 *   Mármoles: el muro blanco largo con el nombre, las adelfas rosas delante y el guardarraíl, y la oficina baja detrás;
 * - Tinguatón Ferretería, en la Carretera de San Bartolomé 290: el edificio blanco con la placa de «TINGUATON, S.L.
 *   FERRETERIA EN GENERAL · MATERIAL DE FONTANERIA», la puerta de cristal con la carpintería blanca y la ventana con reja;
 *   y, como contó José Manuel y se ve en la foto aérea, al lado (mirando desde la carretera, a la derecha) el solar de
 *   los materiales: la tierra, los montones de arena, rofe y grava en sus boxes de bloques, los palés de bloques, los
 *   sacos grandes, el toro (la carretilla elevadora) con su palé, la nave del almacén con las puertas de garaje, y el muro
 *   con las dos entradas abiertas para los coches: por la Carretera de San Bartolomé y por detrás, por la calle Isa.
 */

const Z = 0.12, ZF = Z + 0.3, BLANCO = 0xf2f2ee;
// las caras de cada una, N hacia la calle
const MB = marco([1640.4, -1288.1], [1602.3, -1346]);
const TI = marco([2285.3, -1683.4], [2311.6, -1684.5]);
const TF = marco([-1957.3, -1463.6], [-1931.9, -1442.5]);
// el solar de Tinguatón: el frente de la Carretera de San Bartolomé (N hacia la calle; el solar hacia z negativo), la
// trasera de la calle Isa (N hacia la calle) y la cara de la nave que da al solar (N hacia el solar)
const SOLAR = marco([-1931.9, -1442.5], [-1903.8, -1420.6]);
const SOLAR_ISA = marco([-1873.3, -1450.3], [-1903.5, -1478.4]);
const NAVE = marco([-1931.9, -1442.5], [-1903.5, -1478.4]);
const SOLAR_SUELO = [[-1931.9, -1442.5], [-1903.8, -1420.6], [-1873.3, -1450.3], [-1903.5, -1478.4]];

/** antes de levantar la ciudad: los bloques blancos y a su altura */
export function tuneGrupoTiagua(map) {
  alturaBloque(map, 1600, -1290, 7.5, [236, 236, 232]);
  alturaBloque(map, 2298, -1690, 4, [240, 240, 236]);
  alturaBloque(map, -1935, -1475, 6.5, [240, 240, 236]);
  map.grupoTiagua = true;
}

/** un rótulo de letras sobre un fondo */
function rotulo(texto, fondo, color, fuente) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = color;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = fuente(h);
    g.fillText(texto, w / 2, h / 2 + 1, w * 0.92);
  };
}

/** la placa blanca de Tinguatón, con sus tres renglones */
function placaTinguaton(g, w, h) {
  g.fillStyle = '#f6f6f2';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8a8a86';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.fillStyle = '#2a3a6a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `700 ${Math.round(h * 0.26)}px Georgia, serif`;
  g.fillText('TINGUATON, S.L.', w / 2, h * 0.24, w * 0.9);
  g.font = `700 ${Math.round(h * 0.18)}px Arial, sans-serif`;
  g.fillText('FERRETERIA EN GENERAL', w / 2, h * 0.55, w * 0.92);
  g.fillText('MATERIAL DE FONTANERIA', w / 2, h * 0.8, w * 0.92);
}

const ventanaMarron = cristales('#6a4a34', 4, 'rgba(110,80,60,.5)');
const ventana = cristales('#c8c8c4', 3, 'rgba(70,80,90,.55)');

/** Mármoles Brito: la nave blanca de la Carretera Los Castillos (s 0 a 30, desde la esquina del norte) */
function marmolesBrito(k) {
  const L = 30, H = 7.5;
  k.box(L / 2, 0, Z + 0.15, L, H, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.box(L / 2, 0, ZF + 0.05, L, 0.7, 0.12, 0x8a8a86);
  k.box(L / 2, H - 0.2, ZF + 0.05, L, 0.2, 0.12, 0xe2e2de);
  // la fila de ventanas marrones de arriba y el rótulo oscuro en medio
  for (const s of [3, 8, 22, 27]) k.pic(s, 5.2, ZF + 0.012, 2.4, 0.9, 0, 1, canvasTex(96, 36, ventanaMarron));
  k.pic(15, 5.2, ZF + 0.03, 7, 1.2, 0, 1, canvasTex(420, 72, rotulo('MARMOLES BRITO', '#2a2c34', '#f2f2ee', h => `800 ${Math.round(h * 0.5)}px Arial, sans-serif`)));
  // abajo: las ventanas, la puerta de madera y las placas oscuras
  for (const s of [5, 9, 18, 21.5]) k.pic(s, 1.9, ZF + 0.012, 2.0, 1.4, 0, 1, canvasTex(80, 56, ventana));
  k.box(13.5, 0.7, ZF + 0.05, 1.6, 2.2, 0.08, 0x8a6a4a);
  for (const s of [3, 11, 26.5]) k.box(s, 1.4, ZF + 0.04, 0.9, 0.6, 0.04, 0x2a2a2e);
  // la barandilla del escalón de la entrada
  for (let s = 10.5; s <= 16.5; s += 1.5) k.box(s, 0.7, ZF + 0.9, 0.05, 0.9, 0.05, 0x9a9c9c);
  k.box(13.5, 1.6, ZF + 0.9, 6, 0.05, 0.05, 0x9a9c9c);
}

/** una mata de adelfa con sus flores rosas */
function adelfa(k, s, z, r) {
  k.ball(s, r * 0.9, z, r, 0x3e6a34);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26;
    k.ball(s + Math.cos(a) * r * 0.6, r * (1.2 + (i % 2) * 0.3), z + Math.sin(a) * r * 0.4, r * 0.32, 0xe48aa8);
  }
}

/** Grupo Tiagua: el muro blanco de la Carretera de Las Caletas, las adelfas y el guardarraíl */
function grupoTiagua(k) {
  const L = TI.len, s0 = -12, s1 = L + 14, DM = 1.0;
  // la fachada de la oficina baja (no se ve, tras el muro)
  k.box(L / 2, 0, Z + 0.15, L, 4, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  // el muro blanco con su albardilla y el nombre en la punta del este
  k.box((s0 + s1) / 2, 0, DM, s1 - s0, 2.6, 0.3, BLANCO);
  k.block((s0 + s1) / 2, DM, s1 - s0, 0.3);
  k.box((s0 + s1) / 2, 2.6, DM, s1 - s0 + 0.1, 0.08, 0.4, 0xdcdcd6);
  k.pic(s1 - 6, 1.9, DM + 0.16, 4.5, 0.9, 0, 1, canvasTex(300, 60, rotulo('Grupo Tiagua', '#f2f2ee', '#4a4c58', h => `italic 700 ${Math.round(h * 0.6)}px Georgia, serif`)));
  // las adelfas rosas delante del muro y el guardarraíl en el borde de la acera
  for (let s = s0 + 1; s < s1 - 1; s += 1.6) adelfa(k, s, DM + 1.2 + (Math.round(s) % 2) * 0.2, 0.62 + (Math.round(s * 3) % 3) * 0.08);
  for (let s = s0; s <= s1; s += 2) k.box(s, 0, DM + 3.2, 0.1, 0.75, 0.1, 0x8a8c8e);
  k.box((s0 + s1) / 2, 0.45, DM + 3.25, s1 - s0, 0.3, 0.05, 0xb8babc);
}

/** Tinguatón Ferretería: la fachada blanca de la Carretera de San Bartolomé (s de 21 a 33) */
function tinguaton(k) {
  const a = 21, b = TF.len, c = (a + b) / 2, H = 6.5;
  k.box(c, 0, Z + 0.15, b - a, H, 0.3, BLANCO);
  k.block(c, Z + 0.15, b - a, 0.3);
  k.box(c, H - 0.2, ZF + 0.05, b - a, 0.2, 0.12, 0xe2e2de);
  // la placa encima de la puerta
  k.pic(c, 4.4, ZF + 0.03, 4.4, 1.5, 0, 1, canvasTex(352, 120, placaTinguaton));
  // la puerta de cristal con la carpintería blanca (cuarterones) y los paños de los lados
  k.pic(c, 1.6, ZF + 0.012, 3.2, 3.0, 0, 1, canvasTex(128, 120, cristales('#f4f4f0', 4, 'rgba(90,100,110,.55)')));
  for (const ds of [-1.6, 0, 1.6]) k.box(c + ds, 0.1, ZF + 0.05, 0.1, 3.0, 0.08, 0xf4f4f0);
  for (const y of [1.1, 2.1]) k.box(c, y, ZF + 0.05, 3.2, 0.08, 0.08, 0xf4f4f0);
  // la ventana con reja de la derecha y la de la izquierda
  for (const ds of [-4, 3.8]) {
    k.pic(c + ds, 2.2, ZF + 0.012, 1.4, 1.1, 0, 1, canvasTex(56, 44, ventana));
    for (let x = -0.6; x <= 0.61; x += 0.2) k.box(c + ds + x, 1.65, ZF + 0.08, 0.03, 1.1, 0.03, 0xe6e6e2);
  }
}

/** un muro blanco del solar de s0 a s1, con una entrada abierta de e0 a e1 (la cancela corrida a un lado) */
function muroSolar(k, s0, s1, e0, e1) {
  for (const [a, b] of [[s0, e0], [e1, s1]]) {
    if (b - a < 0.2) continue;
    k.box((a + b) / 2, 0, 0, b - a, 2.4, 0.3, BLANCO);
    k.block((a + b) / 2, 0, b - a, 0.3);
    k.box((a + b) / 2, 2.4, 0, b - a + 0.05, 0.08, 0.38, 0xdcdcd6);
  }
  for (const s of [e0, e1]) k.box(s, 0, 0, 0.4, 2.7, 0.4, BLANCO);
  // la cancela de malla, corrida detrás del muro
  const w = e1 - e0;
  k.box(e0 - w / 2, 0.1, -0.4, w, 0.06, 0.06, 0x7a7c7e);
  k.box(e0 - w / 2, 2.1, -0.4, w, 0.06, 0.06, 0x7a7c7e);
  for (let s = e0 - w; s <= e0 + 0.01; s += 0.25) k.box(s, 0.1, -0.4, 0.03, 2.0, 0.03, 0x8a8c8e);
}

/** un palé de bloques de hormigón (s, z del centro; n de alto) */
function paleBloques(k, s, z, n = 1, y = 0) {
  for (let i = 0; i < n; i++) {
    const yy = y + i * 1.15;
    k.box(s, yy, z, 1.2, 0.14, 1.0, 0x8a6a44);
    k.box(s, yy + 0.14, z, 1.2, 0.95, 1.0, 0xa8a8a2);
    for (const d of [0.32, 0.63]) k.box(s, yy + 0.14 + d, z, 1.21, 0.02, 1.01, 0x8a8a84);
  }
}

/** un montón (arena, rofe, grava) */
function monton(k, s, z, r, h, color) {
  k.cyl(s, 0, z, r * 0.15, r, h, color, { seg: 14 });
  k.cyl(s + r * 0.35, 0, z + r * 0.2, r * 0.1, r * 0.7, h * 0.7, color, { seg: 12 });
}

/** el toro (la carretilla elevadora): amarillo, con su cabina, el mástil y las palas con un palé de bloques */
function toro(k, s, z) {
  const A = 0xe8b818;
  k.box(s, 0.35, z, 2.3, 0.9, 1.2, A);
  k.box(s - 0.8, 0.35, z, 0.7, 1.2, 1.15, 0x4a4a48);
  for (const [ds, dz] of [[-0.75, -0.62], [-0.75, 0.62], [0.65, -0.62], [0.65, 0.62]]) k.cyl(s + ds, 0.3, z + dz, 0.3, 0.3, 0.22, 0x1e1e1e, { seg: 12, rx: Math.PI / 2 });
  for (const dz of [-0.5, 0.5]) k.box(s - 0.2, 1.25, z + dz, 0.06, 1.1, 0.06, 0x2a2a2a);
  k.box(s - 0.2, 2.33, z, 1.0, 0.06, 1.06, 0x2a2a2a);
  k.box(s - 0.2, 1.25, z, 0.5, 0.05, 0.9, 0x3a3a3a);
  for (const dz of [-0.35, 0.35]) k.box(s + 1.4, 1.2, z + dz, 0.1, 2.3, 0.1, 0x3a3a3a);
  for (const dz of [-0.3, 0.3]) k.box(s + 2.0, 0.4, z + dz, 1.2, 0.05, 0.12, 0x3a3a3a);
  paleBloques(k, s + 2.1, z, 1, 0.45);
}

/** el solar de los materiales de Tinguatón (s a lo largo de la carretera, z hacia dentro negativo) */
function solar(k) {
  const L = SOLAR.len;
  muroSolar(k, 0, L, 15, 23);
  // los boxes de bloques del fondo con los montones: arena, rofe (picón rojo), grava y picón negro
  const zb = -34;
  for (let i = 0; i <= 4; i++) k.box(4 + i * 7, 0, zb, 0.25, 1.6, 6, 0xb4b4ae);
  k.box(18, 0, zb - 3, 28, 1.6, 0.25, 0xb4b4ae);
  const colores = [0xd8bc84, 0x8a4434, 0x9a968e, 0x2e2826];
  colores.forEach((c, i) => monton(k, 7.5 + i * 7, zb, 3.2, 2.4, c));
  // los montones sueltos grandes (arena y grava), como en la foto aérea
  monton(k, 28, -22, 4.5, 3.2, 0xd2b67e);
  monton(k, 33, -30, 3.5, 2.6, 0x9a968e);
  // los palés de bloques en filas, de uno y de dos de alto
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) paleBloques(k, 4 + i * 1.6, -8 - j * 1.4, 1 + ((i + j) % 2));
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) paleBloques(k, 15 + i * 1.6, -26 - j * 1.4, 1 + (i % 2));
  // los sacos grandes blancos de arena y los tubos
  for (let i = 0; i < 5; i++) {
    k.box(16 + i * 1.3, 0, -9, 1.0, 1.0, 1.0, 0xeeeee6);
    for (const d of [-0.4, 0.4]) k.box(16 + i * 1.3 + d, 1.0, -9, 0.06, 0.25, 0.06, 0xd8d8d0);
  }
  for (let i = 0; i < 6; i++) k.cyl(18 + (i % 3) * 0.45, 0.25 + Math.floor(i / 3) * 0.45, -14, 0.22, 0.22, 5, 0x6a6c70, { seg: 10, rx: Math.PI / 2 });
  // el toro, con un palé en las palas
  toro(k, 10, -18);
}

/** la cara de la nave del almacén que da al solar: las puertas de garaje (s desde la esquina de la carretera) */
function naveSolar(k) {
  const L = NAVE.len, H = 6.5;
  k.box(L / 2, 0, Z + 0.15, L, H, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  for (const s of [12, 28]) {
    k.box(s, 0, ZF + 0.03, 5, 4.6, 0.06, 0xb8bcc0);
    for (let y = 0.2; y < 4.6; y += 0.18) k.box(s, y, ZF + 0.07, 5, 0.025, 0.02, 0x9aa0a4);
    k.box(s, 4.6, ZF + 0.15, 5.4, 0.35, 0.3, 0x8a8e92);
  }
  k.box(20, 0, ZF + 0.04, 1.0, 2.2, 0.06, 0x6a6c70);
}

/** se monta con lo demás */
export function buildGrupoTiagua(scene, colliders, map) {
  if (!map?.grupoTiagua) return null;
  const montar = (M, nombre, hacer) => {
    const k = new Kit();
    hacer(k);
    const g = enMarco(k, M, nombre, colliders);
    scene.add(g);
    return g;
  };
  return {
    marmolesBrito: montar(MB, 'marmolesBrito', marmolesBrito),
    grupoTiagua: montar(TI, 'grupoTiagua', grupoTiagua),
    tinguaton: montar(TF, 'tinguaton', tinguaton),
    solar: (() => {
      // el suelo de tierra del solar
      const suelo = paveMesh(trocear(polyTris(SOLAR_SUELO), 1.5), 0.22, tierra(), 0x9aa8b4);
      if (suelo) { suelo.name = 'tinguatonSolarSuelo'; scene.add(suelo); }
      return [montar(SOLAR, 'tinguatonSolar', solar), montar(SOLAR_ISA, 'tinguatonSolarIsa', (k) => muroSolar(k, 0, SOLAR_ISA.len, 16, 24)),
        montar(NAVE, 'tinguatonNave', naveSolar), suelo];
    })(),
  };
}
