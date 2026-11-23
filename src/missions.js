import * as THREE from 'three';
import { store } from './save.js';

/**
 * Misiones y dinero. Por la ciudad hay tres puntos de encargo (columnas de
 * luz). Al pisarlos empieza una misión:
 *  - Reparto: lleva un paquete a otra punta de Arrecife antes de que acabe el tiempo.
 *  - Carrera: pasa por los puntos de control siguiendo las calles.
 *  - Esquinazo: la policía va a por ti (3 estrellas) y tienes que perderla.
 *  - ¡Erupción!: la lava avanza desde detrás de ti, cada vez más deprisa; llega a la zona segura antes.
 * El dinero se guarda en el navegador entre partidas.
 */

const GIVERS = [
  { kind: 'acampada', label: 'PRINCIPAL', color: 0xc04cff, who: 'Don Florencio', intro: '' },
  { kind: 'reparto', label: 'REPARTO', color: 0xf4c542, who: 'Doña Pino',
    intro: 'Mi niño, llévame este paquete rapidito, que el cliente está esperando.' },
  { kind: 'carrera', label: 'CARRERA', color: 0x18c5b8, who: 'Ayoze',
    intro: '¿Te atreves con una carrerita por Arrecife? Pasa por todos los puntos.' },
  { kind: 'esquinazo', label: 'ESQUINAZO', color: 0xff5a3c, who: 'Tito',
    intro: 'Necesito que distraigas a la Local un rato. Que te persigan... y piérdelos.' },
  { kind: 'erupcion', label: '¡ERUPCIÓN!', color: 0xff5a14, who: 'Nayra, la vulcanóloga',
    intro: '¡El volcán ha despertado y la lava baja por las calles! Corre a la zona segura antes de que te alcance.' },
  // el WOD de Crossfit Lanzarote: el encargo está fijo en la acera, delante de la puerta del gimnasio (Calle Polca)
  { kind: 'wod', label: 'WOD', color: 0xe8392b, who: 'Entrenador de Crossfit Lanzarote', fixed: [-1837.6, -1552.1],
    intro: 'Hoy toca WOD de calle: tres puntos por el barrio a todo gas y vuelta aquí, a la puerta. ¡Sin parar, que el reloj corre!' },
];

/** el frente de lava de «¡Erupción!»: un muro que brilla, más fuerte abajo; el relieve lo dobla con las cuestas */
function lavaWall() {
  const c = document.createElement('canvas');
  c.width = 4; c.height = 128;
  const x = c.getContext('2d'), grad = x.createLinearGradient(0, 128, 0, 0);
  grad.addColorStop(0, 'rgba(255,214,120,1)');
  grad.addColorStop(0.18, 'rgba(255,110,20,0.95)');
  grad.addColorStop(0.55, 'rgba(200,40,10,0.45)');
  grad.addColorStop(1, 'rgba(120,20,5,0)');
  x.fillStyle = grad;
  x.fillRect(0, 0, 4, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
  });
  // radio 1 y alto 1: se escala con el frente (y = 0 es el suelo)
  const geo = new THREE.CylinderGeometry(1, 1, 1, 128, 1, true);
  geo.translate(0, 0.5, 0);
  return new THREE.Mesh(geo, mat);
}

/** lo que ya ha cubierto la lava: un disco por las calles, más claro en el borde (malla fina: sigue las cuestas) */
function lavaLake() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d'), grad = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(140,22,4,0.85)');
  grad.addColorStop(0.8, 'rgba(225,70,10,0.9)');
  grad.addColorStop(0.97, 'rgba(255,190,80,1)');
  grad.addColorStop(1, 'rgba(255,120,20,0)');
  x.fillStyle = grad;
  x.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(2, 2, 64, 64);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0.3, 0);
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: false, toneMapped: false }));
}

