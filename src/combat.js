import * as THREE from 'three';
import { panicLine, copLine, bumpLine, conversation } from './dialogue.js';
import { sound } from './sound.js';

/**
 * Acción: pistola (a pie y desde el coche), puntería asistida, impactos en
 * peatones, coches y patrullas, salud del jugador, estrellas de búsqueda y
 * las pantallas de DETENIDO / HAS MUERTO con reaparición.
 */

const RANGE = 45;
const FIRE_GAP = 0.22;
const AIM_CONE = 0.32; // radianes de puntería asistida

export class Combat {
  constructor({ scene, peds, traffic, police, colliders, dialog, hud }) {
    this.scene = scene;
    this.peds = peds;
    this.traffic = traffic;
    this.police = police;
    this.colliders = colliders;
    this.dialog = dialog;
    this.hud = hud;
    this.health = 100;
    this.fireT = 0;
    this.trigger = false;
    this.dead = false;
    this.overlayT = 0;
    this.onRespawn = null;
    this.altFire = null; // (mode) → true si el arma ahora es otra (la tanqueta)
    this.shotBuf = null;

    // fogonazo: una luz y un destello reutilizados
    this.flash = new THREE.PointLight(0xffc070, 0, 9, 2);
    scene.add(this.flash);
    const fc = document.createElement('canvas');
    fc.width = fc.height = 64;
    const fx = fc.getContext('2d');
    const gr = fx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,250,220,1)');
    gr.addColorStop(0.3, 'rgba(255,190,80,0.8)');
    gr.addColorStop(1, 'rgba(255,120,20,0)');
    fx.fillStyle = gr;
    fx.fillRect(0, 0, 64, 64);
    this.muzzle = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(fc), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    }));
    this.muzzle.scale.setScalar(0.7);
    this.muzzle.visible = false;
    scene.add(this.muzzle);
    // trazadoras
    this.tracers = [];
    for (let i = 0; i < 8; i++) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffe2a0, transparent: true, opacity: 0 }));
      l.frustumCulled = false;
      scene.add(l);
      this.tracers.push({ line: l, life: 0 });
    }
    this.tracerIdx = 0;

    // ratón / teclas de disparo
    addEventListener('mousedown', (e) => { if (e.button === 0 && e.target.tagName === 'CANVAS') this.trigger = true; });
    addEventListener('mouseup', (e) => { if (e.button === 0) this.trigger = false; });
    addEventListener('keydown', (e) => { if (e.key.toLowerCase() === 'k') this.trigger = true; });
    addEventListener('keyup', (e) => { if (e.key.toLowerCase() === 'k') this.trigger = false; });
  }

  /** sonido de disparo: ráfaga de ruido filtrado con golpe grave */
  bang(distance = 0) {
    if (!sound.live) return;
    const ctx = sound.ctx;
    if (!this.shotBuf) {
      const len = Math.floor(ctx.sampleRate * 0.25);
      this.shotBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.shotBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
    }
    const src = ctx.createBufferSource();
    src.buffer = this.shotBuf;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2400 - Math.min(1800, distance * 40);
    const g = ctx.createGain();
    g.gain.value = 0.5 / (1 + distance * 0.06);
    src.connect(lp).connect(g).connect(sound.out);
    src.start();
  }

  /** elige objetivo dentro del cono de puntería; si no hay, dispara recto */
  aim(ox, oz, fx, fz) {
    let best = null, bestScore = Infinity;
    const consider = (x, z, kind, ref) => {
      const dx = x - ox, dz = z - oz;
      const d = Math.hypot(dx, dz);
      if (d < 0.5 || d > RANGE) return;
      const ang = Math.acos(THREE.MathUtils.clamp((dx * fx + dz * fz) / d, -1, 1));
      if (ang > AIM_CONE) return;
      const score = ang * 30 + d;
      if (score < bestScore) { bestScore = score; best = { x, z, kind, ref }; }
    };
    for (const p of this.peds.peds) if (p.road && p.state !== 'down' && p.group.visible) consider(p.x, p.z, 'ped', p);
    for (const c of this.police.cars) if (c.active && c.hp > 0) consider(c.pos.x, c.pos.y, 'cop', c);
    if (!best) return [fx, fz];
    const d = Math.hypot(best.x - ox, best.z - oz);
    return [(best.x - ox) / d, (best.z - oz) / d];
  }

  /** distancia hasta la primera pared en la dirección del disparo */
  wallDistance(ox, oz, dx, dz) {
    for (let s = 1; s < RANGE; s += 0.8) {
      if (this.colliders.circleContacts(ox + dx * s, oz + dz * s, 0.15, 'coast').length) return s;
    }
    return RANGE;
  }

  fire(act, mode) {
    const f = act.forward();
    const side = mode === 'car' ? 0 : 0.25;
    const ox = act.pos.x + f.x * (mode === 'car' ? 2.6 : 0.5) + f.y * side;
    const oz = act.pos.y + f.y * (mode === 'car' ? 2.6 : 0.5) - f.x * side;
    const oy = mode === 'car' ? 1.1 : 1.35;
    const [dx, dz] = this.aim(ox, oz, f.x, f.y);
    const spread = (Math.random() - 0.5) * 0.03;
    const cdx = dx * Math.cos(spread) - dz * Math.sin(spread);
    const cdz = dx * Math.sin(spread) + dz * Math.cos(spread);

    let range = this.wallDistance(ox, oz, cdx, cdz);
    const pedHit = this.peds.hitTest(ox, oz, cdx, cdz, range);
    const copHit = this.police.hitTest(ox, oz, cdx, cdz, range);
    let carHit = null;
    for (const c of this.traffic.cars) {
      if (!c.road) continue;
      const rx = c.x - ox, rz = c.z - oz;
      const t = rx * cdx + rz * cdz;
      if (t > 0 && t < range && Math.abs(rx * cdz - rz * cdx) < 1.2) { range = t; carHit = c; }
    }
    if (copHit && copHit.dist < range) range = copHit.dist;
    if (pedHit && pedHit.dist <= range) {
      range = pedHit.dist;
      this.peds.shoot(pedHit.ped, cdx, cdz);
      this.police.add(1);
    } else if (copHit && copHit.dist <= range) {
      this.police.damage(copHit.car);
      this.police.add(1);
    } else if (carHit) {
      this.traffic.panic(carHit, 10);
    }

    // efectos
    this.bang(0);
    this.flash.position.set(ox, oy, oz);
    this.flash.intensity = 30;
    this.muzzle.position.set(ox, oy, oz);
    this.muzzle.visible = true;
    this.muzzle.material.rotation = Math.random() * Math.PI;
    const tr = this.tracers[this.tracerIdx++ % this.tracers.length];
    const pos = tr.line.geometry.getAttribute('position');
    pos.setXYZ(0, ox, oy, oz);
    pos.setXYZ(1, ox + cdx * range, oy - 0.2, oz + cdz * range);
    pos.needsUpdate = true;
    tr.life = 0.08;

    // la gente huye y alguien grita
    if (this.peds.scare(ox, oz, 40) > 0 && !this.dialog.busy) {
      const near = this.peds.peds.find(p => p.state === 'flee');
      if (near) this.dialog.say(near.name, panicLine(), 1.6);
    }
    // disparar en público ya es delito
    if (this.police.wanted === 0) this.police.add(1);
  }

  /** disparo de una patrulla hacia el jugador */
  copShot(car, dist, act) {
    this.bang(dist);
    const ox = car.pos.x, oz = car.pos.y;
    const tr = this.tracers[this.tracerIdx++ % this.tracers.length];
    const pos = tr.line.geometry.getAttribute('position');
    const miss = Math.random() > 0.4;
    pos.setXYZ(0, ox, 1.4, oz);
    pos.setXYZ(1, act.pos.x + (miss ? (Math.random() - 0.5) * 4 : 0), 1.1, act.pos.y + (miss ? (Math.random() - 0.5) * 4 : 0));
    pos.needsUpdate = true;
    tr.life = 0.08;
    if (!miss) this.hurt(6 + Math.random() * 6);
  }

  hurt(n) {
    if (this.dead) return;
    this.health = Math.max(0, this.health - n);
    this.hud.hurt();
    if (this.health <= 0) this.end('HAS MUERTO', 'El hospital Doctor José Molina Orosa te ha dado el alta.');
  }

  end(title, sub) {
    this.dead = true;
    this.lastEnd = title;
    this.trigger = false;
    this.overlayT = 3.5;
    this.hud.big(title, sub);
  }

  busted() { this.end('DETENIDO', 'Has pasado la noche en comisaría. Te han quitado lo que llevabas.'); }

  /** T: hablar con quien tengas al lado (a pie) */
  talk(act, charKey, charName, hour) {
    if (this.dialog.busy) { this.dialog.skip(); return; }
    const p = this.peds.nearestTalkable(act.pos.x, act.pos.y, 3.2);
    if (!p) return false;
    p.state = 'talk';
    const lines = conversation({ ped: p, charKey, charName, hour, wanted: this.police.wanted });
    this.dialog.play(lines, () => {
      if (p.state !== 'talk') return;
      if (this.police.wanted > 0) { this.peds.scare(act.pos.x, act.pos.y, 6); return; }
      p.state = 'walk';
    });
    return true;
  }

  pedEvent(type, p) {
    if (type === 'runover') {
      this.police.add(1);
      this.peds.scare(p.x, p.z, 30);
      this.bang(40); // golpe seco
    } else if (type === 'bumped') {
      this.dialog.say(p.name, bumpLine(), 1.6);
    }
  }

  spotted() { this.dialog.say('Policía Local', copLine(), 2); }

  update(dt, act, mode) {
    // fogonazo y trazadoras se apagan rápido
    this.flash.intensity = Math.max(0, this.flash.intensity - dt * 400);
    if (this.flash.intensity < 1) this.muzzle.visible = false;
    for (const t of this.tracers) {
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / 0.08) * 0.9;
    }

    if (this.dead) {
      this.overlayT -= dt;
      if (this.overlayT <= 0) {
        this.dead = false;
        this.health = 100;
        this.police.clear();
        this.hud.big(null);
        this.onRespawn?.();
      }
      return;
    }

    this.fireT -= dt;
    if (this.trigger && this.fireT <= 0 && !this.altFire?.(mode)) {
      this.fireT = FIRE_GAP;
      this.fire(act, mode);
    }
    // la salud se recupera despacio si no te buscan
    if (this.police.wanted === 0) this.health = Math.min(100, this.health + dt * 2);
  }
}
