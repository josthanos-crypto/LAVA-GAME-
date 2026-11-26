/**
 * (Version 177) Playa Honda, retoques con las capturas de Look Around del PC de casa (carpeta «Downloads\recursos lava
 * game 2026-11-24 web casa\playa_honda»: 880 fotos de 110 calles, 8 por calle; solo se miran, no van dentro del juego).
 * El pueblo ya estaba hecho calle a calle (calles.js, calles2.js, resto.js). Se miraron las 88 calles que caen dentro
 * del barrio, cada foto con su brújula (arriba a la derecha dice hacia dónde mira: N, S, E, O). Casi todas confirman lo
 * que había: casas blancas de dos plantas con muro blanco. Aquí va solo lo que las fotos enseñan distinto, y solo donde
 * se sabe de qué lado de la calle es: el color o la altura de un edificio que ya estaba, sin moverlo ni partirlo.
 * Cada línea: [punto de dentro del edificio (x, z), { f: color de fachada, h: alto, c: color de la azotea }].
 * A ojo: qué casas exactas de Tomás Bretón son las crema, y hasta dónde llega la fila de tejados rojos de Bergantín.
 * (Version 178) Los rótulos de los negocios que confirmó José Manuel el 26-11-2026 (`ROTULOS`): solo el nombre, sobre la
 * fachada que ya había; su sitio a lo largo de la calle es aproximado. Y se quitó el amarillo del bloque de Princesa
 * Ico de la 177: ese edificio es el blanco de Boanva y Don Rafa (los bloques crema están pasado el cruce y no salen en
 * el mapa).
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
  // Bocaina, acera oeste (fotos 4396-4399): casas viejas de pescadores, de una planta (el patrón las ponía de dos)
  [-3521.4, 1128.9, { h: 4.0 }],
  [-3518.9, 1142.9, { h: 4.0 }],
  [-3516.7, 1156.9, { h: 4.0 }],
  // La Plazoleta, acera sur (fotos 4384-4391): casas viejas de una planta
  [-3485.4, 1224.9, { h: 4.0 }],
  [-3493.7, 1219.6, { h: 4.0 }],
];

// rótulos sueltos: [nombre, x, z, normal hacia la calle (x, z), tipo]
const ROTULOS = [
  ['Mesón Pleamar', -3572.9, 971.0, -0.985, 0.173, 'food'],
  ['Atlántico Autocentros', -3922.2, 399.0, 0.102, 0.995, 'gen'],
  ['GM Cash', -4356.6, 460.5, 0.999, 0.042, 'super'],
  ['Cegrisa', -3526.3, 486.7, 0.995, -0.100, 'retail'],
  ['Milar', -3577.8, 397.2, 0.994, -0.110, 'tech'],
  ['Oviedo-Miranda Dental Clinic', -4129.7, 1042.9, -1.000, 0.009, 'gen'],
  ['Boanva', -3663.0, 837.6, 0.988, -0.155, 'retail'],
  ['Don Rafa', -3661.9, 844.5, 0.989, -0.151, 'food'],
  ['Jeep', -4502.6, 495.3, -0.999, -0.044, 'retail'],
  ['Graficame', -4500.6, 440.3, -0.999, -0.044, 'gen'],
  ['Azulejos Insulares', -4801.4, 407.8, -0.992, 0.125, 'retail'],
  ['Centro de Salud de Playa Honda', -4136.0, 1008.5, 0.000, 1.000, 'gen'],
  ['El Concord', -4599.5, 957.5, 1.000, 0.000, 'gen'],
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
  if (!Array.isArray(map.signs)) map.signs = [];
  const ya = new Set(map.signs.map(s => s.name));
  let rotulos = 0;
  for (const [name, x, z, nx, nz, k] of ROTULOS) {
    if (ya.has(name)) continue;
    map.signs.push({ x, z, nx, nz, name, k });
    rotulos++;
  }
  map.capturasHonda = hechos;
  map.rotulosHonda = rotulos;
}
