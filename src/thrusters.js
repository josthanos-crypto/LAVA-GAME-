import * as THREE from 'three';
import { hissSound } from './audio.js';

/**
 * Los propulsores de aire comprimido del roadster (Chispa Órbita), como los del paquete SpaceX: bocanadas
 * blancas que salen por debajo, por los lados y por delante al frenar; al girar sale más aire por el lado
 * contrario al de la curva, y en el turbo salto, a chorro hacia el suelo.
 * Son sprites que se reutilizan (como el humo): siguen el terreno igual que el resto del mundo.
 */

const POOL = 64;
const UNDER = [[0.72, 0.12, 1.05], [-0.72, 0.12, 1.05], [0.72, 0.12, -1.05], [-0.72, 0.12, -1.05]];
const SIDE_Z = [1.0, -0.95];

/**
 * La bocanada: un redondel blanco que se apaga hacia el borde sobre fondo NEGRO OPACO.
 * Con el alfa del lienzo (como estaba antes) el cuadrado del sprite sacaba su borde recto y,
 * según la tarjeta gráfica, se veía como un cuadro negro pegado al coche. Sobre negro opaco
 * y con mezcla aditiva el negro no suma nada: no hay cuadrado posible, solo el redondel.
 */
function puffTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 64);
  const grad = g.createRadialGradient(32, 32, 1, 32, 32, 31);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.28, 'rgba(238,245,253,0.8)');
  grad.addColorStop(0.62, 'rgba(186,203,224,0.26)');
  grad.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** la llama del cohete: núcleo blanco, naranja y borde azul, sobre negro opaco (mezcla aditiva) */
function flameTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 64, 64);
  const grad = g.createRadialGradient(32, 32, 1, 32, 32, 31);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.22, 'rgba(255,233,168,0.95)');
  grad.addColorStop(0.5, 'rgba(255,128,36,0.55)');
  grad.addColorStop(0.78, 'rgba(70,110,255,0.22)');
  grad.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const FLAME_X = [0.5, -0.5];
const FLAME_STEPS = [0, 0.55, 1.15];   // las tres bolas de cada llama, hacia atrás

