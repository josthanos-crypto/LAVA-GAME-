import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Regata de vela latina delante de la Playa del Reducto: barquillos con su vela
 * triangular colgada de la entena, numerados, dando vueltas a un recorrido de boyas.
 */

const WATER_Y = 0.15;
const COURSE = { x: -760, z: 612, rx: 118, rz: 38 };
const SAILS = [0xf4efe4, 0xd8271c, 0x2a6db5, 0xf2c500, 0x3e8a4f, 0xe2661b, 0xf4efe4, 0x1c1c1e];
const HULLS = [0xf2f2f2, 0x1f4e8a, 0xf2f2f2, 0x8a1f1f, 0x0d5c63, 0xf2f2f2, 0x2e2e30, 0xe9d7b0];

function hullGeometry() {
  // casco de 5 m visto desde arriba, con la proa afilada; se extruye hacia abajo
  const s = new THREE.Shape();
  s.moveTo(0, 2.6);
  s.quadraticCurveTo(0.95, 1.2, 0.85, -1.6);
  s.lineTo(0.7, -2.4);
  s.lineTo(-0.7, -2.4);
  s.lineTo(-0.85, -1.6);
  s.quadraticCurveTo(-0.95, 1.2, 0, 2.6);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.55, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08, bevelSegments: 2, curveSegments: 8 });
  g.rotateX(Math.PI / 2);
  g.translate(0, 0.45, 0);
  return g;
}

function numberTexture(n, sail) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#' + sail.toString(16).padStart(6, '0');
  g.fillRect(0, 0, 128, 128);
  // costuras de los paños
  g.strokeStyle = 'rgba(0,0,0,.12)';
  g.lineWidth = 2;
  for (let x = 16; x < 128; x += 18) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 128); g.stroke(); }
  const dark = (sail === 0xf4efe4 || sail === 0xf2c500);
  g.fillStyle = dark ? '#1c1c1e' : '#f4efe4';
  g.font = '800 46px Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(String(n), 64, 82);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** vela latina: triángulo entre el pie del mástil, la punta alta de la entena y su extremo bajo a proa */
function sailGeometry() {
  // una cara por cada lado, cada una con su número al derecho
  const A = [0, 0.9, -1.2], B = [0, 7.6, -1.4], C = [0, 1.5, 2.6];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...A, ...B, ...C, ...A, ...C, ...B], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute([0.9, 0, 0.5, 1, 0.05, 0.05, 0.1, 0, 0.95, 0.05, 0.5, 1], 2));
  g.computeVertexNormals();
  return g;
}

function buildBoat(i, few) {
  const group = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({ color: HULLS[i % HULLS.length], roughness: 0.45 });
  group.add(new THREE.Mesh(hullGeometry(), hullMat));
  // borda de madera y bancadas
  const wood = new THREE.MeshStandardMaterial({ color: 0x7a5232, roughness: 0.8 });
  const trim = [];
  for (const z of [-1.4, 0, 1.2]) trim.push(new THREE.BoxGeometry(1.5, 0.06, 0.22).translate(0, 0.5, z));
  trim.push(new THREE.BoxGeometry(0.12, 0.08, 4.6).translate(0.82, 0.52, 0), new THREE.BoxGeometry(0.12, 0.08, 4.6).translate(-0.82, 0.52, 0));
  group.add(new THREE.Mesh(mergeGeometries(trim), wood));
  // mástil corto y la entena larga, inclinada
  const spar = new THREE.MeshStandardMaterial({ color: 0x5a3b22, roughness: 0.7 });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.4, 6), spar);
  mast.position.set(0, 2.1, 0.2);
  group.add(mast);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 7.3, 6), spar);
  yard.position.set(0, 4.55, 0.6);
  yard.rotation.x = Math.atan2(-1.4 - 2.6, 7.6 - 1.5);
  group.add(yard);
  const sailMat = new THREE.MeshStandardMaterial({ map: numberTexture(i + 1, SAILS[i % SAILS.length]), roughness: 0.9 });
  const sail = new THREE.Mesh(sailGeometry(), sailMat);
  group.add(sail);
  // la tripulación: chalecos naranjas sentados a barlovento
  const crewN = few ? 1 : 3;
  const skin = new THREE.MeshStandardMaterial({ color: 0xc89270, roughness: 0.7 });
  const vest = new THREE.MeshStandardMaterial({ color: 0xff6a12, roughness: 0.7 });
  const crew = new THREE.Group();
  for (let k = 0; k < crewN; k++) {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.42, 3, 8), vest);
    body.position.set(0.62, 0.92, -1.6 + k * 1.1);
    body.rotation.z = -0.35;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), skin);
    head.position.set(0.82, 1.34, -1.6 + k * 1.1);
    crew.add(body, head);
  }
  group.add(crew);
  group.userData = { sail, crew };
  group.traverse(o => { if (o.isMesh) { o.castShadow = !few; o.receiveShadow = false; } });
  return group;
}

