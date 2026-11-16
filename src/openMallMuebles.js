import * as THREE from 'three';

/**
 * Lo de dentro de cada local del Open Mall según su tipo (openMallDatos.js): percheros y maniquíes, paredes de
 * zapatos, baldas de perfumes, vitrinas, mesas de móviles, gafas, juguetes, camas, pasillos del súper, camas
 * elásticas y la barra con la cocina de los restaurantes. Todo con cajas del Kit (se juntan en pocas mallas).
 *
 * Cada local va en su marco: t a lo largo de la fachada (0 a L) y v hacia dentro desde el escaparate (0 a D).
 */

const COLORES = [0x1c1c1e, 0xf4f1ea, 0xd8271c, 0x2c4f86, 0xe8c46a, 0x5a8a5a, 0xc87a9a, 0x8a6a4a, 0x3a3a6a, 0xe86a2a];

/** el marco del local: de (t, v) a (x, z), y cajas alineadas */
export function marcoLocal(u) {
  const { x0, z0, x1, z1, front } = u;
  const largo = front === 'e' || front === 'w' ? z1 - z0 : x1 - x0;
  const fondo = front === 'e' || front === 'w' ? x1 - x0 : z1 - z0;
  const P = (t, v) => {
    if (front === 'e') return [x1 - v, z0 + t];
    if (front === 'w') return [x0 + v, z0 + t];
    if (front === 's') return [x0 + t, z1 - v];
    return [x0 + t, z0 + v];
  };
  const alongZ = front === 'e' || front === 'w';
  // cara hacia el pasillo (para la gente que atiende)
  const cara = { e: Math.PI / 2, w: -Math.PI / 2, s: 0, n: Math.PI }[front];
  return { L: largo, D: fondo, P, alongZ, cara };
}

/** caja de t0 a t1 a lo largo y de v0 a v1 hacia dentro */
function caja(k, m, t0, t1, v0, v1, y, h, hex, opts = {}) {
  const [x, z] = m.P((t0 + t1) / 2, (v0 + v1) / 2);
  const a = Math.abs(t1 - t0), b = Math.abs(v1 - v0);
  k.box(x, y, z, m.alongZ ? b : a, h, m.alongZ ? a : b, hex, opts);
  if (opts.solido) k.block(x, z, m.alongZ ? b : a, m.alongZ ? a : b);
}

/** fila de cositas en una balda */
function fila(k, m, t0, t1, v, y, n, tam, cols, forma = 'caja') {
  for (let i = 0; i < n; i++) {
    const t = t0 + (i + 0.5) * (t1 - t0) / n;
    const [x, z] = m.P(t, v);
    const c = cols[i % cols.length];
    if (forma === 'bote') k.cyl(x, y, z, tam * 0.35, tam * 0.4, tam * 1.6, c, { seg: 6 });
    else if (forma === 'bola') k.ball(x, y + tam, z, tam, c, { seg: 6 });
    else k.box(x, y, z, tam, tam, tam, c);
  }
}

/** estantería contra una pared lateral (t fijo), con baldas y lo que lleve */
function paredLateral(k, m, t, v0, v1, cols, forma, tam = 0.16, color = 0xf2f2ee) {
  const lado = t < m.L / 2 ? 1 : -1;
  caja(k, m, t, t + lado * 0.4, v0, v1, 0, 2.2, color, { solido: true });
  for (let r = 0; r < 4; r++) {
    const y = 0.35 + r * 0.48;
    caja(k, m, t, t + lado * 0.4, v0, v1, y, 0.03, color);
    const tt = t + lado * 0.2;
    const n = Math.max(2, Math.floor((v1 - v0) / (tam * 3.4)));
    for (let i = 0; i < n; i++) {
      const v = v0 + (i + 0.5) * (v1 - v0) / n;
      const [x, z] = m.P(tt, v);
      const c = cols[(i + r) % cols.length];
      if (forma === 'bote') k.cyl(x, y + 0.03, z, tam * 0.35, tam * 0.4, tam * 1.6, c, { seg: 6 });
      else k.box(x, y + 0.03, z, tam, tam, tam, c);
    }
  }
}

/** pared del fondo con baldas a lo largo */
function paredFondo(k, m, t0, t1, cols, forma, tam = 0.16, color = 0xf2f2ee) {
  const v = m.D - 0.25;
  caja(k, m, t0, t1, v - 0.2, v + 0.2, 0, 2.2, color, { solido: true });
  for (let r = 0; r < 4; r++) {
    const y = 0.35 + r * 0.48;
    caja(k, m, t0, t1, v - 0.2, v + 0.2, y, 0.03, color);
    fila(k, m, t0 + 0.2, t1 - 0.2, v - 0.3, y + 0.03, Math.floor((t1 - t0) / (tam * 3.6)), tam, cols.slice(r % 3), forma);
  }
}

