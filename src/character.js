import * as THREE from 'three';
import { buildHuman } from './humanModel.js';
import { store } from './save.js';
import { andar, reposo } from './andares.js';

// Los protagonistas: los cuatro rubios de siempre, cada uno con su rollo
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
    build: 0.96,           // delgado, de surfero (Version 133)
    shoeAccent: 0xff7a45,  // franja coral en las zapatillas, a juego con las mangas
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
    build: 1.08,           // ancho de hombros (Version 133)
    belt: 0x2a1f16,        // cinturón de cuero oscuro
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
    build: 1.04,
    belt: 0x6a4a30,        // cinturón marrón, a juego con los zapatos (Version 133)
    stubble: false,        // bien afeitado
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
    shoeAccent: 0xff7a8a,  // franja coral en las zapatillas, a juego con el top (Version 133)
  },
};

/** aspecto por defecto de cada protagonista, en el formato de buildHuman */
export function defaultLook(key) {
  const c = CHARACTERS[key] || CHARACTERS.noah;
  return {
    skin: c.skin, hair: c.hair, top: c.torso, sleeves: c.torso2, bottom: c.legsCol,
    shoes: c.shoes, shoeStyle: c.shoeStyle, shorts: c.shorts, shades: c.shades, hairStyle: c.hairStyle, height: c.height || 1.8,
    beard: false, cap: false, capColor: 0x1c2a44, topStyle: c.topStyle || 'tshirt', build: c.build || 1, sex: c.sex || 'm',
    aviator: !!c.aviator,
    cara: CHARACTERS[key] ? key : 'noah',   // cada protagonista, su cara (rasgos.js)
    belt: c.belt ?? null, shoeAccent: c.shoeAccent ?? null, stubble: c.stubble,
  };
}

/** aspecto actual: el de fábrica más lo que hayas personalizado (guardado en el navegador) */
export function getLook(key) {
  let saved = {};
  try { saved = JSON.parse(store.get('gtac.look.' + key) || '{}'); } catch { /* guardado roto: el de fábrica */ }
  return { ...defaultLook(key), ...saved };
}

export function setLook(key, look) {
  store.set('gtac.look.' + key, JSON.stringify(look));
}

export function resetLook(key) {
  store.remove('gtac.look.' + key);
}

export function buildCharacter(key, look = getLook(key)) {
  // el protagonista lleva todo el detalle: dedos, cordones, bolsillos, reloj...
  const parts = buildHuman({ ...look, detail: 2 });
  CHARACTERS[key]?.dress?.(parts);
  return parts;
}

const WALK_SPEED = 4.4;
const TURN_SPEED = 3.2;
const RADIUS = 0.42;
const FOOT_Y = 0.2;  // entre la calzada (0,14) y la acera (0,24)
// (Version 170) saltar (Espacio) y agacharse (Mayúsculas, mientras se mantiene)
const SALTO_V = 5.3, SALTO_G = 15;   // sube unos 0,95 m y está en el aire 0,7 s
const MUSLO = 0.43, ESPINILLA = 0.5; // humanModel.js: HIP − KNEE y KNEE
const AGACHADO = 0.45;               // agachado se anda a menos de la mitad

export class OnFoot {
  constructor(scene) {
    this.scene = scene;
    this.charKey = 'noah';   // con 1–4 se cambia a los otros
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
    // sentado en una silla de un local (locales.js): { x, z, heading, y, eat }
    this.sitting = null;
    // nadar: waterAt lo engancha main.js (terrain.js); swim pasa de 0 (a pie) a 1 (nadando)
    this.waterAt = null;
    this.swim = 0;
    // salto y agachado: jumpY = altura sobre el suelo (m), crouch y vuelo de 0 a 1, golpe = flexión al caer
    this.jumpY = 0;
    this.jumpV = 0;
    this.jumpHeld = false;
    this.crouch = 0;
    this.vuelo = 0;
    this.golpe = 0;
  }