function buoy() {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 1.3, 14), mat);
  body.position.y = 0.4;
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 14), mat);
  top.position.y = 1.45;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.18, 14), new THREE.MeshStandardMaterial({ color: 0xf4efe4, roughness: 0.5 }));
  band.position.y = 0.75;
  g.add(body, top, band);
  return g;
}

/** punto del recorrido (elipse) para el parámetro a, con un carril lateral */
function onCourse(a, lane) {
  const rx = COURSE.rx + lane, rz = COURSE.rz + lane;
  const x = COURSE.x + Math.cos(a) * rx, z = COURSE.z + Math.sin(a) * rz;
  const tx = -Math.sin(a) * rx, tz = Math.cos(a) * rz;
  return { x, z, heading: Math.atan2(tx, tz) };
}

export class Regatta {
  constructor(scene, { touch = false } = {}) {
    this.group = new THREE.Group();
    this.group.name = 'regata';
    const n = touch ? 5 : 8;
    this.boats = [];
    for (let i = 0; i < n; i++) {
      const mesh = buildBoat(i, touch);
      this.group.add(mesh);
      this.boats.push({ mesh, a: -i * 0.34, lane: ((i % 3) - 1) * 7, speed: 0.033 + (i % 4) * 0.0018, phase: i * 1.7 });
    }
    // boyas de las balizas en las dos puntas y en los costados del recorrido
    this.buoys = [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a) => {
      const b = buoy();
      const p = onCourse(a, -14);
      b.position.set(p.x, WATER_Y - 0.25, p.z);
      this.group.add(b);
      return b;
    });
    scene.add(this.group);
  }

  update(dt, t, px, pz) {
    // lejos no se mueve nada (ni se dibuja): el Reducto queda a trasmano de casi todo
    const far = Math.hypot(px - COURSE.x, pz - COURSE.z) > 1400;
    this.group.visible = !far;
    if (far) return;
    for (const b of this.boats) {
      b.a += b.speed * dt * (1 + Math.sin(t * 0.2 + b.phase) * 0.12);
      const p = onCourse(b.a, b.lane);
      const m = b.mesh;
      m.position.set(p.x, WATER_Y - 0.32 + Math.sin(t * 1.6 + b.phase) * 0.06, p.z);
      m.rotation.order = 'YXZ';
      m.rotation.y = p.heading;
      // escora hacia sotavento y cabeceo con las olas
      m.rotation.z = 0.16 + Math.sin(t * 0.7 + b.phase) * 0.05;
      m.rotation.x = Math.sin(t * 1.3 + b.phase) * 0.04;
      m.userData.sail.rotation.y = 0.35 + Math.sin(t * 0.5 + b.phase) * 0.06;
    }
    for (let i = 0; i < this.buoys.length; i++) this.buoys[i].position.y = WATER_Y - 0.25 + Math.sin(t * 1.4 + i) * 0.05;
  }
}
