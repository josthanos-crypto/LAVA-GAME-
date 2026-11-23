import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco, trocear, sueloTex } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { paveMesh, polyTris } from './suelos.js';
import { Z, ZF, BLANCO, pared, tira } from './rapadurasSur.js';

/**
 * El Autolavado Parque de Limpieza, en la calle León y Castillo (al lado de la gasolinera Shell, Altavista), con las
 * fotos del sitio de 2018 y 2020 y las vistas de la calle de Google de julio de 2025 (León y Castillo 157 y la LZ-1 194;
 * solo se miran, no van dentro del juego; la gente no se pone). En el juego era la foto aérea del suelo entre la calle y
 * la nave, y las paredes genéricas con ventanas. De verdad:
 * - el patio de hormigón gris, cerrado por la calle con el muro bajo y la barandilla amarilla, con la entrada por el sur;
 * - la marquesina larga de techo claro sobre los pilares amarillos, con el canto amarillo y las letras rojas
 *   «LIMPIEZA DE INTERIORES»;
 * - al fondo, la nave blanca con la franja amarilla y roja, los cuatro boxes de lavado numerados con las paredes
 *   amarillas (vista de la calle de la LZ-1 194) y el letrero «AUTOLAVADO · PARQUE DE LIMPIEZA · 24h» encima, el de
 *   «PARQUE DEL AUTOMÓVIL» y la puerta del cuarto con los asientos rojos;
 * - al norte, el edificio blanco del zócalo gris con la parte de arriba de chapa beis ondulada.
 */

// la línea de la valla, por el borde de la acera de León y Castillo (s del sur al norte; N al oeste, a la calle)
const FY = marco([360.2, -1060.0], [355.05, -1030.0]);
// la cara oeste de la nave del fondo (s del sur al norte; N al oeste)
const NV = marco([384.35, -1088.37], [368.82, -991.42]);
// el edificio del norte: su cara a la calle y la del patio
const BW = marco([351.91, -1021.91], [349.71, -1011.09]);
const BS = marco([351.91, -1021.91], [361.57, -1019.95]);
// el patio
const PATIO = [[353.7, -1022.4], [361.57, -1019.95], [373.2, -1019.0], [381.7, -1072.0], [362.4, -1072.0], [357.07, -1042.3]];
const AMARILLO = 0xf5c400, ROJO = 0xd0202a;

/** antes de levantar la ciudad */
export function tuneAutolavadoParque(map) {
  map.autolavadoParque = true;
}

/** letras rojas sobre amarillo, en una o varias líneas */
function letrasRojas(lineas, fondo = '#f5c400') {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d0202a';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (const [texto, y, t] of lineas) {
      g.font = `900 ${Math.round(h * t)}px "Arial Black", Arial, sans-serif`;
      g.fillText(texto, w / 2, h * y, w * 0.94);
    }
  };
}

/** la chapa beis ondulada */
function chapaBeis(g, w, h) {
  g.fillStyle = '#cfc6a8';
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,110,90,0.25)';
  for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h);
}

