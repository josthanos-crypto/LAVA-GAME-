import * as THREE from 'three';
import { Calzada } from './sentidos.js';

/**
 * Los rótulos de las empresas del parque comercial de la salida a Costa Teguise (Version 142).
 *
 * José Manuel pidió «un montón de empresas que hay ahí» y recordó que estas cosas se miraban con algo parecido a
 * Street View. Los nombres y el sitio de cada una salen del mapa de Google Maps mirado el 16/11/2026 (solo se miró;
 * no entra nada suyo en el juego). SON DATOS SACADOS DE INTERNET: José Manuel tiene que repasar la lista y decir si
 * sobra o falta alguna. No llevan logotipos, teléfonos ni nada más: solo el nombre, en un cartel sencillo.
 *
 * Cada cartel se cuelga solo en la pared de la nave que tiene más cerca, en la cara que da a una calle.
 * (x, z) = coordenadas del juego: x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320.
 */
export const EMPRESAS = [
  ['Supermercados Marcial', 1034.4, -1159],
  ['Keidea Muebles', 1137.3, -1152.2],
  ['Cash Unide', 1192.7, -1175.7],
  ['Nortysur Hogar', 1238.1, -1206.5],
  ['Maresa Logística', 1232.4, -1180.4],
  ['Centro Logístico Spar', 1268.6, -1288.5],
  ['Carnes y Embutidos Chacón', 1146.1, -1333],
  ['Distribuciones Viera', 1154.7, -1427.2],
  ['Tecfrinox', 1274.9, -1401.3],
  ['Taller Llave 12', 1336.5, -1389.6],
  ['Aluminios Carpaty', 1292.1, -1470],
  ['Remacan', 1305.4, -1467.4],
  ['Foncal', 1350.9, -1457.2],
  ['Distribuidora Eléctrica Canaria', 1378.8, -1446.8],
  ['Fanfi Surf Outlet', 1373.3, -1470],
  ['Hostelería Brito', 1441.2, -1439.4],
  ['Quimiventura', 1436.5, -1418.3],
  ['Ensueños FLEX', 1509.3, -1375.7],
  ['Colchones en Canarias', 1523.4, -1298],
  ['CCC Lanzarote', 1562.5, -1317.6],
  ['Mármoles Brito', 1626.8, -1300],
  ['Persianas Lanzarote', 1453.9, -1253.4],
  ['Edoglass', 1431.9, -1233.2],
  ['Hidramelca', 1463, -1238.5],
  ['Desatascos Timanfaya', 1524.1, -1247.4],
  ['Taller Tinajuma', 1535.6, -1221.8],
  ['Sothyr', 1355.1, -1188.8],
  ['Transportes Vega Navarro', 1440, -1184.7],
  ['Químicas Morales', 1382.8, -1155.1],
  ['Distribuciones Tierney', 1411, -1117.3],
  ['Hang On Lanzarote Climbing Centre', 1567.8, -1157.8],
  ['DHL Lanzarote', 1623.1, -1193.5],
];

const ALTO = 1.3;            // alto del cartel (m)
const ZONA = [980, 1700, -1520, -1060];

function dentroDe(poly, x, z) {
  let dentro = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) dentro = !dentro;
  }
  return dentro;
}

function cartelTex(texto, tipo) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 80;
  const g = c.getContext('2d');
  const farmacia = tipo === 'farmacia';        // cartel verde con la cruz, como el de cualquier farmacia
  g.fillStyle = '#f6f5f1'; g.fillRect(0, 0, 512, 80);
  g.fillStyle = farmacia ? '#12853f' : '#1d3d6e'; g.fillRect(0, 0, 512, 7); g.fillRect(0, 73, 512, 7);
  let x0 = 12, ancho = 488;
  if (farmacia) {
    for (const cx of [44, 468]) { g.fillRect(cx - 9, 16, 18, 48); g.fillRect(cx - 24, 31, 48, 18); }
    x0 = 80; ancho = 352;
  }
  g.fillStyle = farmacia ? '#0d5f2d' : '#15233b'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let px = 44;
  g.font = `bold ${px}px Arial, Helvetica, sans-serif`;
  while (px > 18 && g.measureText(texto.toUpperCase()).width > ancho) { px -= 2; g.font = `bold ${px}px Arial, Helvetica, sans-serif`; }
  g.fillText(texto.toUpperCase(), x0 + ancho / 2, 41);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * cuelga los carteles en las naves; devuelve el grupo (userData.puestos = cuántos se han podido poner).
 * Cada empresa es [nombre, x, z] o [nombre, x, z, 'farmacia']. `zona` = [x0, x1, z0, z1] donde se buscan las paredes.
 */
