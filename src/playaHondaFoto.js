import * as THREE from 'three';
import { isTouchDevice } from './touch.js';

/**
 * La foto aérea de Playa Honda (Version 149).
 *
 * La foto aérea del juego (public/ortho) solo llega hasta x = -2922: de ahí hacia el oeste —todo Playa Honda, su
 * zona industrial y el aeropuerto— el suelo era una textura de arena pintada, lisa, entre las casas. Aquí se le
 * pone la ortofoto oficial (PNOA, © Instituto Geográfico Nacional de España, CC BY 4.0), bajada del servicio WMS
 * del IGN el 17/11/2026: `public/honda/honda.jpg` (0,8 m por punto) y `public/honda/honda-m.jpg` (1,6 m, para el
 * móvil). Cubre de x = -5400 a -2880 y de z = -200 a 1600.
 *
 * No toca world.js: el suelo fino de Playa Honda ya existe (grupo `sueloFinoHonda`, teselas de 400 m); aquí solo
 * se le cambia la textura y se le ponen las coordenadas de la foto. Si la foto no llega, se queda la arena de antes.
 */

const FOTO = { x0: -5400, x1: -2880, z0: -200, z1: 1600 };

export function buildPlayaHondaFoto(scene) {
  const fino = scene.getObjectByName('sueloFinoHonda');
  if (!fino) return null;
  const teselas = fino.children.filter(m => m.isMesh && m.geometry?.getAttribute('uv'));
  if (!teselas.length) return null;
  const base = import.meta.env.BASE_URL || './';
  const W = FOTO.x1 - FOTO.x0, H = FOTO.z1 - FOTO.z0;
  new THREE.TextureLoader().load(base + 'honda/' + (isTouchDevice() ? 'honda-m.jpg' : 'honda.jpg'), (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    const mat = teselas[0].material.clone();
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.userData = { ...teselas[0].material.userData };
    mat.needsUpdate = true;
    for (const m of teselas) {
      const p = m.geometry.getAttribute('position'), uv = m.geometry.getAttribute('uv');
      m.geometry.computeBoundingBox();
      const bb = m.geometry.boundingBox;
      // solo las teselas que caen dentro de la foto
      if (bb.max.x < FOTO.x0 || bb.min.x > FOTO.x1 || bb.max.z < FOTO.z0 || bb.min.z > FOTO.z1) continue;
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - FOTO.x0) / W, 1 - (p.getZ(i) - FOTO.z0) / H);
      uv.needsUpdate = true;
      m.material = mat;
    }
    fino.userData.foto = true;
  });
  return fino;
}
