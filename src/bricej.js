import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';

/**
 * B3RICEJ, en la Avenida Mamerto Cabrera (foto de Street View de julio de 2025): casa terrera
 * blanca de una planta, con la pared de cal rugosa, el cartel negro con el emblema del toro y
 * el nombre, dos ventanales con reja de rombos, la chapa de la calle en la esquina y un
 * arriate con una mata en el chaflán.
 *
 * Se pone sobre el edificio que ya trae el mapa en esa esquina de la avenida, sin moverlo: se
 * le baja la altura a la planta baja (`ownFacade` para que no le ponga el rótulo genérico) y
 * se le pega delante la fachada de verdad, con la textura de cal.
 *
 * Skill `threejs-materials-lighting`: la cal es `MeshStandardMaterial` rugosa (0,95) con mapa
 * de lienzo; el cristal de las ventanas, oscuro y poco rugoso; los rótulos, lienzos en SRGB.
 */

// la esquina de la avenida que da al sur (OpenStreetMap)
const A = [-3780.0, 546.7], B = [-3764.8, 544.7];
const LEN = Math.hypot(B[0] - A[0], B[1] - A[1]);
const U = [(B[0] - A[0]) / LEN, (B[1] - A[1]) / LEN];
const N = [-U[1], U[0]];              // normal hacia la avenida (sur)
const RY = Math.atan2(N[0], N[1]);
const H = 4.4;
const BLANCO = 0xf4f2ec;

/** un punto de la fachada: u a lo largo, v hacia fuera */
const P = (u, v) => [A[0] + U[0] * u + N[0] * v, A[1] + U[1] * u + N[1] * v];

/** pone la casa terrera en planta baja y le quita el rótulo genérico */
export function tuneBricej(map) {
  for (const b of map.buildings || []) {
    if (!b.p.some(([x, z]) => Math.hypot(x - A[0], z - A[1]) < 0.6)) continue;
    if (!b.p.some(([x, z]) => Math.hypot(x - B[0], z - B[1]) < 0.6)) continue;
    b.h = H; b.s = 0; b.ownFacade = true;
  }
}

