import * as THREE from 'three';
import { pintarCasa, altoDibujo } from './pintor.js';
// todas las calles de la carpeta calles/ (cada archivo: { nombre, aceras: [{ a, b, anchos, casas }] })
const MODULOS = import.meta.glob('./calles/*.js', { eager: true });

/**
 * Fachadas dibujadas: cada casa de una calle hecha a partir de sus fotos lleva por delante su fachada pintada como
 * una ilustración (pintor.js). Va en un plano pegado a la pared que da a la calle, del suelo al pretil, y tapa las
 * ventanas genéricas que pone world.js. Cada calle se pinta en su propio lienzo cuando el jugador se acerca y se
 * suelta al alejarse: en el móvil, menos píxeles por metro.
 * Se monta sobre window.__game cuando el juego ha cargado (lo importa arrecifeExtras.js).
 */

// cada acera es su propia «calle» a efectos de cargar y soltar: así solo se pinta lo que está cerca
const CALLES = Object.values(MODULOS).flatMap(m => (m.default?.aceras || [])
  .filter(ac => ac.casas?.some(Boolean))
  .map(ac => ({ nombre: `${m.default.nombre} ${ac.id || ''}`.trim(), aceras: [ac] })));
const CERCA = 190;      // m: se pinta la calle
const LEJOS = 280;      // m: se suelta
const LIENZO = 2048;
const POR_VUELTA = 2;
const PEGADO = 0.05;    // m por delante de la pared
const PEGADO_CORNISA = 0.15; // las de dos plantas: por delante de la cornisa de world.js

const tactil = () => typeof document !== 'undefined' && document.body?.classList.contains('touch');

/** busca las casas de cada acera en el mapa (las levantó el kit de aceras: su primer lado es la fachada) */
function casasDeCalle(map, calle) {
  const out = [];
  let semilla = 1;
  for (const ac of calle.aceras) {
    const [a, b] = [ac.a, ac.b];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const k = L / ac.anchos.reduce((s, w) => s + w, 0);
    let s = 0;
    ac.anchos.forEach((w, i) => {
      const s0 = s, s1 = s + w * k;
      s = s1;
      const desc = ac.casas[i];
      if (!desc) return;
      const p0 = [a[0] + u[0] * s0, a[1] + u[1] * s0], p1 = [a[0] + u[0] * s1, a[1] + u[1] * s1];
      const casa = map.buildings.find(q => q.edificioReal && Array.isArray(q.p) && q.p.length >= 4
        && Math.hypot(q.p[0][0] - p0[0], q.p[0][1] - p0[1]) < 0.06 && Math.hypot(q.p[1][0] - p1[0], q.p[1][1] - p1[1]) < 0.06);
      if (!casa || !(casa.h > 0)) return;
      const n = [casa.p[2][0] - casa.p[1][0], casa.p[2][1] - casa.p[1][1]];
      const nl = Math.hypot(n[0], n[1]) || 1;
      out.push({ p0: casa.p[0], p1: casa.p[1], fuera: [-n[0] / nl, -n[1] / nl], ancho: w * k, alto: casa.h, desc, semilla: semilla++ * 7919 });
    });
  }
  return out;
}

