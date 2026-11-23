import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex } from './interiorKit.js';

/**
 * Las guaguas municipales de Arrecife (foto de José Manuel, por detrás, en una rotonda): azules,
 * eléctricas, de unos 10,5 m, con «Arrecife» en letra de mano blanca en los costados y detrás, el
 * dibujo de la ciudad en línea blanca (el Gran Hotel, San Ginés, el castillo, palmeras, barquillos y
 * gaviotas) sobre las ventanas y debajo del letrero de atrás, el escudo del Ayuntamiento en la luna
 * trasera y las columnas de pilotos rojo oscuro en las esquinas de atrás. Las puertas, a la derecha:
 * la delantera, por delante de la rueda, y la del medio. Ni la marca ni la matrícula son las de verdad.
 * traffic.js las mete en la calle como un coche más: más largas, más despacio y por las calles anchas.
 */

export const GUAGUA_LEN = 10.5;
const L = GUAGUA_LEN, W = 2.5, H = 3.15, ZF = L / 2, ZR = -L / 2;
const AXF = 2.85, AXR = -2.65, WR = 0.5, Y0 = 0.3, YB = 1.0, ARCH = 0.62;
// la franja de las ventanas y las puertas (las puertas, en el lado derecho: x negativa)
const WIN0 = 1.32, WIN1 = 2.78, DOORS = [[3.5, 4.62], [0.15, 1.35]];
const BLUE = 0x2b5db3;
const SCRIPT = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", "Comic Sans MS", cursive';

/** el dibujo de la ciudad en línea blanca, de x0 a x1 con el suelo en y (s = píxeles por metro) */
function ciudad(g, x0, x1, y, s) {
  g.save();
  g.strokeStyle = 'rgba(255,255,255,.92)';
  g.lineWidth = Math.max(1.2, s * 0.09);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  const line = (pts) => { g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.stroke(); };
  const rect = (x, w, h) => g.strokeRect(x, y - h, w, h);
  const casa = (x, w, h) => {
    rect(x, w, h);
    for (let i = 0; i < Math.floor(w / (s * 1.1)); i++) g.strokeRect(x + s * 0.4 + i * s * 1.1, y - h * 0.65, s * 0.45, s * 0.6);
  };
  const torre = (x) => {   // el Gran Hotel: alto, con la rejilla de ventanas
    const w = s * 3, h = s * 13;
    rect(x, w, h);
    for (let r = 1; r < 12; r++) line([[x, y - r * s * 1.05], [x + w, y - r * s * 1.05]]);
    line([[x + w / 2, y], [x + w / 2, y - h]]);
    return w;
  };
  const iglesia = (x) => {   // San Ginés: torre con su campanario, la cúpula y la cruz
    const w = s * 2.2, h = s * 7;
    rect(x, w, h);
    g.beginPath(); g.arc(x + w / 2, y - h, w / 2, Math.PI, 0); g.stroke();
    line([[x + w / 2, y - h - w / 2], [x + w / 2, y - h - w / 2 - s * 1.2]]);
    line([[x + w / 2 - s * 0.4, y - h - w / 2 - s * 0.8], [x + w / 2 + s * 0.4, y - h - w / 2 - s * 0.8]]);
    g.beginPath(); g.arc(x + w / 2, y - h * 0.62, s * 0.45, Math.PI, 0); g.lineTo(x + w / 2 + s * 0.45, y - h * 0.45); g.lineTo(x + w / 2 - s * 0.45, y - h * 0.45); g.closePath(); g.stroke();
    rect(x + w, s * 4, s * 3.2);
    return w + s * 4;
  };
  const castillo = (x) => {   // el castillo de San Gabriel con sus almenas
    const w = s * 6, h = s * 2.6, a = [[x, y], [x, y - h]];
    for (let i = 0; i < 6; i++) a.push([x + i * s, y - h], [x + i * s, y - h - s * 0.5], [x + (i + 0.5) * s, y - h - s * 0.5], [x + (i + 0.5) * s, y - h]);
    a.push([x + w, y - h], [x + w, y]);
    line(a);
    g.beginPath(); g.arc(x + w / 2, y, s * 0.9, Math.PI, 0); g.stroke();
    return w;
  };
  const palmera = (x) => {
    const h = s * 5;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + s * 0.6, y - h * 0.5, x + s * 0.2, y - h); g.stroke();
    for (const [dx, dy] of [[-2, 0.4], [-1.2, -0.6], [0, -0.9], [1.3, -0.5], [2.1, 0.5]]) {
      g.beginPath(); g.moveTo(x + s * 0.2, y - h); g.quadraticCurveTo(x + s * (0.2 + dx * 0.6), y - h + s * (dy - 0.8), x + s * (0.2 + dx), y - h + s * (dy + 0.6)); g.stroke();
    }
    return s * 2.5;
  };
  const barco = (x) => {
    g.beginPath(); g.moveTo(x, y - s * 0.8); g.quadraticCurveTo(x + s * 1.5, y + s * 0.2, x + s * 3, y - s * 0.8); g.closePath(); g.stroke();
    line([[x + s * 1.5, y - s * 0.6], [x + s * 1.5, y - s * 3]]);
    line([[x + s * 1.5, y - s * 2.8], [x + s * 2.6, y - s * 1.1], [x + s * 1.5, y - s * 1.1]]);
    return s * 3.4;
  };
  const gaviota = (x, h) => line([[x - s * 0.5, y - h - s * 0.2], [x, y - h], [x + s * 0.5, y - h - s * 0.2]]);
  // la fila de la ciudad, repetida hasta llenar
  const fila = [(x) => (casa(x, s * 4, s * 2.4), s * 4), torre, (x) => (casa(x, s * 3, s * 3.4), s * 3), iglesia, palmera,
    (x) => (casa(x, s * 5, s * 2), s * 5), castillo, barco, palmera, (x) => (casa(x, s * 3.5, s * 4.2), s * 3.5), barco];
  let x = x0, i = 0;
  while (x < x1 - s * 4) {
    x += fila[i % fila.length](x) + s * (0.5 + (i % 3) * 0.4);
    if (i % 4 === 1) gaviota(x - s * 2, s * (8 + (i % 3)));
    i++;
  }
  line([[x0, y], [x1, y]]);
  g.restore();
}

