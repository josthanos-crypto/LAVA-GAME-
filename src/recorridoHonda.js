import * as THREE from 'three';
import { buildAparcamientos } from './aparcamientosTenderete.js';
import { Calzada } from './sentidos.js';

/**
 * (Version 156) Del vídeo del recorrido Deiland Plaza (Playa Honda) → autovía → Arrecife → avenida → tanatorio
 * (262 fotogramas, PC de Arrecife: Desktop\lavagame recursos\fotogramas_recorrido_8min). Lo que se ve en el vídeo
 * y no estaba en el juego, medido sobre la ortofoto oficial del IGN:
 *  - el aparcamiento de fuera del Deiland Plaza: la franja entre el centro comercial y la autovía, con dos filas en
 *    batería y sus coches (fotogramas 5 a 10);
 *  - el cartel de piedra «MUNICIPIO DE ARRECIFE» al incorporarse a la autovía (fotograma 23);
 *  - las letras blancas «ARRECIFE» sobre el talud de piedra de la rotonda de entrada, con la bandera (82 a 84);
 *  - las jardineras blancas en forma de bola de la avenida, pasado el Gran Hotel (143 a 152).
 * El número de plazas es el que cabe, no el real.
 */
const DEILAND = { nombre: 'aparcamientoDeiland', centro: [-3588, 587], eje: [0.9987, -0.05], largo: 68, ancho: 8 };
const MUNICIPIO = { en: [-3392, 568.5], mira: [-0.94, -0.34] };
const LETRAS = { en: [-1179, 412], a: [0.57, -0.82], mira: [-0.82, -0.57] };
const hash = (n) => { const v = Math.sin(n * 57.3 + 4.1) * 43758.5453; return v - Math.floor(v); };

/** los coches del aparcamiento del Deiland, en las plazas que pinta buildAparcamientos (pasan a map.lotSpots) */
export function tuneRecorridoHonda(map) {
  if (!Array.isArray(map.lotSpots)) return;
  const { centro: c, eje: A, largo } = DEILAND, B = [-A[1], A[0]];
  for (let a = -largo + 0.6 + 1.25, k = 0; a < largo - 1.5; a += 2.5, k++) {
    for (const lado of [-1, 1]) {
      if (hash(k * 2 + lado) > 0.82) continue;
      const b = lado * 5.5;
      map.lotSpots.push([+(c[0] + A[0] * a + B[0] * b).toFixed(2), +(c[1] + A[1] * a + B[1] * b).toFixed(2), Math.atan2(-B[0] * lado, -B[1] * lado)]);
    }
  }
}

function lienzo(w, h, pinta) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pinta(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const PIEDRA = 0x2f2b28;
/** un muro de piedra volcánica de a a b */
function muro(grupo, colliders, [ax, az], [bx, bz], alto, grueso) {
  const L = Math.hypot(bx - ax, bz - az);
  const m = new THREE.Mesh(new THREE.BoxGeometry(grueso, alto, L, 1, 1, Math.max(1, Math.round(L / 3))), new THREE.MeshStandardMaterial({ color: PIEDRA, roughness: 0.95 }));
  m.position.set((ax + bx) / 2, alto / 2, (az + bz) / 2);
  m.rotation.y = Math.atan2(bx - ax, bz - az);
  m.castShadow = m.receiveShadow = true;
  grupo.add(m);
  colliders?.addSegment(ax, az, bx, bz);
}

/** el cartel de piedra del término municipal, con su palmera y las pitas */
function cartelMunicipio(grupo, colliders) {
  const [x, z] = MUNICIPIO.en, [nx, nz] = MUNICIPIO.mira, t = [-nz, nx];
  muro(grupo, colliders, [x - t[0] * 2.4, z - t[1] * 2.4], [x + t[0] * 2.4, z + t[1] * 2.4], 1.7, 0.6);
  const tex = lienzo(512, 160, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#f2efe6'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'bold 44px Georgia, serif'; c.fillText('MUNICIPIO DE', w / 2, 46);
    c.font = 'bold 70px Georgia, serif'; c.fillText('ARRECIFE', w / 2, 112);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.3), new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.4, roughness: 0.8 }));
  p.position.set(x + nx * 0.32, 0.95, z + nz * 0.32);
  p.rotation.y = Math.atan2(nx, nz);
  grupo.add(p);
  // la palmera de detrás y las pitas de delante
  const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 5.2, 8), new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 1 }));
  tronco.position.set(x - nx * 1.6, 2.6, z - nz * 1.6);
  grupo.add(tronco);
  const copa = new THREE.Mesh(new THREE.SphereGeometry(2.1, 9, 6), new THREE.MeshStandardMaterial({ color: 0x3f6a34, roughness: 0.9, flatShading: true }));
  copa.scale.y = 0.55; copa.position.set(x - nx * 1.6, 5.6, z - nz * 1.6);
  grupo.add(copa);
  for (const i of [-3.4, -2.6, 2.6, 3.4]) {
    const pita = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0x6f8f6a, roughness: 0.9, flatShading: true }));
    pita.position.set(x + nx * 0.6 + t[0] * i * 1.3, 0.45, z + nz * 0.6 + t[1] * i * 1.3);
    grupo.add(pita);
  }
}

