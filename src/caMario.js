import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, hueco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';
import { ZF, BLANCO, pared } from './rapadurasSur.js';

/**
 * Ca'Mario hamburguesería (calle Mosta 20, Altavista, en la esquina con la calle La Majada) y el edificio entero de
 * encima, con las fotos del sitio de 2019 a 2023 y las vistas de la calle de Google de julio de 2025 (calle Mosta 1 y 20,
 * La Majada 2 y Peña del Espino 1), y la foto aérea de GRAFCAN (solo se miran, no van dentro del juego). En el mapa era la
 * punta sur del bloque genérico de 9 m que llega hasta 115 m más al norte. De verdad es un edificio blanco de dos plantas,
 * de 45,5 × 38 m, con las esquinas de Mosta en chaflán, el zócalo de granito gris, la moldura blanca entre las plantas,
 * las balconeras de barandilla blanca arriba, la cornisa y el pretil:
 * - Ca'Mario en la esquina de La Majada: los rótulos rojos («Ca'Mario · Cafetería – Churrería · Pizzería –
 *   Hamburguesería» por Mosta y «Ca'Mario» por La Majada, sin el dibujo del gallo), las cristaleras con las barandillas
 *   blancas bajas, la puerta del chaflán y la terraza cerrada roja de la acera de Mosta;
 * - por Mosta, los locales: el que se alquila con el cartel del 3x2 en la ventana, las dos puertas dobles de cristal y
 *   los escaparates grandes con los carteles de «SE ALQUILA» (sin los teléfonos);
 * - por Peña del Espino, los escaparates grandes y la puerta de cristal del portal; por La Majada, el portal blanco.
 */

// la esquina suroeste del bloque del mapa (Mosta con La Majada); hacia el este por Mosta (UE) y hacia el norte (UN)
const SO = [216.09, -1773.03];
const UE = [0.98447, 0.17554], UN = [0.17565, -0.98445];
const en = (a, b) => [SO[0] + UE[0] * a + UN[0] * b, SO[1] + UE[1] * a + UN[1] * b];
// el edificio: 45,52 m por Mosta y 38 m de fondo, con los chaflanes de 1,4 m por lado
const LM = 45.52, FONDO = 38, CH = 1.4;
const ALTO = 7.0;
const SE = en(LM, 0);
// las caras: Mosta (s = lo que hay desde la esquina de La Majada − 1,4), La Majada (s del norte al sur: s = 38 − lo que
// hay desde Mosta), Peña del Espino (s = lo que hay desde Mosta − 1,4) y los dos chaflanes
const FM = marco(en(CH, 0), en(LM - CH, 0));
const FO = marco(en(0, FONDO), en(0, CH));
const FE = marco(en(LM, CH), en(LM, FONDO));
const CO = marco(en(0, CH), en(CH, 0));
const CE = marco(en(LM - CH, 0), en(LM, CH));

const BLANCA = '#f2f0ea', ROJO = 0xd42a2a, ROJO_OSC = 0x7a1a1a, MOLDURA = 0xf4f2ec;

/** antes de levantar la ciudad: la punta sur del bloque de 9 m sale como edificio propio de dos plantas */
export function tuneCaMario(map) {
  if (!Array.isArray(map?.buildings)) return;
  const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const r = q => [+q[0].toFixed(2), +q[1].toFixed(2)];
  const b = map.buildings.find(q => !q.skip && !q.edificioReal && Array.isArray(q.p) && q.p.some(p => d(p, SO) < 0.3) && q.p.some(p => d(p, SE) < 0.3));
  if (!b) return;
  b.p = b.p.map(p => (d(p, SO) < 0.3 ? r(en(0, FONDO)) : d(p, SE) < 0.3 ? r(en(LM, FONDO)) : p));
  const p = [en(CH, 0), en(0, CH), en(0, FONDO), en(LM, FONDO), en(LM, CH), en(LM - CH, 0)].map(r);
  p.push(p[0].slice());
  map.buildings.push({ p, h: ALTO, k: 'gen', s: 0, f: [242, 240, 234], c: [196, 112, 96], edificioReal: true });
  map.caMario = true;
}

