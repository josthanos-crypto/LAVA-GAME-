import * as THREE from 'three';
import { bajadaEn, sombraDe } from './trinchera.js';

/**
 * (Version 161) Los coches, de una pieza en los puentes (lo vio José Manuel junto al puente del Cabildo: «el coche
 * parece un acordeón»).
 *
 * En los cruces a distinto nivel (trinchera.js) la carretera se hunde o se sube en el dibujo, vértice a vértice. Eso
 * va bien para lo fijo, pero a un coche parado en el talud de los lados (una cuesta del 80 %) le bajaba más la parte
 * de chapa que más sobresale: cada abombado del costado se convertía en un escalón y la carrocería, las letras y los
 * cristales quedaban en zigzag.
 *
 * Aquí el coche entero baja o sube lo que le toca a su centro y se inclina con la rampa y con el talud, sin deformarse:
 *  - sus materiales llevan el modo 'stay' de trinchera.js (el dibujo ya no los mueve en la franja);
 *  - la bajada y la inclinación se le ponen a la matriz del coche (`bajadaEn`, la misma cuenta que usa la cámara).
 * `rigidoEnTrinchera(group)` se llama al final de makeCar y makeBike: vale para el coche del jugador, el tráfico, los
 * aparcados y la policía. El piloto de las motos del tráfico comparte materiales con la gente de la calle: se le dan
 * copias suyas para no cambiar a los peatones.
 */
const LARGO = 1.3;        // a cuánto del centro se mira la rampa por delante y por detrás
const ANCHO = 0.8;        // y a cuánto, hacia cada lado, el talud
const REPASO = 24;        // cada cuántos fotogramas se miran las piezas que se le cuelgan después (puerta, salpicadero)
const copias = new Map();
const _rx = new THREE.Matrix4();

function quieto(m) {
  if (!m || m.userData?.trench === 'stay') return m;
  m.userData.trench = 'stay';
  m.needsUpdate = true;
  return m;
}
function copiaQuieta(m) {
  if (!m || m.userData?.trench === 'stay') return m;
  let c = copias.get(m);
  if (!c) { c = m.clone(); c.userData.trench = 'stay'; copias.set(m, c); }
  return c;
}

/** deja 'quietos' en la franja todos los materiales del coche (los del piloto, en copias) */
function marcar(group) {
  const piloto = group.userData.rider?.group || null;
  group.traverse(o => {
    if (!o.material) return;
    // (Version 183) la sombra del coche, con el mismo modo que su dibujo (si no, en la franja salía desplazada)
    if (o.isMesh && !o.customDepthMaterial) o.customDepthMaterial = sombraDe('stay');
    let dePiloto = false;
    for (let p = o; p && piloto; p = p.parent) if (p === piloto) { dePiloto = true; break; }
    const f = dePiloto ? copiaQuieta : quieto;
    if (Array.isArray(o.material)) {
      if (dePiloto) o.material = o.material.map(f); else o.material.forEach(f);
    } else if (dePiloto) o.material = f(o.material);
    else f(o.material);
  });
}

export function rigidoEnTrinchera(group) {
  const ud = group.userData;
  if (ud.trincheraRigida) return group;
  ud.trincheraRigida = true;
  marcar(group);
  let n = 0;
  const base = group.updateMatrix;
  group.updateMatrix = function () {
    base.call(this);
    if (++n % REPASO === 0) marcar(this);
    const x = this.position.x, z = this.position.z, h = this.rotation.y;
    const d = bajadaEn(x, z, h);
    const fx = Math.sin(h) * LARGO, fz = Math.cos(h) * LARGO;
    const delante = bajadaEn(x + fx, z + fz, h), detras = bajadaEn(x - fx, z - fz, h);
    // la derecha del coche es (cos h, -sin h)
    const rx = Math.cos(h) * ANCHO, rz = -Math.sin(h) * ANCHO;
    const derecha = bajadaEn(x + rx, z + rz, h), izquierda = bajadaEn(x - rx, z - rz, h);
    const fuera = d === 0 && delante === 0 && detras === 0 && derecha === 0 && izquierda === 0;
    // (Version 183) en la franja el coche se dibuja a d metros de donde three.js cree que está (la matriz baja y el
    // sombreador sube el mundo): three.js lo daba por fuera de cámara y el coche desaparecía al pasar bajo los puentes
    if (ud.enFranja !== !fuera) {
      ud.enFranja = !fuera;
      this.traverse(o => { if (o.isMesh) { if (ud.enFranja) { o.userData.culloAntes ??= o.frustumCulled; o.frustumCulled = false; } else if (o.userData.culloAntes !== undefined) o.frustumCulled = o.userData.culloAntes; } });
    }
    if (fuera) return;
    // la rampa: el morro baja si por delante se hunde más. Un salto brusco (el borde del tablero del puente) no inclina
    const salto = delante - detras;
    if (Math.abs(salto) > 0.004 && Math.abs(salto) < LARGO * 0.9) this.matrix.multiply(_rx.makeRotationX(Math.atan2(salto, 2 * LARGO)));
    // el talud de los lados: el coche se ladea entero con él (hasta unos 40 grados), en vez de quedar medio enterrado
    const ladeo = derecha - izquierda;
    if (Math.abs(ladeo) > 0.004 && Math.abs(ladeo) < ANCHO * 2.8) {
      this.matrix.multiply(_rx.makeRotationZ(-Math.max(-0.7, Math.min(0.7, Math.atan2(ladeo, 2 * ANCHO)))));
    }
    this.matrix.elements[13] -= d;
  };
  return group;
}
