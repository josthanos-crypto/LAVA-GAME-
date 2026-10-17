import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildHuman } from './humanModel.js';
import { Kit, paint, canvasTex } from './interiorKit.js';
import { windowGlow } from './realism.js';

/**
 * Locales de los clientes en los que se puede entrar. Fuera: rótulo en la
 * fachada real, puerta de cristal y un aro de luz en la acera. Dentro: una
 * sala aparte con su luz y su cámara, y la gente del local, que te cuenta
 * lo suyo (T) y a veces te ofrece algo (otra T). F (o el botón del móvil)
 * para entrar y salir.
 *
 * Los interiores se montan lejos del mapa (a unos 20 km), la primera vez que
 * entras: desde dentro no se ve la ciudad, y la ciudad sigue a lo suyo
 * alrededor de la puerta mientras estás dentro.
 */

const FLOOR_Y = 0.17;            // a la altura del protagonista (character.js)
const BASE = 20000, GAP = 300;   // dónde va cada interior
const DOOR_R = 2.3, EXIT_R = 1.5, TALK_R = 2.7;
const FADE = 0.3;

/**
 * los clientes con rótulo propio: el genérico del mapa se quita antes de
 * levantar la ciudad (ni se pinta ni avisa al pasar); se guarda en
 * map.clientSigns para colocar la puerta
 */
export function claimSigns(map, defs) {
  map.clientSigns = map.clientSigns || [];
  for (const d of defs) {
    const name = d.door?.sign;
    if (!name || d.keepSign) continue;
    const i = (map.signs || []).findIndex(q => q.name === name);
    if (i >= 0) map.clientSigns.push(...map.signs.splice(i, 1));
  }
}

function resolveDoor(map, d) {
  const o = d.door || {};
  let x = o.x, z = o.z, nx = o.nx, nz = o.nz;
  if (o.sign) {
    const s = [...(map.clientSigns || []), ...(map.signs || [])].find(q => q.name === o.sign);
    if (s) ({ x, z, nx, nz } = s);
  }
  if (x === undefined) return null;
  const l = Math.hypot(nx, nz) || 1;
  nx /= l; nz /= l;
  // desplazada a lo largo de la fachada si el rótulo no cae justo en la puerta
  if (o.shift) { x += -nz * o.shift; z += nx * o.shift; }
  return { x, z, nx, nz, ry: Math.atan2(nx, nz) };
}

export class Locales {
  /**
   * hooks: { toast, heal, pay(n) → bool, addMinutes(n), getLook(), setLook(look),
   *          wanted(), who() → { key, name }, hour() }
   */
  constructor({ scene, map, colliders, dialog, defs, hooks, touch = false }) {
    this.scene = scene;
    this.colliders = colliders;
    this.dialog = dialog;
    this.hooks = hooks;
    this.touch = touch;
    this.defs = defs.map((d, i) => ({ ...d, i, door: resolveDoor(map, d), built: null })).filter(d => d.door);
    this.inside = null;
    this.pending = null;      // fundido en marcha
    this.offer = null;        // lo último que te han ofrecido (pedir, cortar el pelo...)
    this.talking = null;
    this.jumped = false;      // la cámara tiene que saltar con el personaje
    this.promptText = '';
    this.proxy = {
      pos: new THREE.Vector2(), vel: new THREE.Vector2(), heading: 0, speed: 0, crashPulse: 0,
      forward() { return new THREE.Vector2(Math.sin(this.heading), Math.cos(this.heading)); },
    };
    this.fadeEl = document.getElementById('fade');
    this.promptEl = document.getElementById('prompt');
    this.t = 0;
    this.street = [];         // gente con la que se habla en la calle (el camarero de la terraza)
    this.buildOutside();
  }