/** la franja de ventanas: cristal oscuro con los montantes y el dibujo de la ciudad en la parte de abajo */
function ventanas(g, w, h) {
  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#20262d'); sky.addColorStop(0.5, '#0d1014'); sky.addColorStop(1, '#090b0e');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);
  // reflejo en diagonal
  g.fillStyle = 'rgba(255,255,255,.05)';
  for (let x = -h; x < w; x += w / 5) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h * 0.6, 0); g.lineTo(x + h * 0.9, 0); g.lineTo(x + h * 0.3, h); g.fill(); }
  g.fillStyle = '#050607';
  for (let i = 0; i <= 7; i++) g.fillRect(i * (w / 7) - 4, 0, 8, h);
  // la pegatina verde de dentro (como en la foto) en una de las ventanas
  g.fillStyle = '#3aa86b';
  g.fillRect(w * 0.47, h * 0.16, w * 0.012, h * 0.14);
  const s = h / 15;
  ciudad(g, w * 0.02, w * 0.98, h * 0.9, s);
}

/** «Arrecife» en letra de mano blanca, con la sombra un poco más oscura */
function letrero(g, w, h, size = 0.82, y = 0.6) {
  g.clearRect(0, 0, w, h);
  g.font = `italic 700 ${Math.round(h * size)}px ${SCRIPT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = 'rgba(10,30,70,.35)';
  g.fillText('Arrecife', w / 2 + h * 0.03, h * y + h * 0.03);
  g.fillStyle = '#ffffff';
  g.fillText('Arrecife', w / 2, h * y);
}

/** la trasera: «Arrecife» y debajo la ciudad en línea blanca */
function trasera(g, w, h) {
  letrero(g, w, h, 0.5, 0.36);
  ciudad(g, w * 0.08, w * 0.92, h * 0.93, h / 22);
}

/** la luna de atrás, oscura, con el escudo y «Ayuntamiento de Arrecife» */
function lunaTrasera(g, w, h) {
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, '#262b31'); gr.addColorStop(1, '#0b0d10');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.06)';
  g.beginPath(); g.moveTo(w * 0.55, 0); g.lineTo(w * 0.75, 0); g.lineTo(w * 0.5, h); g.lineTo(w * 0.3, h); g.fill();
  // el escudo: corona, campo partido con el castillo y las olas
  const cx = w * 0.18, cy = h * 0.52, sw = h * 0.36, sh = h * 0.46;
  g.strokeStyle = '#e9edf2'; g.fillStyle = 'rgba(233,237,242,.18)'; g.lineWidth = h * 0.018;
  g.beginPath();
  g.moveTo(cx - sw / 2, cy - sh / 2); g.lineTo(cx + sw / 2, cy - sh / 2); g.lineTo(cx + sw / 2, cy + sh * 0.1);
  g.quadraticCurveTo(cx + sw / 2, cy + sh / 2, cx, cy + sh * 0.62); g.quadraticCurveTo(cx - sw / 2, cy + sh / 2, cx - sw / 2, cy + sh * 0.1);
  g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#e9edf2';
  g.fillRect(cx - sw * 0.38, cy - sh / 2 - h * 0.09, sw * 0.76, h * 0.05);
  for (let i = 0; i < 3; i++) g.fillRect(cx - sw * 0.34 + i * sw * 0.3, cy - sh / 2 - h * 0.14, sw * 0.12, h * 0.06);
  g.fillRect(cx - sw * 0.16, cy - sh * 0.3, sw * 0.32, sh * 0.32);
  g.beginPath();
  for (let i = 0; i < 3; i++) { g.moveTo(cx - sw * 0.34, cy + sh * (0.12 + i * 0.11)); g.quadraticCurveTo(cx, cy + sh * (0.04 + i * 0.11), cx + sw * 0.34, cy + sh * (0.12 + i * 0.11)); }
  g.stroke();
  g.textAlign = 'left';
  g.textBaseline = 'middle';
  g.fillStyle = '#eef1f5';
  g.font = `400 ${Math.round(h * 0.1)}px "Barlow", Arial, sans-serif`;
  g.fillText('Ayuntamiento de', w * 0.31, h * 0.42);
  g.font = `600 ${Math.round(h * 0.16)}px "Barlow", Arial, sans-serif`;
  g.fillText('Arrecife', w * 0.31, h * 0.6);
}

/** el letrero de delante: letras de luz naranja sobre negro */
function destino(g, w, h) {
  g.fillStyle = '#07080a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#ff9a1f';
  g.font = `700 ${Math.round(h * 0.68)}px "Barlow", Arial, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('ARRECIFE', w / 2, h * 0.54);
}

