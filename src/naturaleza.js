import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { waterAt } from './terrain.js';

/**
 * Más naturaleza y más tierra (lo pidió José Manuel): por los solares y rincones
 * libres de la ciudad salen grupillos de tuneras, arbustos, rocas de lava, matos
 * secos y algún drago, a veces sobre su mancha de picón. Todo determinista (cada
 * jugador ve lo mismo), lejos de calzadas, edificios y mar, y sin choques (se
 * pasa por encima como por un jardín).
 */

const CGRID = 4;

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildNaturaleza(scene, map, { count = 200 } = {}) {
  const b = map.meta?.bounds;
  if (!b) return;
  // la calzada y las aceras, en una rejilla gruesa
  const roadGrid = new Set();
  for (const r of map.roads || []) {
    if (r.p.length < 2) continue;
    const half = r.w / 2 + 2.5;
    for (let i = 1; i < r.p.length; i++) {
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
      const L = Math.hypot(bx - ax, bz - az), steps = Math.max(1, Math.ceil(L / 2));
      for (let t = 0; t <= steps; t++) {
        const x = ax + (bx - ax) * (t / steps), z = az + (bz - az) * (t / steps);
        for (let dx = -half; dx <= half + 0.1; dx += 2) {
          for (let dz = -half; dz <= half + 0.1; dz += 2) {
            roadGrid.add(Math.round((x + dx) / CGRID) + ',' + Math.round((z + dz) / CGRID));
          }
        }
      }
    }
  }
  // los edificios (y los castillos), por sus cajas con un metro de margen
  const bldGrid = new Map();
  const addBox = (x0, z0, x1, z1) => {
    for (let i = Math.floor(x0 / 20); i <= Math.floor(x1 / 20); i++) {
      for (let j = Math.floor(z0 / 20); j <= Math.floor(z1 / 20); j++) {
        const k = i + ',' + j;
        if (!bldGrid.has(k)) bldGrid.set(k, []);
        bldGrid.get(k).push([x0, z0, x1, z1]);
      }
    }
  };
  for (const bd of [...(map.buildings || []), ...(map.castles || [])]) {
    const xs = bd.p.map(q => q[0]), zs = bd.p.map(q => q[1]);
    addBox(Math.min(...xs) - 1, Math.min(...zs) - 1, Math.max(...xs) + 1, Math.max(...zs) + 1);
  }
  // los parques y jardines del mapa ya llevan lo suyo (parks.js): también se evitan
  for (const a of map.areas || []) {
    const xs = a.p.map(q => q[0]), zs = a.p.map(q => q[1]);
    addBox(Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs));
  }
  const blocked = (x, z) => {
    if (roadGrid.has(Math.round(x / CGRID) + ',' + Math.round(z / CGRID))) return true;
    for (const [x0, z0, x1, z1] of bldGrid.get(Math.floor(x / 20) + ',' + Math.floor(z / 20)) || []) {
      if (x >= x0 && x <= x1 && z >= z0 && z <= z1) return true;
    }
    return waterAt(x, z);
  };

  const verdes = [], secos = [], rocas = [], troncos = [], suelos = [];
  const ball = (list, x, y, z, r, sy = 1) => {
    const g = new THREE.SphereGeometry(r, 7, 5);
    g.scale(1, sy, 1);
    g.translate(x, y, z);
    list.push(g);
  };
  const rnd = rng(97);
  let placed = 0;
  for (let i = 0; i < count * 5 && placed < count; i++) {
    // la mitad de los intentos, dentro del casco urbano (donde mas se juega); el resto, por todo el mapa
    const urb = i % 2 === 0;
    const x0 = urb ? Math.max(b.minX, -900) : b.minX, x1 = urb ? Math.min(b.maxX, 1300) : b.maxX;
    const z0 = urb ? Math.max(b.minZ, -900) : b.minZ, z1 = urb ? Math.min(b.maxZ, 800) : b.maxZ;
    const x = x0 + rnd() * (x1 - x0);
    const z = z0 + rnd() * (z1 - z0);
    if (blocked(x, z)) continue;
    // sitio con aire alrededor (que el grupillo no roce una fachada)
    if (blocked(x + 3, z) || blocked(x - 3, z) || blocked(x, z + 3) || blocked(x, z - 3)) continue;
    placed++;
    const kind = rnd();
    if (kind < 0.16) {
      // mancha de picón con piedras
      const cg = new THREE.CircleGeometry(2 + rnd() * 2.5, 12);
      cg.rotateX(-Math.PI / 2);
      cg.translate(x, 0.06, z);
      suelos.push(cg);
      for (let k = 0; k < 4; k++) ball(rocas, x + (rnd() - 0.5) * 3, 0.05, z + (rnd() - 0.5) * 3, 0.2 + rnd() * 0.35, 0.7);
    } else if (kind < 0.42) {
      // tunera: palas verdes apiladas
      for (let k = 0; k < 6 + Math.floor(rnd() * 5); k++) {
        const a = rnd() * Math.PI * 2, d = rnd() * 0.8;
        const g = new THREE.SphereGeometry(0.34 + rnd() * 0.2, 7, 5);
        g.scale(1, 1.25, 0.28);
        g.rotateY(a);
        g.translate(x + Math.cos(a) * d, 0.35 + rnd() * 0.75, z + Math.sin(a) * d);
        verdes.push(g);
      }
    } else if (kind < 0.62) {
      // arbusto verde oscuro
      for (let k = 0; k < 3; k++) ball(verdes, x + (rnd() - 0.5) * 1.4, 0.4 + rnd() * 0.25, z + (rnd() - 0.5) * 1.4, 0.45 + rnd() * 0.3, 0.8);
    } else if (kind < 0.82) {
      // matos secos (aulagas)
      for (let k = 0; k < 4; k++) ball(secos, x + (rnd() - 0.5) * 2.2, 0.22, z + (rnd() - 0.5) * 2.2, 0.28 + rnd() * 0.2, 0.65);
    } else if (kind < 0.94) {
      // rocas de lava
      for (let k = 0; k < 3 + Math.floor(rnd() * 3); k++) ball(rocas, x + (rnd() - 0.5) * 2.6, 0.1, z + (rnd() - 0.5) * 2.6, 0.3 + rnd() * 0.5, 0.7);
    } else {
      // drago chico: tronco y copa
      const tg = new THREE.CylinderGeometry(0.14, 0.22, 2.2, 7);
      tg.translate(x, 1.1, z);
      troncos.push(tg);
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        ball(verdes, x + Math.cos(a) * 0.45, 2.3, z + Math.sin(a) * 0.45, 0.42, 0.55);
      }
    }
  }

  const put = (geoms, color, rough = 0.9) => {
    if (!geoms.length) return;
    const m = new THREE.Mesh(mergeGeometries(geoms, false), new THREE.MeshStandardMaterial({ color, roughness: rough }));
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
  };
  put(verdes, 0x45703e);
  put(secos, 0x9a8a5a);
  put(rocas, 0x2e2a26);
  put(troncos, 0x7a5a3a);
  if (suelos.length) {
    const m = new THREE.Mesh(mergeGeometries(suelos, false), new THREE.MeshStandardMaterial({ color: 0x3a322c, roughness: 0.98 }));
    m.receiveShadow = true;
    scene.add(m);
  }
}