  /**
   * alguien en la calle con quien hablar: mismo formato que la gente de dentro,
   * pero en coordenadas del mapa (at) y, si se mueve, con move(n, dt, t)
   */
  addStreetNpc(n) {
    const parts = buildHuman({ detail: 1, ...n.look });
    parts.group.rotation.order = 'YXZ';
    const y = n.y ?? (n.pose === 'sit' ? (n.seat ?? 0.47) - 0.93 * (n.look.height || 1.75) / 1.78 : 0);
    parts.group.position.set(n.at[0], FLOOR_Y + 0.02 + y, n.at[1]);
    n.dress?.(parts, THREE);
    this.scene.add(parts.group);
    const npc = { ...n, parts, heading: n.face || 0, x: n.at[0], z: n.at[1], baseY: FLOOR_Y + 0.02 + y, visits: 0, phase: Math.random() * 6 };
    setPose(npc, 0, false);
    this.street.push(npc);
    return npc;
  }

  // ── fuera: rótulos, puertas y aros de luz ──
  buildOutside() {
    const solid = [], darkGlass = [], group = new THREE.Group();
    group.name = 'locales';
    this.signMats = [];
    this.markers = [];
    for (const d of this.defs) {
      const { x, z, nx, nz, ry } = d.door;
      const tx = -nz, tz = nx;
      // puerta de cristal con su marco y tirador, pegada a la fachada
      const dw = d.doorWidth || 1.7, dh = 2.35;
      const dx = x + nx * 0.06, dz = z + nz * 0.06;
      const g = new THREE.BoxGeometry(dw, dh, 0.05);
      g.translate(0, dh / 2, 0); g.rotateY(ry); g.translate(dx, FLOOR_Y - 0.02, dz);
      darkGlass.push(g);
      const frame = d.frameColor ?? 0x2a2c30;
      const part = (w, h, px, py) => {
        const b = new THREE.BoxGeometry(w, h, 0.1);
        b.translate(0, h / 2, 0); b.rotateY(ry); b.translate(dx + tx * px, FLOOR_Y - 0.02 + py, dz + tz * px);
        solid.push(paint(b, frame));
      };
      part(0.08, dh + 0.08, -dw / 2, 0); part(0.08, dh + 0.08, dw / 2, 0); part(dw + 0.16, 0.08, 0, dh); part(0.05, dh, 0, 0);
      for (const s of [-1, 1]) {
        const hdl = new THREE.BoxGeometry(0.03, 0.5, 0.05);
        hdl.translate(0, 0.25, 0); hdl.rotateY(ry); hdl.translate(dx + nx * 0.07 + tx * s * 0.12, FLOOR_Y + 0.85, dz + nz * 0.07 + tz * s * 0.12);
        solid.push(paint(hdl, 0xc8ccd0));
      }
      // felpudo
      const mat = new THREE.BoxGeometry(dw * 0.9, 0.02, 0.7);
      mat.rotateY(ry); mat.translate(x + nx * 0.45, FLOOR_Y + 0.01, z + nz * 0.45);
      solid.push(paint(mat, 0x2a2420));
      // rótulo
      if (d.sign) this.addSign(group, d);
      // aro de luz en la acera y flecha que flota encima
      const color = new THREE.Color(d.color ?? 0xf4c542);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide, fog: false }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x + nx * 1.25, FLOOR_Y + 0.04, z + nz * 1.25);
      ring.renderOrder = 3;
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.42, 4), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.3 }));
      arrow.rotation.x = Math.PI;
      arrow.position.set(x + nx * 1.25, FLOOR_Y + 2.1, z + nz * 1.25);
      group.add(ring, arrow);
      this.markers.push({ ring, arrow, d });
      d.spot = { x: x + nx * 1.25, z: z + nz * 1.25 };
    }
    if (solid.length) {
      const m = new THREE.Mesh(mergeGeometries(solid, false), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.35 }));
      m.castShadow = true;
      group.add(m);
    }
    if (darkGlass.length) {
      group.add(new THREE.Mesh(mergeGeometries(darkGlass, false), new THREE.MeshStandardMaterial({ color: 0x1b2730, roughness: 0.08, metalness: 0.5 })));
    }
    this.scene.add(group);
    this.outside = group;
  }

  /** rótulo en caja: la cara de delante con su dibujo, los cantos del color del fondo */
  addSign(group, d) {
    const s = d.sign;
    const [w, h] = s.size || [4.2, 0.85];
    const tex = canvasTex(s.px?.[0] || 1024, s.px?.[1] || Math.round(1024 * h / w), s.draw);
    const face = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: 0xffffff, emissiveIntensity: 0.2, roughness: 0.45 });
    const edge = new THREE.MeshStandardMaterial({ color: s.edge ?? 0x222222, roughness: 0.6 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.14), [edge, edge, edge, edge, face, edge]);
    const { x, z, nx, nz, ry } = d.door;
    const along = s.shift || 0;
    box.position.set(x + nx * 0.1 - nz * along, FLOOR_Y + (s.y ?? 3.0), z + nz * 0.1 + nx * along);
    box.rotation.y = ry;
    box.castShadow = true;
    group.add(box);
    this.signMats.push(face);
    // totem o banderola de pie (el tanatorio)
    if (s.totem) {
      const [tw, th] = s.totem.size;
      const ttex = canvasTex(256, Math.round(256 * th / tw), s.totem.draw);
      const tface = new THREE.MeshStandardMaterial({ map: ttex, emissiveMap: ttex, emissive: 0xffffff, emissiveIntensity: 0.25, roughness: 0.4 });
      const t = new THREE.Mesh(new THREE.BoxGeometry(tw, th, 0.35), [edge, edge, edge, edge, tface, tface]);
      const off = s.totem.at || [2.6, 2.2];
      t.position.set(x + nx * off[1] - nz * off[0], FLOOR_Y + th / 2, z + nz * off[1] + nx * off[0]);
      t.rotation.y = ry;
      t.castShadow = true;
      group.add(t);
      this.signMats.push(tface);
      this.colliders.addPolygon(boxOutline(t.position.x, t.position.z, tw, 0.35, ry));
    }
  }

  // ── dentro ──
  ensureBuilt(d) {
    if (d.built) return d.built;
    const kit = new Kit();
    const plan = d.build(kit, { canvasTex, THREE }) || {};
    const { group, segs, rooms } = kit.build(d.id);
    const ox = BASE + d.i * GAP, oz = BASE;
    group.position.set(ox, FLOOR_Y, oz);
    this.scene.add(group);
    for (const [ax, az, bx, bz] of segs) this.colliders.addSegment(ox + ax, oz + az, ox + bx, oz + bz);
    const npcs = (plan.npcs || []).map(n => {
      const parts = buildHuman({ detail: n.detail ?? 2, ...n.look });
      parts.group.rotation.order = 'YXZ';
      // sentados: la cadera a la altura del asiento
      const y = n.y ?? (n.pose === 'sit' ? (n.seat ?? 0.47) - 0.93 * (n.look.height || 1.75) / 1.78 : 0);
      parts.group.position.set(n.at[0], y, n.at[1]);
      parts.group.rotation.y = n.face || 0;
      n.dress?.(parts, THREE);
      group.add(parts.group);
      const npc = { ...n, parts, heading: n.face || 0, x: ox + n.at[0], z: oz + n.at[1], visits: 0, phase: Math.random() * 6 };
      setPose(npc, 0, false);
      return npc;
    });
    d.built = {
      group, ox, oz, npcs, plan,
      rooms: rooms.map(r => ({ x0: ox + r.x0, z0: oz + r.z0, x1: ox + r.x1, z1: oz + r.z1, h: r.h })),
      spawn: plan.spawn || [0, 0, 0], exit: plan.exit || [0, 0],
    };
    return d.built;
  }

  /** F a pie: entrar o salir si estás en una puerta; devuelve true si se encarga */
  useDoor(foot) {
    if (this.pending) return true;
    if (this.inside) {
      const b = this.inside.built;
      if (Math.hypot(foot.pos.x - b.ox - b.exit[0], foot.pos.y - b.oz - b.exit[1]) < EXIT_R) {
        this.go(() => this.leave(foot));
      } else this.hooks.toast('Para salir, ve a la puerta');
      return true;
    }
    const d = this.doorNear(foot.pos.x, foot.pos.y);
    if (!d) return false;
    if (this.hooks.wanted() > 0) { this.hooks.toast('Con la policía detrás no te abren'); return true; }
    this.go(() => this.enter(d, foot));
    return true;
  }

  doorNear(x, z) {
    let best = null, bd = DOOR_R;
    for (const d of this.defs) {
      const dd = Math.hypot(x - d.spot.x, z - d.spot.z);
      if (dd < bd) { bd = dd; best = d; }
    }
    return best;
  }

  /** fundido a negro, el cambio y vuelta */
  go(fn) {
    this.pending = { t: 0, fn, done: false };
    this.fadeEl?.classList.add('on');
  }

  enter(d, foot) {
    const b = this.ensureBuilt(d);
    this.inside = d;
    const [sx, sz, sh] = b.spawn;
    foot.placeAt(b.ox + sx, b.oz + sz, sh);
    const { x, z, nx, nz } = d.door;
    this.proxy.pos.set(x + nx * 2, z + nz * 2);
    this.proxy.heading = Math.atan2(nx, nz);
    this.jumped = true;
    this.offer = null;
    for (const n of b.npcs) n.greeted = false;
    // te saluda el que esté más a mano
    const host = b.npcs.find(n => n.greet);
    if (host) setTimeout(() => {
      if (this.inside === d && !this.dialog.busy) this.dialog.say(host.name, host.greet(this.ctx(host)), 2.6);
    }, 700);
  }

  leave(foot) {
    const { x, z, nx, nz, ry } = this.inside.door;
    foot.placeAt(x + nx * 1.6, z + nz * 1.6, ry);
    this.inside = null;
    this.offer = null;
    this.talking = null;
    this.jumped = true;
  }

  /** fuera sin más (al reaparecer tras caer o ser detenido) */
  forceOut() {
    if (!this.inside && !this.pending) return;
    this.inside = null;
    this.pending = null;
    this.offer = null;
    this.talking = null;
    this.fadeEl?.classList.remove('on');
  }

  /** ¿la cámara tiene que saltar? (se consume al leerlo) */
  consumeJump() { const j = this.jumped; this.jumped = false; return j; }

  ctx(n) {
    const who = this.hooks.who();
    return { me: who.name, key: who.key, visits: n.visits, hour: this.hooks.hour() };
  }

  /** T: hablar con la gente del local (o aceptar lo que te ofrecen); true si se encarga */
  talk(foot) {
    const n = this.npcNear(foot.pos.x, foot.pos.y);
    if (!this.inside && !n) return false;
    // un saludo suelto se corta para empezar a hablar; una conversación, se adelanta
    const greeting = this.dialog.busy && !this.dialog.queue.length && this.dialog.current?.hold !== undefined;
    if (this.dialog.busy && !(greeting && n)) { this.dialog.skip(); return true; }
    if (!n) { this.hooks.toast('Acércate a alguien para hablar'); return true; }
    const offer = this.offer?.npc === n ? this.offer : null;
    this.talking = n;
    if (offer) {
      this.offer = null;
      const o = n.offer;
      const paid = !o.price || this.hooks.pay(o.price);
      this.dialog.play(o.talk({ ...this.ctx(n), paid }), () => {
        this.talking = null;
        o.apply?.(this.hooks, { paid });
      });
      return true;
    }
    const lines = n.talk(this.ctx(n));
    n.visits++;
    this.dialog.play(lines, () => {
      this.talking = null;
      if (n.offer && this.npcNear(foot.pos.x, foot.pos.y) === n) {
        this.offer = { npc: n, t: 20 };
        this.hooks.toast(n.offer.label + (n.offer.price ? ` · ${n.offer.price} €` : '') + ' · pulsa T');
      }
    });
    return true;
  }

  npcNear(x, z) {
    let best = null, bd = TALK_R;
    for (const n of this.inside ? this.inside.built.npcs : this.street) {
      if (!n.talk) continue;
      const d = Math.hypot(x - n.x, z - n.z);
      if (d < bd) { bd = d; best = n; }
    }
    return best;
  }

  /** la cámara no se sale de la sala en la que estás; lift: si se queda pegada, sube para ver por encima */
  clampCamera(v, px, pz, lift = false) {
    if (!this.inside) return;
    const rooms = this.inside.built.rooms;
    let r = rooms.find(q => px >= q.x0 && px <= q.x1 && pz >= q.z0 && pz <= q.z1);
    if (!r) {
      let bd = Infinity;
      for (const q of rooms) {
        const d = Math.hypot(px - Math.max(q.x0, Math.min(q.x1, px)), pz - Math.max(q.z0, Math.min(q.z1, pz)));
        if (d < bd) { bd = d; r = q; }
      }
    }
    if (!r) return;
    const m = 0.38;
    v.x = Math.max(r.x0 + m, Math.min(r.x1 - m, v.x));
    v.z = Math.max(r.z0 + m, Math.min(r.z1 - m, v.z));
    if (lift) {
      const d = Math.hypot(v.x - px, v.z - pz);
      if (d < 2.4) v.y += (2.4 - d) * 0.55;
    }
    v.y = Math.max(FLOOR_Y + 0.6, Math.min(FLOOR_Y + r.h - 0.25, v.y));
  }

  /** luz de dentro: plafones encendidos, de día y de noche */
  light({ sun, hemi, fill, renderer }, px, pz) {
    const L = this.inside?.light || {};
    sun.position.set(px + 60, 320, pz + 35);
    sun.target.position.set(px, 0, pz);
    sun.target.updateMatrixWorld();
    sun.color.setHex(L.sun ?? 0xfff0dc);
    sun.intensity = L.sunI ?? 1.5;
    hemi.intensity = L.hemiI ?? 0.95;
    hemi.color.setHex(L.sky ?? 0xfff5e8);
    hemi.groundColor.setHex(L.ground ?? 0x8c7a66);
    if (fill) {
      fill.intensity = 0.38;
      fill.color.setHex(0xffe6cc);
      fill.position.set(px - 60, 40, pz + 50);
    }
    renderer.toneMappingExposure = L.exposure ?? 0.82;
  }

  /** act: el coche o el personaje (para saber qué gente de la calle animar) */
  update(dt, foot, mode, act = foot) {
    this.t += dt;
    const t = this.t;
    // fundido: a negro, cambio, y vuelta a la luz
    if (this.pending) {
      const p = this.pending;
      p.t += dt;
      if (!p.done && p.t >= FADE) { p.done = true; p.fn(); }
      if (p.t >= FADE * 2) { this.pending = null; this.fadeEl?.classList.remove('on'); }
    }
    if (this.offer && (this.offer.t -= dt) <= 0) this.offer = null;

    // fuera: los aros laten y las flechas giran; de noche, rótulos encendidos
    for (const m of this.markers) {
      m.arrow.rotation.y = t * 1.6;
      m.arrow.position.y = FLOOR_Y + 2.05 + Math.sin(t * 2.4 + m.d.i) * 0.12;
      m.ring.material.opacity = 0.55 + Math.sin(t * 3 + m.d.i) * 0.25;
      m.ring.visible = m.arrow.visible = mode === 'foot' && !this.inside;
    }
    const glowI = 0.2 + windowGlow.value * 2.2;
    for (const mat of this.signMats) mat.emissiveIntensity = glowI;

    // dentro: la gente del local; fuera, la de la calle que tengas cerca
    if (this.inside) {
      const b = this.inside.built;
      for (const n of b.npcs) animate(n, dt, t, foot, this.talking === n);
      b.plan.update?.(dt, t);
    } else {
      for (const n of this.street) {
        if (Math.hypot(n.x - act.pos.x, n.z - act.pos.y) > 90) continue;
        const talking = this.talking === n;
        if (n.move && !talking) n.move(n, dt, t);
        n.parts.group.position.set(n.x, n.baseY, n.z);
        animate(n, dt, t, act, talking);
      }
    }

    // aviso de lo que puedes hacer aquí
    let text = '';
    if (!this.pending && mode === 'foot') {
      const n = this.npcNear(foot.pos.x, foot.pos.y);
      const talkText = n && !this.dialog.busy
        ? (this.offer?.npc === n ? `T|${n.offer.label}${n.offer.price ? ` · ${n.offer.price} €` : ''}` : `T|Hablar con ${n.name}`) : '';
      if (this.inside) {
        const b = this.inside.built;
        const out = Math.hypot(foot.pos.x - b.ox - b.exit[0], foot.pos.y - b.oz - b.exit[1]) < EXIT_R;
        text = [out ? 'F|Salir a la calle' : '', talkText].filter(Boolean).join('||');
      } else {
        const d = this.doorNear(foot.pos.x, foot.pos.y);
        text = d ? `F|Entrar en ${d.name}` : talkText;
      }
    }
    this.showPrompt(text);
  }

  showPrompt(text) {
    if (text === this.promptText || !this.promptEl) return;
    this.promptText = text;
    if (!text) { this.promptEl.classList.remove('on'); return; }
    // en el móvil no hay teclas: se dice el botón
    this.promptEl.innerHTML = text.split('||').map(part => {
      const [key, label] = part.split('|');
      const btn = key === 'F' ? (label.startsWith('Salir') ? 'Salir' : 'Entrar') : 'Hablar';
      return this.touch ? `<b class="btn">${btn}</b><span>${label}</span>` : `<b>${key}</b><span>${label}</span>`;
    }).join('<i class="sep"></i>');
    this.promptEl.classList.add('on');
  }

  /** texto del botón amarillo del móvil: dentro siempre Salir; en una puerta, Entrar; si no, null */
  get enterLabel() {
    if (this.inside) return 'Salir';
    return this.promptText.startsWith('F|Entrar') ? 'Entrar' : null;
  }

  /** lista para el minimapa */
  get places() {
    return this.defs.map(d => ({ x: d.spot.x, z: d.spot.z, color: d.color ?? 0xf4c542, glyph: d.glyph || '•' }));
  }
}