/** una persona que pide ayuda en «¡Erupción!»: chaleco naranja, un brazo en alto y un aro en el suelo */
function survivor() {
  const g = new THREE.Group();
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.3, 0.75, 10), mat(0xff8a1e));
  body.position.y = 1.0;
  const legs = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 0.65, 10), mat(0x2d3a55));
  legs.position.y = 0.33;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), mat(0xd9a07a));
  head.position.y = 1.62;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.7, 0.11), mat(0xd9a07a));
  arm.geometry.translate(0, 0.35, 0);
  arm.position.set(0.34, 1.25, 0);
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.4, 32),
    new THREE.MeshBasicMaterial({ color: 0xffb02e, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.1;
  g.add(legs, body, head, arm, ring);
  g.userData.arm = arm;
  return g;
}

function disposeTree(o) {
  o.traverse(c => { c.geometry?.dispose(); c.material?.dispose(); });
}

const DEST_NAMES = ['El Charco de San Ginés', 'el Gran Hotel', 'la Marina', 'el Reducto', 'la calle Real', 'el Parque Islas Canarias', 'Valterra', 'Titerroy', 'el puerto de Los Mármoles', 'Altavista'];

function load(k, def) { try { const v = store.get(k); return v === null ? def : JSON.parse(v); } catch { return def; } }
function save(k, v) { store.set(k, JSON.stringify(v)); }

function labelSprite(text, color) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const x = c.getContext('2d');
  x.font = 'italic 800 76px "Barlow Condensed", "Arial Narrow", Arial';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.lineWidth = 10;
  x.strokeStyle = 'rgba(0,0,0,0.6)';
  x.strokeText(text, 256, 64);
  x.fillStyle = '#' + new THREE.Color(color).getHexString();
  x.fillText(text, 256, 64);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false, transparent: true }));
  s.scale.set(8, 2, 1);
  return s;
}

/** columna de luz + anillo en el suelo: alta para verla por encima de los edificios */
function beacon(color, radius = 3) {
  const g = new THREE.Group();
  const H = 160;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.5, radius * 0.5, H, 24, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, fog: false }),
  );
  beam.position.y = H / 2;
  // alma brillante: de noche resplandece y de día se ve el color
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.14, radius * 0.14, H, 12, 1, true),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
  );
  core.position.y = H / 2;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.8, radius, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.25;
  g.add(beam, core, ring);
  g.userData.ring = ring;
  return g;
}

/** chincheta del destino: siempre del mismo tamaño y visible también a través de los edificios */
function pinSprite() {
  const c = document.createElement('canvas');
  c.width = 96; c.height = 128;
  const x = c.getContext('2d');
  x.beginPath();
  x.moveTo(48, 122);
  x.bezierCurveTo(40, 96, 10, 78, 10, 46);
  x.arc(48, 46, 38, Math.PI, 0);
  x.bezierCurveTo(86, 78, 56, 96, 48, 122);
  x.closePath();
  x.fillStyle = '#ffffff';
  x.fill();
  x.lineWidth = 6;
  x.strokeStyle = 'rgba(0,0,0,0.55)';
  x.stroke();
  x.beginPath();
  x.arc(48, 46, 15, 0, Math.PI * 2);
  x.fillStyle = 'rgba(0,0,0,0.55)';
  x.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, depthTest: false, depthWrite: false, transparent: true, sizeAttenuation: false, fog: false,
  }));
  s.center.set(0.5, 0); // la punta, en el sitio
  s.scale.set(0.045, 0.06, 1);
  s.renderOrder = 999;
  return s;
}

