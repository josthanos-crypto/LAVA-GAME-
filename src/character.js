import * as THREE from 'three';
import { buildHuman } from './humanModel.js';

// Los cuatro protagonistas — todos rubios, cada uno con su rollo
export const CHARACTERS = {
  noah: {
    name: 'Noah',
    skin: 0xd9a47a,        // bronceado de surfero
    hair: 0xe8c66a,        // rubio playa
    torso: 0x18c5b8,       // camiseta turquesa estrafalaria
    torso2: 0xff7a45,      // mangas/estampado coral
    legsCol: 0xffa63d,     // bermudas naranjas
    shoes: 0xf4f1ea,
    shoeStyle: 'sneaker',
    shorts: true,
    shades: true,          // gafas de sol siempre
    hairStyle: 'surf',
  },
  michael: {
    name: 'Michael',
    skin: 0xe2b896,
    hair: 0xd9b45e,
    torso: 0xf2f2f2,       // camiseta blanca clásica
    torso2: 0xf2f2f2,
    legsCol: 0x34465c,     // vaqueros
    shoes: 0x2a2c30,
    shoeStyle: 'sneaker',
    shorts: false,
    shades: false,
    hairStyle: 'short',
  },
  jose: {
    name: 'José',
    skin: 0xcf9a6e,
    hair: 0xc9a650,
    torso: 0x3e8a4f,       // verde canario
    torso2: 0x3e8a4f,
    legsCol: 0x4a5568,
    shoes: 0x8a6a4a,
    shoeStyle: 'shoe',
    shorts: false,
    shades: false,
    hairStyle: 'short',
  },
  iria: {
    name: 'Iria',
    sex: 'f',
    skin: 0xe8bf98,
    hair: 0xe2bf6e,        // rubia
    torso: 0xff7a8a,       // top coral de tirantes
    torso2: 0xff7a8a,
    topStyle: 'tank',
    legsCol: 0x5a7fb0,     // shorts vaqueros
    shoes: 0xf4f1ea,
    shoeStyle: 'sneaker',
    shorts: true,
    shades: false,
    hairStyle: 'ponytail',
    height: 1.66,
  },
};

/** aspecto por defecto de cada protagonista, en el formato de buildHuman */
export function defaultLook(key) {
  const c = CHARACTERS[key] || CHARACTERS.noah;
  return {
    skin: c.skin, hair: c.hair, top: c.torso, sleeves: c.torso2, bottom: c.legsCol,
    shoes: c.shoes, shoeStyle: c.shoeStyle, shorts: c.shorts, shades: c.shades, hairStyle: c.hairStyle, height: c.height || 1.8,
    beard: false, cap: false, capColor: 0x1c2a44, topStyle: c.topStyle || 'tshirt', build: 1, sex: c.sex || 'm',
  };
}

/** aspecto actual: el de fábrica más lo que hayas personalizado (guardado en el navegador) */
export function getLook(key) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('gtac.look.' + key) || '{}'); } catch { /* sin almacenamiento */ }
  return { ...defaultLook(key), ...saved };
}

export function setLook(key, look) {
  try { localStorage.setItem('gtac.look.' + key, JSON.stringify(look)); } catch { /* sin almacenamiento */ }
}

export function resetLook(key) {
  try { localStorage.removeItem('gtac.look.' + key); } catch { /* sin almacenamiento */ }
}

export function buildCharacter(key, look = getLook(key)) {
  // el protagonista lleva todo el detalle: dedos, cordones, bolsillos, reloj...
  return buildHuman({ ...look, detail: 2 });
}

const WALK_SPEED = 4.4;
const TURN_SPEED = 3.2;
const RADIUS = 0.42;
const FOOT_Y = 0.17; // entre la calzada y la acera

export class OnFoot {
  constructor(scene) {
    this.scene = scene;
    this.charKey = 'noah';
    this.parts = buildCharacter(this.charKey);
    this.mesh = this.parts.group;
    this.mesh.visible = false;
    scene.add(this.mesh);
    this.pos = new THREE.Vector2(0, 0);
    this.heading = 0;
    this.speed = 0;
    this.phase = 0;
    // compatibilidad con tráfico/peatones (los coches lo apartan, sin daño)
    this.vel = new THREE.Vector2(0, 0);
    this.crashPulse = 0;
  }

  /** vuelve a montar el personaje (tras cambiarle el aspecto) */
  rebuild(look) {
    const visible = this.mesh.visible;
    this.scene.remove(this.mesh);
    this.parts = buildCharacter(this.charKey, look);
    this.mesh = this.parts.group;
    this.mesh.visible = visible;
    this.mesh.position.set(this.pos.x, FOOT_Y, this.pos.y);
    this.mesh.rotation.y = this.heading;
    this.scene.add(this.mesh);
  }

  setCharacter(key) {
    if (key === this.charKey) return;
    const visible = this.mesh.visible;
    const posY = this.mesh.position.y;
    this.scene.remove(this.mesh);
    this.charKey = key;
    this.parts = buildCharacter(key);
    this.mesh = this.parts.group;
    this.mesh.visible = visible;
    this.mesh.position.set(this.pos.x, posY, this.pos.y);
    this.mesh.rotation.y = this.heading;
    this.scene.add(this.mesh);
  }

  placeAt(x, z, heading) {
    this.pos.set(x, z);
    this.heading = heading;
    this.mesh.position.set(x, FOOT_Y, z);
    this.mesh.rotation.y = heading;
  }

  forward() { return new THREE.Vector2(Math.sin(this.heading), Math.cos(this.heading)); }

  update(dt, input, colliders) {
    this.heading -= input.steer * -TURN_SPEED * dt;
    const target = Math.max(0, input.throttle) * WALK_SPEED - Math.max(0, -input.throttle) * 2;
    this.speed += (target - this.speed) * Math.min(1, dt * 8);

    const f = this.forward();
    this.pos.addScaledVector(f, this.speed * dt);

    const contacts = colliders.circleContacts(this.pos.x, this.pos.y, RADIUS);
    for (const c of contacts) {
      this.pos.x += c.nx * c.depth;
      this.pos.y += c.nz * c.depth;
    }

    this.phase += Math.abs(this.speed) * dt * 3.4;
    const amt = Math.min(1, Math.abs(this.speed) / 3);
    const swing = Math.sin(this.phase) * amt * 0.5;
    this.parts.legL.rotation.x = swing;
    this.parts.legR.rotation.x = -swing;
    this.parts.armL.rotation.x = -swing * 0.8;
    this.parts.armR.rotation.x = swing * 0.8;

    this.mesh.position.set(this.pos.x, FOOT_Y + Math.abs(Math.sin(this.phase)) * 0.03 * amt, this.pos.y);
    this.mesh.rotation.y = this.heading;
  }
}
