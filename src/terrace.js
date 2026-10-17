import * as THREE from 'three';
import { Kit, canvasTex, glowMaterial } from './interiorKit.js';
import { findBuilding } from './civic.js';
import { windowGlow } from './realism.js';
import { randomPedLook } from './peds.js';
import { area } from './dogs.js';

/**
 * Las terrazas del Reducto, delante de La Cervecería y La Botica (Avenida
 * Fred Olsen): casi toda la plaza va techada, con toldo sobre perfiles de
 * aluminio, faldón con el nombre, cortavientos de cristal, jardineras con
 * buganvillas, guirnaldas de bombillas y la gente tomándose algo; y hacia el
 * paseo, más mesas al aire libre. El camarero de La Cervecería sirve una caña
 * con su tapa. En la plaza corretean perros salchicha y dan vueltas los de la
 * patineta.
 */

const FLOOR_Y = 0.17;
const D = 7.6, H0 = 3.25, H1 = 2.8;   // fondo del techado y alturas junto a la fachada y delante

/** fachada del edificio que da a la plaza: esquina A, a lo largo u, hacia fuera n, largo L */
function facade(map, sign) {
  const b = findBuilding(map, sign.x - sign.nx * 1.5, sign.z - sign.nz * 1.5);
  if (!b) return null;
  const p = b.p;
  let area2 = 0;
  for (let i = 0; i < p.length - 1; i++) area2 += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1];
  const o = area2 >= 0 ? 1 : -1;
  let best = null, bd = Infinity;
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1], L = Math.hypot(bx - ax, bz - az);
    if (L < 10) continue;
    const nx = o * (bz - az) / L, nz = -o * (bx - ax) / L;
    if (nx * sign.nx + nz * sign.nz < 0.9) continue;
    const t = Math.max(0, Math.min(1, ((sign.x - ax) * (bx - ax) + (sign.z - az) * (bz - az)) / (L * L)));
    const d = Math.hypot(sign.x - ax - (bx - ax) * t, sign.z - az - (bz - az) * t);
    if (d < bd) { bd = d; best = { a: [ax, az], b: [bx, bz], n: [nx, nz], L }; }
  }
  if (!best) return null;
  const n = best.n, u = [n[1], -n[0]];
  // A: la punta de la que se empieza a contar a lo largo de u
  const A = (best.b[0] - best.a[0]) * u[0] + (best.b[1] - best.a[1]) * u[1] > 0 ? best.a : best.b;
  return { A, u, n, L: best.L };
}

function valance(text, bg, fg) {
  return canvasTex(1024, 96, (g, W, H) => {
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // ondas del faldón
    g.fillStyle = 'rgba(0,0,0,.18)';
    for (let x = 0; x < W; x += 64) { g.beginPath(); g.arc(x + 32, H, 30, Math.PI, 0); g.fill(); }
    g.fillStyle = fg;
    g.font = 'italic 800 54px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, W / 2, H / 2 - 4);
  });
}

