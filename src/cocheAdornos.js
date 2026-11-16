import * as THREE from 'three';

/**
 * Lo que hace que la carrocería deje de verse lisa (Version 133): juntas de capó, maletero y paragolpes,
 * gomas de las ventanillas, estribo, limpiaparabrisas, retrovisores con forma, tercera luz de freno, antena
 * y faldón delantero. Son piezas pequeñas que se funden con la carrocería de cada modelo (no añaden
 * llamadas de dibujo). carModels.js las pide desde extras() con sus propias herramientas.
 *
 * t = { at, halfRing, colored, K }: la sección del coche en z, su media sección (16 puntos), el pintado de
 * una pieza y la paleta de carModels.js.
 */

/** cinta fina pegada a la chapa siguiendo una línea de puntos; n(i) da la normal hacia fuera en cada punto */
function cinta(pts, anchos, normales, sep = 0.006) {
  const pos = [];
  const lado = (i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dir = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
    const n = new THREE.Vector3(...normales[i]).normalize();
    const lat = new THREE.Vector3().crossVectors(dir, n).normalize().multiplyScalar(anchos / 2);
    const p = new THREE.Vector3(...pts[i]).addScaledVector(n, sep);
    return [p.clone().add(lat), p.clone().sub(lat)];
  };
  let prev = lado(0);
  for (let i = 1; i < pts.length; i++) {
    const cur = lado(i);
    const [a, b] = prev, [c, d] = cur;
    pos.push(a.x, a.y, a.z, c.x, c.y, c.z, b.x, b.y, b.z, b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z);
    prev = cur;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  // que mire siempre hacia fuera
  const nr = g.getAttribute('normal');
  const ref = new THREE.Vector3(...normales[0]);
  if (new THREE.Vector3(nr.getX(0), nr.getY(0), nr.getZ(0)).dot(ref) < 0) {
    const p = g.getAttribute('position').array;
    for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const tmp = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = tmp; }
    g.computeVertexNormals();
  }
  return g;
}