/** las letras «ARRECIFE» sobre el talud de piedra de la rotonda de entrada, con la bandera */
function letrasArrecife(grupo, colliders) {
  const [x, z] = LETRAS.en, a = LETRAS.a, n = LETRAS.mira;
  // el talud: muro de piedra por delante y la tierra de encima
  muro(grupo, colliders, [x - a[0] * 8 + n[0] * 1.6, z - a[1] * 8 + n[1] * 1.6], [x + a[0] * 8 + n[0] * 1.6, z + a[1] * 8 + n[1] * 1.6], 1.1, 0.6);
  const tierra = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.0, 16, 1, 1, 5), new THREE.MeshStandardMaterial({ color: 0x4a3f38, roughness: 1 }));
  tierra.position.set(x - n[0] * 0.2, 0.5, z - n[1] * 0.2);
  tierra.rotation.y = Math.atan2(a[0], a[1]);
  grupo.add(tierra);
  // las letras: varias láminas seguidas para que tengan grueso
  const tex = lienzo(1024, 220, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#f6f5f1'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '900 200px "Arial Black", Arial, Helvetica, sans-serif';
    c.fillText('ARRECIFE', w / 2, h / 2 + 8, w - 16);
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.6, side: THREE.DoubleSide });
  for (let k = 0; k < 5; k++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.15), mat);
    p.position.set(x + n[0] * (0.25 - k * 0.09), 2.05, z + n[1] * (0.25 - k * 0.09));
    p.rotation.y = Math.atan2(n[0], n[1]);
    p.castShadow = k === 0;
    grupo.add(p);
  }
  // el mástil con la bandera de España
  const mx = x + a[0] * 7 - n[0] * 0.8, mz = z + a[1] * 7 - n[1] * 0.8;
  const mastil = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 9, 8), new THREE.MeshStandardMaterial({ color: 0xd9dadb, roughness: 0.4, metalness: 0.6 }));
  mastil.position.set(mx, 5.5, mz);
  grupo.add(mastil);
  const bandera = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshStandardMaterial({ map: lienzo(96, 64, (c, w, h) => {
    c.fillStyle = '#c60b1e'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffc400'; c.fillRect(0, h / 4, w, h / 2);
  }), side: THREE.DoubleSide, roughness: 0.8 }));
  bandera.position.set(mx + a[0] * 1.25, 9.1, mz + a[1] * 1.25);
  bandera.rotation.y = Math.atan2(n[0], n[1]);
  grupo.add(bandera);
}

/** las jardineras blancas en forma de bola de la avenida, en la acera del lado del parque */
function jardinerasBola(grupo, colliders, map) {
  const calz = new Calzada(map.roads);
  const dentro = (x, z) => x > -430 && x < -215 && z > 480 && z < 535;
  const calles = map.roads.filter(r => !r.ped && !r.glorieta && r.p.length >= 2 && r.w >= 6 && r.p.some(([x, z]) => dentro(x, z)));
  const bola = new THREE.SphereGeometry(0.75, 14, 10), verde = new THREE.SphereGeometry(0.9, 8, 6);
  const blanco = new THREE.MeshStandardMaterial({ color: 0xf1ede2, roughness: 0.7 }), hoja = new THREE.MeshStandardMaterial({ color: 0x4d7a3c, roughness: 0.9, flatShading: true });
  const tronco = new THREE.MeshStandardMaterial({ color: 0x6a5642, roughness: 1 });
  const puestas = [];
  for (const r of calles) {
    let acc = 0, next = 6;
    for (let i = 1; i < r.p.length; i++) {
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i], L = Math.hypot(bx - ax, bz - az);
      if (L < 0.01) continue;
      const ux = (bx - ax) / L, uz = (bz - az) / L;
      for (; next < acc + L; next += 13) {
        const t = next - acc;
        // el lado del parque es el del sur (z mayor)
        let nx = -uz, nz = ux; if (nz < 0) { nx = -nx; nz = -nz; }
        const off = r.w / 2 + 2.4, x = ax + ux * t + nx * off, z = az + uz * t + nz * off;
        if (!dentro(x, z) || calz.roadAt(x, z, 1.6) || puestas.some(q => Math.hypot(q[0] - x, q[1] - z) < 9)) continue;
        if (colliders?.circleContacts && colliders.circleContacts(x, z, 1.0).length) continue;
        puestas.push([x, z]);
        const b = new THREE.Mesh(bola, blanco); b.position.set(x, 0.72, z); b.scale.y = 0.92; b.castShadow = true; grupo.add(b);
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.6, 6), tronco); tr.position.set(x, 2.0, z); grupo.add(tr);
        const c = new THREE.Mesh(verde, hoja); c.position.set(x, 3.2, z); c.scale.set(1.2, 0.9, 1.2); grupo.add(c);
        colliders?.addSegment(x - 0.6, z, x + 0.6, z); colliders?.addSegment(x, z - 0.6, x, z + 0.6);
      }
      acc += L;
    }
  }
  return puestas.length;
}

export function buildRecorridoHonda(scene, colliders, map) {
  const grupo = new THREE.Group();
  grupo.name = 'recorridoHonda';
  const deiland = buildAparcamientos(scene, map, { nombre: 'aparcamientoDeilandFirme', solares: [DEILAND], zona: [-3700, -3480, 540, 720] });
  cartelMunicipio(grupo, colliders);
  letrasArrecife(grupo, colliders);
  grupo.userData.bolas = jardinerasBola(grupo, colliders, map);
  scene.add(grupo);
  return { grupo, deiland };
}