export class Missions {
  constructor({ scene, graph, police, combat, dialog, hud, spawn, story = null, charName = () => 'Tú' }) {
    this.story = story;
    this.charName = charName;
    this.scene = scene;
    this.graph = graph;
    this.police = police;
    this.combat = combat;
    this.dialog = dialog;
    this.hud = hud;
    this.money = load('gtac.money', 0);
    this.done = load('gtac.missionsDone', 0);
    this.active = null;
    this.cooldown = 0;
    this.wasDead = false;

    // puntos de encargo repartidos alrededor del punto de salida
    const used = [];
    this.givers = GIVERS.map((def, i) => {
      if (def.fixed) {
        const fb = beacon(def.color, 2.6);
        fb.position.set(def.fixed[0], 0, def.fixed[1]);
        const fl = labelSprite(def.label, def.color);
        fl.position.y = 5;
        fb.add(fl);
        scene.add(fb);
        return { ...def, x: def.fixed[0], z: def.fixed[1], mesh: fb };
      }
      // la principal, a dos pasos de donde empiezas
      let n = def.kind === 'acampada'
        ? graph.randomNodeAround(spawn.x, spawn.z, 25, 70, true)
        : graph.randomNodeAround(spawn.x, spawn.z, 60 + i * 40, 140 + i * 60, true);
      // separados entre sí, para no pisar dos encargos a la vez
      for (let k = 0; k < 30 && used.some(u => Math.hypot(graph.x[u] - graph.x[n], graph.z[u] - graph.z[n]) < 40); k++) {
        n = graph.randomNodeAround(spawn.x, spawn.z, 50, 260, true);
      }
      used.push(n);
      const b = beacon(def.color, 2.6);
      b.position.set(graph.x[n], 0, graph.z[n]);
      const label = labelSprite(def.label, def.color);
      label.position.y = 5;
      b.add(label);
      scene.add(b);
      return { ...def, x: graph.x[n], z: graph.z[n], mesh: b };
    });
    this.target = beacon(0xf4c542, 4);
    this.pin = pinSprite();
    this.pin.position.y = 7;
    this.target.add(this.pin);
    this.target.visible = false;
    scene.add(this.target);
    // destino para el GPS del minimapa: { x, z, color } o null
    this.nav = null;
    this.hud.money(this.money);
  }

  addMoney(n) {
    this.money = Math.max(0, Math.round(this.money + n));
    save('gtac.money', this.money);
    this.hud.money(this.money, n);
  }

  /** el destino (columna, anillo y chincheta) toma el color de la misión */
  paintTarget(color) {
    this.target.traverse(o => { if (o.material?.color) o.material.color.setHex(color); });
  }

  start(giver, act) {
    const g = this.graph;
    const m = { kind: giver.kind, giver, t: 0 };
    this.paintTarget(giver.color);
    if (giver.kind === 'acampada') {
      m.points = [];
      m.limit = 900;
      m.reward = 3000;
      m.title = 'La Acampada';
      m.idx = 0;
      this.active = m;
      for (const gv of this.givers) gv.mesh.visible = false;
      this.story.start();
      this.dialog.play(this.story.intro(this.charName()));
      this.hud.mission(m.title);
      return;
    }
    if (giver.kind === 'reparto') {
      const n = g.randomNodeAround(act.pos.x, act.pos.y, 300, 750);
      m.points = [[g.x[n], g.z[n]]];
      const d = Math.hypot(g.x[n] - act.pos.x, g.z[n] - act.pos.y);
      m.limit = Math.round(d / 7 + 30);
      m.reward = Math.round(150 + d * 0.4);
      m.title = 'Lleva el paquete a ' + DEST_NAMES[Math.floor(Math.random() * DEST_NAMES.length)];
    } else if (giver.kind === 'carrera') {
      const far = g.randomNodeAround(act.pos.x, act.pos.y, 600, 1100, true);
      const route = g.path(act.pos.x, act.pos.y, g.x[far], g.z[far], 20000) || [far];
      // un punto de control cada ~120 m de ruta
      m.points = [];
      let acc = 0;
      for (let i = 1; i < route.length; i++) {
        acc += Math.hypot(g.x[route[i]] - g.x[route[i - 1]], g.z[route[i]] - g.z[route[i - 1]]);
        if (acc > 120 || i === route.length - 1) { m.points.push([g.x[route[i]], g.z[route[i]]]); acc = 0; }
      }
      const total = m.points.reduce((s, p, i) => s + Math.hypot(p[0] - (i ? m.points[i - 1][0] : act.pos.x), p[1] - (i ? m.points[i - 1][1] : act.pos.y)), 0);
      m.limit = Math.round(total / 11 + 15);
      m.reward = Math.round(250 + total * 0.3);
      m.title = 'Carrera: ' + m.points.length + ' puntos de control';
    } else if (giver.kind === 'wod') {
      // tres puntos por las calles de alrededor y vuelta a la puerta del gimnasio
      m.points = [];
      for (let i = 0; i < 3; i++) {
        const n = g.randomNodeAround(giver.x, giver.z, 50 + i * 25, 120 + i * 30, true);
        m.points.push([g.x[n], g.z[n]]);
      }
      m.points.push([giver.x, giver.z]);
      m.limit = 120;
      m.reward = 400;
      m.title = 'WOD de calle: 3 puntos y vuelta al gimnasio';
    } else if (giver.kind === 'erupcion') {
      // la zona segura, lejos; la lava sale 70 m por detrás (al otro lado) y cada vez va más deprisa
      const n = g.randomNodeAround(act.pos.x, act.pos.y, 450, 800, true);
      m.points = [[g.x[n], g.z[n]]];
      const dx = g.x[n] - act.pos.x, dz = g.z[n] - act.pos.y, L = Math.hypot(dx, dz) || 1;
      const wall = lavaWall(), lake = lavaLake();
      m.lava = { x: act.pos.x - (dx / L) * 70, z: act.pos.y - (dz / L) * 70, r: 4, wall, lake };
      for (const o of [wall, lake]) {
        o.position.set(m.lava.x, 0, m.lava.z);
        o.scale.set(m.lava.r, o === wall ? 9 : 1, m.lava.r);
        this.scene.add(o);
      }
      // tres personas por la ruta pidiendo ayuda: se rescatan acercándote (a pie o en coche)
      const route = g.path(act.pos.x, act.pos.y, g.x[n], g.z[n], 20000) || [];
      m.rescue = route.length < 8 ? [] : [0.2, 0.4, 0.6].map(f => {
        const id = route[Math.floor(route.length * f)];
        const mesh = survivor();
        mesh.position.set(g.x[id], 0, g.z[id]);
        this.scene.add(mesh);
        return { x: g.x[id], z: g.z[id], mesh, done: false };
      });
      m.rescued = 0;
      m.limit = 300;
      m.reward = 900;
      m.title = '¡Erupción! Ve a la zona segura';
    } else {
      this.police.add(3);
      m.points = [];
      m.limit = 240;
      m.reward = 600;
      m.title = 'Pierde a la policía';
    }
    m.idx = 0;
    this.active = m;
    for (const gv of this.givers) gv.mesh.visible = false;
    this.dialog.play([{ who: giver.who, text: giver.intro }]);
    this.hud.mission(m.title);
  }