export class Thrusters {
  /** light: en el móvil, la mitad de bocanadas (son sprites aditivos a pantalla completa en el salto) */
  constructor(scene, light = false) {
    const map = puffTexture();
    this.group = new THREE.Group();
    this.group.name = 'propulsores';
    this.k = light ? 0.5 : 1;
    this.puffs = [];
    for (let i = 0; i < (light ? POOL / 2 : POOL); i++) {
      const mat = new THREE.SpriteMaterial({
        map, color: 0xf4f8ff, transparent: true, opacity: 0, depthWrite: false,
        // sin niebla: la niebla tiñe el negro del cuadrado con su color y, con la mezcla aditiva, el
        // cuadro entero se encendía (en el turbo salto, con tantas bocanadas, se veía todo a cuadros)
        blending: THREE.AdditiveBlending, fog: false, toneMapped: false,
      });
      const sp = new THREE.Sprite(mat);
      sp.visible = false;
      this.group.add(sp);
      this.puffs.push({ sp, life: 0, max: 1, vel: new THREE.Vector3(), s0: 0.3, s1: 1, a: 0.6 });
    }
    // las llamas de atrás (turbo salto y arrancadas) y los brillos blancos de las boquillas cuando disparan
    const fmap = flameTexture();
    this.flames = [];
    for (let i = 0; i < FLAME_X.length * FLAME_STEPS.length; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fmap, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }));
      sp.visible = false;
      this.group.add(sp);
      this.flames.push(sp);
    }
    this.glows = UNDER.map(() => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: 0xcfe6ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }));
      sp.visible = false;
      this.group.add(sp);
      return { sp, t: 0 };
    });
    this.hissT = 0;
    this.flameI = 0;
    scene.add(this.group);
    this.acc = { under: 0, side: 0, brake: 0, jump: 0, launch: 0 };
    this.prevHeading = null;
    this.prevSpeed = 0;
    this.wasJump = false;
    this.v = new THREE.Vector3();
    this.w = new THREE.Vector3();
  }

  spawn(pos, vel, s0, s1, life, a) {
    const p = this.puffs.find(q => q.life <= 0);
    if (!p) return;
    p.life = p.max = life * (0.8 + Math.random() * 0.4);
    p.vel.copy(vel);
    p.s0 = s0; p.s1 = s1; p.a = a;
    p.sp.position.copy(pos);
    p.sp.visible = true;
  }

  /** de un punto del coche (x, y, z locales) al mundo (reutiliza un vector: spawn lo copia) */
  at(mesh, x, y, z) { return mesh.localToWorld(this.w.set(x, y, z)); }

  /** una dirección del coche (locales) al mundo, con algo de chispa al azar (reutiliza otro vector) */
  dir(mesh, x, y, z, jitter = 0.35) {
    return this.v.set(x + (Math.random() - 0.5) * jitter, y + (Math.random() - 0.5) * jitter * 0.5, z + (Math.random() - 0.5) * jitter).applyQuaternion(mesh.quaternion);
  }

  /** car: el PlayerCar; active: va en el coche y es el roadster; night: 0 día … 1 noche */
  update(dt, car, active, night = 0, throttle = 0) {
    for (const p of this.puffs) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.sp.visible = false; p.sp.material.opacity = 0; continue; }
      const k = 1 - p.life / p.max;
      p.vel.multiplyScalar(Math.max(0, 1 - 2.2 * dt));
      p.sp.position.addScaledVector(p.vel, dt);
      p.sp.position.y += dt * 0.25;
      const s = (p.s0 + (p.s1 - p.s0) * Math.sqrt(k)) * 1.15;
      p.sp.scale.set(s, s, 1);
      // con mezcla aditiva el brillo se suma: menos opacidad para que no reviente la pantalla
      p.sp.material.opacity = Math.min(1, p.a * 0.75) * (1 - k) * (0.45 + 0.55 * (1 - night));
    }
    this.hissT = Math.max(0, this.hissT - dt);
    const mesh = car?.mesh;
    if (!active || !mesh || mesh.userData.carType !== 'roadster') {
      this.prevHeading = null;
      this.prevSpeed = 0;
      this.flameI = 0;
      this.wasJump = false;
      for (const f of this.flames) f.visible = false;
      for (const gl of this.glows) gl.sp.visible = false;
      return;
    }

    const speed = car.speed, fwd = car.forwardSpeed;
    // un NaN de la física (main.js lo recupera después) dejaría los contadores muertos para siempre
    if (!Number.isFinite(speed + fwd + car.heading)) { this.prevHeading = null; return; }
    const yaw = this.prevHeading === null ? 0 : (car.heading - this.prevHeading) / Math.max(dt, 1e-3);
    const decel = (this.prevSpeed - speed) / Math.max(dt, 1e-3);
    this.prevHeading = car.heading;
    this.prevSpeed = speed;
    const jumping = !!car.jump;

    // por debajo: bocanadas que salen hacia fuera, pocas parado y más cuanto más deprisa
    const under = (jumping ? 55 : 3 + Math.min(14, speed * 0.55)) * this.k;
    this.acc.under += under * dt;
    while (this.acc.under >= 1) {
      this.acc.under -= 1;
      const gi = Math.floor(Math.random() * 4);
      const [x, y, z] = UNDER[gi];
      this.glows[gi].t = 0.16;
      const out = Math.sign(x);
      const vel = jumping ? this.dir(mesh, out * 1.2, -4.5, 0, 0.8) : this.dir(mesh, out * 1.9, 0.3, -fwd * 0.05, 0.5);
      this.spawn(this.at(mesh, x, y, z), vel, jumping ? 0.5 : 0.28, jumping ? 1.9 : 1.05, jumping ? 0.8 : 0.65, jumping ? 0.8 : 0.55);
    }

    // al girar: el aire sale por el lado contrario al de la curva
    const turn = Math.min(1, Math.abs(yaw) * 0.9) * Math.min(1, speed / 6);
    this.acc.side += turn * 55 * this.k * dt;
    while (this.acc.side >= 1 && turn > 0.05) {
      this.acc.side -= 1;
      const side = -Math.sign(yaw);
      const z = SIDE_Z[Math.floor(Math.random() * 2)];
      this.spawn(this.at(mesh, side * 0.95, 0.3, z), this.dir(mesh, side * (3.2 + turn * 2.5), 0.25, 0, 0.45), 0.34, 1.25 + turn * 0.5, 0.6, 0.75);
    }
    if (turn <= 0.05) this.acc.side = 0;

    // al frenar fuerte: sale por delante, a los lados del morro
    const braking = decel > 7 && fwd > 3;
    this.acc.brake += (braking ? 50 * this.k : 0) * dt;
    while (this.acc.brake >= 1) {
      this.acc.brake -= 1;
      const side = Math.random() < 0.5 ? -1 : 1;
      this.spawn(this.at(mesh, side * 0.8, 0.28, 1.7), this.dir(mesh, side * 1.2, 0.2, 3.4, 0.4), 0.3, 1.1, 0.55, 0.7);
    }

    // el turbo salto: una ráfaga grande al despegar
    if (jumping && !this.wasJump) {
      for (let i = 0; i < 16; i++) {
        const [x, y, z] = UNDER[i % 4];
        this.spawn(this.at(mesh, x, y, z), this.dir(mesh, Math.sign(x) * 2.6, -1.5, 0, 1.2), 0.6, 2.4, 0.9, 0.85);
      }
    }
    // siseo del aire: en las curvas fuertes, al frenar y al despegar (sin repetirse a cada fotograma)
    if (this.hissT <= 0 && (turn > 0.45 || braking || (jumping && !this.wasJump))) {
      hissSound(jumping ? 1 : braking ? 0.8 : 0.35 + turn * 0.4);
      this.hissT = 0.3;
    }

    // las arrancadas: aire hacia atrás por las boquillas de la zaga cuando pisas a fondo desde parado
    const arrancando = throttle > 0.8 && fwd < 9 && !jumping;
    this.acc.launch += (arrancando ? 40 * this.k : 0) * dt;
    while (this.acc.launch >= 1) {
      this.acc.launch -= 1;
      const side = Math.random() < 0.5 ? -1 : 1;
      this.spawn(this.at(mesh, side * 0.6, 0.22, -2.0), this.dir(mesh, side * 0.8, 0.15, -3.4, 0.4), 0.3, 1.2, 0.6, 0.7);
    }

    // las llamas azules y naranjas de atrás: en el turbo salto a tope, en las arrancadas más suaves
    const objetivo = jumping ? 1 : arrancando ? 0.45 : 0;
    this.flameI += (objetivo - this.flameI) * Math.min(1, dt * 12);
    const I = this.flameI;
    let n = 0;
    for (const bx of FLAME_X) {
      for (const dz of FLAME_STEPS) {
        const sp = this.flames[n++];
        sp.visible = I > 0.03;
        if (!sp.visible) continue;
        sp.position.copy(this.at(mesh, bx, 0.55, -2.05 - dz * (0.6 + I)));
        const tam = (0.9 - dz * 0.45) * I * (0.85 + Math.random() * 0.3) * 1.3;
        sp.scale.set(tam, tam, 1);
        sp.material.opacity = Math.min(1, (1 - dz * 0.5) * I);
      }
    }

    // brillo blanco en las boquillas de los bajos mientras disparan
    UNDER.forEach(([x, y, z], i) => {
      const gl = this.glows[i];
      gl.t = Math.max(0, gl.t - dt);
      gl.sp.visible = gl.t > 0;
      if (!gl.sp.visible) return;
      gl.sp.position.copy(this.at(mesh, x, y + 0.04, z));
      const k = gl.t / 0.16;
      gl.sp.scale.setScalar(0.3 + 0.3 * k);
      gl.sp.material.opacity = 0.85 * k;
    });
    this.wasJump = jumping;
  }
}
