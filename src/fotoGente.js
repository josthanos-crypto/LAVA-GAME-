import * as THREE from 'three';
import { randomName } from './dialogue.js';

/**
 * Gente de foto: personas sacadas de fotos de estudio (recortadas, con su
 * fondo transparente, en public/gente/) que están de pie en las aceras, como
 * quien espera o mira el móvil. Son láminas que giran para mirar siempre a la
 * cámara: de cerca y de lado se nota que son planas, por eso salen pocas y
 * paradas. Si las atropellas caen de espaldas y cuentan como un peatón
 * (policía y susto alrededor).
 */

// alto real de cada persona (m); la foto se escala a esa altura
const FOTOS = [
  { file: 'gente/foto1.webp', h: 1.8 },   // chico de camiseta verde
  { file: 'gente/foto2.webp', h: 1.66 },  // chica de coleta con top coral
  { file: 'gente/foto3.webp', h: 1.82 },  // chico de camiseta negra con panel solar
  { file: 'gente/foto4.webp', h: 1.76 },  // señor del chaleco reflectante
];
const WALK_Y = 0.24;          // la acera, como peds.js
const R0 = 18, R1 = 85, FAR = 105;
const CELL = 40;
const cellKey = (x, z) => Math.floor(x / CELL) * 100003 + Math.floor(z / CELL);
const HIT_R = 1.9;            // el coche las toca a esta distancia
const FALL_TIME = 0.45;

const SHADOW_GEO = new THREE.CircleGeometry(1, 18);
SHADOW_GEO.rotateX(-Math.PI / 2);
const SHADOW_MAT = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });

