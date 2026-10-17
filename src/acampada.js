import * as THREE from 'three';
import { buildHuman } from './humanModel.js';
import { makeWaterTruck, WaterJet } from './waterCannon.js';
import { planSite, inSea, makeTent, makeBanner, makeCampfire, makeWallPiece } from './acampadaSite.js';

/**
 * MISIÓN PRINCIPAL · LA ACAMPADA
 * Los jipis han acampado en el Parque Islas Canarias y Don Florencio no
 * puede abrir el kiosco. Roba la tanqueta de agua de la Policía, ve al
 * parque y échalos al mar con agua y jabón: el chorro los tumba y los
 * arrastra, el muro de la orilla acaba cediendo y caen al agua.
 */

const NAMES = ['Rayo de Luna', 'Kike Pachamama', 'Tranquilino', 'Nube', 'Yeray Karma', 'Brisa', 'Chema Mandala', 'Lucía Libertad', 'Pancho Incienso', 'Sol'];
const SHIRTS = [0xff4f6d, 0xffb02e, 0x3ed39a, 0x9b5cff, 0x3aa8ff, 0xffe14d, 0xd88a9a, 0x8a6a4a];
const HIT = ['¡Ño, qué fresquito!', '¡Esto es represión jabonosa!', '¡Me has mojado el aura!', '¡Que llevo tres semanas sin ducharme y estaba bien!', '¡Paz y amor, mi niño, paz y amor!', '¡El jabón no es biodegradable!', '¡Mis rastas, chacho!', '¡Que me resbalo!'];
const SEA = ['¡Pues ahora acampamos en La Graciosa!', '¡El agua está buenísima, venid!', '¡Esto no es una retirada, es una excursión!', '¡Que alguien salve mi ukelele!', '¡Seguimos protestando… desde el agua!', '¡Mira, una vieja! ¡Hola, vieja!'];
const CHANT = ['¡No nos moverán!', '¡Paz, amor y mojo!', '¡El parque es del pueblo!', '¡Menos curro, más surf!'];

const STAND_Y = 0.19;
const SWIM_Y = -1.2;
const R = 0.42;
const HOSE_LEN = 22;

function distSeg(x, z, s) {
  const dx = s.bx - s.ax, dz = s.bz - s.az, l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - s.ax) * dx + (z - s.az) * dz) / l2));
  return Math.hypot(x - (s.ax + dx * t), z - (s.az + dz * t));
}

export class Acampada {
  constructor({ scene, map, graph, colliders, police, dialog, toast, player, parkedCars, onFoot, getMode }) {
    Object.assign(this, { scene, map, graph, colliders, police, dialog, toast, player, parkedCars, onFoot, getMode });
    this.site = planSite(map, graph, colliders);
    this.jet = new WaterJet(scene);
    this.root = new THREE.Group();
    scene.add(this.root);
    this.phase = 'idle';
    this.lineT = 0;
    this.chantT = 3;
    this.buildCamp();
    this.buildTruck();
    this.reset();
  }

  /* ─── montaje ─── */