/** perchero con la ropa colgada */
function perchero(k, m, t0, t1, v) {
  for (const t of [t0, t1]) { const [x, z] = m.P(t, v); k.cyl(x, 0, z, 0.025, 0.025, 1.55, 0x8a8f96, { seg: 6 }); }
  caja(k, m, t0, t1, v - 0.02, v + 0.02, 1.52, 0.03, 0x8a8f96);
  const n = Math.floor((t1 - t0) / 0.14);
  for (let i = 0; i < n; i++) {
    const t = t0 + 0.1 + i * (t1 - t0 - 0.2) / Math.max(1, n - 1);
    caja(k, m, t - 0.03, t + 0.03, v - 0.22, v + 0.22, 0.75, 0.75, COLORES[(i * 3 + Math.round(v * 7)) % COLORES.length]);
  }
  const [x, z] = m.P((t0 + t1) / 2, v);
  k.block(x, z, m.alongZ ? 0.5 : t1 - t0, m.alongZ ? t1 - t0 : 0.5);
}

/** maniquí del escaparate */
function maniqui(k, m, t, v, color) {
  const [x, z] = m.P(t, v);
  k.cyl(x, 0, z, 0.18, 0.2, 0.04, 0x2a2a2c).cyl(x, 0.04, z, 0.02, 0.02, 0.8, 0x2a2a2c);
  k.box(x, 0.85, z, 0.38, 0.62, 0.22, color).ball(x, 1.62, z, 0.11, 0xe8e2d8);
  k.block(x, z, 0.4, 0.4);
}

/** mostrador con la caja registradora */
function caja_registradora(k, m, t, v, frente = 0x2a2a2c) {
  const [x, z] = m.P(t, v);
  k.counter(x, z, m.alongZ ? 0.6 : 1.8, m.alongZ ? 1.8 : 0.6, 0, { front: frente, top: 0xf2f2ee });
  const [x2, z2] = m.P(t, v + 0.05);
  k.box(x2, 1.05, z2, 0.3, 0.2, 0.25, 0x1c1c1e);
}