/** las puertas: cristal oscuro con el marco gris y la junta en medio */
function puerta(g, w, h) {
  g.fillStyle = '#0c0f13';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#4b5158';
  g.lineWidth = w * 0.05;
  g.strokeRect(w * 0.03, h * 0.01, w * 0.94, h * 0.98);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.05)';
  g.fillRect(w * 0.1, h * 0.05, w * 0.12, h * 0.6);
  g.fillRect(w * 0.6, h * 0.05, w * 0.12, h * 0.6);
}

/** matrícula inventada */
function matricula(g, w, h) {
  g.fillStyle = '#f4f4f0'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1f4fb5'; g.fillRect(0, 0, w * 0.09, h);
  g.fillStyle = '#111';
  g.font = `700 ${Math.round(h * 0.72)}px "Barlow", Arial, sans-serif`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('2026 LVG', w * 0.55, h * 0.55);
}

// piezas y materiales: se hacen una vez y las comparten todas las guaguas
let PARTS = null;
function parts() {
  if (PARTS) return PARTS;
  const geo = { paint: [], dark: [], glass: [], red: [], tire: [], rim: [] };
  const flat = (g) => (g.index ? g.toNonIndexed() : g);
  const box = (list, x, y, z, w, h, d) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y + h / 2, z); list.push(flat(g)); };
  const round = (list, x, y, z, w, h, d, r) => { const g = new RoundedBoxGeometry(w, h, d, 2, r); g.translate(x, y + h / 2, z); list.push(flat(g)); };
  // carrocería: la parte de arriba entera y, por debajo, los faldones entre las ruedas
  round(geo.paint, 0, YB, 0, W, H - YB, L, 0.16);
  for (const [z0, z1] of [[AXF + ARCH, ZF], [AXR + ARCH, AXF - ARCH], [ZR, AXR - ARCH]]) round(geo.paint, 0, Y0, (z0 + z1) / 2, W - 0.02, YB - Y0 + 0.12, z1 - z0, 0.1);
  // el techo de las baterías, un poco más estrecho
  round(geo.paint, 0, H - 0.06, -0.5, W - 0.5, 0.32, 6.4, 0.1);
  // los huecos de las ruedas por dentro, los parachoques y los retrovisores
  for (const z of [AXF, AXR]) box(geo.dark, 0, Y0 - 0.05, z, W - 0.5, YB - Y0 + 0.12, ARCH * 2);
  box(geo.dark, 0, Y0 - 0.06, ZF - 0.04, W - 0.06, 0.24, 0.16);
  box(geo.dark, 0, Y0 - 0.06, ZR + 0.04, W - 0.06, 0.24, 0.16);
  for (const sx of [-1, 1]) {
    box(geo.dark, sx * (W / 2 + 0.16), 2.62, ZF - 0.15, 0.36, 0.06, 0.06);
    box(geo.dark, sx * (W / 2 + 0.3), 1.95, ZF - 0.12, 0.08, 0.72, 0.06);
    box(geo.dark, sx * (W / 2 + 0.3), 1.85, ZF - 0.14, 0.12, 0.5, 0.26);
    // las columnas de pilotos de atrás, rojo oscuro (foto)
    box(geo.red, sx * (W / 2 - 0.11), Y0 + 0.12, ZR - 0.02, 0.22, 1.75, 0.08);
  }
  // ruedas
  for (const z of [AXF, AXR]) for (const sx of [-1, 1]) {
    const t = new THREE.CylinderGeometry(WR, WR, 0.32, 20); t.rotateZ(Math.PI / 2); t.translate(sx * (W / 2 - 0.2), WR, z); geo.tire.push(flat(t));
    const r = new THREE.CylinderGeometry(0.3, 0.3, 0.34, 14); r.rotateZ(Math.PI / 2); r.translate(sx * (W / 2 - 0.2), WR, z); geo.rim.push(flat(r));
  }
  // el parabrisas, entero
  const ws = new THREE.PlaneGeometry(W - 0.22, 1.85); ws.translate(0, 1.98, ZF + 0.012); geo.glass.push(flat(ws));

  const std = (o) => new THREE.MeshStandardMaterial(o);
  const decal = (tex, o = {}) => std({ map: tex, transparent: true, depthWrite: false, roughness: 0.4, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, ...o });
  const merge = (list) => mergeGeometries(list, false);
  PARTS = {
    paint: merge(geo.paint), dark: merge(geo.dark), glass: merge(geo.glass), red: merge(geo.red), tire: merge(geo.tire), rim: merge(geo.rim),
    mats: {
      paint: std({ color: BLUE, roughness: 0.34, metalness: 0.22 }),
      dark: std({ color: 0x17191c, roughness: 0.7 }),
      glass: std({ color: 0x0e1116, roughness: 0.08, metalness: 0.55 }),
      red: std({ color: 0x5c1418, roughness: 0.3, metalness: 0.1 }),
      tire: std({ color: 0x151515, roughness: 0.92 }),
      rim: std({ color: 0xb8bcc2, roughness: 0.3, metalness: 0.8 }),
      // faros y pilotos: apagados de día, se encienden de noche (setLights)
      head: std({ color: 0xeeeeea, emissive: 0xfff3d6, emissiveIntensity: 0, roughness: 0.2 }),
      tail: std({ color: 0xb3121b, emissive: 0xff1a1a, emissiveIntensity: 0, roughness: 0.3 }),
      amber: std({ color: 0xe58a1f, roughness: 0.3 }),
      white: std({ color: 0xe8e8e2, roughness: 0.3 }),
      windows: decal(canvasTex(1536, 228, ventanas), { transparent: false, depthWrite: true, roughness: 0.12, metalness: 0.3 }),
      side: decal(canvasTex(768, 216, (g, w, h) => letrero(g, w, h))),
      back: decal(canvasTex(512, 256, trasera)),
      rearWin: decal(canvasTex(512, 280, lunaTrasera), { transparent: false, depthWrite: true, roughness: 0.12, metalness: 0.3 }),
      door: decal(canvasTex(128, 256, puerta), { transparent: false, depthWrite: true, roughness: 0.12, metalness: 0.3 }),
      plate: decal(canvasTex(256, 56, matricula), { transparent: false, depthWrite: true }),
      sign: (() => { const t = canvasTex(512, 64, destino); return std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.9, roughness: 0.4 }); })(),
      shadow: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.38, depthWrite: false }),
    },
  };
  return PARTS;
}