// ——— las texturas ———

const liso = color => (g, w, h) => { g.fillStyle = color; g.fillRect(0, 0, w, h); };

/** el granito gris del zócalo */
function granito(g, w, h) {
  g.fillStyle = '#8c8c8a';
  g.fillRect(0, 0, w, h);
  let sd = 41;
  const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < w * h / 12; i++) {
    g.fillStyle = rnd() < 0.5 ? 'rgba(60,60,60,.45)' : 'rgba(220,220,218,.45)';
    g.fillRect(rnd() * w, rnd() * h, 1.4, 1.4);
  }
  g.strokeStyle = 'rgba(70,70,70,.5)';
  for (let x = 24; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
}

/** el rótulo rojo de Ca'Mario: el nombre en blanco y, si se pide, lo que hacen en amarillo */
function rotuloCaMario(conLetrero) {
  return (g, w, h) => {
    g.fillStyle = '#d42a2a';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    g.fillRect(0, h * 0.9, w, h * 0.04);
    g.textBaseline = 'middle';
    g.font = `italic bold ${Math.round(h * 0.7)}px "Segoe Script", "Brush Script MT", Georgia, cursive`;
    if (!conLetrero) {
      g.textAlign = 'center';
      g.fillText("Ca'Mario", w / 2, h * 0.48, w * 0.6);
      return;
    }
    g.textAlign = 'left';
    g.fillText("Ca'Mario", w * 0.04, h * 0.48, w * 0.38);
    g.fillStyle = '#f6d24a';
    g.font = `italic ${Math.round(h * 0.28)}px Georgia, serif`;
    g.textAlign = 'center';
    g.fillText('Cafetería – Churrería', w * 0.74, h * 0.3, w * 0.44);
    g.fillText('Pizzería – Hamburguesería', w * 0.74, h * 0.66, w * 0.44);
  };
}

/** un cartel de «SE ALQUILA» (sin el teléfono) */
function seAlquila(fondo, letra) {
  return (g, w, h) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, w, h);
    g.fillStyle = letra;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `bold ${Math.round(h * 0.5)}px Arial, sans-serif`;
    g.fillText('SE ALQUILA', w / 2, h * 0.52, w * 0.9);
  };
}

/** el cartel del 3x2 de los martes, en la ventana */
function cartel3x2(g, w, h) {
  g.fillStyle = '#f4ece4';
  g.fillRect(0, 0, w, h);
  for (const [x, y] of [[0.3, 0.62], [0.7, 0.62], [0.5, 0.82]]) {
    g.fillStyle = '#e8b060';
    g.beginPath(); g.arc(w * x, h * y, w * 0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c8402a';
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * x + Math.cos(i * 1.3) * w * 0.1, h * y + Math.sin(i * 1.3) * w * 0.1, w * 0.035, 0, Math.PI * 2); g.fill(); }
  }
  g.fillStyle = '#c82a3a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `bold ${Math.round(h * 0.2)}px Arial Black, Arial, sans-serif`;
  g.fillText('3x2', w / 2, h * 0.3, w * 0.8);
  g.font = `bold ${Math.round(h * 0.08)}px Arial, sans-serif`;
  g.fillText('MARTES', w / 2, h * 0.12, w * 0.7);
}

/** una puerta doble de aluminio blanco con cristal */
function puertaCristal(g, w, h) {
  g.fillStyle = '#f0f0ec';
  g.fillRect(0, 0, w, h);
  for (const x0 of [0.06, 0.53]) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#56626c');
    gr.addColorStop(1, '#2a3036');
    g.fillStyle = gr;
    g.fillRect(w * x0, h * 0.04, w * 0.41, h * 0.92);
    g.fillStyle = 'rgba(255,255,255,.14)';
    g.fillRect(w * (x0 + 0.06), h * 0.06, w * 0.07, h * 0.88);
  }
}

/** la puerta blanca lisa del portal */
function portalBlanco(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a4048';
  g.fillRect(w * 0.6, h * 0.1, w * 0.3, h * 0.55);
  g.fillStyle = '#9a9a96';
  g.fillRect(w * 0.1, h * 0.5, w * 0.08, h * 0.03);
}