  get enElAire() { return this.jumpY > 0 || this.jumpV > 0; }

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
    if (this.sitting) { this.jumpY = this.jumpV = this.crouch = this.vuelo = this.golpe = 0; reposo(this.parts); this.sitPose(dt); return; }
    // en el agua se nada: más despacio, tumbado y a brazadas; al pisar la orilla se sale andando
    const inWater = this.waterAt ? (this.waterAt(this.pos.x, this.pos.y) ? 1 : 0) : 0;
    this.swim += (inWater - this.swim) * Math.min(1, dt * 4);
    const sw = this.swim;
    this.heading -= input.steer * -TURN_SPEED * dt;
    let target = Math.max(0, input.throttle) * WALK_SPEED - Math.max(0, -input.throttle) * 2;
    target *= 1 - 0.6 * sw;
    // saltar: una vez por pulsación, solo con los pies en el suelo y fuera del agua
    const pideSalto = !!input.jump, enTierra = sw < 0.3;
    if (pideSalto && !this.jumpHeld && !this.enElAire && enTierra) { this.jumpV = SALTO_V; this.crouch *= 0.3; }
    this.jumpHeld = pideSalto;
    if (this.enElAire) {
      this.jumpY += this.jumpV * dt;
      this.jumpV -= SALTO_G * dt;
      if (this.jumpY <= 0) {
        this.golpe = Math.min(1, -this.jumpV / SALTO_V);   // al caer se flexionan las rodillas
        this.jumpY = 0; this.jumpV = 0;
      }
    }
    // agacharse: mientras se mantiene la tecla, con los pies en el suelo
    const quiere = input.crouch && !this.enElAire && enTierra ? 1 : 0;
    this.crouch += (quiere - this.crouch) * Math.min(1, dt * 9);
    this.vuelo += ((this.enElAire ? 1 : 0) - this.vuelo) * Math.min(1, dt * 14);
    this.golpe = Math.max(0, this.golpe - dt * 3.2);
    target *= 1 - (1 - AGACHADO) * this.crouch;
    // en el aire no se frena ni se acelera de golpe: se lleva el impulso
    this.speed += (target - this.speed) * Math.min(1, dt * (this.enElAire ? 1.5 : 8));

    const f = this.forward();
    this.pos.addScaledVector(f, this.speed * dt);

    const contacts = colliders.circleContacts(this.pos.x, this.pos.y, RADIUS);
    for (const c of contacts) {
      this.pos.x += c.nx * c.depth;
      this.pos.y += c.nz * c.depth;
    }

    this.phase += (Math.abs(this.speed) + sw * 1.4) * dt * 3.4;
    const amt = Math.min(1, Math.abs(this.speed) / 3);
    const mix = (a, b) => a + (b - a) * sw;
    const crawl = Math.sin(this.phase * 0.9);
    // en tierra, paso natural (andares.js): anda despacio y corre a partir de unos 2,5 m/s
    const v = Math.abs(this.speed);
    if (sw < 0.98) {
      andar(this.parts, this.phase, { zancada: amt * (this.speed < 0 ? 0.6 : 1), correr: Math.max(0, Math.min(1, (v - 2.2) / 1.6)), peso: 1 - sw });
    } else reposo(this.parts);
    if (sw > 0.01) {
      const P = this.parts;
      P.legL.rotation.x = mix(P.legL.rotation.x, 0.3 * Math.sin(this.phase * 2.2));
      P.legR.rotation.x = mix(P.legR.rotation.x, -0.3 * Math.sin(this.phase * 2.2));
      P.armL.rotation.x = mix(P.armL.rotation.x, -1.6 + crawl * 1.5);
      P.armR.rotation.x = mix(P.armR.rotation.x, -1.6 - crawl * 1.5);
    }

    this.posturaExtra();

