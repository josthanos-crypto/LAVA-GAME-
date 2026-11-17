import * as THREE from 'three';
import { isTouchDevice } from './touch.js';

/**
 * (Version 157) La zona del Recinto Ferial, el Cabildo y el Parque Temático (al oeste de la Playa del Reducto), con la
 * foto aérea oficial como suelo y el parque como es de verdad.
 *
 * José Manuel pidió que esta zona quede bien, que es de mucho paso. En el juego el suelo era la foto general
 * (unos 2 m por punto, borrosa) y el Parque Temático salía como un césped verde con árboles redondos: de verdad es
 * un jardín volcánico de picón negro y rojo con palmeras, plazas de losa con dibujo, el parque infantil y la fuente.
 *
 *  - `tuneReductoFoto(map)`: abre un hueco en el suelo general (map.groundHoles), deja de pintar de césped las zonas
 *    de «parque» de dentro (pasan a `k: 'parkFoto'`, con `kAntes`) y quita el surtidor genérico de la fuente.
 *  - `buildReductoFoto(scene, colliders)`: el suelo con la ortofoto (PNOA, © Instituto Geográfico Nacional de España,
 *    CC BY 4.0; `public/reducto/zona.jpg` a 0,2 m por punto y `zona-m.jpg` a 0,5 para el móvil; bajadas del WMS del
 *    IGN el 17/11/2026) y la fuente del parque: el estanque en forma de pajarita con sus chorros.
 */
const ZONA = { x0: -1610, x1: -1040, z0: 370, z1: 900 };
const PARQUE = { x0: -1310, x1: -1050, z0: 515, z1: 735 };
// el estanque de la fuente, medido sobre la foto (forma de pajarita)
const FUENTE = [[-1196, 589.6], [-1183.5, 594.2], [-1171, 589.6], [-1171, 607.6], [-1183.5, 603], [-1196, 607.6]];
const TESELA = 190;

const dentro = (R, x, z) => x > R.x0 && x < R.x1 && z > R.z0 && z < R.z1;

export function tuneReductoFoto(map) {
  if (map.reductoFoto) return;
  map.reductoFoto = true;
  map.groundHoles = [...(map.groundHoles || []), { ...ZONA }];
  for (const a of map.areas || []) {
    if (a.k !== 'park' || !a.p?.length) continue;
    const cx = a.p.reduce((t, q) => t + q[0], 0) / a.p.length, cz = a.p.reduce((t, q) => t + q[1], 0) / a.p.length;
    if (dentro(PARQUE, cx, cz)) { a.kAntes = a.k; a.k = 'parkFoto'; }
  }
  if (Array.isArray(map.fountains)) map.fountains = map.fountains.filter(f => !(Math.abs(f[0] + 1184) < 16 && Math.abs(f[1] - 598) < 14));
}

function suelo(scene) {
  const modelo = scene.getObjectByName('sueloFinoHonda')?.children.find(m => m.isMesh);
  if (!modelo) return null;
  const movil = isTouchDevice(), celda = movil ? 16 : 8;
  const base = import.meta.env.BASE_URL || './';
  const tex = new THREE.TextureLoader().load(base + 'reducto/zona' + (movil ? '-m' : '') + '.jpg');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  const mat = modelo.material.clone();
  mat.map = tex;
  mat.color.set(0xffffff);
  mat.userData = { ...modelo.material.userData, terrainSeg: celda };
  const grupo = new THREE.Group();
  grupo.name = 'sueloReducto';
  const W = ZONA.x1 - ZONA.x0, H = ZONA.z1 - ZONA.z0;
  for (let x = ZONA.x0; x < ZONA.x1; x += TESELA) {
    for (let z = ZONA.z0; z < ZONA.z1; z += TESELA) {
      const x1 = Math.min(x + TESELA, ZONA.x1), z1 = Math.min(z + TESELA, ZONA.z1);
      const g = new THREE.PlaneGeometry(x1 - x, z1 - z, Math.ceil((x1 - x) / celda), Math.ceil((z1 - z) / celda));
      g.rotateX(-Math.PI / 2);
      g.translate((x + x1) / 2, -0.35, (z + z1) / 2);
      const p = g.getAttribute('position'), uv = g.getAttribute('uv');
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - ZONA.x0) / W, 1 - (p.getZ(i) - ZONA.z0) / H);
      const m = new THREE.Mesh(g, mat);
      m.receiveShadow = true;
      grupo.add(m);
    }
  }
  scene.add(grupo);
  return grupo;
}

/** la fuente del Parque Temático: el estanque en pajarita, su borde y los chorros */
function fuente(scene, colliders) {
  const grupo = new THREE.Group();
  grupo.name = 'fuenteParqueTematico';
  const forma = new THREE.Shape(FUENTE.map(([x, z]) => new THREE.Vector2(x, z)));
  const agua = new THREE.ShapeGeometry(forma);
  agua.rotateX(Math.PI / 2);
  const mAgua = new THREE.Mesh(agua, new THREE.MeshStandardMaterial({ color: 0x3a93c8, roughness: 0.25, metalness: 0.1, side: THREE.DoubleSide }));
  mAgua.position.y = 0.42;
  grupo.add(mAgua);
  const borde = new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.8 });
  for (let i = 0; i < FUENTE.length; i++) {
    const a = FUENTE[i], b = FUENTE[(i + 1) % FUENTE.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, L + 0.45), borde);
    m.position.set((a[0] + b[0]) / 2, 0.3, (a[1] + b[1]) / 2);
    m.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
    m.castShadow = m.receiveShadow = true;
    grupo.add(m);
    colliders?.addSegment(a[0], a[1], b[0], b[1]);
  }
  // los chorros: uno alto en el centro y tres a cada lado
  const chorro = new THREE.MeshStandardMaterial({ color: 0xf2f9fd, roughness: 0.3, transparent: true, opacity: 0.9 });
  const pon = (x, z, h) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.3, h, 8), chorro);
    c.position.set(x, 0.42 + h / 2, z);
    grupo.add(c);
  };
  pon(-1183.5, 598.6, 3.2);
  for (const dx of [-9, -6.5, -4, 4, 6.5, 9]) pon(-1183.5 + dx, 598.6, 1.6);
  scene.add(grupo);
  return grupo;
}

export function buildReductoFoto(scene, colliders) {
  const s = suelo(scene);
  const f = fuente(scene, colliders);
  return { suelo: s, fuente: f };
}
