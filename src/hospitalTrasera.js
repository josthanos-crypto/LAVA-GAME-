import { buildAparcamientos } from './aparcamientosTenderete.js';
import { sueloConFoto } from './reductoFoto.js';
import { Calzada } from './sentidos.js';

/**
 * (Version 159) La parte de atrás del Hospital Molina Orosa, del lado de la calle Santiago Alemán.
 *
 * Del vídeo «hospital hiperdino» de José Manuel (recursos\nuevas\clips_0-20s\01_hospital_hiperdino; dice: «Estamos
 * dentro del hospital… y por la parte de detrás… la calle Santiago Alemán»): la valla verde, la entrada con su
 * marquesina y el aparcamiento descubierto lleno de coches. En el juego esa parte no tenía nada: solo la foto general.
 * Medido sobre la ortofoto oficial del IGN:
 *  - el aparcamiento largo de entre el hospital y la calle Santiago Alemán, con sus filas y sus coches;
 *  - los dos aparcamientos del noroeste (junto a los jardines de picón);
 *  - el suelo de toda esa parte, con la foto oficial a 0,2 m por punto (`public/hospital/trasera.jpg`; PNOA,
 *    © Instituto Geográfico Nacional de España, CC BY 4.0; WMS del IGN, 17/11/2026).
 * El firme y las plazas los pone `buildAparcamientos` (no pinta sobre calle ni edificio). Las plazas son las que caben,
 * no las reales. **Falta** lo que se ve en el vídeo y no en la foto aérea: la valla verde y la marquesina de la entrada.
 */
const ZONA = { x0: -1720, x1: -1400, z0: -1570, z1: -1320 };
const SOLARES = [
  // entre el hospital y la calle Santiago Alemán
  { nombre: 'aparcamientoHospitalDetras', centro: [-1502.5, -1396], eje: [0.488, 0.873], largo: 60, ancho: 22 },
  // los del noroeste
  { nombre: 'aparcamientoHospitalNorte1', centro: [-1585, -1479], eje: [0.914, -0.406], largo: 30, ancho: 12 },
  { nombre: 'aparcamientoHospitalNorte2', centro: [-1649, -1439], eje: [0.914, -0.406], largo: 42, ancho: 18 },
];
const hash = (n) => { const v = Math.sin(n * 71.3 + 2.9) * 43758.5453; return v - Math.floor(v); };

function dentro(p, x, z) {
  let d = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    if ((p[i][1] > z) !== (p[j][1] > z) && x < (p[j][0] - p[i][0]) * (z - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) d = !d;
  }
  return d;
}

export function tuneHospitalTrasera(map) {
  if (map.hospitalTrasera) return;
  map.hospitalTrasera = true;
  map.groundHoles = [...(map.groundHoles || []), { ...ZONA }];
  if (!Array.isArray(map.lotSpots)) return;
  const calz = new Calzada(map.roads);
  const cerca = (map.buildings || []).filter(b => b.p?.length > 3 && b.p.some(([x, z]) => x > ZONA.x0 && x < ZONA.x1 && z > ZONA.z0 && z < ZONA.z1));
  const libre = (x, z) => !calz.roadAt(x, z, 3.4) && ![[0, 0], [2, 0], [-2, 0], [0, 2], [0, -2]].some(([dx, dz]) => cerca.some(b => dentro(b.p, x + dx, z + dz)));
  let k = 0;
  for (const s of SOLARES) {
    const A = s.eje, B = [-A[1], A[0]];
    // las mismas filas que pinta buildAparcamientos: módulos de fila (5 m) + calle (6 m) + fila (5 m)
    const n = Math.max(1, Math.floor((2 * s.ancho + 0.01) / 16)), b0 = -n * 8;
    for (let m = 0; m < n; m++) {
      for (const [b, sentido] of [[b0 + m * 16 + 2.5, 1], [b0 + m * 16 + 13.5, -1]]) {
        for (let a = -s.largo + 0.6 + 1.25; a < s.largo - 1.5; a += 2.5) {
          if (hash(++k) > 0.7) continue;
          const x = s.centro[0] + A[0] * a + B[0] * b, z = s.centro[1] + A[1] * a + B[1] * b;
          if (!libre(x, z)) continue;
          map.lotSpots.push([+x.toFixed(2), +z.toFixed(2), Math.atan2(B[0] * sentido, B[1] * sentido)]);
        }
      }
    }
  }
}

export function buildHospitalTrasera(scene, map) {
  sueloConFoto(scene, ZONA, 'hospital/trasera', 'sueloHospitalTrasera');
  return buildAparcamientos(scene, map, { nombre: 'aparcamientosHospitalTrasera', solares: SOLARES, zona: [ZONA.x0, ZONA.x1, ZONA.z0, ZONA.z1] });
}
