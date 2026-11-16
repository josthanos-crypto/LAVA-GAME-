import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Detalle de los coches vistos de cerca (Version 133). Lo usa carModels.js al montar cada coche:
 *  - LUNA: cristal tintado que refleja el cielo (antes era un negro casi mate)
 *  - ensuciar(): una película de polvo de carretera en los bajos y detrás de las ruedas
 *  - focos(): dónde caen los faros y pilotos de cada modelo (los mismos sitios que pinta el frontal)
 *  - tulipas(): el cristal abombado de faros y pilotos, que coge el brillo del sol
 *  - halos(): el resplandor de faros y pilotos de noche
 *  - pinza(): la pinza de freno, curvada sobre el disco
 * Todo es geometría y texturas hechas aquí; nada sale de coches reales.
 */

/** cristal de las ventanillas: oscuro, con el cielo reflejado (más cuanto más de refilón se mira) */
export const LUNA = new THREE.MeshPhysicalMaterial({
  color: 0x121b24, roughness: 0.04, metalness: 0.62, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 3.2,
});

const smooth = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };

/**
 * suciedad ligera: oscurece un poco la chapa y los plásticos cerca del suelo y en la estela de cada rueda.
 * Toca los colores de los vértices de la carrocería (una vez por modelo). hasta: nº de vértices que no son cristal
 */
export function ensuciar(geo, s, hasta) {
  if (geo.userData.sucio) return geo;
  geo.userData.sucio = true;
  const P = geo.getAttribute('position'), C = geo.getAttribute('color');
  const n = Math.min(hasta ?? P.count, P.count);
  for (let i = 0; i < n; i++) {
    const y = P.getY(i), z = P.getZ(i);
    // de los bajos hacia arriba, unos 40 cm
    let g = 0.3 * smooth(1 - (y - s.clear) / 0.42) ** 1.4;
    // la rueda levanta el polvo hacia atrás (-z) y un poco hacia arriba
    for (const wz of s.wheels) {
      const d = wz - z;
      if (d > s.archR * 0.5 && d < s.archR + 0.75 && y < s.wheelR * 2.3) {
        g += 0.16 * smooth(1 - (d - s.archR * 0.5) / (s.archR * 0.5 + 0.75)) * smooth(1 - (y - s.clear) / (s.wheelR * 2.3 - s.clear));
      }
    }
    if (g <= 0.004) continue;
    g = Math.min(0.42, g);
    // polvo pardo: se come más el azul que el rojo
    C.setXYZ(i, C.getX(i) * (1 - g * 0.82), C.getY(i) * (1 - g * 0.9), C.getZ(i) * (1 - g));
  }
  C.needsUpdate = true;
  return geo;
}

/**
 * dónde están los faros y pilotos de un modelo, con las mismas cuentas con las que carModels.js los pinta en
 * el frontal y la zaga. M = lo que devuelve buildModel/carShape. Cada foco: { x, y, w, h, r (redondo), col }
 */