/** plano con su material, mirando hacia (nx, nz) */
function plane(group, mat, w, h, x, y, z, nx, nz) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  m.rotation.y = Math.atan2(nx, nz);
  group.add(m);
  return m;
}

/**
 * una guagua: el morro hacia +z y el suelo en y = 0, como los coches de carModels.js.
 * Devuelve lo mismo que makeCar en lo que usa el tráfico (group con setLights y setDetail).
 */
export function makeGuagua() {
  const P = parts(), M = P.mats;
  const group = new THREE.Group();
  group.name = 'guagua';
  const body = new THREE.Group();
  group.add(body);
  for (const k of ['paint', 'dark', 'glass', 'red', 'tire', 'rim']) {
    const m = new THREE.Mesh(P[k], M[k]);
    m.castShadow = k === 'paint';
    m.receiveShadow = true;
    body.add(m);
  }
  const detail = [];
  // las ventanas de los dos lados y, a la derecha, las dos puertas
  const wz0 = ZR + 0.35, wz1 = ZF - 0.45;
  for (const sx of [-1, 1]) {
    plane(body, M.windows, wz1 - wz0, WIN1 - WIN0, sx * (W / 2 + 0.006), (WIN0 + WIN1) / 2, (wz0 + wz1) / 2, sx, 0);
    // «Arrecife» encima de la rueda de atrás, metiéndose un poco en las ventanas (foto)
    plane(body, M.side, 3.7, 1.04, sx * (W / 2 + 0.014), 1.5, -2.9, sx, 0);
  }
  for (const [z0, z1] of DOORS) plane(body, M.door, z1 - z0, 2.45, -(W / 2 + 0.012), Y0 + 0.05 + 2.45 / 2, (z0 + z1) / 2, -1, 0);
  // delante: el letrero de destino, los faros y la matrícula
  plane(body, M.sign, 1.7, 0.22, 0, 2.78, ZF + 0.02, 0, 1);
  for (const sx of [-1, 1]) plane(body, M.head, 0.42, 0.15, sx * 0.9, 0.72, ZF + 0.014, 0, 1);
  detail.push(plane(body, M.plate, 0.52, 0.11, 0, 0.5, ZF + 0.016, 0, 1));
  // detrás: la luna con el escudo, «Arrecife» con la ciudad, los pilotos de las columnas y la matrícula
  plane(body, M.rearWin, W - 0.5, 1.12, 0, 2.32, ZR - 0.012, 0, -1);
  plane(body, M.back, 1.9, 0.95, 0, 1.22, ZR - 0.014, 0, -1);
  const lens = new THREE.CircleGeometry(0.075, 14);
  for (const sx of [-1, 1]) {
    [[1.72, M.amber], [1.38, M.tail], [1.04, M.tail], [0.7, M.white]].forEach(([y, mat]) => {
      const l = new THREE.Mesh(lens, mat);
      l.position.set(sx * (W / 2 - 0.11), y, ZR - 0.066);
      l.rotation.y = Math.PI;
      body.add(l);
    });
  }
  detail.push(plane(body, M.plate, 0.52, 0.11, 0, 0.56, ZR - 0.016, 0, -1));
  // sombra de contacto
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.2, L + 0.2), M.shadow);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.012;
  shadow.renderOrder = 1;
  group.add(shadow);

  group.userData.carType = 'guagua';
  group.userData.body = body;
  group.userData.paint = M.paint;
  group.userData.headlights = [M.head];
  group.userData.taillights = [M.tail];
  let near = true;
  group.userData.setDetail = (v) => {
    if (v === near) return;
    near = v;
    for (const o of detail) o.visible = v;
  };
  group.userData.setLights = (night) => {
    M.head.emissiveIntensity = night * 3.05;
    M.tail.emissiveIntensity = night * 2.05;
  };
  return { group, body, dims: { length: L, width: W, height: H }, model: 'guagua', brand: false };
}
