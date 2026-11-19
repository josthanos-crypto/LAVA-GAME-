/**
 * Andar y correr con naturalidad (Version 133). Antes las piernas y los brazos iban y venían como un
 * péndulo y el cuerpo no se movía. Ahora, con el mismo esqueleto de humanModel.js:
 *  - la rodilla se dobla al pasar la pierna hacia delante y cede un poco al apoyar
 *  - la cadera gira y bascula con cada zancada, y los hombros hacen el giro contrario
 *  - el cuerpo sube y baja dos veces por zancada, la cabeza se queda mirando al frente
 *  - los brazos van algo retrasados respecto a las piernas y doblan el codo al adelantarse
 *  - corriendo: zancada larga, talón arriba, cuerpo echado hacia delante y brazos en ángulo
 *
 * p: lo que devuelve buildHuman (legL, legR, kneeL, kneeR, armL, armR, elbowL, elbowR, hips, spine, head).
 * No guarda nada fuera de p; `reposo(p)` deja el tronco como estaba (para sentarse, caer, charlar...).
 */

const cl = (v, a, b) => Math.max(a, Math.min(b, v));

function base(p) {
  if (!p._and) {
    p._and = {
      hipY: p.hips.position.y, spineX: p.spine.rotation.x, headX: p.head.rotation.x,
      armLZ: p.armL.rotation.z, armRZ: p.armR.rotation.z, suelto: true,
    };
  }
  return p._and;
}

/** el tronco y la cabeza vuelven a su postura de reposo (las piernas y los brazos los pone quien llame) */
export function reposo(p) {
  const b = p._and;
  if (!b || b.suelto) return;
  b.suelto = true;
  p.hips.position.y = b.hipY;
  p.hips.rotation.set(0, 0, 0);
  p.spine.rotation.set(b.spineX, 0, 0);
  p.head.rotation.set(b.headX, 0, 0);
  p.armL.rotation.z = b.armLZ;
  p.armR.rotation.z = b.armRZ;
}

/**
 * fase: avanza 2π por zancada completa (dos pasos). zancada: 0 parado … 1 paso largo. correr: 0 andar … 1 correr.
 * peso: cuánto se aplica al tronco (para mezclar con otra postura, p. ej. al entrar al agua)
 */
export function andar(p, fase, { zancada = 0.6, correr = 0, peso = 1 } = {}) {
  const b = base(p);
  b.suelto = false;
  const k = cl(zancada, 0, 1.2), r = cl(correr, 0, 1), w = cl(peso, 0, 1);
  const s = Math.sin(fase), c = Math.cos(fase);
  // ── piernas: positivo = hacia atrás ──
  const A = k * (0.5 + 0.34 * r);
  // la pierna de delante llega más lejos de lo que la de atrás se queda (el pie apoya por delante del cuerpo)
  const cad = (x) => A * (x - 0.12 * (1 - x * x)) - 0.05 * r;
  const legL = cad(s), legR = cad(-s);
  p.legL.rotation.x = legL;
  p.legR.rotation.x = legR;
  // rodilla: se dobla mientras la pierna vuelve hacia delante (el pie libra el suelo) y cede al apoyar
  const flex = (cs, sn) => {
    const vuelo = Math.max(0, -(cs * 0.94 - sn * 0.34));   // máximo a mitad de la vuelta, algo antes
    const apoyo = Math.max(0, cs * 0.62 - sn * 0.78);       // justo al apoyar el talón
    return 0.05 + k * ((0.95 + 0.85 * r) * vuelo ** 1.25 + (0.16 + 0.1 * r) * apoyo);
  };
  p.kneeL.rotation.x = flex(c, s);
  p.kneeR.rotation.x = flex(-c, -s);
  // ── cadera: gira hacia la pierna que avanza, bascula hacia la que apoya, y sube y baja ──
  const giro = (0.075 + 0.05 * r) * k * w;
  p.hips.rotation.y = -giro * s;
  p.hips.rotation.z = -0.035 * k * c * w;
  p.hips.position.y = b.hipY - (0.012 + 0.02 * r) * k * w * (1 - Math.cos(2 * fase)) + 0.004 * k;
  // ── tronco: contragiro de hombros, se endereza sobre la cadera y se echa adelante al correr ──
  p.spine.rotation.y = giro * 1.9 * s;
  p.spine.rotation.z = 0.03 * k * c * w;
  p.spine.rotation.x = b.spineX + (0.02 + 0.2 * r) * k * w;
  p.head.rotation.y = -giro * 0.9 * s;
  p.head.rotation.x = b.headX - (0.015 + 0.13 * r) * k * w;
  // ── brazos: al contrario que las piernas, un pelo retrasados; el codo se dobla al adelantarse ──
  const sa = Math.sin(fase - 0.22);
  const B = k * (0.42 + 0.5 * r);
  const armL = -B * sa - 0.12 * r, armR = B * sa - 0.12 * r;
  p.armL.rotation.x = armL;
  p.armR.rotation.x = armR;
  const codo = (a) => -(0.16 + 1.25 * r + k * (0.5 - 0.2 * r) * Math.max(0, -a / (B + 1e-3)));
  p.elbowL.rotation.x = codo(armL);
  p.elbowR.rotation.x = codo(armR);
  // los brazos se abren un poco más al correr
  p.armL.rotation.z = b.armLZ - 0.05 * r * w;
  p.armR.rotation.z = b.armRZ + 0.05 * r * w;
}