export function buildRotulosEmpresas(scene, map, empresas = EMPRESAS, zona = ZONA, nombreGrupo = 'parqueComercialRotulos') {
  const ZONA = zona;
  const grupo = new THREE.Group();
  grupo.name = nombreGrupo;
  const calz = new Calzada(map.roads);
  const naves = (map.buildings || []).filter(b => b.p?.length > 3 && !b.ikea && b.p.some(([x, z]) => x > ZONA[0] && x < ZONA[1] && z > ZONA[2] && z < ZONA[3]));
  // los lados de cada nave, con la normal hacia fuera
  const lados = [];
  for (const b of naves) {
    const pts = b.p.slice(0, -1);
    let area = 0;
    for (let i = 0; i < pts.length; i++) { const a = pts[i], c = pts[(i + 1) % pts.length]; area += a[0] * c[1] - c[0] * a[1]; }
    const fuera = area >= 0 ? 1 : -1;
    pts.forEach((a, i) => {
      const c = pts[(i + 1) % pts.length], len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (len < 5) return;
      const d = [(c[0] - a[0]) / len, (c[1] - a[1]) / len];
      lados.push({ b, a, len, d, n: [fuera * d[1], -fuera * d[0]], usados: [] });
    });
  }
  let puestos = 0;
  for (const [nombre, x, z, tipo] of empresas) {
    let mejor = null;
    for (const l of lados) {
      const t = Math.max(0, Math.min(l.len, (x - l.a[0]) * l.d[0] + (z - l.a[1]) * l.d[1]));
      const px = l.a[0] + l.d[0] * t, pz = l.a[1] + l.d[1] * t, dist = Math.hypot(px - x, pz - z);
      if (dist > 40) continue;
      // delante de la pared no puede haber otra nave, y mejor si hay una calle
      const fx = px + l.n[0] * 3, fz = pz + l.n[1] * 3;
      if (naves.some(o => dentroDe(o.p, fx, fz))) continue;
      const mx = l.a[0] + l.d[0] * l.len / 2 + l.n[0] * 12, mz = l.a[1] + l.d[1] * l.len / 2 + l.n[1] * 12;
      const aCalle = !!calz.roadAt(px + l.n[0] * 12, pz + l.n[1] * 12, 14) || !!calz.roadAt(mx, mz, 14);
      const nota = dist + (aCalle ? 0 : 18);
      if (!mejor || nota < mejor.nota) mejor = { l, t, nota };
    }
    if (!mejor) continue;
    const { l } = mejor;
    const ancho = Math.max(3, Math.min(l.len - 1, 3.2 + nombre.length * 0.34));
    // sitio a lo largo de la pared: donde cae la empresa, sin salirse y sin pisar otro cartel
    let t = Math.max(ancho / 2 + 0.4, Math.min(l.len - ancho / 2 - 0.4, mejor.t)), fila = 0;
    const choca = (tt, f) => l.usados.some(u => u.f === f && Math.abs(u.t - tt) < (u.w + ancho) / 2 + 0.4);
    for (const paso of [0, 1, -1, 2, -2, 3, -3]) {
      const tt = Math.max(ancho / 2 + 0.4, Math.min(l.len - ancho / 2 - 0.4, mejor.t + paso * (ancho + 0.6)));
      if (!choca(tt, 0)) { t = tt; fila = 0; break; }
      if (paso === -3) fila = 1;      // no cabe al lado: debajo
    }
    l.usados.push({ t, w: ancho, f: fila });
    const alto = Math.min((l.b.h || 6) - 0.9, 4.8) - fila * (ALTO + 0.15);
    const g = new THREE.PlaneGeometry(ancho, ALTO);
    g.rotateY(Math.atan2(l.n[0], l.n[1]));
    g.translate(l.a[0] + l.d[0] * t + l.n[0] * 0.2, Math.max(1.6, alto), l.a[1] + l.d[1] * t + l.n[1] * 0.2);
    const tex = cartelTex(nombre, tipo);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.12 }));
    m.name = 'rotulo:' + nombre;
    grupo.add(m);
    puestos++;
  }
  grupo.userData.puestos = puestos;
  scene.add(grupo);
  return grupo;
}
