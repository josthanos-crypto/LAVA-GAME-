import * as THREE from 'three';

/**
 * Suelos pintados por código para plazas y paseos: losas claras, ladrillo en
 * espiga y losas de piedra gris, y las piezas planas que los llevan (un
 * polígono con huecos o una banda a lo largo de una línea). La textura va
 * por coordenadas del mundo, así que dos trozos que se pisan se ven igual.
 */

function canvasTex(size, draw, metersPerTile) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  let s = 97;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  draw(g, r, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.userData.mpt = metersPerTile;
  return t;
}

/** losas claras de 40 cm del paseo marítimo */
export function lightSlabs() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#aaa59c';
    g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 32) {
      const v = 206 + (r() - 0.5) * 14;
      g.fillStyle = `rgb(${v},${v - 4},${v - 10})`;
      g.fillRect(x + 1, y + 1, 30, 30);
    }
  }, 3.2);
}

/** ladrillo rojizo en espiga con franjas grises en diagonal (parque José Ramírez Cerdá) */
export function herringbone() {
  const u = 16;
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#5e342b';
    g.fillRect(0, 0, 256, 256);
    const brick = (x, y, w, h) => {
      const grey = ((x + y) % 256 + 256) % 256 < 24;
      const k = (r() - 0.5) * 18;
      g.fillStyle = grey ? `rgb(${150 + k},${146 + k},${140 + k})` : `rgb(${150 + k},${78 + k * 0.6},${62 + k * 0.5})`;
      g.fillRect(x + 1, y + 1, w - 2, h - 2);
    };
    // eles (un ladrillo tumbado y otro de pie) en la red (u, u) · (2u, −2u): encaja al repetir
    for (let a = -8; a < 24; a++) for (let b = -10; b < 10; b++) {
      const x = u * (a + 2 * b), y = u * (a - 2 * b);
      brick(x, y, 2 * u, u);
      brick(x, y + u, u, 2 * u);
    }
  }, 1.8);
}

/** losas grises lisas de 60 cm (plaza y calles de San Ginés, como en la foto de José Manuel) */
export function plazaSlabs() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#7d7a75';
    g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) {
      const v = 152 + (r() - 0.5) * 18;
      g.fillStyle = `rgb(${v},${v - 2},${v - 5})`;
      g.fillRect(x + 1.5, y + 1.5, 61, 61);
      g.fillStyle = 'rgba(0,0,0,0.04)';
      g.fillRect(x + 6 + r() * 30, y + 6 + r() * 30, 14, 9);
    }
  }, 2.4);
}

/** picón: grava volcánica negra con granos más claros y alguno rojizo (jardines de piedra, foto del parque del hospital) */
export function picon() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#2b2927';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      const v = 22 + r() * 60, red = r() < 0.12 ? 22 : 0, d = 1 + r() * 2.5;
      g.fillStyle = `rgb(${Math.round(v + red)},${Math.round(v)},${Math.round(v - 2)})`;
      g.fillRect(r() * 256, r() * 256, d, d);
    }
  }, 1.6);
}

/** picón rojo: la grava volcánica rojiza de los parterres del paseo (foto de la trasera de la Escuela) */
export function piconRojo() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#7a4636';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      const v = r(), d = 1 + r() * 2.5;
      g.fillStyle = `rgb(${Math.round(90 + v * 70)},${Math.round(50 + v * 40)},${Math.round(38 + v * 30)})`;
      g.fillRect(r() * 256, r() * 256, d, d);
    }
  }, 1.6);
}

/** asfalto gastado de aparcamiento: gris oscuro con granos y alguna mancha */
export function asfalto() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#4b4b4a';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3000; i++) {
      const v = Math.round(55 + r() * 50), d = 1 + r() * 1.5;
      g.fillStyle = `rgb(${v},${v},${v - 2})`;
      g.fillRect(r() * 256, r() * 256, d, d);
    }
    for (let i = 0; i < 14; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(25,24,22,0.12)' : 'rgba(150,140,110,0.10)';
      g.beginPath();
      g.arc(r() * 256, r() * 256, 8 + r() * 22, 0, Math.PI * 2);
      g.fill();
    }
  }, 4);
}