// ——— las piezas ———

/** la pared blanca, el zócalo de granito, la moldura entre las plantas, la cornisa y el pretil de una cara */
function caja(k, L) {
  pared(k, 0, L, ALTO, liso(BLANCA));
  k.box(L / 2, 0, ZF + 0.03, L, 0.9, 0.06, 0x8c8c8a);
  k.pic(L / 2, 0.45, ZF + 0.062, L, 0.9, 0, 1, canvasTex(Math.min(1024, Math.round(L * 24)), 22, granito));
  k.box(L / 2, 3.95, ZF + 0.11, L, 0.25, 0.22, MOLDURA);
  k.box(L / 2, 3.85, ZF + 0.05, L, 0.1, 0.1, MOLDURA);
  k.box(L / 2, 6.6, ZF + 0.17, L, 0.35, 0.34, MOLDURA);
  k.box(L / 2, ALTO, ZF - 0.1, L, 0.55, 0.2, BLANCO);
  k.box(L / 2, ALTO + 0.55, ZF - 0.08, L + 0.02, 0.07, 0.26, MOLDURA);
}

/** una balconera de arriba, con su barandilla blanca */
function balconera(k, s, w = 1.2) {
  const y = 4.35, h = 1.55;
  hueco(k, s, y, w, h, canvasTex(Math.round(w * 50), Math.round(h * 50), cristales('#f2f2ee', 2, 'rgba(235,232,225,.6)')), { borde: 0xf2f2ee, z: ZF });
  k.box(s, y - 0.06, ZF + 0.12, w + 0.2, 0.06, 0.24, MOLDURA);
  const zr = ZF + 0.2;
  k.box(s, y + 0.9, zr, w + 0.1, 0.05, 0.05, BLANCO);
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 0.12) k.box(s + x, y, zr, 0.025, 0.9, 0.025, BLANCO);
}

/** un escaparate grande de cristal oscuro, encima del zócalo */
function escaparate(k, s, w, y0 = 0.9, y1 = 3.1) {
  const h = y1 - y0;
  hueco(k, s, y0, w, h, canvasTex(Math.min(512, Math.round(w * 40)), Math.round(h * 40), cristales('#f0f0ec', Math.max(1, Math.round(w / 1.8)), 'rgba(60,70,80,.18)')), { borde: 0xf0f0ec, z: ZF + 0.06 });
}

/** una puerta de cristal con su montante */
function puertaConMontante(k, s, w) {
  hueco(k, s, 0, w, 2.4, canvasTex(Math.round(w * 50), 120, puertaCristal), { borde: 0xf0f0ec, z: ZF + 0.06 });
  hueco(k, s, 2.5, w, 0.6, canvasTex(Math.round(w * 50), 30, cristales('#f0f0ec', 2, 'rgba(60,70,80,.2)')), { borde: 0xf0f0ec, z: ZF + 0.06 });
}

/** la barandilla blanca baja de delante de las cristaleras de Ca'Mario */
function barandillaBaja(k, s, w) {
  const z = ZF + 0.18;
  k.box(s, 1.2, z, w, 0.05, 0.05, BLANCO);
  k.box(s, 0.92, z, w, 0.04, 0.05, BLANCO);
  for (let x = -w / 2; x <= w / 2 + 0.01; x += 0.1) k.box(s + x, 0.92, z, 0.025, 0.28, 0.025, BLANCO);
}

