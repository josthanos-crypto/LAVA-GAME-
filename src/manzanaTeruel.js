import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';

/**
 * La manzana de los pisos blancos entre las calles Teruel, Colombia, Aragón y Parranda de los Buches (enfrente del
 * Jardín de los Presentes y de Safe), con la foto aérea y las vistas de la calle de Google de julio de 2025 por las
 * cuatro calles (solo se miran, no van dentro del juego). El mapa no tenía nada ahí: solo la foto aérea pintada en el
 * suelo. De verdad es un solo bloque de pisos que da a las cuatro calles (con un patio dentro que no se ve desde la
 * calle): blanco, el bajo y dos plantas (10 m), con el zócalo gris de las rejillas de ventilación; las ventanas con
 * las persianas de lamas marrón (cerradas casi todas, alguna abierta con el cristal y la cortina); los cuerpos curvos
 * de ventanas que salen de la pared en la primera y la segunda planta, con las ventanas de aluminio marrón; la cornisa
 * de arriba; y por Teruel, el garaje de la persiana blanca con el marco de piedra travertino y la rejilla de encima,
 * la puerta del portal de madera y cristal, los cajetines de la luz, la alarma roja y la placa de la calle en la
 * esquina de Colombia.
 */

// el contorno de la manzana, a la distancia de las aceras de las cuatro calles (de la esquina de Teruel con Parranda,
// hacia Colombia, Aragón y otra vez Parranda); cada cara con su marco y N hacia la calle
const P = [[-882.07, -169.83], [-843.24, -184.75], [-845.18, -188.73], [-854.42, -213.89], [-903.51, -218.78], [-884.07, -173.88]];
const CARAS = P.map((p, i) => marco(p, P[(i + 1) % P.length]));
const Z = 0.12, ZF = Z + 0.3, TECHO = 10.0, BLANCO = 0xf2f0ea, GRIS = 0xb4b6b4, MARRON = 0x5a3a2e, TRAVERTINO = 0xd8ccb4;
// los pisos: el antepecho de las ventanas de cada planta
const FILAS = [1.35, 4.3, 7.3];
// los cuerpos curvos de cada cara (s del centro), sacados de las vistas de la calle
const CUERPOS = [[7, 27], [], [5], [12, 35], [21], []];

/** antes de levantar la ciudad: la marca de que se monta y el bloque de la manzana, que el mapa no tenía */
export function tuneManzanaTeruel(map) {
  if (!Array.isArray(map?.buildings)) return;
  map.manzanaTeruel = true;
  const p = P.map(q => q.slice());
  p.push(p[0].slice());
  map.buildings.push({ p, h: TECHO, k: 'gen', s: 0, c: [242, 240, 234], edificioReal: true });
}

// ——— lo que se pinta en lienzo ———

/** la persiana de lamas marrón, cerrada o abierta con el cristal y la cortina en medio */
function persiana(abierta) {
  return (g, w, h) => {
    const hoja = (x0, x1) => {
      g.fillStyle = '#5a3a2e';
      g.fillRect(x0, 0, x1 - x0, h);
      g.fillStyle = '#3e2820';
      for (let y = 5; y < h - 4; y += 6) g.fillRect(x0 + 4, y, x1 - x0 - 8, 2);
      g.strokeStyle = '#6a4636';
      g.lineWidth = 3;
      g.strokeRect(x0 + 1.5, 1.5, x1 - x0 - 3, h - 3);
    };
    if (!abierta) { hoja(0, w / 2); hoja(w / 2, w); return; }
    g.fillStyle = '#3a4048';
    g.fillRect(w * 0.25, 0, w * 0.5, h);
    g.fillStyle = 'rgba(236,232,222,.7)';
    g.fillRect(w * 0.3, 2, w * 0.4, h * 0.75);
    hoja(0, w * 0.25);
    hoja(w * 0.75, w);
  };
}