function boxOutline(x, z, w, d, ry) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const pt = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const P = [pt(-w / 2, -d / 2), pt(w / 2, -d / 2), pt(w / 2, d / 2), pt(-w / 2, d / 2)];
  return [...P, P[0]];
}

// ── posturas y gestos de la gente de los locales ──
function setPose(n, t, talking) {
  const p = n.parts;
  const s = Math.sin(t * 1.3 + n.phase);
  switch (n.pose) {
    case 'sit':
      p.legL.rotation.x = -1.5; p.legR.rotation.x = -1.45;
      p.kneeL.rotation.x = 1.5; p.kneeR.rotation.x = 1.45;
      p.armL.rotation.x = -0.75 + s * 0.04; p.armR.rotation.x = -0.85 + Math.sin(t * 2.1 + n.phase) * 0.1;
      p.spine.rotation.x = 0.08;
      break;
    case 'chef':
      p.legL.rotation.x = 0; p.legR.rotation.x = 0;
      if (!talking) {
        // remueve la olla o saltea
        p.armR.rotation.x = -1.0 + Math.sin(t * 4.2) * 0.14;
        p.armR.rotation.z = 0.3 + Math.cos(t * 4.2) * 0.14;
        p.armL.rotation.x = -0.75 + Math.sin(t * 1.7) * 0.08;
        p.armL.rotation.z = -0.15;
        p.spine.rotation.x = 0.12;
      }
      break;
    case 'counter':
      p.legL.rotation.x = 0; p.legR.rotation.x = 0;
      if (!talking) {
        p.armL.rotation.x = -0.62 + s * 0.03; p.armR.rotation.x = -0.6 + Math.sin(t * 5 + n.phase) * 0.05;
        p.spine.rotation.x = 0.1;
      }
      break;
    case 'barber':
      p.legL.rotation.x = 0.05; p.legR.rotation.x = -0.05;
      if (!talking) {
        // tijera: tris, tris
        p.armR.rotation.x = -1.55 + Math.sin(t * 11) * 0.05;
        p.armR.rotation.z = 0.35;
        p.armL.rotation.x = -1.25 + s * 0.05;
        p.armL.rotation.z = -0.3;
        p.spine.rotation.x = 0.15;
      }
      break;
    default:
      if (n.walking && !talking) {
        // el camarero va y viene entre las mesas (con la bandeja en alto)
        const sw = Math.sin(t * 6.5 + n.phase) * 0.42;
        p.legL.rotation.x = sw; p.legR.rotation.x = -sw;
        p.armL.rotation.x = -sw * 0.6; p.armL.rotation.z = -0.08;
        p.armR.rotation.x = n.tray ? -1.35 : sw * 0.6; p.armR.rotation.z = n.tray ? 0.25 : 0.08;
        p.spine.rotation.x = 0;
        break;
      }
      p.legL.rotation.x = 0; p.legR.rotation.x = 0;
      if (!talking) {
        p.armL.rotation.x = n.pose === 'host' ? -0.35 : -0.08 + s * 0.03;
        p.armR.rotation.x = n.pose === 'host' ? -0.35 : -0.08 - s * 0.03;
        p.armL.rotation.z = n.pose === 'host' ? 0.18 : -0.075;
        p.armR.rotation.z = n.pose === 'host' ? -0.18 : 0.075;
        p.spine.rotation.x = 0;
      }
  }
  if (talking) {
    // habla con las manos
    p.armR.rotation.x = -0.55 + Math.sin(t * 3.1) * 0.25;
    p.armR.rotation.z = 0.2;
    p.armL.rotation.x = -0.35 + Math.sin(t * 2.3 + 1) * 0.15;
    p.armL.rotation.z = -0.12;
    p.spine.rotation.x = 0;
  }
}