    const bob = Math.sin(this.phase * 0.7) * 0.05 * sw;
    this.mesh.position.set(this.pos.x, mix(FOOT_Y + Math.abs(Math.sin(this.phase)) * 0.03 * amt, -0.3 + bob) + this.jumpY, this.pos.y);
    this.mesh.rotation.x = sw * 1.25;
    this.mesh.rotation.y = this.heading;
  }

  /**
   * (Version 170) encima del paso de andares.js: agachado (en cuclillas, el tronco echado adelante), en el aire
   * (una pierna delante y otra atrás, los brazos arriba) y la flexión al caer. Se llama cada fotograma después de
   * `andar`, que deja cada hueso en su sitio: aquí no se acumula nada.
   */
  posturaExtra() {
    const P = this.parts;
    const c = Math.min(1, Math.max(this.crouch, this.golpe * 0.55)) * (1 - this.swim), j = this.vuelo;
    if (c < 0.004 && j < 0.004) return;
    const lerp = (a, b, t) => a + (b - a) * t;
    if (c >= 0.004) {
      // el muslo va hacia delante y la rodilla se dobla lo justo para que el pie quede debajo de la cadera
      const a = 0.95 * c, d = Math.asin(Math.min(1, MUSLO / ESPINILLA * Math.sin(a)));
      const baja = MUSLO + ESPINILLA - (MUSLO * Math.cos(a) + ESPINILLA * Math.cos(d));
      const paso = 1 - 0.55 * c;   // agachado, la zancada es más corta
      for (const [leg, knee] of [[P.legL, P.kneeL], [P.legR, P.kneeR]]) {
        leg.rotation.x = leg.rotation.x * paso - a;
        knee.rotation.x = knee.rotation.x * paso + a + d;
      }
      P.hips.position.y -= baja;
      P.spine.rotation.x += 0.42 * c;
      P.head.rotation.x -= 0.3 * c;
      P.armL.rotation.x = lerp(P.armL.rotation.x, -0.35, 0.6 * c);
      P.armR.rotation.x = lerp(P.armR.rotation.x, -0.35, 0.6 * c);
      P.elbowL.rotation.x = lerp(P.elbowL.rotation.x, -0.9, 0.6 * c);
      P.elbowR.rotation.x = lerp(P.elbowR.rotation.x, -0.9, 0.6 * c);
    }
    if (j >= 0.004) {
      // subiendo, las rodillas arriba; bajando, las piernas se estiran para caer
      const sube = Math.max(0, Math.min(1, 0.5 + this.jumpV / (2 * SALTO_V)));
      P.legL.rotation.x = lerp(P.legL.rotation.x, -0.85 * sube - 0.15, j);
      P.legR.rotation.x = lerp(P.legR.rotation.x, 0.3 * sube - 0.1, j);
      P.kneeL.rotation.x = lerp(P.kneeL.rotation.x, 1.25 * sube + 0.15, j);
      P.kneeR.rotation.x = lerp(P.kneeR.rotation.x, 0.9 * sube + 0.2, j);
      P.armL.rotation.x = lerp(P.armL.rotation.x, -1.5 * sube + 0.35, j);
      P.armR.rotation.x = lerp(P.armR.rotation.x, -1.9 * sube + 0.35, j);
      P.elbowL.rotation.x = lerp(P.elbowL.rotation.x, -0.7, j);
      P.elbowR.rotation.x = lerp(P.elbowR.rotation.x, -0.5, j);
      P.spine.rotation.x += 0.1 * j;
    }
  }

  /** sentado: la cadera en el asiento, las piernas dobladas y, si come, el tenedor del plato a la boca */
  sitPose(dt) {
    const s = this.sitting, p = this.parts;
    this.speed = 0;
    this.pos.set(s.x, s.z);
    this.heading = s.heading;
    p.legL.rotation.x = -1.5; p.legR.rotation.x = -1.45;
    p.kneeL.rotation.x = 1.5; p.kneeR.rotation.x = 1.45;
    p.spine.rotation.x = 0.1;
    if (s.eat) {
      s.t = (s.t || 0) + dt;
      const k = Math.max(0, Math.sin(s.t * 2.4));          // sube el tenedor, se lo come y baja
      p.armR.rotation.x = -0.95 - k * 1.05; p.armR.rotation.z = 0.22 + k * 0.2;
      p.armL.rotation.x = -0.8; p.armL.rotation.z = -0.12;
      p.spine.rotation.x = 0.18 - k * 0.08;
    } else {
      p.armL.rotation.x = -0.75; p.armR.rotation.x = -0.8;
      p.armL.rotation.z = -0.06; p.armR.rotation.z = 0.06;
    }
    this.mesh.position.set(s.x, FOOT_Y + s.y, s.z);
    this.mesh.rotation.y = s.heading;
  }

  /** se baja de la moto o del quad: vuelve a la postura de andar */
  unride() {
    const p = this.parts;
    for (const k of ['legL', 'legR', 'kneeL', 'kneeR', 'armL', 'armR', 'elbowL', 'elbowR', 'spine']) p[k]?.rotation.set(0, 0, 0);
  }

  /** se levanta de la silla y se queda de pie en (x, z) */
  standUp(x, z) {
    const p = this.parts;
    this.sitting = null;
    p.kneeL.rotation.x = 0; p.kneeR.rotation.x = 0; p.spine.rotation.x = 0;
    p.armL.rotation.z = 0; p.armR.rotation.z = 0;
    this.placeAt(x, z, this.heading);
  }
}