export class FotoGente {
  /** peds: los peatones (de ahí salen las calles por casillas y el aviso de atropello) */
  constructor(scene, peds, { count = 10 } = {}) {
    this.scene = scene;
    this.peds = peds;
    this.cells = peds.cells;
    this.people = [];
    const loader = new THREE.TextureLoader();
    const looks = FOTOS.map((f) => {
      const geo = new THREE.PlaneGeometry(1, 1);
      geo.translate(0, 0.5, 0);   // el origen, en los pies
      const mat = new THREE.MeshLambertMaterial({ transparent: false, alphaTest: 0.5, side: THREE.DoubleSide });
      const look = { ...f, geo, mat, aspect: 0.33 };
      loader.load(f.file, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        // la foto ya trae su luz de estudio: la lámina no se queda a oscuras
        // cuando el sol le da por detrás (un poco de luz propia, del color de la foto)
        mat.map = tex;
        mat.emissiveMap = tex;
        mat.emissive.setScalar(0.5);
        mat.needsUpdate = true;
        look.aspect = tex.image.width / tex.image.height;
        for (const p of this.people) if (p.look === look) this.fit(p);
      });
      return look;
    });
    for (let i = 0; i < count; i++) {
      const look = looks[i % looks.length];
      const group = new THREE.Group();
      group.rotation.order = 'YXZ';
      const mesh = new THREE.Mesh(look.geo, look.mat);
      const shadow = new THREE.Mesh(SHADOW_GEO, SHADOW_MAT);
      shadow.position.y = 0.01;
      shadow.renderOrder = -1;
      group.add(mesh);
      scene.add(group, shadow);
      group.visible = shadow.visible = false;
      const p = { look, group, mesh, shadow, x: 0, z: 0, state: 'off', timer: 0, fall: 0, name: '', heading: 0 };
      this.fit(p);
      this.people.push(p);
    }
  }

  /** escala la lámina a su altura y proporción */
  fit(p) {
    p.mesh.scale.set(p.look.h * p.look.aspect, p.look.h, 1);
    p.shadow.scale.set(p.look.h * p.look.aspect * 0.45, 1, 0.32);
  }

  /** sale en una acera cerca del jugador, fuera de la vista */
  spawn(p, px, pz, fwd) {
    const hidden = (x, z) => {
      const d = Math.hypot(x - px, z - pz);
      return d > 45 || !fwd || ((x - px) * fwd[0] + (z - pz) * fwd[1]) / (d || 1) < 0.2;
    };
    for (let tries = 0; tries < 40; tries++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.sqrt(R0 * R0 + Math.random() * (R1 * R1 - R0 * R0));
      const cell = this.cells.get(cellKey(px + Math.sin(a) * d, pz + Math.cos(a) * d));
      if (!cell) continue;
      const [r, seg] = cell[Math.floor(Math.random() * cell.length)];
      // en las peatonales y avenidas, donde más gente hay
      if (r.dirt || !(r.ped || r.major)) continue;
      const [ax, az] = r.p[seg], [bx, bz] = r.p[seg + 1];
      const len = Math.hypot(bx - ax, bz - az) || 1;
      const t = Math.random();
      const side = Math.random() < 0.5 ? 1 : -1;
      // por donde pasean los peatones (peds.js), un poco más cerca del bordillo
      const off = side * (r.ped ? r.w * 0.3 : r.w / 2 + 1.2);
      const x = ax + (bx - ax) * t - ((bz - az) / len) * off;
      const z = az + (bz - az) * t + ((bx - ax) / len) * off;
      const dq = Math.hypot(x - px, z - pz);
      if (dq < R0 - 4 || dq > R1 + 10 || !hidden(x, z)) continue;
      // nunca en la calzada (en los cruces la acera de una calle cae en la otra)
      if (this.peds.onRoad?.(x, z)) continue;
      if (this.people.some(q => q !== p && q.state !== 'off' && Math.hypot(q.x - x, q.z - z) < 6)) continue;
      Object.assign(p, { x, z, state: 'stand', fall: 0, timer: 0, name: randomName() });
      p.group.rotation.x = 0;
      p.group.visible = p.shadow.visible = true;
      return;
    }
    p.state = 'off';
    p.group.visible = p.shadow.visible = false;
  }

  /** ctx como en peds.update: { driving, carSpeed, carVel, flying } */
  update(dt, player, camera, ctx = {}) {
    const px = player.pos.x, pz = player.pos.y;
    const fwd = this.started && player.heading !== undefined ? [Math.sin(player.heading), Math.cos(player.heading)] : null;
    this.started = true;
    for (const p of this.people) {
      if (p.state === 'off') { this.spawn(p, px, pz, fwd); continue; }
      const dx = p.x - px, dz = p.z - pz, d = Math.hypot(dx, dz);
      if (p.state === 'down') {
        p.fall = Math.min(1, p.fall + dt / FALL_TIME);
        p.group.rotation.x = -Math.PI / 2 * p.fall * p.fall;
        p.timer -= dt;
        if (p.timer <= 0 && d > 60) p.state = 'off';
      } else {
        if (d > FAR) { p.state = 'off'; continue; }
        // mira siempre a la cámara (solo gira en vertical: sigue de pie)
        p.heading = Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
        if (ctx.driving && !ctx.flying && d < HIT_R) {
          if (ctx.carSpeed > 4) {
            // cae de espaldas, hacia donde va el coche
            const v = ctx.carVel;
            p.heading = Math.atan2(-v.x, -v.y);
            p.state = 'down';
            p.timer = 40;
            this.peds.onEvent?.('runover', p);
          } else if (d > 0.01) {
            p.x += (dx / d) * (HIT_R - d);
            p.z += (dz / d) * (HIT_R - d);
          }
        } else if (!ctx.driving && d < 0.6 && d > 0.01) {
          p.x += (dx / d) * (0.6 - d);
          p.z += (dz / d) * (0.6 - d);
        }
      }
      p.group.position.set(p.x, WALK_Y, p.z);
      p.group.rotation.y = p.heading;
      p.shadow.position.set(p.x, WALK_Y + 0.01, p.z);
      p.shadow.visible = p.state !== 'down' || p.fall < 0.5;
    }
  }
}