/** pinta las casas en uno o varios lienzos y levanta los planos */
function montarCalle(g, casas, S) {
  const grupo = new THREE.Group();
  grupo.name = 'fachadasDibujadas';
  // primero se reparte el sitio de cada casa en lienzos de 2048 de ancho y el alto justo; luego se pinta
  const sitios = [];
  let x = 0, y = 0, fila = 0, hoja = 0;
  const altos = [0];
  for (const c of casas) {
    const H = altoDibujo(c.alto);
    const w = Math.min(LIENZO, Math.ceil(c.ancho * S) + 4), h = Math.ceil(H * S) + 4;
    if (x + w > LIENZO) { x = 0; y += fila; fila = 0; }
    if (y + h > LIENZO) { hoja++; x = 0; y = 0; fila = 0; altos.push(0); }
    sitios.push({ c, H, x, y, hoja });
    x += w;
    fila = Math.max(fila, h);
    altos[hoja] = Math.max(altos[hoja], y + h);
  }
  const geoms = altos.map(alto => {
    const lienzo = document.createElement('canvas');
    lienzo.width = LIENZO;
    lienzo.height = Math.max(8, alto);
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#cfcac0';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    return { lienzo, ctx, pos: [], uv: [], idx: [], nor: [] };
  });
  for (const { c, H, x: px, y: py, hoja: k } of sitios) {
    const q = geoms[k];
    const LH = q.lienzo.height;
    // una casa más ancha que el lienzo se pinta más estrecha (se estira al ponerla)
    const Sx = Math.min(S, (LIENZO - 4) / c.ancho);
    q.ctx.save();
    q.ctx.translate(px + 2, py + 2);
    q.ctx.scale(Sx / S, 1);
    pintarCasa(q.ctx, 0, 0, S, c.ancho, c.alto, c.desc, c.semilla);
    q.ctx.restore();
    const u0 = (px + 2) / LIENZO, u1 = (px + 2 + c.ancho * Sx) / LIENZO;
    const v1 = 1 - (py + 2) / LH, v0 = 1 - (py + 2 + H * S) / LH;
    const d = c.alto > 4.5 ? PEGADO_CORNISA : PEGADO;
    const [fx, fz] = c.fuera;
    const ax = c.p0[0] + fx * d, az = c.p0[1] + fz * d, bx = c.p1[0] + fx * d, bz = c.p1[1] + fz * d;
    const base = q.pos.length / 3;
    q.pos.push(ax, 0, az, bx, 0, bz, bx, H, bz, ax, H, az);
    q.uv.push(u0, v0, u1, v0, u1, v1, u0, v1);
    for (let i = 0; i < 4; i++) q.nor.push(fx, 0, fz);
    // que mire a la calle: el orden de los vértices según hacia dónde queda fuera
    const cruz = (bx - ax) * fz - (bz - az) * fx;
    if (cruz > 0) q.idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    else q.idx.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
  const aniso = Math.min(8, g.renderer?.capabilities?.getMaxAnisotropy?.() || 1);
  for (const q of geoms) {
    if (!q.pos.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(q.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(q.nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(q.uv, 2));
    geo.setIndex(q.idx);
    const tex = new THREE.CanvasTexture(q.lienzo);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = aniso;
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, metalness: 0 });
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true;
    grupo.add(m);
  }
  g.scene.add(grupo);
  return grupo;
}

function soltar(g, grupo) {
  g.scene.remove(grupo);
  grupo.traverse(o => {
    if (!o.isMesh) return;
    o.geometry.dispose();
    o.material.map?.dispose();
    o.material.dispose();
  });
}

function montar(g) {
  // píxeles por metro y distancias: en el móvil, menos nitidez, más cerca y de una en una (memoria y tirones)
  const movil = tactil();
  const S = movil ? 26 : 44;
  const cerca = movil ? 130 : CERCA, lejos = movil ? 200 : LEJOS, porVuelta = movil ? 1 : POR_VUELTA;
  const calles = CALLES.map(calle => {
    const casas = casasDeCalle(g.map, calle);
    const cx = casas.reduce((s, c) => s + (c.p0[0] + c.p1[0]) / 2, 0) / (casas.length || 1);
    const cz = casas.reduce((s, c) => s + (c.p0[1] + c.p1[1]) / 2, 0) / (casas.length || 1);
    const r = casas.reduce((m, c) => Math.max(m, Math.hypot(c.p0[0] - cx, c.p0[1] - cz)), 0);
    return { nombre: calle.nombre, casas, cx, cz, r, grupo: null };
  }).filter(c => c.casas.length);
  window.__fachadasDibujadas = { calles: calles.map(c => ({ nombre: c.nombre, casas: c.casas.length })) };
  const mirar = () => {
    const p = g.camera?.position;
    if (!p) return;
    // como mucho POR_VUELTA aceras nuevas cada vez (las más cercanas primero): sin tirones al llegar a un barrio
    const pendientes = [];
    for (const c of calles) {
      const d = Math.hypot(p.x - c.cx, p.z - c.cz) - c.r;
      if (!c.grupo && d < cerca && c.casas.length) pendientes.push([d, c]);
      else if (c.grupo && d > lejos) {
        soltar(g, c.grupo);
        c.grupo = null;
      }
    }
    pendientes.sort((x, y) => x[0] - y[0]).slice(0, porVuelta).forEach(([, c]) => {
      try { c.grupo = montarCalle(g, c.casas, S); } catch (e) { console.warn('Fachadas dibujadas:', c.nombre, e); c.casas = []; }
    });
  };
  mirar();
  setInterval(mirar, 400);
}

const espera = setInterval(() => {
  const g = window.__game;
  if (!g?.scene || !g.map || !g.camera) return;
  clearInterval(espera);
  try { montar(g); } catch (e) { console.warn('Fachadas dibujadas:', e); }
}, 500);