/** el hormigón gris del patio, con manchas de agua */
function hormigonPatio() {
  return sueloTex(256, 6, (g, r, n) => {
    g.fillStyle = '#8e8e8a';
    g.fillRect(0, 0, n, n);
    for (let i = 0; i < 2400; i++) {
      const v = 110 + r() * 50;
      g.fillStyle = `rgb(${Math.round(v)},${Math.round(v)},${Math.round(v - 4)})`;
      g.fillRect(r() * n, r() * n, 1 + r() * 2, 1 + r() * 2);
    }
    for (let i = 0; i < 10; i++) {
      g.fillStyle = 'rgba(60,62,64,0.12)';
      g.beginPath();
      g.arc(r() * n, r() * n, 10 + r() * 30, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = 'rgba(70,70,68,0.5)';
    g.fillRect(0, 0, n, 1.5);
  });
}

/** la valla de la calle: el muro bajo gris claro y la barandilla amarilla, con la entrada al sur */
function valla(k) {
  const L = FY.len, e0 = 0, e1 = 6.0;
  k.box((e1 + L) / 2, 0, Z + 0.1, L - e1, 0.8, 0.22, 0xd8d8d2);
  k.box((e1 + L) / 2, 0.8, Z + 0.1, L - e1 + 0.02, 0.05, 0.26, 0xc8c8c2);
  for (let s = e1; s <= L; s += 2.0) k.box(s, 0.85, Z + 0.1, 0.07, 1.1, 0.07, s % 6 < 1 ? ROJO : AMARILLO);
  for (const y of [0.9, 1.92]) k.box((e1 + L) / 2, y, Z + 0.1, L - e1, 0.05, 0.05, AMARILLO);
  for (let s = e1 + 0.15; s < L; s += 0.15) k.box(s, 0.9, Z + 0.1, 0.02, 1.02, 0.02, AMARILLO);
  k.block((e1 + L) / 2, Z + 0.1, L - e1, 0.25);
  // los dos postes de la entrada
  for (const s of [e0 + 0.2, e1 - 0.1]) k.box(s, 0, Z + 0.1, 0.3, 1.2, 0.3, 0xd8d8d2);
}

/** la marquesina larga: los pilares amarillos, el techo claro y el canto con las letras */
function marquesina(k) {
  const s0 = 1.0, s1 = 29.0, z0 = -1.5, z1 = -9.0, alto = 3.4;
  const cs = (s0 + s1) / 2, cz = (z0 + z1) / 2;
  for (let s = s0; s <= s1 + 0.01; s += 4) for (const z of [z0 - 0.15, z1 + 0.15]) {
    k.box(s, 0, z, 0.16, alto, 0.16, AMARILLO);
    k.block(s, z, 0.2, 0.2);
  }
  k.box(cs, alto, cz, s1 - s0 + 0.4, 0.06, z0 - z1 + 0.4, 0xd8dcdc);
  for (let z = z1; z <= z0; z += 0.5) k.box(cs, alto - 0.04, z, s1 - s0 + 0.4, 0.04, 0.05, 0xb8bcbc);
  // el canto amarillo, con las letras por los dos lados
  k.box(cs, alto - 0.5, z0 + 0.15, s1 - s0 + 0.4, 0.6, 0.06, AMARILLO);
  k.box(cs, alto - 0.5, z1 - 0.15, s1 - s0 + 0.4, 0.6, 0.06, AMARILLO);
  for (const s of [cs - 7, cs + 7]) {
    k.pic(s, alto - 0.2, z0 + 0.19, 12.5, 0.55, 0, 1, canvasTex(1000, 44, letrasRojas([['LIMPIEZA DE INTERIORES', 0.55, 0.8]])));
    k.pic(s, alto - 0.2, z1 - 0.19, 12.5, 0.55, 0, -1, canvasTex(1000, 44, letrasRojas([['LIMPIEZA DE INTERIORES', 0.55, 0.8]])));
  }
}

/** la cara de la nave que da al patio: los boxes de lavado numerados, el cuarto de la espera y la pared de la nave */
function naveFondo(k) {
  const a0 = 16.6, a1 = 40.0, b1 = 70.3, box0 = a0 + 0.4, ancho = 3.6, nb = 4;
  // el edificio del autolavado: blanco, con la franja amarilla y roja arriba y los carteles
  pared(k, a0, a1, 6.5, (g, w, h) => { g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h); });
  k.box((a0 + a1) / 2, 5.0, ZF + 0.03, a1 - a0, 0.9, 0.06, AMARILLO);
  k.box((a0 + a1) / 2, 4.85, ZF + 0.03, a1 - a0, 0.15, 0.06, ROJO);
  k.pic(box0 + (nb * ancho) / 2, 3.55, ZF + 0.05, nb * ancho, 0.75, 0, 1, canvasTex(1200, 64, letrasRojas([['AUTOLAVADO · PARQUE DE LIMPIEZA · 24h', 0.55, 0.62]])));
  k.pic(35.5, 5.45, ZF + 0.08, 6.0, 0.8, 0, 1, canvasTex(600, 80, letrasRojas([['PARQUE DEL AUTOMÓVIL', 0.55, 0.62]])));
  // los boxes de lavado: el hueco oscuro, las paredes amarillas de los lados y el número
  for (let i = 0; i < nb; i++) {
    const c = box0 + ancho * (i + 0.5);
    k.pic(c, 1.55, ZF + 0.01, ancho - 0.3, 3.1, 0, 1, canvasTex(120, 104, (g, w, h) => {
      const f = g.createLinearGradient(0, 0, 0, h); f.addColorStop(0, '#3a3a38'); f.addColorStop(1, '#5a5a56');
      g.fillStyle = f; g.fillRect(0, 0, w, h);
      g.fillStyle = '#f5c400'; g.fillRect(0, h * 0.62, w, h * 0.38);
    }));
    k.box(c - ancho / 2, 0, ZF + 0.6, 0.25, 3.15, 1.2, AMARILLO);
    k.block(c - ancho / 2, ZF + 0.6, 0.25, 1.2);
    k.pic(c - ancho / 2, 3.0, ZF + 1.21, 0.25, 0.25, 0, 1, canvasTex(32, 32, (g, w, h) => {
      g.fillStyle = '#d0202a'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `900 ${Math.round(h * 0.8)}px Arial, sans-serif`; g.fillText(String(i + 1), w / 2, h * 0.55);
    }));
  }
  k.box(box0 + nb * ancho, 0, ZF + 0.6, 0.25, 3.15, 1.2, AMARILLO);
  k.block(box0 + nb * ancho, ZF + 0.6, 0.25, 1.2);
  k.box(box0 + (nb * ancho) / 2, 3.1, ZF + 0.6, nb * ancho + 0.25, 0.12, 1.2, 0xe8e6e0);
  // la puerta del cuarto, la ventana y los asientos rojos de la espera
  hueco(k, 33.0, 0, 1.0, 2.3, canvasTex(60, 138, cristales('#f2f2ee', 1, 'rgba(60,60,60,.3)')), { borde: ROJO, z: ZF });
  hueco(k, 35.2, 1.0, 1.4, 1.2, canvasTex(84, 72, cristales('#f2f2ee', 2)), { borde: ROJO, z: ZF });
  for (const s of [37.0, 37.6, 38.2]) {
    k.box(s, 0.42, ZF + 0.4, 0.48, 0.06, 0.45, 0xc8202a);
    k.box(s, 0.48, ZF + 0.18, 0.48, 0.45, 0.06, 0xc8202a);
    k.box(s, 0, ZF + 0.4, 0.05, 0.42, 0.05, 0x5a5a5a);
  }
  k.block(37.6, ZF + 0.4, 1.8, 0.5);
  // la pared de la nave hacia el norte: blanca con el zócalo gris y la chapa beis arriba
  pared(k, a1, b1, 5.0, (g, w, h) => { g.fillStyle = '#eeeeea'; g.fillRect(0, 0, w, h); });
  k.box((a1 + b1) / 2, 0, ZF + 0.02, b1 - a1, 0.9, 0.06, 0x8a8c8c);
  k.pic((a1 + b1) / 2, 4.1, ZF + 0.006, b1 - a1, 1.8, 0, 1, canvasTex(900, 54, chapaBeis));
  k.box((a1 + b1) / 2, 2.95, ZF + 0.02, b1 - a1, 0.12, 0.06, AMARILLO);
  k.box((a1 + b1) / 2, 2.83, ZF + 0.02, b1 - a1, 0.12, 0.06, ROJO);
}

/** el edificio del norte: zócalo gris, blanco y la chapa beis ondulada arriba */
function edificioNorte(k, L, conCartel) {
  pared(k, 0, L, 6.0, (g, w, h) => { g.fillStyle = '#eeeeea'; g.fillRect(0, 0, w, h); });
  k.box(L / 2, 0, ZF + 0.02, L, 0.9, 0.06, 0x8a8c8c);
  k.pic(L / 2, 4.75, ZF + 0.006, L, 2.5, 0, 1, canvasTex(Math.round(L * 30), 75, chapaBeis));
  if (conCartel) k.pic(L / 2, 2.4, ZF + 0.04, Math.min(L - 1, 7.0), 1.1, 0, 1, canvasTex(640, 100, letrasRojas([['AUTOLAVADO', 0.55, 0.7]])));
}

/** se monta con lo demás */
export function buildAutolavadoParque(scene, colliders, map) {
  if (!map?.autolavadoParque) return null;
  const grupos = [];
  const montar = (M, nombre, hacer) => { const k = new Kit(); hacer(k); grupos.push(enMarco(k, M, nombre, colliders)); };
  montar(FY, 'autolavadoValla', (k) => { valla(k); marquesina(k); });
  montar(NV, 'autolavadoNave', naveFondo);
  montar(BW, 'autolavadoNorteCalle', (k) => edificioNorte(k, BW.len, false));
  montar(BS, 'autolavadoNortePatio', (k) => edificioNorte(k, BS.len, true));
  for (const g of grupos) scene.add(g);
  const suelo = paveMesh(trocear(polyTris(PATIO), 1.5), 0.2, hormigonPatio(), 0xffffff);
  if (suelo) { suelo.name = 'autolavadoPatio'; scene.add(suelo); }
  return { grupos, suelo };
}