/** la rejilla oscura de ventilación del zócalo */
function rejilla(g, w, h) {
  g.fillStyle = '#5a4a40';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2420';
  for (let y = 3; y < h - 2; y += 5) g.fillRect(3, y, w - 6, 2);
}

/** la persiana blanca enrollable del garaje */
function persianaGaraje(g, w, h) {
  g.fillStyle = '#e8e4da';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c8c4ba';
  for (let y = 6; y < h; y += 9) g.fillRect(0, y, w, 2);
  g.fillStyle = '#b02a2a';
  g.fillRect(w * 0.8, h * 0.94, w * 0.1, h * 0.03);
}

/** la rejilla de malla de encima del garaje */
function malla(g, w, h) {
  g.fillStyle = '#4a3a30';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(200,190,170,.7)';
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 6) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
}

/** la puerta del portal: madera marrón con cuarterones de cristal */
function portal(g, w, h) {
  g.fillStyle = '#4a2e22';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2e343a';
  for (let y = 0; y < 5; y++) for (let x = 0; x < 2; x++) g.fillRect(w * (0.12 + x * 0.42), h * (0.06 + y * 0.18), w * 0.34, h * 0.14);
  g.fillStyle = '#c8c8c4';
  g.fillRect(w * 0.88, h * 0.1, w * 0.04, h * 0.8);
}

/** la placa de la calle: «Calle TERUEL» en blanco sobre azul */
function placa(g, w, h) {
  g.fillStyle = '#1e4a9a';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f4f4f0';
  g.lineWidth = 3;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.fillStyle = '#f4f4f0';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `600 ${Math.round(h * 0.18)}px Arial, sans-serif`;
  g.fillText('CALLE', w * 0.58, h * 0.3);
  g.font = `800 ${Math.round(h * 0.36)}px Arial, sans-serif`;
  g.fillText('TERUEL', w * 0.58, h * 0.65, w * 0.75);
  g.fillStyle = '#c8a040';
  g.fillRect(w * 0.06, h * 0.25, w * 0.1, h * 0.5);
}

// ——— las piezas ———

/** un cuerpo curvo de ventanas en la primera y la segunda planta, centrado en s */
function cuerpoCurvo(k, s, w = 3.2) {
  const y0 = 3.55, y1 = 9.45, r = 0.45, sale = 0.6;
  k.box(s, y0, ZF + sale / 2 - 0.15, w - 2 * r, y1 - y0, sale + 0.3, BLANCO);
  for (const t of [s - w / 2 + r, s + w / 2 - r]) k.cyl(t, y0, ZF + sale - r, r, r, y1 - y0, BLANCO, { seg: 16 });
  for (const y of [y0 - 0.12, y1]) k.box(s, y, ZF + sale / 2 - 0.1, w + 0.1, 0.14, sale + 0.25, 0xe8e6e0);
  for (const y of [4.2, 7.2]) k.pic(s, y + 0.75, ZF + sale + 0.012, w - 1.1, 1.4, 0, 1, canvasTex(Math.round((w - 1.1) * 60), 84, cristales('#4a3428', 2, 'rgba(236,232,222,.6)')));
  k.block(s, ZF + sale / 2, w, sale);
}