  buildCamp() {
    const s = this.site;
    this.walls = [];
    for (let i = 0; i < s.wallLine.length - 1; i++) {
      const a = s.wallLine[i], b = s.wallLine[i + 1];
      const mesh = makeWallPiece(a, b);
      this.root.add(mesh);
      this.walls.push({ ax: a[0], az: a[1], bx: b[0], bz: b[1], mesh, hp: 100, debris: [] });
    }
    this.tents = s.tents.map(([x, z], i) => {
      const g = makeTent(i);
      this.root.add(g);
      return { g, hx: x, hz: z, rot: Math.atan2(-s.nx, -s.nz) + (Math.random() - 0.5) * 0.8 };
    });
    s.banners.forEach(([x, z], i) => {
      const b = makeBanner(i);
      b.position.set(x, 0, z);
      b.rotation.y = Math.atan2(-s.nx, -s.nz);
      this.root.add(b);
    });
    this.fire = makeCampfire();
    this.fire.position.set(s.fire[0], 0.12, s.fire[1]);
    this.root.add(this.fire);

    this.hippies = s.people.map(([x, z], i) => {
      const h = buildHuman({
        skin: [0xe8c4a2, 0xd9a882, 0xc28a62, 0x9a6844][i % 4],
        hair: [0x6a4a2a, 0xc9a650, 0x3a2a1c, 0xb04a2a, 0x1e1712][i % 5],
        hairStyle: i % 3 ? 'long' : 'surf',
        beard: i % 2 === 0, shades: i % 4 === 1,
        top: SHIRTS[i % SHIRTS.length], sleeves: SHIRTS[(i + 3) % SHIRTS.length],
        bottom: [0xc8b89a, 0x6b5844, 0x3a5f8a, 0x8a4fd8][i % 4], shorts: i % 3 === 1,
        shoes: 0x8a6a4a, height: 1.62 + Math.random() * 0.28,
      });
      h.group.rotation.order = 'YXZ';
      this.root.add(h.group);
      return { ...h, name: NAMES[i % NAMES.length], hx: x, hz: z, phase: Math.random() * 10 };
    });

    // policías de guardia junto a la tanqueta
    this.cops = [0, 1].map(() => {
      const h = buildHuman({ skin: 0xd9a882, top: 0x1d2b4f, sleeves: 0x1d2b4f, bottom: 0x1d2b4f, shoes: 0x111111, cap: true, capColor: 0x1d2b4f, hair: 0x2a2018 });
      h.group.rotation.order = 'YXZ';
      this.root.add(h.group);
      return h;
    });
  }