/** diferencia de ángulos entre -π y π */
const wrap = (a) => ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
const clamp = (v, m) => Math.max(-m, Math.min(m, v));

function animate(n, dt, t, foot, talking) {
  const dx = foot.pos.x - n.x, dz = foot.pos.y - n.z, d = Math.hypot(dx, dz);
  const toPlayer = Math.atan2(dx, dz), face = n.face || 0;
  // los que atienden se giran hacia ti; el de detrás del mostrador, sin darle la espalda al mostrador;
  // el cocinero y el peluquero, solo cuando les hablas
  let want = face;
  if (talking && n.pose !== 'sit') want = toPlayer;
  else if (d < 5 && !n.walking && (n.pose === 'host' || n.pose === 'stand')) want = toPlayer;
  else if (d < 5 && n.pose === 'counter') want = face + clamp(wrap(toPlayer - face), 0.9);
  n.heading += wrap(want - n.heading) * Math.min(1, dt * 4);
  n.parts.group.rotation.y = n.heading;
  // y te mira a la cara
  const hd = d < 7 ? clamp(wrap(toPlayer - n.heading), 0.8) : 0;
  n.parts.head.rotation.y += (hd - n.parts.head.rotation.y) * Math.min(1, dt * 5);
  setPose(n, t, talking);
}