export function buildTerrace(scene, map, colliders, { locales, touch = false }) {
  const sign = (map.signs || []).find(s => s.name === 'La Cerveceria');
  const F = sign && facade(map, sign);
  if (!F) return null;
  const { A, u, n } = F;
  const L = Math.min(F.L, 60);
  const toW = (s, d) => [A[0] + u[0] * s + n[0] * d, A[1] + u[1] * s + n[1] * d];
  const ry = Math.atan2(n[0], n[1]);
  const sOf = (q) => (q.x - A[0]) * u[0] + (q.z - A[1]) * u[1];
  const cerv = sOf(sign);
  const botica = map.signs.find(s => s.name === 'La Botica');
  // los bares de la fila ya no sacan su mesita con sombrilla (ahora van bajo techo): se quitan de
  // la lista de rótulos cuando la ciudad ya está levantada, así el rótulo de la fachada se queda
  const under = (q) => q.k === 'food' && Math.hypot(q.x - sign.x, q.z - sign.z) < 30 && Math.abs((q.x - A[0]) * n[0] + (q.z - A[1]) * n[1]) < 2;
  map.terraceSigns = map.signs.filter(under);
  map.signs = map.signs.filter(q => !under(q));
  const bs = botica ? sOf(botica) : cerv + 16;

  const kit = new Kit();
  const AL = 0x2e3236;
  const pav = [
    { s0: 3.5, s1: cerv - 10.5, roof: 0x41474d, chair: 0x2b2f33, top: 0xeeeae2 },
    { s0: cerv - 9.5, s1: (cerv + bs) / 2 - 0.6, roof: 0x7a1f24, chair: 0x8a5a36, top: 0x6e4a30, text: 'LA CERVECERÍA · EL REDUCTO', bg: '#7a1f24', fg: '#f6e7c8' },
    { s0: (cerv + bs) / 2 + 0.6, s1: Math.min(L - 1.5, bs + 8), roof: 0xebe3cf, chair: 0x1e1f22, top: 0xeeeae2, text: 'LA BOTICA', bg: '#ebe3cf', fg: '#2a3a2e' },
  ].filter(p => p.s1 - p.s0 > 5);
  const seats = [];
  const slope = Math.atan((H0 - H1) / D);
  for (const P of pav) {
    const w = P.s1 - P.s0, mid = (P.s0 + P.s1) / 2;
    // toldo inclinado hacia el paseo (da sombra de verdad)
    const roof = new THREE.BoxGeometry(w, 0.05, D / Math.cos(slope));
    roof.rotateX(slope);
    roof.translate(mid, (H0 + H1) / 2, D / 2);
    kit.add(roof, P.roof);
    // perfiles: viga delantera, viga en la fachada, correas y postes
    kit.box(mid, H1 - 0.16, D, w, 0.16, 0.12, AL);
    kit.box(mid, H0 - 0.16, 0.08, w, 0.16, 0.12, AL);
    const bays = Math.max(2, Math.round(w / 3.4));
    const posts = [];
    for (let i = 0; i <= bays; i++) {
      const s = P.s0 + 0.08 + (w - 0.16) * i / bays;
      posts.push(s);
      kit.box(s, 0, D - 0.06, 0.1, H1 - 0.12, 0.1, AL);
      kit.block(s, D - 0.06, 0.14, 0.14);
      const rafter = new THREE.BoxGeometry(0.07, 0.11, D / Math.cos(slope));
      rafter.rotateX(slope);
      rafter.translate(s, (H0 + H1) / 2 - 0.09, D / 2);
      kit.add(rafter, AL);
    }
    // faldón con el nombre (o liso) y tira de luz por debajo
    if (P.text) kit.pic(mid, H1 - 0.2, D + 0.075, w, 0.38, 0, 1, valance(P.text, P.bg, P.fg), { glow: 0.18 });
    else kit.box(mid, H1 - 0.38, D + 0.065, w, 0.38, 0.02, P.roof);
    kit.box(mid, H1 - 0.19, D - 0.07, w - 0.2, 0.025, 0.03, 0xffd9a0, { list: kit.glow });
    // guirnalda de bombillas de poste a poste
    for (let i = 0; i < posts.length - 1; i++) {
      const a = posts[i], b = posts[i + 1], k = Math.max(3, Math.round((b - a) / 0.55));
      for (let j = 1; j < k; j++) {
        const t = j / k;
        kit.ball(a + (b - a) * t, H1 - 0.32 - 0.28 * (1 - (2 * t - 1) ** 2), D - 0.25, 0.06, 0xffe2a8, { list: kit.glow, seg: 6 });
      }
    }
    // cortavientos de cristal entre postes, menos la entrada (el hueco que cae enfrente del bar)
    const door = posts.reduce((bi, s, i) => (i < posts.length - 1 && Math.abs((s + posts[i + 1]) / 2 - mid) < Math.abs((posts[bi] + posts[bi + 1]) / 2 - mid) ? i : bi), 0);
    for (let i = 0; i < posts.length - 1; i++) {
      if (i === door) continue;
      const a = posts[i] + 0.06, b = posts[i + 1] - 0.06;
      kit.pane(a, D - 0.06, 1, 0, 0, 1, 0, b - a, 0.05, 1.5, false);
    }
    // laterales
    for (const s of [P.s0 + 0.08, P.s1 - 0.08]) {
      kit.pane(s, 0.6, 0, 1, s < mid ? 1 : -1, 0, 0, D - 0.75, 0.05, 1.5, false);
    }
    // jardineras con buganvillas en las esquinas de delante
    for (const s of [P.s0 + 0.6, P.s1 - 0.6]) kit.plant(s, D + 0.55, { h: 1.25, pot: 0x2e3236, leaf: 0x2f6b3a, flowers: 0xc2185b, r: 0.45 });
    // mesas bajo techo: tres filas, con pasillo enfrente de la puerta
    for (const d of [1.75, 3.85, 5.95]) {
      for (let s = P.s0 + 1.3; s < P.s1 - 1; s += 2.3) {
        if (Math.abs(s - mid) < 1.0 && d > 5) continue;
        kit.table(s, d, { w: 0.72, d: 0.72, top: P.top, leg: AL });
        kit.chair(s - 0.58, d, Math.PI / 2, P.chair, { legs: AL });
        kit.chair(s + 0.58, d, -Math.PI / 2, P.chair, { legs: AL });
        seats.push([s - 0.58, d, Math.PI / 2], [s + 0.58, d, -Math.PI / 2]);
        // cañas y algún plato
        if ((s * 7 + d * 3) % 3 < 2) {
          for (const o of [-0.16, 0.16]) {
            kit.cyl(s + o, 0.765, d + 0.1, 0.035, 0.03, 0.14, 0xe0a531, { seg: 10 });
            kit.cyl(s + o, 0.9, d + 0.1, 0.037, 0.037, 0.025, 0xf7f1e2, { seg: 10 });
          }
          kit.cyl(s, 0.762, d - 0.14, 0.12, 0.12, 0.012, 0xf4f2ee, { seg: 16 });
        }
      }
    }
  }
  const glow = glowMaterial(0.2);
  const built = kit.build('terrazas del Reducto', { glow });
  built.group.position.set(A[0], FLOOR_Y, A[1]);
  built.group.rotation.y = ry;
  scene.add(built.group);
  for (const [ax, az, bx, bz] of built.segs) colliders.addSegment(...toW(ax, az), ...toW(bx, bz));

  // la gente sentada (menos en el móvil)
  const rnd = mulberry(9);
  const want = touch ? 6 : 16;
  const chosen = seats.map(s => [s, rnd()]).sort((a, b) => a[1] - b[1]).slice(0, want).map(([s]) => s);
  for (const [s, d, a] of chosen) {
    const [x, z] = toW(s, d);
    locales.addStreetNpc({ name: '', look: { ...randomPedLook(rnd), backpack: null, bag: null }, at: [x, z], face: ry + a, pose: 'sit' });
  }

  // el camarero: va y viene por el pasillo de La Cervecería con la bandeja
  const P1 = pav.find(p => p.text?.startsWith('LA CERVECERÍA')) || pav[0];
  const stops = [];
  for (let s = P1.s0 + 1.3; s < P1.s1 - 1; s += 2.3) stops.push(s);
  let leg = 0, wait = 2, dir = 1;
  const at = toW(stops[0], 4.8);
  locales.addStreetNpc({
    name: 'Camarero',
    look: { sex: 'm', skin: 0xc28a62, hair: 0x1e1712, hairStyle: 'short', top: 0xf2f2f2, topStyle: 'tshirt', bottom: 0x1c1c1e, bottomStyle: 'pants', shoes: 0x1e1e20, shoeStyle: 'shoe', beard: true, height: 1.76, build: 1.05 },
    at, face: ry, pose: 'stand', tray: true,
    dress(parts) {
      // bandeja con dos cañas en alto
      const tray = new THREE.Group();
      const m = (geo, color) => new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.4 }));
      const plate = m(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 18), 0xb8bec4);
      tray.add(plate);
      for (const o of [-0.07, 0.07]) {
        const beer = m(new THREE.CylinderGeometry(0.035, 0.03, 0.15, 10), 0xe0a531);
        beer.position.set(o, 0.08, 0);
        const foam = m(new THREE.CylinderGeometry(0.037, 0.037, 0.03, 10), 0xf7f1e2);
        foam.position.set(o, 0.17, 0);
        tray.add(beer, foam);
      }
      tray.position.set(0.3, 0.46, 0.26);
      parts.spine.add(tray);
      // delantal negro
      const apron = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.5, 0.02), new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.8 }));
      apron.position.set(0, -0.12, 0.13);
      parts.spine.add(apron);
    },
    move(nn, dt) {
      if (wait > 0) { wait -= dt; nn.walking = false; return; }
      const [tx, tz] = toW(stops[leg], 4.8);
      const dx = tx - nn.x, dz = tz - nn.z, d = Math.hypot(dx, dz);
      if (d < 0.1) {
        wait = 1.5 + Math.random() * 3;
        nn.face = ry + (Math.random() < 0.5 ? Math.PI : 0);
        leg += dir;
        if (leg >= stops.length || leg < 0) { dir = -dir; leg += dir * 2; leg = Math.max(0, Math.min(stops.length - 1, leg)); }
        return;
      }
      nn.walking = true;
      nn.face = Math.atan2(dx, dz);
      const step = Math.min(d, 1.25 * dt);
      nn.x += dx / d * step; nn.z += dz / d * step;
    },
    talk: (c) => pick([
      [
        { who: 'Camarero', text: '¡Buenas! Bienvenido a La Cervecería, aquí en el Reducto, con la playa enfrente.' },
        { who: c.me, text: '¿Qué tienen hoy?', player: true },
        { who: 'Camarero', text: 'Cañas bien frías, tapas, pescado, hamburguesas, pizzas y ensaladas. Y para refrescarse, sangría o un daiquiri.' },
      ],
      [
        { who: 'Camarero', text: '¿Te busco sitio a la sombra? Debajo del toldo se está de lujo con la brisa.' },
        { who: c.me, text: 'Venga, que el sol aprieta.', player: true },
        { who: 'Camarero', text: 'Cocina abierta todo el día, desde el desayuno hasta la cena. Aquí siempre hay algo.' },
      ],
      [
        { who: 'Camarero', text: 'Mira qué vistas: la playa del Reducto, las palmeras y el paseo. Así da gusto trabajar.' },
        { who: c.me, text: 'Y la caña, ¿qué tal está?', player: true },
        { who: 'Camarero', text: '¡Tirada como Dios manda! Pide una con su tapa y me cuentas.' },
      ],
    ]),
    offer: {
      label: 'Pedir una caña con tapa', price: 4,
      talk: (c) => [
        { who: c.me, text: 'Ponme una caña y una tapita, porfa.', player: true },
        { who: 'Camarero', text: c.paid ? '¡Marchando! Siéntate donde quieras, que ahora te la llevo.' : 'Hoy invita la casa, ¡que ya vendrás más veces!' },
      ],
      apply: (h) => { h.heal(); h.addMinutes(20); h.toast('Caña y tapa en La Cervecería · salud al 100%'); },
    },
  });

  // la plaza que queda delante: para los perros y los patinadores
  const plaza = area([toW(2, 9.2), toW(L - 2, 9.2), toW(L - 2, 16.5), toW(2, 16.5)]);
  const loop = [];
  const s0 = 6, s1 = L - 6, d0 = 13.2, d1 = 17, r = (d1 - d0) / 2;
  for (let i = 0; i <= 8; i++) loop.push(toW(s0 + (s1 - s0) * i / 8, d0));
  for (let i = 1; i < 8; i++) { const a = -Math.PI / 2 + Math.PI * i / 8; loop.push(toW(s1 + Math.cos(a) * r, d0 + r + Math.sin(a) * r)); }
  for (let i = 0; i <= 8; i++) loop.push(toW(s1 - (s1 - s0) * i / 8, d1));
  for (let i = 1; i < 8; i++) { const a = Math.PI / 2 + Math.PI * i / 8; loop.push(toW(s0 + Math.cos(a) * r, d0 + r + Math.sin(a) * r)); }

  // mesas al aire libre hacia el paseo (estas sí salen volando si te las llevas por delante)
  const props = [];
  let k = 0;
  for (const d of [9.4, 11.7]) {
    for (let s = 5; s < L - 4; s += 3.1) {
      if ((k++ % 5) === 3) continue;
      const [x, z] = toW(s, d);
      props.push({ t: 'table', x, z, a: k });
      const [cx1, cz1] = toW(s - 0.62, d), [cx2, cz2] = toW(s + 0.62, d);
      const col = [0x2b2f33, 0x8a5a36, 0xd8d2c4][k % 3];
      props.push({ t: 'chair', x: cx1, z: cz1, a: Math.atan2(u[0], u[1]), c: col });
      props.push({ t: 'chair', x: cx2, z: cz2, a: Math.atan2(-u[0], -u[1]), c: col });
      if (k % 2 === 0) props.push({ t: 'umbrella', x, z, a: 0, c: [0xe8e2d0, 0x7a1f24, 0x2a4d6e][k % 3] });
    }
  }
  map.extraProps = [...(map.extraProps || []), ...props];

  return {
    plaza, loop,
    update() { glow.emissiveIntensity = 0.15 + windowGlow.value * 3.2; },
  };
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];

function mulberry(seed) {
  let t = seed >>> 0;
  return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}