export function focos(M) {
  const s = M.s;
  const cota = (ring) => {
    const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
    return { x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  };
  const del = [], tras = [];
  const BL = 0xfff1d8, RJ = 0xff2412, AM = 0xff9a20;
  {
    const b = cota(M.ringF), hw = b.x1, top = b.y1, h = top - b.y0;
    const ly = top - Math.min(0.11, h * 0.28);
    const par = (fn) => { fn(1); fn(-1); };
    switch (s.front?.lights) {
      case 'swept': par(sx => del.push({ x: sx * (hw - 0.235), y: ly + 0.012, w: 0.36, h: 0.105, col: BL })); break;
      case 'square': par(sx => del.push({ x: sx * (hw - 0.245), y: ly - 0.035, w: 0.37, h: 0.17, col: BL })); break;
      case 'van': par(sx => del.push({ x: sx * (hw - 0.245), y: ly - 0.03, w: 0.37, h: 0.16, col: BL })); break;
      case 'oval': par(sx => del.push({ x: sx * (hw - 0.2), y: ly - 0.01, w: 0.27, h: 0.15, r: 1, col: BL })); break;
      case 'round2': par(sx => {
        del.push({ x: sx * (hw - 0.15), y: ly - 0.03, w: 0.15, h: 0.15, r: 1, col: BL });
        del.push({ x: sx * (hw - 0.34), y: ly - 0.03, w: 0.124, h: 0.124, r: 1, col: BL, menor: 1 });
      }); break;
      case 'slim': par(sx => del.push({ x: sx * (hw - 0.05 + 0.365) / 2, y: ly + 0.042, w: hw - 0.42, h: 0.05, col: BL })); break;
      default: break;
    }
    if (s.front?.fog) par(sx => del.push({ x: sx * (hw - 0.2), y: b.y0 + 0.11, w: 0.084, h: 0.084, r: 1, col: BL, menor: 1 }));
  }
  {
    const b = cota(M.ringR), hw = b.x1, belt = M.secR.yt, top = Math.min(b.y1, belt + 0.02), h = top - b.y0;
    const st = s.rear || {};
    const ty = st.window || st.cargo ? belt - 0.08 : top - Math.min(0.12, h * 0.32);
    const par = (fn) => { fn(1); fn(-1); };
    switch (st.lights) {
      case 'wide': par(sx => tras.push({ x: sx * (hw * 0.5 + 0.065), y: ty + 0.01, w: hw - 0.23, h: 0.08, col: RJ })); break;
      case 'pair': par(sx => tras.push({ x: sx * (hw - 0.23), y: ty, w: 0.36, h: 0.115, col: RJ })); break;
      case 'vertical': par(sx => tras.push({ x: sx * (hw - 0.11), y: ty - 0.09, w: 0.12, h: 0.39, col: RJ })); break;
      case 'slim': par(sx => tras.push({ x: sx * hw * 0.5, y: ty + 0.02, w: hw - 0.09, h: 0.044, col: RJ })); break;
      case 'round2': par(sx => {
        tras.push({ x: sx * (hw - 0.17), y: ty, w: 0.144, h: 0.144, r: 1, col: RJ });
        tras.push({ x: sx * (hw - 0.37), y: ty, w: 0.124, h: 0.124, r: 1, col: RJ, menor: 1 });
      }); break;
      case 'round4': par(sx => {
        tras.push({ x: sx * (hw - 0.16), y: ty, w: 0.124, h: 0.124, r: 1, col: RJ });
        tras.push({ x: sx * (hw - 0.33), y: ty, w: 0.104, h: 0.104, r: 1, col: AM, menor: 1 });
      }); break;
      case 'bar3': par(sx => tras.push({ x: sx * (hw - 0.265), y: ty, w: 0.33, h: 0.12, col: RJ })); break;
      default: break;
    }
  }
  return { del, tras };
}

// el cristal de faros y pilotos: solo aporta reflejos (suma luz sobre lo pintado debajo)
const CRISTAL_FARO = new THREE.MeshPhysicalMaterial({
  color: 0x000000, roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.6,
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
});

const tulipaCache = new Map();
/** el cristal abombado de todos los faros y pilotos de un modelo, en una sola malla */
export function tulipas(M) {
  const key = M.s.type;
  if (tulipaCache.has(key)) return tulipaCache.get(key);
  const { del, tras } = focos(M);
  const piezas = [];
  const una = (f, z, dir) => {
    let g;
    if (f.r) {
      g = new THREE.SphereGeometry(1, 12, 3, 0, Math.PI * 2, 0, Math.PI / 2);
      g.rotateX(Math.PI / 2);
      g.scale(f.w / 2, f.h / 2, 0.028);
    } else {
      // almohadilla: un rectángulo que se abomba hacia el centro
      g = new THREE.PlaneGeometry(f.w, f.h, 5, 3);
      const p = g.getAttribute('position');
      for (let i = 0; i < p.count; i++) {
        const u = p.getX(i) / (f.w / 2), v = p.getY(i) / (f.h / 2);
        p.setZ(i, 0.03 * (1 - u * u * u * u) * (1 - v * v));
      }
      g.computeVertexNormals();
    }
    if (dir < 0) g.rotateY(Math.PI);
    g.translate(f.x, f.y, z + dir * 0.006);
    const ng = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(ng.attributes)) if (k !== 'position' && k !== 'normal') ng.deleteAttribute(k);
    piezas.push(ng);
  };
  for (const f of del) una(f, M.s.zf, 1);
  for (const f of tras) una(f, M.s.zr, -1);
  const geo = piezas.length ? mergeGeometries(piezas, false) : null;
  const out = geo ? { geo, mat: CRISTAL_FARO } : null;
  tulipaCache.set(key, out);
  return out;
}