/** la terraza cerrada roja de la acera de Mosta: los paños rojos de abajo, los de plástico de arriba y los postes */
function terraza(k, s0, s1, fondo) {
  const H = 2.2, z0 = ZF + 0.05, z1 = ZF + fondo;
  const tramos = Math.round((s1 - s0) / 1.35);
  for (let i = 0; i <= tramos; i++) k.box(s0 + (s1 - s0) * i / tramos, 0, z1, 0.08, H, 0.08, ROJO_OSC);
  for (const s of [s0, s1]) for (const z of [z0 + (z1 - z0) / 2]) k.box(s, 0, z, 0.08, H, 0.08, ROJO_OSC);
  k.box((s0 + s1) / 2, 0, z1, s1 - s0, 0.85, 0.03, ROJO);
  k.box((s0 + s1) / 2, 0.85, z1, s1 - s0, H - 0.95, 0.02, 0xd6c8c0);
  k.box((s0 + s1) / 2, H - 0.1, z1, s1 - s0 + 0.08, 0.1, 0.1, ROJO_OSC);
  for (const s of [s0, s1]) {
    k.box(s, 0, (z0 + z1) / 2, 0.03, 0.85, z1 - z0, ROJO);
    k.box(s, 0.85, (z0 + z1) / 2, 0.02, H - 0.95, z1 - z0, 0xd6c8c0);
    k.box(s, H - 0.1, (z0 + z1) / 2, 0.1, 0.1, z1 - z0, ROJO_OSC);
  }
  k.block((s0 + s1) / 2, (z0 + z1) / 2, s1 - s0, z1 - z0);
}

/** la cara de Mosta: Ca'Mario con su terraza, los locales que se alquilan y los escaparates grandes */
function caraMosta(k) {
  const L = FM.len, s = a => a - CH;
  caja(k, L);
  // Ca'Mario: las cristaleras, la rejilla, el rótulo largo y la terraza cerrada
  for (const [a, w] of [[3.4, 2.4], [6.2, 2.4], [9.0, 2.4]]) escaparate(k, s(a), w, 0.9, 2.5);
  k.box(s(9.8), 2.65, ZF + 0.06, 1.6, 0.3, 0.06, 0xe8e8e4);
  for (let y = 2.7; y < 2.93; y += 0.06) k.box(s(9.8), y, ZF + 0.1, 1.5, 0.02, 0.02, 0xb8b8b4);
  k.box(s(6.25), 3.0, ZF + 0.08, 9.5, 0.66, 0.12, ROJO);
  k.pic(s(6.25), 3.33, ZF + 0.142, 9.4, 0.62, 0, 1, canvasTex(940, 62, rotuloCaMario(true)));
  terraza(k, s(3.0), s(11.0), 2.3);
  // el local que se alquila y el cartel del 3x2 en su ventana
  puertaConMontante(k, s(13.05), 1.65);
  k.pic(s(13.05), 2.15, ZF + 0.1, 0.6, 0.22, 0, 1, canvasTex(60, 22, seAlquila('#f2d02a', '#1a1a1a')));
  hueco(k, s(14.95), 0.9, 1.8, 2.0, canvasTex(72, 80, cartel3x2), { borde: 0xf0f0ec, z: ZF + 0.06 });
  // las dos puertas dobles y los escaparates grandes del resto
  puertaConMontante(k, s(19.26), 1.82);
  puertaConMontante(k, s(21.43), 1.9);
  escaparate(k, s(26.6), 5.7);
  k.pic(s(27.6), 1.9, ZF + 0.1, 1.1, 0.45, 0, 1, canvasTex(110, 45, seAlquila('#c8282a', '#ffffff')));
  puertaConMontante(k, s(31.0), 1.8);
  escaparate(k, s(36.0), 5.0);
  escaparate(k, s(41.6), 4.2);
  k.pic(s(42.4), 1.9, ZF + 0.1, 1.1, 0.45, 0, 1, canvasTex(110, 45, seAlquila('#c8282a', '#ffffff')));
  // arriba, las balconeras de dos en dos
  balconera(k, s(2.8));
  for (let c = 8.15; c < LM - 3; c += 5.9) for (const x of [-0.95, 0.95]) balconera(k, s(c + x));
}

