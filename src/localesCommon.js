import * as THREE from 'three';

/**
 * Cosas que comparten los locales de los clientes: rótulos pintados en
 * lienzo, carteles y pizarras, ropa de trabajo (gorro de cocinero, delantal,
 * corbata) y cómo va cambiando la conversación cada vez que vuelves.
 */

export const pick = (a) => a[Math.floor(Math.random() * a.length)];

/** cada vez que hablas con alguien te cuenta otra cosa (y luego vuelve a empezar) */
export const byVisit = (list) => (c) => list[c.visits % list.length](c);

export const SERIF = 'Georgia, "Times New Roman", serif';
export const SANS = '"Barlow Condensed", "Arial Narrow", Arial, sans-serif';

/** texto centrado que se encoge hasta caber */
export function fit(g, text, x, y, maxW, size, weight = '800', family = SANS, style = '') {
  let s = size;
  const f = () => `${style} ${weight} ${s}px ${family}`.trim();
  g.font = f();
  while (g.measureText(text).width > maxW && s > 10) { s -= 2; g.font = f(); }
  g.fillText(text, x, y);
  return s;
}

/** rótulo elegante: fondo liso, filete dorado, nombre en serifa y una línea debajo */
export function classicSign({ bg, fg, line = '#c9a96a', title, sub = '', serif = true }) {
  return (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = line; g.lineWidth = Math.max(4, H * 0.035);
    g.strokeRect(H * 0.08, H * 0.08, W - H * 0.16, H - H * 0.16);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    fit(g, title, W / 2, sub ? H * 0.42 : H * 0.52, W * 0.86, H * 0.46, serif ? '700' : '800', serif ? SERIF : SANS);
    if (sub) {
      g.fillStyle = line;
      fit(g, sub, W / 2, H * 0.76, W * 0.8, H * 0.17, '700', SANS);
    }
  };
}

/** pizarra de tiza con títulos y líneas */
export function chalkboard(title, lines) {
  return (g, W, H) => {
    g.fillStyle = '#5a3a22'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1f2a24'; g.fillRect(14, 14, W - 28, H - 28);
    g.globalAlpha = 0.06;
    for (let i = 0; i < 400; i++) { g.fillStyle = '#fff'; g.fillRect(Math.random() * W, Math.random() * H, 30 * Math.random(), 1); }
    g.globalAlpha = 1;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#f6d36b';
    fit(g, title, W / 2, 62, W - 80, 44, '700', SERIF, 'italic');
    let y = 118;
    const step = (H - 150) / lines.length;
    for (const l of lines) {
      const head = l.startsWith('#');
      g.fillStyle = head ? '#9fd6c2' : '#f2efe6';
      fit(g, head ? l.slice(1) : l, W / 2, y, W - 70, head ? 30 : 26, head ? '800' : '600', SANS);
      y += step;
    }
  };
}

/** cartel con fondo de color y dos líneas (escaparates, avisos) */
export function poster({ bg, fg, title, sub = '', accent = null }) {
  return (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    if (accent) { g.fillStyle = accent; g.fillRect(0, H * 0.78, W, H * 0.22); }
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    fit(g, title, W / 2, sub ? H * 0.36 : H * 0.48, W * 0.88, H * 0.28, '800', SANS);
    if (sub) fit(g, sub, W / 2, H * 0.62, W * 0.88, H * 0.12, '600', SANS);
  };
}

// ── ropa de trabajo (piezas pegadas a los huesos del muñeco) ──
const mat = (color, rough = 0.8) => new THREE.MeshStandardMaterial({ color, roughness: rough });

/** gorro de cocinero, alto y blanco */
export function chefHat(parts) {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.1, 0.07, 18), mat(0xf6f6f2));
  const puff = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.105, 0.17, 18), mat(0xffffff));
  puff.position.y = 0.12;
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xffffff));
  top.position.y = 0.205;
  g.add(band, puff, top);
  g.position.set(0, 0.29, -0.01);
  parts.head.add(g);
}

/** delantal (de cocina, de bar, de peluquero) */
export function apron(parts, color = 0x1a1a1c, long = true) {
  const a = new THREE.Mesh(new THREE.BoxGeometry(0.36, long ? 0.62 : 0.34, 0.02), mat(color));
  a.position.set(0, long ? -0.2 : -0.06, 0.135);
  parts.spine.add(a);
}

/** corbata sobre la camisa */
export function tie(parts, color = 0x1d2a3a) {
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.015), mat(color, 0.5));
  t.position.set(0, 0.22, 0.135);
  t.rotation.x = -0.08;
  parts.spine.add(t);
}

/** tijeras en la mano (peluquero) */
export function scissors(parts) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.16, 0.02), new THREE.MeshStandardMaterial({ color: 0xc8ccd0, metalness: 0.8, roughness: 0.25 }));
  s.position.set(0.02, -0.33, 0.04);
  parts.elbowR.add(s);
}