/** una cara de la manzana: la pared, el zócalo con sus rejillas, las ventanas, los cuerpos curvos y la cornisa */
function cara(k, len, cuerpos, hueco = () => false) {
  const c = len / 2;
  k.box(c, 0, Z + 0.15, len, TECHO, 0.3, BLANCO);
  k.block(c, Z + 0.15, len, 0.3);
  // el canto de la esquina del principio de la cara
  k.cyl(0, 0, 0, 0.42, 0.42, TECHO, BLANCO, { seg: 10 });
  // el zócalo gris y las rejillas de ventilación
  k.box(c, 0, ZF + 0.01, len, 1.0, 0.03, GRIS);
  for (let s = 2.4; s < len - 1.5; s += 5.4) if (!hueco(s, 0)) k.pic(s, 0.42, ZF + 0.03, 1.1, 0.38, 0, 1, canvasTex(66, 24, rejilla));
  // los cuerpos curvos
  for (const s of cuerpos) cuerpoCurvo(k, s);
  // las ventanas con las persianas de lamas, por columnas
  if (len > 6) {
    const n = Math.max(1, Math.round((len - 3) / 2.7));
    const paso = (len - 3) / n;
    let i = 0;
    for (let s = 1.5 + paso / 2; s < len - 1.4; s += paso) {
      FILAS.forEach((y, f) => {
        if (f > 0 && cuerpos.some(b => Math.abs(b - s) < 2.1)) return;
        if (hueco(s, f)) return;
        i++;
        const abierta = i % 7 === 3;
        k.pic(s, y + 0.72, ZF + 0.012, 1.05, 1.45, 0, 1, canvasTex(64, 88, persiana(abierta)));
        for (const t of [s - 0.4, s + 0.4]) k.box(t, y + 1.25, ZF + 0.02, 0.03, 0.03, 0.14, 0x2a2a2a);
      });
    }
  }
  // la cornisa de arriba, un poco redondeada
  k.box(c, TECHO - 0.18, ZF + 0.08, len + 0.1, 0.18, 0.18, 0xe8e6e0);
  k.box(c, TECHO - 0.05, Z + 0.15, len + 0.1, 0.1, 0.36, 0xf4f2ee);
}

/** lo de la cara de Teruel: el garaje con su marco de travertino, el portal, los cajetines, la alarma y la placa */
function teruel(k) {
  const G = 20.5, D = 22.55;
  // el garaje: la persiana blanca, los pilares y el dintel de travertino y la rejilla de encima
  k.pic(G, 1.25, ZF + 0.012, 2.6, 2.5, 0, 1, canvasTex(160, 154, persianaGaraje));
  for (const t of [G - 1.55, G + 1.55, D + 0.75]) k.box(t, 0, ZF + 0.06, 0.45, 3.15, 0.12, TRAVERTINO);
  k.box((G - 1.8 + D + 1.0) / 2, 2.5, ZF + 0.06, D + 1.0 - (G - 1.8), 0.14, 0.14, 0xc8a882);
  k.pic(G + 0.9, 2.95, ZF + 0.02, 4.4, 0.75, 0, 1, canvasTex(264, 45, malla));
  k.box(G + 0.9, 3.3, ZF + 0.07, 4.9, 0.12, 0.14, TRAVERTINO);
  // el portal de madera y cristal con el telefonillo
  k.pic(D, 1.2, ZF + 0.012, 1.1, 2.4, 0, 1, canvasTex(66, 144, portal));
  k.box(D + 0.75, 1.3, ZF + 0.14, 0.18, 0.3, 0.04, 0xb8b8b4);
  // los cuatro cajetines de la luz y la alarma roja
  for (let i = 0; i < 4; i++) k.box(G - 4.6 + i * 0.62, 0.25, ZF + 0.08, 0.55, 0.6, 0.16, 0xece8de);
  k.cyl(G - 1.7, 3.5, ZF + 0.06, 0.16, 0.16, 0.1, 0xc83a32, { rx: Math.PI / 2, seg: 10 });
  // la placa de la calle en la esquina de Colombia
  k.pic(40.8, 2.7, ZF + 0.02, 0.7, 0.38, 0, 1, canvasTex(140, 76, placa));
}

/** se monta con lo demás de Arrecife Centro */
export function buildManzanaTeruel(scene, colliders, map) {
  if (!map?.manzanaTeruel) return null;
  const grupos = CARAS.map((M, i) => {
    const k = new Kit();
    const hueco = i === 0 ? (s, f) => f === 0 && s > 15.6 && s < 23.6 : undefined;
    cara(k, M.len, CUERPOS[i], hueco);
    if (i === 0) teruel(k);
    const g = enMarco(k, M, 'manzanaTeruel' + i, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