/** lo de dentro según el tipo; devuelve dónde se pone el dependiente [t, v] */
export function amueblar(k, u) {
  const m = marcoLocal(u), { L, D } = m;
  const tc = L - 1.6, vc = D - 1.6;
  switch (u.cat) {
    case 'ropa': {
      for (let i = 0; i < Math.floor(L / 3.4); i++) {
        const t = 1.4 + i * 3.4;
        perchero(k, m, t - 0.9, t + 0.9, 2.4);
        perchero(k, m, t - 0.9, t + 0.9, 4.6);
      }
      maniqui(k, m, 0.9, 0.7, COLORES[2]);
      maniqui(k, m, L - 0.9, 0.7, COLORES[3]);
      paredLateral(k, m, 0.05, 1.2, D - 0.4, COLORES, 'caja', 0.22);
      caja_registradora(k, m, tc, vc);
      return [tc, vc + 0.75];
    }
    case 'zapatos':
    case 'deporte': {
      const cols = [0xf4f1ea, 0x1e1e20, 0xd8271c, 0x3a4a6a, 0x8a6a4a, 0x18c5b8];
      paredLateral(k, m, 0.05, 0.8, D - 0.4, cols, 'caja', 0.14);
      paredLateral(k, m, L - 0.05, 0.8, D - 2.2, cols, 'caja', 0.14);
      paredFondo(k, m, 0.6, L - 2.6, cols, 'caja', 0.14);
      for (let t = 1.6; t < L - 2; t += 2.2) caja(k, m, t - 0.7, t + 0.7, 3.0, 3.5, 0, 0.42, 0x7a2a22, { solido: true });
      if (u.cat === 'deporte') perchero(k, m, 1.2, 3.0, 5.4);
      caja_registradora(k, m, tc, vc);
      return [tc, vc + 0.75];
    }
    case 'belleza':
    case 'regalos': {
      const cols = u.cat === 'belleza' ? [0xf4c2d0, 0xe8c46a, 0x1c1c1e, 0xf4f1ea, 0xc87a9a, 0x9fd6c2] : [0xf2c41a, 0x18c5b8, 0xd8271c, 0x7a6aff, 0x5aa02c, 0xe86a2a];
      const forma = u.cat === 'belleza' ? 'bote' : 'caja';
      paredLateral(k, m, 0.05, 0.8, D - 0.4, cols, forma, 0.14);
      paredLateral(k, m, L - 0.05, 0.8, D - 2.2, cols, forma, 0.14);
      for (let t = 2; t < L - 1.5; t += 2.6) {
        caja(k, m, t - 0.8, t + 0.8, 2.6, 3.4, 0, 1.0, 0xf2f2ee, { solido: true });
        fila(k, m, t - 0.7, t + 0.7, 3.0, 1.0, 6, 0.12, cols, forma);
      }
      caja_registradora(k, m, tc, vc);
      return [tc, vc + 0.75];
    }
    case 'joyas':
    case 'compl': {
      paredFondo(k, m, 0.6, L - 2.6, [0xe8c46a, 0xdfe8ee, 0xc87a9a, 0x1c1c1e], u.cat === 'joyas' ? 'bola' : 'caja', u.cat === 'joyas' ? 0.05 : 0.22, 0x2a2a2c);
      for (let t = 1.5; t < L - 1; t += 2.4) {
        caja(k, m, t - 0.6, t + 0.6, 2.4, 3.0, 0, 0.95, 0x1c1c1e, { solido: true });
        for (let i = 0; i < 5; i++) { const [x, z] = m.P(t - 0.45 + i * 0.22, 2.7); k.ball(x, 1.0, z, 0.04, i % 2 ? 0xe8c46a : 0xdfe8ee, { list: k.glow, seg: 5 }); }
      }
      caja_registradora(k, m, tc, vc, 0x1c1c1e);
      return [tc, vc + 0.75];
    }
    case 'tecno': {
      for (let t = 1.5; t < L - 1; t += 2.6) {
        caja(k, m, t - 0.9, t + 0.9, 2.4, 3.2, 0, 0.9, 0xf2f2ee, { solido: true });
        for (let i = 0; i < 4; i++) { const [x, z] = m.P(t - 0.6 + i * 0.4, 2.8); k.box(x, 0.9, z, 0.14, 0.02, 0.26, 0x1c1c1e); }
      }
      const [xs, zs] = m.P(L / 2, D - 0.1);
      k.box(xs, 1.4, zs, m.alongZ ? 0.06 : L * 0.6, 1.0, m.alongZ ? L * 0.6 : 0.06, 0x5aa0d8, { list: k.glow });
      paredLateral(k, m, 0.05, 1.0, D - 0.4, [0x1c1c1e, 0xf4f1ea, 0xd8271c, 0x2c4f86], 'caja', 0.12);
      caja_registradora(k, m, tc, vc, 0x1c1c1e);
      return [tc, vc + 0.75];
    }
    case 'optica': {
      paredLateral(k, m, 0.05, 0.8, D - 0.4, [0x1c1c1e, 0x8a6a4a, 0xc87a9a, 0x2c4f86], 'caja', 0.08);
      paredLateral(k, m, L - 0.05, 0.8, D - 2.2, [0x1c1c1e, 0xe8c46a, 0x3a3a6a], 'caja', 0.08);
      caja(k, m, 2, 3.2, 3.0, 3.6, 0, 0.78, 0xf2f2ee, { solido: true });
      const [xe, ze] = m.P(L / 2, D - 0.08);
      k.box(xe, 0.4, ze, m.alongZ ? 0.04 : 1, 1.8, m.alongZ ? 1 : 0.04, 0xcfe0ea, { list: k.glow });
      caja_registradora(k, m, tc, vc);
      return [tc, vc + 0.75];
    }
    case 'juguetes':
    case 'mascotas':
    case 'papel':
    case 'estanco': {
      const cols = [0xf2c41a, 0xd8271c, 0x18c5b8, 0x7a6aff, 0x5aa02c, 0xe86a2a, 0xf4c2d0];
      paredLateral(k, m, 0.05, 0.8, D - 0.4, cols, u.cat === 'juguetes' ? 'caja' : 'caja', 0.2);
      paredFondo(k, m, 0.6, L - 2.6, cols, u.cat === 'juguetes' ? 'bola' : 'caja', 0.14);
      if (u.cat === 'juguetes') for (let i = 0; i < 6; i++) { const [x, z] = m.P(1.6 + i * 0.7, 3.4); k.ball(x, 0, z, 0.25, cols[i], { seg: 7 }); }
      if (u.cat === 'mascotas') { const [x, z] = m.P(2.5, 3.4); k.cyl(x, 0, z, 0.55, 0.6, 0.18, 0x8a6a4a, { seg: 16 }).cyl(x, 0.12, z, 0.45, 0.45, 0.06, 0xd8c8b0, { seg: 16 }); }
      caja_registradora(k, m, tc, vc);
      return [tc, vc + 0.75];
    }
    case 'loteria':
    case 'oficina': {
      caja_registradora(k, m, L / 2, 3.2, u.cat === 'loteria' ? 0x1c3a8a : 0x2a2a2c);
      paredFondo(k, m, 0.6, L - 0.6, [0xf2f2ee, 0xe8c46a, 0x1c3a8a], 'caja', 0.18);
      for (const t of [1.2, L - 1.2]) k.chair(...m.P(t, 1.6), m.cara + Math.PI, 0x2a2a2c);
      return [L / 2, 4.0];
    }
    case 'pelu': {
      for (let i = 0; i < Math.floor((L - 1) / 2); i++) {
        const t = 1.2 + i * 2;
        const [x, z] = m.P(t, D - 1.2);
        k.cyl(x, 0, z, 0.26, 0.3, 0.08, 0x8a8f96, { seg: 14 }).box(x, 0.48, z, 0.56, 0.12, 0.56, 0x1c1c1e);
        const [xm, zm] = m.P(t, D - 0.06);
        k.box(xm, 0.9, zm, m.alongZ ? 0.04 : 1.0, 1.3, m.alongZ ? 1.0 : 0.04, 0xcfe0ea, { list: k.glow });
        k.block(x, z, 0.6, 0.6);
      }
      k.sofa(...m.P(1.5, 1.4), 1.8, m.cara + Math.PI, 0x1c1c1e);
      return [L / 2, D - 2.2];
    }
    case 'hogar': {
      for (let t = 2; t < L - 1.5; t += 3.4) {
        caja(k, m, t - 0.8, t + 0.8, 2.2, 4.2, 0, 0.5, 0xf4f1ea, { solido: true });
        caja(k, m, t - 0.8, t + 0.8, 4.0, 4.2, 0.5, 0.5, 0x8a6a4a);
        caja(k, m, t - 0.6, t - 0.1, 3.6, 3.9, 0.5, 0.14, 0xffffff);
        caja(k, m, t + 0.1, t + 0.6, 3.6, 3.9, 0.5, 0.14, 0xffffff);
      }
      k.sofa(...m.P(L - 3, D - 1.2), 2.2, m.cara, 0x5a6670);
      caja_registradora(k, m, 1.2, vc);
      return [1.2, vc + 0.75];
    }
    case 'super': {
      const cols = [0xd8271c, 0xf2c41a, 0x5aa02c, 0x2c4f86, 0xe86a2a, 0xf4f1ea, 0x8a6a4a];
      for (let t = 2.5; t < L - 3; t += 3.2) {
        caja(k, m, t - 0.5, t + 0.5, 3.5, D - 2.5, 0, 1.8, 0xf2f2ee, { solido: true });
        for (let r = 0; r < 3; r++) {
          for (const s of [-0.55, 0.55]) {
            const n = Math.floor((D - 6) / 0.6);
            for (let i = 0; i < n; i++) { const [x, z] = m.P(t + s, 3.7 + i * 0.6); k.box(x, 0.3 + r * 0.5, z, 0.3, 0.3, 0.45, cols[(i + r) % cols.length]); }
          }
        }
      }
      for (let t = 2; t < L - 2; t += 3) caja_registradora(k, m, t, 1.6, 0xd8271c);
      for (let i = 0; i < 4; i++) { const [x, z] = m.P(L - 1.4, 1 + i * 0.7); k.box(x, 0.2, z, 0.55, 0.6, 0.8, 0x8a8f96); }
      return [2, 2.3];
    }
    case 'saltos': {
      const tramo = (L - 2) / 3;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
        const t0 = 1 + i * tramo, v0 = 1.8 + j * 3;
        caja(k, m, t0, t0 + tramo - 0.3, v0, v0 + 2.6, 0, 0.45, 0x2c4f86);
        caja(k, m, t0 + 0.15, t0 + tramo - 0.45, v0 + 0.15, v0 + 2.45, 0.45, 0.02, 0x1c1c1e);
      }
      caja(k, m, 0.2, L - 0.2, D - 0.6, D - 0.2, 0, 1.2, 0xf2c41a, { solido: true });
      return [1.2, 1.2];
    }
    default:
      caja_registradora(k, m, tc, vc);
      return [tc, vc + 0.75];
  }
}

/** la barra del restaurante con la carta encima y la cocina detrás; devuelve dónde está quien atiende [t, v] */
export function cocina(k, u) {
  const m = marcoLocal(u), { L, D } = m;
  const [x, z] = m.P(L / 2, 1.6);
  k.counter(x, z, m.alongZ ? 0.7 : L - 1.2, m.alongZ ? L - 1.2 : 0.7, 0, { front: new THREE.Color(u.bg).getHex(), top: 0xf2f2ee });
  for (let t = 1; t < L - 0.8; t += 1.2) {
    const [x2, z2] = m.P(t, D - 0.5);
    k.box(x2, 0, z2, m.alongZ ? 0.7 : 1.0, 0.9, m.alongZ ? 1.0 : 0.7, 0xc8ccd0);
  }
  caja(k, m, 0.4, L - 0.4, D - 0.9, D - 0.1, 0, 0.9, 0xc8ccd0, { solido: true });
  return [L / 2, 2.4];
}