  buildTruck() {
    this.truck = makeWaterTruck();
    this.truck.group.visible = false;
    this.scene.add(this.truck.group);
    this.hose = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: 16 }, () => new THREE.Vector3())),
      new THREE.LineBasicMaterial({ color: 0xf2c500 }),
    );
    this.hose.frustumCulled = false;
    this.hose.visible = false;
    this.scene.add(this.hose);
  }

  /** todo como al principio: muro entero, jipis en su sitio, tanqueta escondida */
  reset() {
    for (const w of this.walls) {
      w.hp = 100;
      w.mesh.visible = true;
      for (const d of w.debris) this.root.remove(d.mesh);
      w.debris = [];
    }
    for (const t of this.tents) {
      Object.assign(t, { x: t.hx, z: t.hz, vx: 0, vz: 0, y: 0.12, vy: 0, hp: 30, loose: false, spin: 0, roll: 0, sea: false });
      t.g.visible = true;
      t.g.userData.door.visible = true;
      t.g.rotation.set(0, t.rot, 0);
    }
    for (const h of this.hippies) {
      Object.assign(h, { x: h.hx, z: h.hz, vx: 0, vz: 0, y: STAND_Y, vy: 0, state: 'protest', downT: 0, push: 0, heading: Math.atan2(-this.site.nx, -this.site.nz) });
      h.group.visible = true;
      h.group.rotation.set(0, h.heading, 0);
    }
    this.fireHp = 60;
    this.fire.userData.flame.visible = true;
    this.inWater = 0;
    this.wallSaid = false;
    this.hideTruck();
  }

  hideTruck() {
    const i = this.parkedCars.findIndex(p => p.mesh === this.truck.group);
    if (i >= 0) this.parkedCars.splice(i, 1);
    if (!this.inTruck) this.truck.group.visible = false;
    for (const c of this.cops) c.group.visible = false;
    this.hose.visible = false;
  }

  /* ─── misión ─── */

  intro(charName) {
    return [
      { who: 'Don Florencio', text: 'Mi niño, los jipis han montado una acampada en el ' + this.site.name + ' y no me dejan abrir el kiosco.' },
      { who: 'Don Florencio', text: 'Dicen que no se mueven de allí ni con agua caliente.' },
      { who: charName, text: '¿Y con agua fría?', player: true },
      { who: 'Don Florencio', text: 'La Policía tiene la tanqueta de agua aparcada al lado… Yo no he dicho nada. Y échale jabón, que les hace falta.' },
    ];
  }

  start() {
    this.reset();
    const t = this.site.truck;
    const tr = this.truck;
    tr.group.position.set(t.x, 0.16, t.z);
    tr.group.rotation.y = t.heading;
    tr.turret.rotation.y = 0;
    tr.group.visible = true;
    this.parkedCars.push({ mesh: tr.group, body: tr.body, wheels: tr.wheels, type: 'tanqueta', color: 0xf4f5f7, x: t.x, z: t.z, heading: t.heading, reach: 6 });
    // dos agentes de charla al lado
    const sx = Math.cos(t.heading), sz = -Math.sin(t.heading);
    this.cops.forEach((c, i) => {
      c.x = t.x + sx * (2.4 + i * 0.9) + Math.sin(t.heading) * (i ? -1 : 1.5);
      c.z = t.z + sz * (2.4 + i * 0.9) + Math.cos(t.heading) * (i ? -1 : 1.5);
      c.group.position.set(c.x, STAND_Y, c.z);
      c.group.rotation.set(0, t.heading + (i ? 2.4 : -0.8), 0);
      c.group.visible = true;
      c.alarm = 0;
    });
    this.phase = 'steal';
  }

  abort() {
    this.phase = 'idle';
    this.reset();
  }

  get inTruck() { return this.getMode() === 'car' && this.player.mesh === this.truck.group; }

  objective(act) {
    const s = this.site;
    if (this.phase === 'steal') {
      const p = this.truck.group.position;
      return { text: 'Roba la tanqueta de agua de la Policía', x: p.x, z: p.z };
    }
    if (this.phase === 'drive') return { text: 'Ve a la acampada del ' + s.name, x: s.cx, z: s.cz };
    return { text: `¡Al agua con ellos! ${this.inWater}/${this.hippies.length}`, x: this.site.cx + this.site.nx * 14, z: this.site.cz + this.site.nz * 14, near: Math.hypot(act.pos.x - s.cx, act.pos.y - s.cz) < 60 };
  }

  /** combat pregunta si el arma ahora es el agua (y no la pistola) */
  waterReady(mode) {
    if (this.phase === 'idle' && !this.inTruck) return false;
    if (mode === 'car') return this.inTruck;
    return this.hoseReach() !== null;
  }

  hoseReach() {
    if (!this.truck.group.visible || this.inTruck) return null;
    const p = new THREE.Vector3();
    this.truck.hoseEnd.getWorldPosition(p);
    const d = Math.hypot(p.x - this.onFoot.pos.x, p.z - this.onFoot.pos.y);
    return d < HOSE_LEN ? p : null;
  }

  /* ─── por fotograma ─── */

  update(dt, act, mode, trigger) {
    this.dt = dt;
    const t = performance.now() * 0.001;
    const s = this.site;
    if (this.phase === 'steal' && this.inTruck) {
      this.phase = 'drive';
      this.police.add(2);
      this.toast('¡Tanqueta mangada!');
      this.dialog.play([{ who: 'Policía Local', text: '¡Eh! ¡Esa tanqueta es nuestra! ¡Que alguien llame a comisaría!' }]);
      for (const c of this.cops) c.alarm = 6;
    }
    // terminada y lejos: vuelven a acampar (se puede repetir)
    if (this.phase === 'done' && Math.hypot(act.pos.x - s.cx, act.pos.y - s.cz) > 220) { this.phase = 'idle'; this.reset(); }
    if (this.phase === 'drive' && Math.hypot(act.pos.x - s.cx, act.pos.y - s.cz) < 45) {
      this.phase = 'soak';
      this.police.clear();
      this.toast('Dispara agua (K / Disparar) y empújalos contra el muro');
      this.dialog.play([
        { who: 'Don Florencio', text: '(por teléfono) Tranquilo, mi niño, mi primo el de la Local ha entretenido a los suyos.' },
        { who: 'Kike Pachamama', text: '¡Compañeros, viene la tanqueta! ¡Cadena humana!' },
      ]);
    }

    this.updateCops(dt, t);
    this.updateTruck(dt, act, mode, trigger);
    this.updateHippies(dt, t, act, mode);
    this.updateTents(dt);
    this.updateWalls(dt);
    this.updateFire(t);

    this.jet.update(dt, (x, y, z, vx, vz, kind) => this.hit(x, y, z, vx, vz, kind), (x, z) => (inSea(this.map.sea, x, z) ? 'sea' : 'land'));

    const total = this.hippies.length;
    this.inWater = this.hippies.filter(h => h.state === 'swim' || h.state === 'fall').length;
    if (this.phase === 'soak' && this.inWater >= total) {
      this.phase = 'done';
      this.police.clear();
      this.dialog.play([
        { who: 'Tranquilino', text: SEA[0] },
        { who: 'Don Florencio', text: '¡Ese es mi niño! Ya llamé a mi primo, el de la Local: aquí no ha pasado nada.' },
      ]);
    }
  }

  updateCops(dt, t) {
    for (const c of this.cops) {
      if (!c.group.visible) continue;
      if (c.alarm > 0) {
        c.alarm -= dt;
        c.armL.rotation.x = -2.6 + Math.sin(t * 9) * 0.4;
        c.armR.rotation.x = -2.6 - Math.sin(t * 9) * 0.4;
        if (c.alarm <= 0) c.group.visible = false;
      } else {
        c.armL.rotation.x = Math.sin(t * 1.3) * 0.1;
        c.armR.rotation.x = -0.4 + Math.sin(t * 2) * 0.25; // gesticula al hablar
      }
    }
  }

  updateTruck(dt, act, mode, trigger) {
    const tr = this.truck;
    const lights = this.inTruck && this.phase !== 'idle';
    tr.lamps.forEach((m, i) => { m.emissiveIntensity = lights ? (Math.sin(performance.now() * 0.02 + i * Math.PI) > 0 ? 4 : 0.2) : 0.4; });

    // manguera a pie
    const reel = this.waterReady(mode) && mode === 'foot' ? this.hoseReach() : null;
    this.hose.visible = !!reel;
    if (reel) {
      const f = this.onFoot.forward();
      const hx = this.onFoot.pos.x + f.x * 0.45 + f.y * 0.2, hz = this.onFoot.pos.y + f.y * 0.45 - f.x * 0.2;
      const pos = this.hose.geometry.getAttribute('position');
      for (let i = 0; i < 16; i++) {
        const k = i / 15;
        const sag = Math.sin(k * Math.PI) * 0.9;
        pos.setXYZ(i, reel.x + (hx - reel.x) * k, Math.max(0.22, reel.y + (1.1 - reel.y) * k - sag), reel.z + (hz - reel.z) * k);
      }
      pos.needsUpdate = true;
    }

    if (trigger && mode === 'foot' && !reel && this.truck.group.visible && !this.inTruck && (this.hoseT = (this.hoseT || 0) - dt) <= 0) {
      const p = this.truck.group.position;
      if (Math.hypot(p.x - act.pos.x, p.z - act.pos.y) < HOSE_LEN + 15) { this.hoseT = 3; this.toast('La manguera no llega tan lejos'); }
    }
    if (!trigger || !this.waterReady(mode)) return;
    const o = new THREE.Vector3();
    let speed, rate, spread;
    const target = this.aimTarget(act);
    if (mode === 'car') {
      // el cañón gira hacia el jipi más cercano dentro del cono
      const want = target ? Math.atan2(target.x - act.pos.x, target.z - act.pos.y) - act.heading : 0;
      let d = want - tr.turret.rotation.y;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      tr.turret.rotation.y += Math.max(-dt * 3, Math.min(dt * 3, d));
      tr.nozzle.getWorldPosition(o);
      speed = 30; rate = 280; spread = 0.04;
    } else {
      const f = act.forward();
      o.set(act.pos.x + f.x * 0.6, 1.15, act.pos.y + f.y * 0.6);
      speed = 21; rate = 170; spread = 0.06;
    }
    // dirección: hacia el objetivo (compensando la caída) o recto
    // se apunta desde la boquilla, no desde el centro del vehículo
    const yaw = target ? Math.atan2(target.x - o.x, target.z - o.z)
      : (mode === 'car' ? act.heading + tr.turret.rotation.y : act.heading);
    // tiro parabólico: que el chorro llegue a la altura del objetivo
    const dist = Math.max(3, target ? Math.hypot(target.x - o.x, target.z - o.z) : 18);
    const tt = dist / speed;
    const vy = ((target ? target.y : 1) - o.y + 4.9 * tt * tt) / tt;
    const dir = new THREE.Vector3(Math.sin(yaw) * speed, vy, Math.cos(yaw) * speed).normalize();
    tr.pitch.rotation.x = -Math.asin(dir.y);
    this.jet.spray(o, dir, speed, rate, spread, dt);
    this.power = mode === 'car' ? 1 : 0.65;
  }

  aimTarget(act) {
    const f = act.forward();
    let best = null, bs = Infinity;
    const consider = (x, z, y) => {
      const dx = x - act.pos.x, dz = z - act.pos.y, d = Math.hypot(dx, dz);
      if (d < 1 || d > 34) return;
      const ang = Math.acos(Math.max(-1, Math.min(1, (dx * f.x + dz * f.y) / d)));
      if (ang > (this.inTruck ? 1.2 : 0.55)) return;
      const sc = ang * 25 + d;
      if (sc < bs) { bs = sc; best = { x, z, y }; }
    };
    for (const h of this.hippies) if (h.state !== 'swim' && h.state !== 'fall') consider(h.x, h.z, h.state === 'down' ? 0.45 : 1.1);
    if (!best) for (const w of this.walls) if (w.hp > 0) consider((w.ax + w.bx) / 2, (w.az + w.bz) / 2, 0.7);
    return best;
  }

  /** una partícula de agua alcanza algo */
  hit(x, y, z, vx, vz, kind) {
    const s = this.site;
    if (Math.abs(x - s.cx) > 60 || Math.abs(z - s.cz) > 60) return false;
    const k = (kind === 0 ? 0.16 : 0.04) * (this.power || 1);
    for (const h of this.hippies) {
      if (h.state === 'swim' || h.state === 'fall') continue;
      const top = h.state === 'down' ? 0.7 : 1.9;
      if (y > top || Math.abs(h.x - x) > 0.6 || Math.abs(h.z - z) > 0.6) continue;
      h.vx += vx * k; h.vz += vz * k;
      h.push += Math.hypot(vx, vz) * k;
      h.wetT = 1.2;
      return kind === 0 && Math.random() < 0.7;
    }
    for (const t of this.tents) {
      if (t.sea || y > 1.4 || Math.abs(t.x - x) > 1.2 || Math.abs(t.z - z) > 1.2) continue;
      if (!t.loose) { t.hp -= kind === 0 ? 1 : 0.2; if (t.hp <= 0) { t.loose = true; t.spin = (Math.random() - 0.5) * 3; t.g.userData.door.visible = false; } }
      else { t.vx += vx * k * 0.6; t.vz += vz * k * 0.6; }
      return kind === 0 && Math.random() < 0.5;
    }
    if (y < 1.15) {
      for (const w of this.walls) {
        if (w.hp <= 0 || distSeg(x, z, w) > 0.45) continue;
        w.hp -= (kind === 0 ? 0.5 : 0.08) * (this.power || 1);
        return true;
      }
    }
    if (this.fireHp > 0 && Math.hypot(x - s.fire[0], z - s.fire[1]) < 1 && y < 1.2) {
      this.fireHp -= 1;
      if (this.fireHp <= 0) {
        this.fire.userData.flame.visible = false;
        this.jet.burst(s.fire[0], 0.6, s.fire[1], 40, 3, 0.6);
        this.toast('Hoguera apagada');
      }
      return true;
    }
    return false;
  }

  /* ─── jipis ─── */

  updateHippies(dt, t, act, mode) {
    const s = this.site;
    this.lineT -= dt;
    this.chantT -= dt;
    if (this.chantT <= 0 && this.phase !== 'done' && Math.hypot(act.pos.x - s.cx, act.pos.y - s.cz) < 70) {
      this.chantT = 9 + Math.random() * 6;
      const h = this.hippies.find(p => p.state === 'protest');
      if (h) this.dialog.say(h.name, CHANT[Math.floor(Math.random() * CHANT.length)], 1.8);
    }
    for (const h of this.hippies) {
      if (h.state === 'swim') { this.swim(h, dt, t); continue; }
      if (h.state === 'fall') { this.fall(h, dt); continue; }
      h.wetT = Math.max(0, (h.wetT || 0) - dt);
      h.push = Math.max(0, h.push - dt * 3);
      // atropello suave con el coche: los aparta
      if (mode === 'car') {
        const pv = this.player.vel;
        if (this.player.speed > 3 && Math.hypot(act.pos.x - h.x, act.pos.y - h.z) < (this.inTruck ? 2.6 : 1.7)) {
          h.vx += pv.x * 0.7; h.vz += pv.y * 0.7; h.push = 9;
        }
      }
      if (h.push > 2.2 && h.state !== 'down') {
        h.state = 'down';
        if (this.lineT <= 0) { this.lineT = 2.6; this.dialog.say(h.name, HIT[Math.floor(Math.random() * HIT.length)], 1.6); }
      }
      if (h.state === 'down') {
        h.downT = h.wetT > 0 ? 1.6 : h.downT - dt;
        if (h.downT <= 0) h.state = 'protest';
      }
      // en el suelo con jabón resbalan mucho; de pie, poco
      const fr = h.state === 'down' ? 0.7 : 4;
      h.vx *= Math.max(0, 1 - fr * dt); h.vz *= Math.max(0, 1 - fr * dt);
      // tozudos: si nadie les moja, vuelven a su sitio
      if (h.state === 'protest' && h.wetT <= 0) {
        const dx = h.hx - h.x, dz = h.hz - h.z, d = Math.hypot(dx, dz);
        if (d > 1.2) { h.vx += (dx / d) * 4 * dt; h.vz += (dz / d) * 4 * dt; }
      }
      const sp = Math.hypot(h.vx, h.vz);
      if (sp > 9) { h.vx *= 9 / sp; h.vz *= 9 / sp; }
      h.x += h.vx * dt; h.z += h.vz * dt;
      for (const c of this.colliders.circleContacts(h.x, h.z, R, 'coast')) { h.x += c.nx * c.depth; h.z += c.nz * c.depth; }
      this.wallBump(h, 6);
      if (inSea(this.map.sea, h.x, h.z)) {
        h.state = 'fall';
        h.vy = 2;
        h.spin = (Math.random() - 0.5) * 6;
        this.jet.burst(h.x, 0.3, h.z, 30, 4, 2);
        if (this.lineT <= 0 || Math.random() < 0.5) { this.lineT = 2.5; this.dialog.say(h.name, '¡Aaaaaah! *splash*', 1.4); }
        continue;
      }
      this.pose(h, t);
    }
  }

  /** choque contra un tramo de muro en pie: rebota y lo daña */
  wallBump(o, dmg) {
    const s = this.site;
    for (const w of this.walls) {
      if (w.hp <= 0) continue;
      const d = distSeg(o.x, o.z, w);
      if (d > R + 0.25) continue;
      // empujar hacia tierra
      const vn = o.vx * s.nx + o.vz * s.nz;
      o.x -= s.nx * (R + 0.25 - d); o.z -= s.nz * (R + 0.25 - d);
      // aplastados contra el muro por el chorro: el muro va cediendo
      if (o.wetT > 0) w.hp -= 30 * this.dt * (this.power || 1);
      if (vn > 0) {
        w.hp -= vn * dmg;
        o.vx -= s.nx * vn * 1.3; o.vz -= s.nz * vn * 1.3;
      }
    }
  }

  pose(h, t) {
    if (h.state === 'down') {
      h.group.rotation.x = -Math.PI / 2;
      h.heading += Math.hypot(h.vx, h.vz) * 0.02;
      h.group.position.set(h.x, STAND_Y + 0.12, h.z);
      h.legL.rotation.x = 0.4; h.legR.rotation.x = -0.2;
      h.armL.rotation.x = -2.8; h.armR.rotation.x = -2.6 + Math.sin(t * 12) * 0.3;
    } else {
      h.group.rotation.x = 0;
      const walking = Math.hypot(h.vx, h.vz) > 0.4;
      if (walking) h.heading = Math.atan2(h.vx, h.vz);
      else h.heading += (Math.atan2(-this.site.nx, -this.site.nz) - h.heading) * 0.05;
      const sw = Math.sin(t * (walking ? 7 : 5) + h.phase);
      h.legL.rotation.x = walking ? sw * 0.45 : 0;
      h.legR.rotation.x = walking ? -sw * 0.45 : 0;
      // puños arriba al ritmo de la consigna
      h.armL.rotation.x = -2.5 + sw * 0.35;
      h.armR.rotation.x = walking ? -sw * 0.5 : -2.5 - sw * 0.35;
      h.group.position.set(h.x, STAND_Y + Math.abs(sw) * 0.04, h.z);
    }
    h.group.rotation.y = h.heading;
  }

  fall(h, dt) {
    h.vy -= 9.8 * dt;
    h.y += h.vy * dt;
    h.x += (h.vx * 0.5 + this.site.nx * 1.5) * dt;
    h.z += (h.vz * 0.5 + this.site.nz * 1.5) * dt;
    h.heading += h.spin * dt;
    h.group.rotation.x = -Math.PI / 2 * Math.min(1, (STAND_Y + 1 - h.y) / 1.5);
    h.group.position.set(h.x, h.y, h.z);
    h.group.rotation.y = h.heading;
    if (h.y <= SWIM_Y) {
      h.state = 'swim';
      h.y = SWIM_Y;
      h.swimT = 0;
      this.jet.burst(h.x, 0.2, h.z, 24, 3, 1.5);
      if (Math.random() < 0.6) this.dialog.say(h.name, SEA[Math.floor(Math.random() * SEA.length)], 2.2);
    }
  }

  swim(h, dt, t) {
    h.swimT += dt;
    // se alejan nadando un poco y se quedan flotando
    const away = h.swimT < 12 ? 0.7 : 0;
    h.x += this.site.nx * away * dt;
    h.z += this.site.nz * away * dt;
    h.heading = Math.atan2(this.site.nx, this.site.nz) + Math.sin(t * 0.5 + h.phase) * 0.4;
    h.group.rotation.x = 0.35;
    h.group.rotation.y = h.heading;
    h.group.position.set(h.x, SWIM_Y + Math.sin(t * 2 + h.phase) * 0.07, h.z);
    h.armL.rotation.x = -1.6 + Math.sin(t * 3 + h.phase) * 1.4;
    h.armR.rotation.x = -1.6 - Math.sin(t * 3 + h.phase) * 1.4;
  }

  /* ─── casetas, muro, hoguera ─── */

  updateTents(dt) {
    for (const t of this.tents) {
      if (!t.loose) { t.g.position.set(t.x, 0.12, t.z); continue; }
      if (t.sea) {
        // flota y se va hundiendo poco a poco
        t.y = Math.max(-2.5, t.y - dt * 0.08);
        t.x += this.site.nx * 0.3 * dt; t.z += this.site.nz * 0.3 * dt;
        t.g.position.set(t.x, t.y, t.z);
        if (t.y <= -2.5) t.g.visible = false;
        continue;
      }
      t.vx *= Math.max(0, 1 - 1.2 * dt); t.vz *= Math.max(0, 1 - 1.2 * dt);
      t.x += t.vx * dt; t.z += t.vz * dt;
      t.roll = Math.min(Math.PI / 2, t.roll + dt * 2);
      t.g.rotation.set(0, t.g.rotation.y + t.spin * dt * Math.min(1, Math.hypot(t.vx, t.vz)), t.roll * 0.9);
      this.wallBump(t, 3);
      if (inSea(this.map.sea, t.x, t.z)) { t.sea = true; t.y = -0.2; this.jet.burst(t.x, 0.3, t.z, 20, 3, 2); }
      t.g.position.set(t.x, 0.12 + Math.sin(t.roll) * 0.4, t.z);
    }
  }

  updateWalls(dt) {
    for (const w of this.walls) {
      if (w.hp <= 0 && w.mesh.visible) this.breakWall(w);
      else if (w.mesh.visible) {
        // se agrieta: tiembla y oscurece cuando le queda poco
        const dmg = 1 - w.hp / 100;
        w.mesh.userData.stone.color.setHex(0xb3a48c).multiplyScalar(1 - dmg * 0.35);
        w.mesh.rotation.z = dmg > 0.6 ? Math.sin(performance.now() * 0.05) * 0.01 * dmg : 0;
      }
      for (const d of w.debris) {
        if (d.done) continue;
        d.vy -= 9.8 * dt;
        d.mesh.position.x += d.vx * dt;
        d.mesh.position.y += d.vy * dt;
        d.mesh.position.z += d.vz * dt;
        d.mesh.rotation.x += d.sx * dt;
        d.mesh.rotation.z += d.sz * dt;
        const wet = inSea(this.map.sea, d.mesh.position.x, d.mesh.position.z);
        if (d.mesh.position.y < (wet ? -1.6 : 0.25)) {
          if (wet && !d.splashed) { d.splashed = true; this.jet.burst(d.mesh.position.x, 0.2, d.mesh.position.z, 10, 3, 1.5); }
          d.vx = d.vz = d.vy = d.sx = d.sz = 0;
          d.done = true;
        }
      }
    }
  }

  breakWall(w) {
    const s = this.site;
    w.mesh.visible = false;
    const mat = w.mesh.userData.stone;
    const len = Math.hypot(w.bx - w.ax, w.bz - w.az);
    for (let i = 0; i < 7; i++) {
      const k = Math.random();
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.3 + Math.random() * 0.5, 0.25 + Math.random() * 0.35, 0.3 + Math.random() * 0.3), mat);
      m.castShadow = true;
      m.position.set(w.ax + (w.bx - w.ax) * k, 0.3 + Math.random() * 0.7, w.az + (w.bz - w.az) * k);
      this.root.add(m);
      const out = 2 + Math.random() * 4;
      w.debris.push({ mesh: m, vx: s.nx * out + (Math.random() - 0.5) * 2, vz: s.nz * out + (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, sx: (Math.random() - 0.5) * 8, sz: (Math.random() - 0.5) * 8 });
    }
    this.jet.burst((w.ax + w.bx) / 2, 0.8, (w.az + w.bz) / 2, 30, 3, len);
    if (!this.wallSaid) { this.wallSaid = true; this.toast('¡El muro ha cedido!'); }
  }

  updateFire(t) {
    const f = this.fire.userData.flame;
    if (!f.visible) return;
    f.scale.set(1.1 + Math.sin(t * 13) * 0.15, 1.5 + Math.sin(t * 9.3) * 0.25, 1);
    f.material.opacity = Math.min(1, this.fireHp / 30);
  }
}