/** cal blanca rugosa, con las sombras y los granos de la pared */
function calTex() {
  const t = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#faf8f2'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5200; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 0.6 + Math.random() * 2.4;
      const v = Math.random();
      g.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.05 + Math.random() * 0.12})` : `rgba(196,192,182,${0.04 + Math.random() * 0.09})`;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    // unas manchas suaves de humedad, como en la foto
    for (let i = 0; i < 14; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = 30 + Math.random() * 90;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(200,196,184,0.1)'); gr.addColorStop(1, 'rgba(190,186,172,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  return t;
}

/** ventanal con reja de rombos: cristal oscuro y la malla dibujada encima */
function rejaTex() {
  return canvasTex(256, 200, (g, w, h) => {
    g.fillStyle = '#2b3f52'; g.fillRect(0, 0, w, h);
    // lo que se ve dentro: cajas y estantes azules
    for (let i = 0; i < 26; i++) {
      g.fillStyle = `rgba(${120 + Math.random() * 60},${160 + Math.random() * 50},${190 + Math.random() * 40},0.55)`;
      g.fillRect(Math.random() * w, h * 0.45 + Math.random() * h * 0.5, 10 + Math.random() * 28, 8 + Math.random() * 26);
    }
    g.strokeStyle = 'rgba(240,240,236,0.85)'; g.lineWidth = 1.6;
    for (let k = -h; k < w + h; k += 22) {
      g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke();
      g.beginPath(); g.moveTo(k, h); g.lineTo(k + h, 0); g.stroke();
    }
    g.strokeStyle = '#e9e7e0'; g.lineWidth = 8; g.strokeRect(0, 0, w, h);
  });
}

export function buildBricej(scene) {
  const g = new THREE.Group();
  g.name = 'bricej';

  // la pared de cal, delante del bloque del mapa
  const cal = new THREE.MeshStandardMaterial({ map: calTex(), roughness: 0.95, metalness: 0 });
  const [wx, wz] = P(LEN / 2, 0.09);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(LEN, H), cal);
  wall.position.set(wx, H / 2, wz);
  wall.rotation.y = RY;
  g.add(wall);

  // el zócalo y el remate de la azotea
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(LEN + 0.2, 0.45, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xe8e5dc, roughness: 0.9 }));
  const [px, pz] = P(LEN / 2, 0.16);
  plinth.position.set(px, 0.22, pz); plinth.rotation.y = RY;
  g.add(plinth);

  // el cartel: fondo blanco con el nombre y el emblema del toro
  const cartel = canvasTex(1024, 160, (c, w, h) => {
    c.fillStyle = '#f6f4ee'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#d6d2c6'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
    // el emblema redondo, con el toro
    const cx = h * 0.5, cy = h * 0.5, r = h * 0.38;
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#f6f4ee'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, r * 0.86, 0, Math.PI * 2); c.stroke();
    c.fillStyle = '#f6f4ee';
    c.beginPath();                                  // cuerpo
    c.ellipse(cx, cy + r * 0.16, r * 0.42, r * 0.22, 0, 0, Math.PI * 2); c.fill();
    c.beginPath();                                  // cabeza y cuernos
    c.ellipse(cx - r * 0.34, cy - r * 0.16, r * 0.2, r * 0.16, -0.3, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.moveTo(cx - r * 0.46, cy - r * 0.3); c.lineTo(cx - r * 0.62, cy - r * 0.5);
    c.lineTo(cx - r * 0.4, cy - r * 0.42); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(cx - r * 0.24, cy - r * 0.3); c.lineTo(cx - r * 0.16, cy - r * 0.52);
    c.lineTo(cx - r * 0.34, cy - r * 0.4); c.closePath(); c.fill();
    for (const lx of [-0.2, 0.05, 0.28]) c.fillRect(cx + r * lx, cy + r * 0.25, r * 0.07, r * 0.34);
    // el nombre
    c.fillStyle = '#1c1c1c'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = `900 ${Math.round(h * 0.62)}px "Arial Black", Impact, Arial, sans-serif`;
    c.fillText('B3RICEJ', h * 1.05, h * 0.54);
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 1.16),
    new THREE.MeshStandardMaterial({ map: cartel, roughness: 0.7 }));
  const [sx, sz] = P(LEN * 0.52, 0.2);
  sign.position.set(sx, 3.42, sz); sign.rotation.y = RY;
  g.add(sign);

  // los dos ventanales con reja
  const vidrio = new THREE.MeshStandardMaterial({ map: rejaTex(), roughness: 0.18, metalness: 0.35 });
  for (const u of [4.3, 10.9]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.15), vidrio);
    const [vx, vz] = P(u, 0.14);
    m.position.set(vx, 1.75, vz); m.rotation.y = RY;
    g.add(m);
  }

  // la chapa de la calle, en la esquina
  const chapa = canvasTex(192, 128, (c, w, h) => {
    c.fillStyle = '#f2f0ea'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#8d9aae'; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
    c.fillStyle = '#33405a'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `700 ${Math.round(h * 0.19)}px Arial, sans-serif`;
    c.fillText('AVDA.', w / 2, h * 0.26);
    c.fillText('MAMERTO', w / 2, h * 0.5);
    c.fillText('CABRERA', w / 2, h * 0.74);
  });
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.42),
    new THREE.MeshStandardMaterial({ map: chapa, roughness: 0.6 }));
  const [cx2, cz2] = P(1.4, 0.2);
  pl.position.set(cx2, 2.35, cz2); pl.rotation.y = RY;
  g.add(pl);

  // el arriate del chaflán, con su mata
  const k = new Kit();
  const [bx, bz] = P(-0.7, 0.55);
  k.box(bx, 0, bz, 2.4, 0.4, 1.1, BLANCO, { ry: RY, list: k.shell });
  k.ball(bx, 0.72, bz, 0.42, 0x5c7a3e, { sy: 0.9, list: k.solid });
  const { group: maceta } = k.build('bricejArriate');
  g.add(maceta);

  scene.add(g);
  return { group: g };
}
