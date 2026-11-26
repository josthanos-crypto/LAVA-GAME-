/**
 * (Version 177) Playa Honda, retoques con las capturas de Look Around del PC de casa (carpeta «Downloads\recursos lava
 * game 2026-11-24 web casa\playa_honda»: 880 fotos de 110 calles, 8 por calle; solo se miran, no van dentro del juego).
 * El pueblo ya estaba hecho calle a calle (calles.js, calles2.js, resto.js). Se miraron las 88 calles que caen dentro
 * del barrio, cada foto con su brújula (arriba a la derecha dice hacia dónde mira: N, S, E, O). Casi todas confirman lo
 * que había: casas blancas de dos plantas con muro blanco. Aquí va solo lo que las fotos enseñan distinto, y solo donde
 * se sabe de qué lado de la calle es: el color o la altura de un edificio que ya estaba, sin moverlo ni partirlo.
 * Cada línea: [punto de dentro del edificio (x, z), { f: color de fachada, h: alto, c: color de la azotea }].
 * A ojo: qué casas exactas de Tomás Bretón son las crema, y hasta dónde llega la fila de tejados rojos de Bergantín.
 */
const CAMBIOS = [
  // Manuel de Falla (fotos 0839-0846): chalets blancos de una planta; estos no tenían color
  [-2862.6, 879.0, { f: '#f3f1ec' }],
  [-2828.9, 912.1, { f: '#f3f1ec' }],
  [-2805.9, 914.0, { f: '#f3f1ec' }],
  [-2866.0, 933.2, { f: '#f3f1ec' }],
  [-2851.4, 945.9, { f: '#f3f1ec' }],
  [-2833.7, 958.6, { f: '#f3f1ec' }],
  [-2812.7, 963.1, { f: '#f3f1ec' }],
  [-2788.3, 969.5, { f: '#f3f1ec' }],
  // Bergantín, acera oeste, frente al punto de las fotos (4144-4145): adosados de una planta
  [-3335.7, 817.0, { h: 4.0 }],
  [-3334.4, 833.1, { h: 4.0 }],
  // Bergantín, acera oeste (fotos 4144-4151): los tejados rojos de esa fila
  [-3335.7, 817.0, { c: [196, 106, 72] }],
  [-3334.4, 833.1, { c: [196, 106, 72] }],
  [-3332.6, 852.2, { c: [196, 106, 72] }],
  [-3341.7, 853.4, { c: [196, 106, 72] }],
  [-3333.3, 876.6, { c: [196, 106, 72] }],
  [-3330.0, 910.7, { c: [196, 106, 72] }],
  // Tomás Bretón, acera sur (fotos 4072-4079): casas blancas y crema alternas (cuáles son las crema, a ojo)
  [-3214.1, 626.8, { f: '#eadfc2' }],
  [-3253.9, 627.5, { f: '#eadfc2' }],
  [-3293.7, 628.0, { f: '#eadfc2' }],
  // Pared del Canto, lado este (fotos 4504-4511): la nave larga color crema
  [-4425.6, 487.0, { f: '#eadfc2' }],
  // Pared del Canto, lado oeste (fotos 4508-4511): nave blanca de dos plantas
  [-4485.8, 483.6, { f: '#f3f1ec', h: 6.4 }],
  // Princesa Ico, acera oeste, pasada la esquina de las tiendas (fotos 4244-4247): el bloque amarillo crema de tres plantas
  [-3678.7, 840.1, { f: '#ecdcae' }],
  // Bocaina, acera oeste (fotos 4396-4399): casas viejas de pescadores, de una planta (el patrón las ponía de dos)
  [-3521.4, 1128.9, { h: 4.0 }],
  [-3518.9, 1142.9, { h: 4.0 }],
  [-3516.7, 1156.9, { h: 4.0 }],
  // La Plazoleta, acera sur (fotos 4384-4391): casas viejas de una planta
  [-3485.4, 1224.9, { h: 4.0 }],
  [-3493.7, 1219.6, { h: 4.0 }],
];

function dentro(p, x, z) {
  let d = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [x1, z1] = p[i], [x2, z2] = p[j];
    if ((z1 > z) !== (z2 > z) && x < (x2 - x1) * (z - z1) / (z2 - z1) + x1) d = !d;
  }
  return d;
}

const rgb = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));

export function tuneCapturasHonda(map) {
  if (!Array.isArray(map?.buildings)) return;
  let hechos = 0;
  for (const [x, z, cambio] of CAMBIOS) {
    const b = map.buildings.find(q => Array.isArray(q.p) && !q.skip && !q.ownFront && !q.ownRoof && dentro(q.p, x, z));
    if (!b) continue;
    if (cambio.f) b.f = rgb(cambio.f);
    if (cambio.h) b.h = cambio.h;
    if (cambio.c) b.c = cambio.c.slice();
    hechos++;
  }
  map.capturasHonda = hechos;
}