  finish(ok, reason) {
    const m = this.active;
    this.active = null;
    if (m.lava) {
      for (const o of [m.lava.wall, m.lava.lake]) {
        this.scene.remove(o);
        o.geometry.dispose();
        o.material.map.dispose();
        o.material.dispose();
      }
    }
    for (const r of m.rescue || []) {
      this.scene.remove(r.mesh);
      disposeTree(r.mesh);
    }
    this.nav = null;
    this.target.visible = false;
    this.cooldown = 4;
    for (const gv of this.givers) gv.mesh.visible = true;
    if (ok) {
      this.done += 1;
      save('gtac.missionsDone', this.done);
      this.addMoney(m.reward);
      this.hud.result(true, '¡MISIÓN SUPERADA!', '+' + m.reward + ' €');
    } else {
      this.hud.result(false, 'MISIÓN FALLIDA', reason);
      if (m.kind === 'acampada') this.story.abort();
    }
    this.hud.mission(null);
  }

  /** a dónde apunta la flecha del HUD */
  objective() {
    const m = this.active;
    if (!m || !m.points.length) return null;
    return m.points[m.idx];
  }

  update(dt, act) {
    const t = performance.now() * 0.001;
    for (const gv of this.givers) gv.mesh.userData.ring.rotation.z = t;
    this.target.userData.ring.rotation.z = -t * 1.5;

    // detenido / muerto: falla la misión y cuesta dinero
    if (this.combat.dead && !this.wasDead) {
      const busted = this.combat.lastEnd === 'DETENIDO';
      this.addMoney(busted ? -Math.round(this.money * 0.1) : -100);
      if (this.active) this.finish(false, busted ? 'Te han detenido' : 'Has muerto');
    }
    this.wasDead = this.combat.dead;
    if (this.combat.dead) { this.nav = null; this.hud.objective(null); return; }

    this.cooldown -= dt;
    const m = this.active;
    this.nav = null;
    if (!m) {
      if (this.cooldown > 0) { this.hud.objective(null); return; }
      for (const gv of this.givers) {
        if (Math.hypot(gv.x - act.pos.x, gv.z - act.pos.y) < 3.5) { this.start(gv, act); return; }
      }
      this.hud.objective(null);
      return;
    }

    m.t += dt;
    const left = m.limit - m.t;
    if (left <= 0) { this.finish(false, 'Se acabó el tiempo'); return; }

    if (m.kind === 'acampada') {
      const o = this.story.objective(act);
      if (this.story.phase === 'done') { this.finish(true); return; }
      // la columna marca la tanqueta que hay que robar y luego la acampada
      const showBeacon = this.story.phase === 'steal' || this.story.phase === 'drive';
      this.target.visible = showBeacon;
      if (showBeacon) this.target.position.set(o.x, 0, o.z);
      this.nav = { x: o.x, z: o.z, color: m.giver.color };
      const d = Math.hypot(o.x - act.pos.x, o.z - act.pos.y);
      const ang = Math.atan2(o.x - act.pos.x, o.z - act.pos.y) - act.heading;
      this.hud.objective(o.near ? { text: o.text, timer: left } : { text: o.text, dist: d, angle: ang, timer: left });
      return;
    }
    if (m.kind === 'esquinazo') {
      this.hud.objective({ text: m.title, timer: left, stars: true });
      if (m.t > 3 && this.police.wanted === 0) this.finish(true);
      return;
    }

    // el frente de lava crece (de 3 a 9 m/s) y parpadea; si llega a donde estás, se acabó
    let lavaGap = 0;
    if (m.lava) {
      const L = m.lava;
      L.r += Math.min(9, 3 + m.t * 0.06) * dt;
      L.wall.scale.set(L.r, 7 + Math.sin(t * 7) * 0.8 + Math.sin(t * 2.3) * 0.6, L.r);
      L.wall.material.opacity = 0.85 + Math.sin(t * 11) * 0.15;
      L.lake.scale.set(L.r, 1, L.r);
      lavaGap = Math.hypot(act.pos.x - L.x, act.pos.y - L.z) - L.r;
      if (lavaGap <= 0) { this.finish(false, 'La lava te ha alcanzado'); return; }
    }

    // las personas por rescatar: se rescata al pasar a menos de 4 m (+150 € al momento y 8 s más cada una)
    const pending = (m.rescue || []).filter(r => !r.done);
    for (const r of m.rescue || []) {
      r.mesh.userData.arm.rotation.z = r.done ? 0 : 2.5 + Math.sin(t * 8) * 0.5;
      if (!r.done && Math.hypot(r.x - act.pos.x, r.z - act.pos.y) < 4) {
        r.done = true;
        r.mesh.visible = false;
        m.rescued += 1;
        m.limit += 8;
        this.addMoney(150);
      }
    }
    const next = pending.find(r => !r.done);
    const [px, pz] = next ? [next.x, next.z] : m.points[m.idx];
    this.target.visible = true;
    this.target.position.set(px, 0, pz);
    this.nav = { x: px, z: pz, color: m.giver.color };
    const d = Math.hypot(px - act.pos.x, pz - act.pos.y);
    const ang = Math.atan2(px - act.pos.x, pz - act.pos.y) - act.heading;
    const sub = (m.kind === 'carrera' || m.kind === 'wod') ? `Punto ${m.idx + 1}/${m.points.length}`
      : m.lava ? `${next ? `Rescata ${m.rescued + 1}/${m.rescue.length}` : 'Zona segura'} · lava a ${Math.round(lavaGap)} m` : m.title;
    this.hud.objective({ text: sub, dist: d, angle: ang, timer: left });
    if (!next && d < ((m.kind === 'carrera' || m.kind === 'wod') ? 7 : 4.5)) {
      m.idx += 1;
      if (m.idx >= m.points.length) this.finish(true);
      else m.limit += 4; // bonus de tiempo por punto
    }
  }
}