/** piedra volcánica negra con las juntas blancas (la peana de la cruz y el borde del parterre) */
export function blackStones() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#e6e2da';
    g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      for (let x = -16 + (y / 32 % 2) * 20; x < 256; x += 26 + r() * 8) {
        const w = 29 + r() * 8, h = 31 + r() * 4, v = 34 + r() * 30;
        g.fillStyle = `rgb(${v},${v - 1},${v - 2})`;
        g.beginPath();
        const n = 6;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + r() * 0.4;
          const px = x + w / 2 + Math.cos(a) * w / 2 * (0.82 + r() * 0.2), py = y + 16 + Math.sin(a) * h / 2 * (0.82 + r() * 0.2);
          if (k) g.lineTo(px, py); else g.moveTo(px, py);
        }
        g.fill();
      }
    }
  }, 2);
}

export function paveMaterial(tex, color = 0xffffff) {
  return new THREE.MeshStandardMaterial({
    map: tex, color, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
  });
}

/** triángulos planos a la altura y, con la textura por metros del mundo y la cara hacia arriba */
function flatGeometry(tris, y, mpt) {
  const pos = [], uv = [];
  for (const [P, Q, R] of tris) {
    const up = ((Q[0] - P[0]) * (R[1] - P[1]) - (Q[1] - P[1]) * (R[0] - P[0])) < 0;
    for (const [x, z] of (up ? [P, Q, R] : [P, R, Q])) { pos.push(x, y, z); uv.push(x / mpt, -z / mpt); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/** polígono [[x, z]...] con huecos, troceado en triángulos */
export function polyTris(outer, holes = []) {
  const ring = (p) => {
    const q = p.map(([x, z]) => new THREE.Vector2(x, z));
    if (q.length > 1 && q[0].equals(q[q.length - 1])) q.pop();
    return q;
  };
  const o = ring(outer), hs = holes.map(ring);
  const all = [...o, ...hs.flat()];
  return THREE.ShapeUtils.triangulateShape(o, hs).map(t => t.map(i => [all[i].x, all[i].y]));
}

/** banda de ancho w a lo largo de una línea [[x, z]...] */
export function bandTris(line, w) {
  const out = [];
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i], [bx, bz] = line[i + 1];
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) continue;
    const nx = -(bz - az) / L * w / 2, nz = (bx - ax) / L * w / 2;
    const A = [ax + nx, az + nz], B = [bx + nx, bz + nz], C = [bx - nx, bz - nz], D = [ax - nx, az - nz];
    out.push([A, B, C], [A, C, D]);
  }
  return out;
}

/** círculo de radio r (n lados) */
export function discTris(cx, cz, r, n = 32) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
    out.push([[cx, cz], [cx + Math.sin(a) * r, cz + Math.cos(a) * r], [cx + Math.sin(b) * r, cz + Math.cos(b) * r]]);
  }
  return out;
}

/** malla plana con sus triángulos, a la altura y */
export function paveMesh(tris, y, tex, color) {
  if (!tris.length) return null;
  const m = new THREE.Mesh(flatGeometry(tris, y, tex.userData.mpt), paveMaterial(tex, color));
  m.receiveShadow = true;
  return m;
}

/** tierra del campo de arriba de Arrecife (fotos desde la azotea): marrón rojizo con piedrecitas y manchas */
export function tierra() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#8a5f45';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 18; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(60,40,30,0.1)' : 'rgba(170,125,90,0.09)';
      g.beginPath();
      g.arc(r() * 256, r() * 256, 10 + r() * 30, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 2400; i++) {
      const v = r(), d = 1 + r() * 2.2;
      const dark = r() < 0.18;
      g.fillStyle = dark ? `rgb(${Math.round(40 + v * 30)},${Math.round(32 + v * 22)},${Math.round(28 + v * 18)})`
        : `rgb(${Math.round(120 + v * 60)},${Math.round(85 + v * 45)},${Math.round(62 + v * 35)})`;
      g.fillRect(r() * 256, r() * 256, d, d);
    }
  }, 6);
}

/** el camino de tierra apisonada: más claro y fino que el campo, con algún bache */
export function tierraCamino() {
  return canvasTex(256, (g, r) => {
    g.fillStyle = '#a57a58';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 10; i++) {
      g.fillStyle = 'rgba(95,65,48,0.14)';
      g.beginPath();
      g.ellipse(r() * 256, r() * 256, 6 + r() * 16, 4 + r() * 8, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    for (let i = 0; i < 2200; i++) {
      const v = r(), d = 0.8 + r() * 1.6;
      g.fillStyle = `rgb(${Math.round(135 + v * 50)},${Math.round(100 + v * 40)},${Math.round(74 + v * 30)})`;
      g.fillRect(r() * 256, r() * 256, d, d);
    }
  }, 3);
}