export function adornos(s, t) {
  const { at, halfRing, colored, K } = t;
  const out = [];
  const add = (g, col) => { if (g) out.push(colored(g, col)); };
  const anillo = (z) => halfRing(s, at(z));
  // la carrocería lleva una sección cada 10 cm desde la zaga: las juntas van justo sobre ellas, para que la
  // cinta siga la chapa sin hundirse entre sección y sección
  const ajusta = (z) => Math.max(s.zr, Math.min(s.zf, s.zr + Math.round((z - s.zr) / 0.1) * 0.1));
  // normal hacia fuera en el punto j de la media sección (perpendicular a la sección, en su plano)
  const normalEn = (r, j, sx) => {
    const a = r[Math.max(0, j - 1)], b = r[Math.min(15, j + 1)];
    return [sx * (b[1] - a[1]), -(b[0] - a[0]), 0];
  };
  /** junta transversal: recorre la sección en z entre los puntos j0..j1, a los dos lados */
  const transversal = (z, j0, j1, ancho, col, lados = [1, -1]) => {
    z = ajusta(z);
    const r = anillo(z);
    for (const sx of lados) {
      const pts = [], nrm = [];
      for (let j = j0; j <= j1; j++) { pts.push([sx * r[j][0], r[j][1], z]); nrm.push(normalEn(r, j, sx)); }
      if (pts.length > 1) add(cinta(pts, ancho, nrm), col);
    }
  };
  /** junta a lo largo del coche: sigue el punto j de la sección de z0 a z1 */
  const longitudinal = (z0, z1, j, ancho, col, lados = [1, -1]) => {
    z0 = ajusta(z0); z1 = ajusta(z1);
    if (z1 - z0 < 0.12) return;
    const n = Math.round((z1 - z0) / 0.1);
    for (const sx of lados) {
      const pts = [], nrm = [];
      for (let i = 0; i <= n; i++) {
        const z = z0 + (z1 - z0) * (i / n), r = anillo(z);
        pts.push([sx * r[j][0], r[j][1], z]);
        nrm.push(normalEn(r, j, sx));
      }
      add(cinta(pts, ancho, nrm), col);
    }
  };
  const caja = (w, h, d, x, y, z, col, rx = 0, ry = 0, rz = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
    g.translate(x, y, z);
    add(g, col);
  };

  const cabF = s.cabZ[1], cabR = s.cabZ[0];
  const furgon = s.type === 'van' || s.type === 'truck';
  const capo = s.zf - cabF;      // largo del capó
  // ── capó: junta con el parabrisas (la rejilla negra donde descansan los limpias), costados y frente ──
  if (capo > 0.5) {
    transversal(cabF + 0.03, 10, 15, 0.05, K.black);
    longitudinal(cabF + 0.05, s.zf - 0.3, 10, 0.02, K.gap);
    transversal(s.zf - 0.3, 10, 15, 0.02, K.gap);
    // paragolpes delantero: su junta baja por la aleta hasta el paso de rueda
    if (s.zf - s.wheels[0] - s.archR > 0.34) transversal(s.zf - 0.3, 5, 9, 0.02, K.gap);
  }
  // ── maletero o portón ──
  const cola = cabR - s.zr;
  if (!s.bed && !s.box) {
    if (cola > 0.5) {
      transversal(cabR - 0.03, 10, 15, 0.02, K.gap);
      longitudinal(s.zr + 0.26, cabR - 0.05, 10, 0.02, K.gap);
      transversal(s.zr + 0.26, 10, 15, 0.02, K.gap);
    }
    if (s.wheels[1] - s.archR - s.zr > 0.34) transversal(s.zr + 0.26, 5, 9, 0.02, K.gap);
  }
  // ── gomas de las ventanillas (abajo) y vierteaguas (arriba) ──
  if (s.win && !s.open) {
    longitudinal(s.win[0], s.win[1], 10, 0.022, K.black);
    longitudinal(s.win[0] + 0.04, s.win[1] - 0.12, 12, 0.016, K.black);
  }
  // ── estribo oscuro entre las ruedas (los que no llevan ya los bajos de plástico) ──
  if (!s.cladding && !s.fenders) {
    longitudinal(s.wheels[1] + s.archR + 0.05, s.wheels[0] - s.archR - 0.05, 3, 0.05, K.black);
  }
  // ── limpiaparabrisas sobre la rejilla ──
  if (capo > 0.5) {
    const z = cabF + 0.03, r = anillo(z);
    const y = r[13][1] + 0.014;
    for (const [x, giro] of [[0.3, 0.1], [-0.28, 0.1]]) {
      caja(0.5, 0.012, 0.018, x, y, z + 0.004 - (furgon ? 0.02 : 0), K.black, 0, giro, 0);
      caja(0.03, 0.02, 0.04, x - 0.24, y, z + 0.03, K.black);
    }
  }
  // ── tercera luz de freno, arriba de la luneta ──
  const luneta = s.topGlass.find(([a, b]) => b < 0);
  if (luneta && !s.open) {
    const z = luneta[1] - 0.05, r = anillo(z);
    caja(0.32, 0.014, 0.03, 0, r[15][1] + 0.004, z, K.stop || [0.42, 0.02, 0.015], -0.5);
  } else if ((s.rear?.window || s.rear?.cargo) && !s.open) {
    const r = anillo(s.zr + 0.02);
    caja(0.3, 0.02, 0.02, 0, r[13][1] - 0.02, s.zr - 0.006, K.stop || [0.42, 0.02, 0.015]);
  }
  // ── antena de aleta en el techo ──
  if (!s.open && !s.box && !s.taxi && !s.lightBar && s.type !== 'beetle') {
    const techo = s.roof.filter(([, y]) => y > Math.max(...s.roof.map(p => p[1])) - 0.05).map(p => p[0]);
    const z = Math.min(...techo) + 0.18, r = anillo(z);
    const g = new THREE.ConeGeometry(0.035, 0.11, 4, 1);
    g.rotateY(Math.PI / 4);
    g.scale(0.5, 0.7, 1.9);
    g.translate(0, r[15][1] + 0.035, z);
    add(g, s.roofCol === 'black' ? K.black : K.paint);
  }
  // ── faldón delantero y difusor trasero ──
  if (!furgon && !s.fenders) {
    const cf = at(s.zf - 0.05), cr = at(s.zr + 0.05);
    caja(cf.hw * 1.72, 0.03, 0.12, 0, cf.yb + 0.012, s.zf - 0.07, K.black);
    if (s.exhaust) caja(cr.hw * 1.3, 0.05, 0.1, 0, cr.yb + 0.03, s.zr + 0.05, K.black);
  }
  return out;
}

/**
 * retrovisor con forma: carcasa redondeada del color del coche, pie negro y espejo. Devuelve piezas ya
 * pintadas. x0: donde nace (borde de la ventanilla); y, z: su sitio; sx: lado
 */
export function retrovisor(t, x0, y, z, sx) {
  const { colored, K } = t;
  const out = [];
  const pie = new THREE.BoxGeometry(0.1, 0.03, 0.06);
  pie.translate(sx * (x0 + 0.03), y - 0.04, z);
  out.push(colored(pie, K.black));
  const carcasa = new THREE.SphereGeometry(1, 10, 7);
  carcasa.scale(0.088, 0.05, 0.05);
  // más llena por delante (hacia +z) y cortada por detrás, donde va el espejo
  const p = carcasa.getAttribute('position');
  for (let i = 0; i < p.count; i++) if (p.getZ(i) < -0.02) p.setZ(i, -0.02 - (p.getZ(i) + 0.02) * 0.15);
  carcasa.computeVertexNormals();
  carcasa.translate(sx * (x0 + 0.118), y - 0.005, z);
  out.push(colored(carcasa, K.paint));
  const espejo = new THREE.PlaneGeometry(0.135, 0.07);
  espejo.rotateY(Math.PI);
  espejo.translate(sx * (x0 + 0.118), y - 0.005, z - 0.0245);
  out.push(colored(espejo, K.glass));
  return out;
}
