import * as THREE from 'three';
import { isTouchDevice } from './touch.js';

/**
 * La foto aérea de la franja del norte de Arrecife (Version 150).
 *
 * La foto aérea del juego (public/ortho) se acaba en z = -1948. De ahí hacia el norte —la zona industrial del
 * nordeste, el arranque de la carretera de Tahíche, lo de arriba de Argana y de Maneje— el suelo era la textura de
 * arena pintada. Aquí se le pone la ortofoto oficial (PNOA, © Instituto Geográfico Nacional de España, CC BY 4.0),
 * bajada del servicio WMS del IGN el 17/11/2026: `public/norte/oeste.jpg` y `este.jpg` (1 m por punto; `-m` = 2 m,
 * para el móvil). Cubre de x = -2952 a 3448 y de z = -2790 a -1918.
 *
 * `tuneNorteFoto` abre un hueco en el suelo general (map.groundHoles, como el campo de arriba) y `buildNorteFoto`
 * pone ahí su propio suelo en teselas de 400 m con celdas de 10 m (20 en el móvil), que es lo que tenía la parte
 * fina de esa franja. Donde está el campo de arriba (campoReal.js) no pone nada: ese suelo ya lleva su foto.
 */

const FRANJA = { x0: -2952, x1: 3448, z0: -2790, z1: -1918 };
const CORTE = 248;                                             // dónde se parte en dos fotos
const CAMPO = { x0: -2700, x1: 0, z1: -2385 };                 // el campo de arriba (su suelo es de campoReal.js)
const TESELA = 400;

/** retoques al mapa antes de levantar la ciudad: el hueco en el suelo general */
export function tuneNorteFoto(map) {
  if (map.norteFoto) return;
  map.norteFoto = true;
  map.groundHoles = [...(map.groundHoles || []), { ...FRANJA }];
}

export function buildNorteFoto(scene) {
  // el material sale del suelo fino que ya existe (lleva puesto lo del terreno)
  const modelo = scene.getObjectByName('sueloFinoHonda')?.children.find(m => m.isMesh);
  if (!modelo) return null;
  const movil = isTouchDevice(), celda = movil ? 20 : 10;
  const base = import.meta.env.BASE_URL || './';
  const material = (archivo) => {
    const tex = new THREE.TextureLoader().load(base + 'norte/' + archivo + (movil ? '-m' : '') + '.jpg');
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    const m = modelo.material.clone();
    m.map = tex;
    m.color.set(0xffffff);
    m.userData = { ...modelo.material.userData, terrainSeg: celda };
    return m;
  };
  const fotos = [
    { x0: FRANJA.x0, x1: CORTE, mat: material('oeste') },
    { x0: CORTE, x1: FRANJA.x1, mat: material('este') },
  ];
  const grupo = new THREE.Group();
  grupo.name = 'sueloNorte';
  const H = FRANJA.z1 - FRANJA.z0;
  for (const f of fotos) {
    for (let x = f.x0; x < f.x1; x += TESELA) {
      for (let z = FRANJA.z0; z < FRANJA.z1; z += TESELA) {
        const x1 = Math.min(x + TESELA, f.x1), z1 = Math.min(z + TESELA, FRANJA.z1);
        // lo que cae en el campo de arriba ya tiene su suelo
        const zc0 = (x >= CAMPO.x0 && x1 <= CAMPO.x1) ? Math.max(z, CAMPO.z1) : z;
        if (z1 - zc0 < 1) continue;
        const nx = Math.ceil((x1 - x) / celda), nz = Math.ceil((z1 - zc0) / celda);
        const g = new THREE.PlaneGeometry(x1 - x, z1 - zc0, nx, nz);
        g.rotateX(-Math.PI / 2);
        g.translate((x + x1) / 2, -0.35, (zc0 + z1) / 2);
        const p = g.getAttribute('position'), uv = g.getAttribute('uv');
        for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - f.x0) / (f.x1 - f.x0), 1 - (p.getZ(i) - FRANJA.z0) / H);
        const m = new THREE.Mesh(g, f.mat);
        m.receiveShadow = true;
        grupo.add(m);
      }
    }
  }
  scene.add(grupo);
  return grupo;
}