// ── resplandor de noche ──
let haloTex = null;
function texHalo() {
  if (haloTex) return haloTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.18, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.14)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  haloTex = new THREE.CanvasTexture(c);
  haloTex.colorSpace = THREE.SRGBColorSpace;
  return haloTex;
}
const haloMats = new Map();
function haloMat(col) {
  if (!haloMats.has(col)) {
    haloMats.set(col, new THREE.SpriteMaterial({
      map: texHalo(), color: col, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0, fog: false,
    }));
  }
  return haloMats.get(col);
}

/**
 * el resplandor de los faros y pilotos principales. Devuelve { grupo, set(noche) }: de día no se dibuja nada.
 * Los materiales se comparten entre todos los coches (la noche es la misma para todos)
 */
export function halos(M) {
  const { del, tras } = focos(M);
  const grupo = new THREE.Group();
  grupo.name = 'halos';
  grupo.visible = false;
  const mats = new Set();
  const pon = (f, z, tam) => {
    if (f.menor) return;
    const m = haloMat(f.col);
    mats.add(m);
    const sp = new THREE.Sprite(m);
    const t = tam * (0.75 + Math.max(f.w, f.h) * 1.1);
    sp.scale.set(t, t, 1);
    sp.position.set(f.x, f.y, z);
    grupo.add(sp);
  };
  for (const f of del) pon(f, M.s.zf + 0.13, 0.85);
  for (const f of tras) pon(f, M.s.zr - 0.13, 0.6);
  return {
    grupo,
    set(noche) {
      grupo.visible = noche > 0.12 && grupo.userData.cerca !== false;
      for (const m of mats) m.opacity = Math.min(1, noche * 1.15) * 0.85;
    },
  };
}

const pinzas = new Map();
/** pinza de freno: un tramo de aro que abraza el disco, por delante del eje. rLl = radio de la llanta */
export function pinza(rLl, ancho) {
  const key = rLl + ':' + ancho;
  if (pinzas.has(key)) return pinzas.get(key);
  const r0 = rLl * 0.5, r1 = rLl * 0.86, a0 = -0.42, a1 = 0.42, n = 5;
  const sh = new THREE.Shape();
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); const m = i ? 'lineTo' : 'moveTo'; sh[m](Math.cos(a) * r1, Math.sin(a) * r1); }
  for (let i = n; i >= 0; i--) { const a = a0 + (a1 - a0) * (i / n); sh.lineTo(Math.cos(a) * r0, Math.sin(a) * r0); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false, curveSegments: 1 });
  // el perfil está en XY: se pasa al plano de la rueda (YZ) con el grosor a lo largo del eje (X)
  g.rotateY(Math.PI / 2);
  g.rotateX(0.9);   // arriba y hacia atrás
  g.translate(ancho / 2 - 0.022 - 0.13, 0, 0);
  pinzas.set(key, g);
  return g;
}