/** la cara de La Majada: Ca'Mario en la esquina (rótulo, cristaleras con barandilla baja y puerta) y el portal */
function caraMajada(k) {
  const L = FO.len, s = b => FONDO - b;
  caja(k, L);
  k.box(s(7.25), 3.0, ZF + 0.08, 11.5, 0.66, 0.12, ROJO);
  k.pic(s(7.25), 3.33, ZF + 0.142, 11.4, 0.62, 0, 1, canvasTex(1024, 56, rotuloCaMario(false)));
  hueco(k, s(2.6), 0, 1.0, 2.5, canvasTex(50, 125, puertaCristal), { borde: 0xf0f0ec, z: ZF + 0.06 });
  for (const [b, w] of [[5.6, 3.6], [10.25, 2.3], [14.15, 1.9]]) {
    escaparate(k, s(b), w, 0.9, 2.9);
    barandillaBaja(k, s(b), w);
  }
  hueco(k, s(17.2), 0, 1.0, 2.4, canvasTex(50, 120, portalBlanco), { borde: 0xe8e8e4, z: ZF + 0.06 });
  k.box(s(18.4), 0.9, ZF + 0.08, 0.5, 0.65, 0.16, 0xe4e2dc);
  for (const [b, w] of [[22.5, 3.0], [31.0, 3.6]]) escaparate(k, s(b), w);
  hueco(k, s(27.0), 0, 1.0, 2.4, canvasTex(50, 120, portalBlanco), { borde: 0xe8e8e4, z: ZF + 0.06 });
  for (const b of [3.6, 6.4, 11.0, 13.7, 17.5, 22.0, 24.5, 30.0, 32.5, 36.0]) balconera(k, s(b), 1.1);
}

/** la cara de Peña del Espino: los escaparates grandes y la puerta de cristal del portal */
function caraEspino(k) {
  const L = FE.len, s = b => b - CH;
  caja(k, L);
  for (const [b, w] of [[4.0, 3.0], [8.0, 3.0], [11.4, 2.2], [13.85, 1.5], [16.15, 1.55], [21.5, 3.0], [25.5, 3.0], [29.5, 3.0], [33.5, 3.0]]) escaparate(k, s(b), w);
  k.pic(s(4.0), 1.9, ZF + 0.1, 1.1, 0.45, 0, 1, canvasTex(110, 45, seAlquila('#c8282a', '#ffffff')));
  puertaConMontante(k, s(18.6), 0.95);
  k.box(s(19.6), 1.2, ZF + 0.08, 0.14, 0.2, 0.06, 0xd8d8d4);
  for (const [b, w] of [[3.4, 1.1], [6.2, 1.1], [9.5, 1.1], [12.4, 1.1], [15.7, 0.65], [17.1, 0.65], [18.3, 0.6], [19.5, 1.1], [21.6, 1.1], [25.0, 1.1], [27.4, 1.1], [31.0, 1.1], [33.4, 1.1]]) balconera(k, s(b), w);
}

/** un chaflán: la puerta de cristal (en el de Ca'Mario, con su rótulo) y la balconera de arriba */
function chaflan(k, M, deCaMario) {
  const L = M.len;
  caja(k, L);
  hueco(k, L / 2, 0, 1.2, 2.5, canvasTex(60, 125, puertaCristal), { borde: 0xf0f0ec, z: ZF + 0.06 });
  if (deCaMario) {
    k.box(L / 2, 3.0, ZF + 0.08, L - 0.1, 0.66, 0.12, ROJO);
    k.pic(L / 2, 3.33, ZF + 0.142, L - 0.2, 0.62, 0, 1, canvasTex(180, 62, rotuloCaMario(false)));
  }
  balconera(k, L / 2, 1.0);
}

/** se monta con lo demás */
export function buildCaMario(scene, colliders, map) {
  if (!map?.caMario) return null;
  const km = new Kit(), ko = new Kit(), ke = new Kit(), kco = new Kit(), kce = new Kit();
  caraMosta(km);
  caraMajada(ko);
  caraEspino(ke);
  chaflan(kco, CO, true);
  chaflan(kce, CE, false);
  const grupos = [
    enMarco(km, FM, 'caMario', colliders),
    enMarco(ko, FO, 'caMarioMajada', colliders),
    enMarco(ke, FE, 'caMarioEspino', colliders),
    enMarco(kco, CO, 'caMarioChaflan', colliders),
    enMarco(kce, CE, 'caMarioChaflanEste', colliders),
  ];
  for (const g of grupos) scene.add(g);
  return { grupos };
}
