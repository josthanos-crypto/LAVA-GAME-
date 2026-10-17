import * as THREE from 'three';

/**
 * Misiones y dinero. Por la ciudad hay tres puntos de encargo (columnas de
 * luz). Al pisarlos empieza una misión:
 *  - Reparto: lleva un paquete a otra punta de Arrecife antes de que acabe el tiempo.
 *  - Carrera: pasa por los puntos de control siguiendo las calles.
 *  - Esquinazo: la policía va a por ti (3 estrellas) y tienes que perderla.
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
];

const DEST_NAMES = ['El Charco de San Ginés', 'el Gran Hotel', 'la Marina', 'el Reducto', 'la calle Real', 'el Parque Islas Canarias', 'Valterra', 'Titerroy', 'el puerto de Los Mármoles', 'Altavista'];

function load(k, def) { try { const v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch { return def; } }
function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } }

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

    const [px, pz] = m.points[m.idx];
    this.target.visible = true;
    this.target.position.set(px, 0, pz);
    this.nav = { x: px, z: pz, color: m.giver.color };
    const d = Math.hypot(px - act.pos.x, pz - act.pos.y);
    const ang = Math.atan2(px - act.pos.x, pz - act.pos.y) - act.heading;
    const sub = m.kind === 'carrera' ? `Punto ${m.idx + 1}/${m.points.length}` : m.title;
    this.hud.objective({ text: sub, dist: d, angle: ang, timer: left });
    if (d < (m.kind === 'carrera' ? 7 : 4.5)) {
      m.idx += 1;
      if (m.idx >= m.points.length) this.finish(true);
      else m.limit += 4; // bonus de tiempo por punto
    }
  }
}
