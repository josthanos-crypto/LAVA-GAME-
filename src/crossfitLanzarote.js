import { byVisit, pick, poster } from './localesCommon.js';

/**
 * Crossfit Lanzarote por dentro (Calle Polca, Arrecife): el "box" de Oliver, con la persiana de la entrada subida.
 *
 * (Version 170) Rehecho mirando dos fotos reales del interior publicadas por La Voz de Lanzarote (26-04-2022,
 * «Emprender en el mundo del CrossFit…»; vistas el 24-11-2026 desde el PC de Arrecife, solo como referencia: no se
 * usan como textura). De ahí sale: la nave larga con techo a dos aguas de vigas blancas y lucernarios, las paredes
 * blancas con una franja roja ancha y ventanas altas, el suelo de goma negro con marcas de cinta roja y blanca, las
 * banderas de países colgadas del techo, la jaula de dominadas negra en medio, los cajones de madera, los remos y
 * las bicis de aire a la derecha, el cuerpo azul de la oficina y el paño verde del fondo.
 * A ojo: las medidas (la nave real es mayor), cuántas máquinas hay y dónde está cada una.
 * Ahora la puerta de salida se ve: el hueco de la persiana con la luz de la calle, el cajón de la persiana arriba
 * y el cartel verde de SALIDA (antes la pared de la entrada era un hueco de 8 m sin nada).
 *
 * Es una recreación para el juego: no hay horarios, precios, nombres de entrenadores ni datos reales del negocio
 * inventados (solo el nombre del local, que es el del rótulo de la calle).
 *
 * Medidas (metros del interior): una nave x −10…10, z 0…32. La entrada está en el lado sur (z = 32), en el centro.
 */

const ROJO = 0xd1261c, NEGRO = 0x1a1a1c, ACERO = 0xb8bcc0, GRIS = 0x8a8e92, MADERA = 0xd9b77e, AZUL = 0x1f5fa8;
const BLANCO = 0xf2f2f0;
const ANCHO = 10, FONDO = 32, ALERO = 5, CUMBRERA = 6.6;
const PI2 = Math.PI / 2;

const PIELES = [0xf0cfb0, 0xe2b896, 0xc89a72, 0x9a6a4a, 0xe8c4a2];
const PELOS = [0x1e1712, 0x3a2a1c, 0x6a4a2a, 0x101010];

function atleta(i, top, extra = {}) {
  const f = i % 2 === 0;
  return {
    sex: f ? 'f' : 'm', skin: PIELES[i % PIELES.length], hair: PELOS[i % PELOS.length],
    hairStyle: f ? pick(['ponytail', 'bun']) : pick(['short', 'rapado']), beard: false,
    top, topStyle: 'tshirt', bottom: 0x1e2024, bottomStyle: 'shorts', shoes: 0xf4f4f2, shoeStyle: 'sneaker',
    height: f ? 1.66 : 1.82, ...extra,
  };
}

const wod = (h) => { h.heal(); h.addMinutes(45); h.toast('Una clase de crossfit · salud al 100%'); };

// ── banderas (dibujadas a mano, sencillas) ──
const franjasV = (...c) => (g, W, H) => c.forEach((col, i) => { g.fillStyle = col; g.fillRect(W * i / c.length, 0, W / c.length + 1, H); });
const franjasH = (...c) => (g, W, H) => c.forEach((col, i) => { g.fillStyle = col; g.fillRect(0, H * i / c.length, W, H / c.length + 1); });
const cruz = (fondo, color) => (g, W, H) => {
  g.fillStyle = fondo; g.fillRect(0, 0, W, H);
  g.fillStyle = color; g.fillRect(W * 0.28, 0, W * 0.14, H); g.fillRect(0, H * 0.41, W, H * 0.18);
};
const BANDERAS = [
  franjasH('#111111', '#dd0000', '#ffce00'),                 // Alemania
  cruz('#c8102e', '#ffffff'),                                  // Dinamarca
  (g, W, H) => {                                               // España
    g.fillStyle = '#c60b1e'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffc400'; g.fillRect(0, H * 0.25, W, H * 0.5);
  },
  franjasH('#0057b7', '#ffd700'),                             // Ucrania
  franjasV('#009246', '#ffffff', '#ce2b37'),                  // Italia
  franjasV('#ffffff', '#0768a9', '#ffcc00'),                  // Canarias
  (g, W, H) => {                                               // Suiza
    g.fillStyle = '#da291c'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#ffffff'; g.fillRect(W * 0.43, H * 0.2, W * 0.14, H * 0.6); g.fillRect(W * 0.3, H * 0.4, W * 0.4, H * 0.2);
  },
  cruz('#006aa7', '#fecc00'),                                  // Suecia
  franjasV('#0055a4', '#ffffff', '#ef4135'),                  // Francia
  (g, W, H) => {                                               // Reino Unido (simplificada)
    g.fillStyle = '#012169'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#ffffff'; g.lineWidth = H * 0.16;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, H); g.moveTo(W, 0); g.lineTo(0, H); g.stroke();
    g.fillStyle = '#ffffff'; g.fillRect(W * 0.4, 0, W * 0.2, H); g.fillRect(0, H * 0.34, W, H * 0.32);
    g.fillStyle = '#c8102e'; g.fillRect(W * 0.44, 0, W * 0.12, H); g.fillRect(0, H * 0.41, W, H * 0.18);
  },
  (g, W, H) => {                                               // Estados Unidos (simplificada)
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#b22234'; g.fillRect(0, H * i / 7, W, H / 7 + 1); }
    g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, W * 0.42, H * 0.57);
  },
  (g, W, H) => {                                               // Brasil (simplificada)
    g.fillStyle = '#009b3a'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#fedf00'; g.beginPath(); g.moveTo(W / 2, H * 0.1); g.lineTo(W * 0.9, H / 2); g.lineTo(W / 2, H * 0.9); g.lineTo(W * 0.1, H / 2); g.fill();
    g.fillStyle = '#002776'; g.beginPath(); g.arc(W / 2, H / 2, H * 0.2, 0, Math.PI * 2); g.fill();
  },
  franjasV('#006600', '#006600', '#ff0000', '#ff0000', '#ff0000'), // Portugal (simplificada)
  franjasV('#000000', '#fdda24', '#ef3340'),                  // Bélgica
  franjasH('#ae1c28', '#ffffff', '#21468b'),                  // Países Bajos
  franjasV('#169b62', '#ffffff', '#ff883e'),                  // Irlanda
];

// ── piezas del gimnasio ──
/** barra tumbada a lo largo de x, con el centro en (x, y, z) */
const barraX = (k, x, y, z, largo, r, hex, seg = 8) => k.cyl(x - largo / 2, y, z, r, r, largo, hex, { seg, rx: PI2, ry: PI2 });
/** barra tumbada a lo largo de z, con el centro en (x, y, z) */
const barraZ = (k, x, y, z, largo, r, hex, seg = 8) => k.cyl(x, y, z - largo / 2, r, r, largo, hex, { seg, rx: PI2 });

/** barra olímpica en el suelo con un disco de goma a cada lado */
function barraConDiscos(k, x, z, color) {
  barraX(k, x, 0.225, z, 2.2, 0.014, ACERO);
  for (const s of [-1, 1]) barraX(k, x + s * 0.86, 0.225, z, 0.07, 0.225, color, 16);
}

function cajon(k, x, z, ry = 0, alto = 0.6) {
  k.box(x, 0, z, 0.76, alto, 0.51, MADERA, { ry });
  k.block(x, z, 0.76, 0.51, ry);
}

/** remo: el raíl, el volante delante (z menor), el asiento y la pantalla */
function remo(k, x, z) {
  k.box(x, 0.2, z + 0.25, 0.09, 0.06, 1.9, ACERO);
  k.box(x, 0, z + 1.15, 0.42, 0.2, 0.07, NEGRO);
  k.box(x, 0, z - 0.75, 0.52, 0.06, 0.09, NEGRO);
  barraX(k, x, 0.42, z - 0.72, 0.13, 0.27, NEGRO, 18);          // el volante
  barraX(k, x, 0.42, z - 0.72, 0.15, 0.1, GRIS, 12);
  k.box(x, 0.06, z - 0.5, 0.06, 0.36, 0.3, NEGRO);
  k.box(x, 0.42, z - 0.42, 0.04, 0.5, 0.04, NEGRO);              // el brazo de la pantalla
  k.box(x, 0.9, z - 0.42, 0.2, 0.14, 0.03, 0x24303a);
  k.box(x, 0.26, z + 0.45, 0.3, 0.07, 0.26, NEGRO);              // el asiento
  k.box(x, 0.28, z - 0.2, 0.34, 0.03, 0.14, GRIS);               // los apoyos de los pies
  k.block(x, z + 0.2, 0.5, 2.1);
}

/** bici de aire: la rueda-ventilador delante (z menor), el sillín y los dos brazos */
function biciAire(k, x, z) {
  k.box(x, 0, z, 0.5, 0.05, 1.2, NEGRO);
  barraX(k, x, 0.45, z - 0.3, 0.1, 0.34, 0x2a2c30, 20);
  barraX(k, x, 0.45, z - 0.3, 0.12, 0.3, 0x55595e, 20);
  barraX(k, x, 0.45, z - 0.3, 0.14, 0.07, NEGRO, 10);
  k.box(x, 0.05, z + 0.3, 0.07, 0.82, 0.07, NEGRO);
  k.box(x, 0.87, z + 0.3, 0.24, 0.06, 0.28, NEGRO);
  for (const s of [-1, 1]) {
    k.box(x + s * 0.2, 0.3, z - 0.05, 0.04, 0.95, 0.04, GRIS);
    barraZ(k, x + s * 0.2, 1.25, z + 0.02, 0.2, 0.02, NEGRO);
  }
  k.box(x, 1.0, z - 0.12, 0.2, 0.13, 0.03, 0x24303a);
  k.block(x, z, 0.6, 1.3);
}

function kettlebell(k, x, y, z, r = 0.11, hex = NEGRO) {
  k.ball(x, y + r, z, r, hex);
  k.box(x, y + r * 1.75, z, r * 1.1, r * 0.75, 0.03, hex);
}

/** cuadro de cinta en el suelo (el sitio de cada uno en la clase) */
function cintaSuelo(k, x, z, lado, hex) {
  const g = 0.05, y = 0.004;
  for (const s of [-1, 1]) {
    k.box(x, y, z + s * lado / 2, lado, 0.006, g, hex, { list: k.shell });
    k.box(x + s * lado / 2, y, z, g, 0.006, lado, hex, { list: k.shell });
  }
}

function nave(k, THREE) {
  k.room(-ANCHO, 0, ANCHO, FONDO, {
    h: CUMBRERA, floor: 'goma', wall: 0xeeeeea, ceil: 0x8c8f92, base: 0x2a2c30, lights: null,
    open: { s: [[ANCHO - 1.6, ANCHO + 1.6, 'hole']] },
  });

  // ── el techo a dos aguas: los paneles, las vigas blancas, los pilares y los lucernarios ──
  const pend = Math.atan2(CUMBRERA - ALERO, ANCHO), largo = Math.hypot(ANCHO, CUMBRERA - ALERO);
  const inclinada = (w, h, d, s, bajo, z) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateZ(-s * pend);
    g.translate(s * ANCHO / 2, (ALERO + CUMBRERA) / 2 - bajo, z);
    return g;
  };
  for (const s of [-1, 1]) {
    k.add(inclinada(largo + 0.1, 0.06, FONDO, s, 0, FONDO / 2), 0xdcdedb, { list: k.shell });
    for (let z = 2; z < FONDO; z += 4) {
      k.add(inclinada(largo, 0.32, 0.2, s, 0.22, z), BLANCO);
      k.box(s * (ANCHO - 0.14), 0, z, 0.26, ALERO, 0.26, BLANCO);
    }
    // correas a lo largo de la nave
    for (const f of [0.25, 0.5, 0.75]) k.box(s * ANCHO * f, ALERO + (CUMBRERA - ALERO) * (1 - f) - 0.16, FONDO / 2, 0.08, 0.1, FONDO, BLANCO);
    // lucernarios: tramos de techo por donde entra la luz
    for (const z of [8, 16, 24]) k.add(inclinada(3.2, 0.03, 2.6, s, 0.05, z), 0xfff6dc, { list: k.glow });
  }
  // focos colgados, a lo largo de las dos mitades
  for (const z of [4, 12, 20, 28]) for (const x of [-4.5, 4.5]) k.pendant(x, z, 5.85, { drop: 1.0, shade: 0x2a2c30, r: 0.3, bulb: 0xfff0d0 });

  // ── las paredes: el zócalo gris, la franja roja y las ventanas altas ──
  const zocalo = 0xd6d6d2;
  for (const s of [-1, 1]) {
    k.box(s * (ANCHO - 0.012), 0, FONDO / 2, 0.02, 2.45, FONDO, zocalo, { list: k.shell });
    k.box(s * (ANCHO - 0.02), 2.45, FONDO / 2, 0.03, 0.95, FONDO, ROJO, { list: k.shell });
    for (const z of [4, 12, 20, 28]) {
      k.box(s * (ANCHO - 0.02), 3.75, z, 0.03, 0.8, 2.2, 0xe4eef4, { list: k.glow });
      k.box(s * (ANCHO - 0.03), 3.7, z, 0.05, 0.05, 2.3, GRIS);
      k.box(s * (ANCHO - 0.03), 4.55, z, 0.05, 0.05, 2.3, GRIS);
    }
  }
  k.box(0, 0, 0.012, ANCHO * 2, 2.45, 0.02, zocalo, { list: k.shell });
  k.box(0, 2.45, 0.02, ANCHO * 2, 0.95, 0.03, ROJO, { list: k.shell });
  for (const s of [-1, 1]) {
    k.box(s * (ANCHO + 1.9) / 2, 0, FONDO - 0.012, ANCHO - 1.9, 2.45, 0.02, zocalo, { list: k.shell });
    k.box(s * (ANCHO + 1.9) / 2, 2.45, FONDO - 0.02, ANCHO - 1.9, 0.95, 0.03, ROJO, { list: k.shell });
  }
}

function puertaSalida(k, canvasTex) {
  const z = FONDO, w = 3.2, h = 2.7;
  // la calle al otro lado de la persiana: la claridad del día, la acera y la calzada
  k.pic(0, h / 2, z + 0.42, w + 0.3, h, 0, -1, canvasTex(256, 216, (g, W, H) => {
    const cielo = g.createLinearGradient(0, 0, 0, H * 0.62);
    cielo.addColorStop(0, '#cfe6f7'); cielo.addColorStop(1, '#f4f8fb');
    g.fillStyle = cielo; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e9e4d8'; g.fillRect(0, H * 0.34, W, H * 0.3);           // las casas de enfrente
    g.fillStyle = '#b9b3a4'; g.fillRect(0, H * 0.62, W, H * 0.03);
    g.fillStyle = '#7d8084'; g.fillRect(0, H * 0.65, W, H * 0.17);          // la calzada
    g.fillStyle = '#c9c6bd'; g.fillRect(0, H * 0.82, W, H * 0.18);          // la acera
    g.fillStyle = '#a9a69d'; g.fillRect(0, H * 0.82, W, H * 0.015);
  }), { glow: 0.45 });
  // el marco negro (con fondo, para que no se vea el hueco de lado) y el cajón de la persiana enrollada
  for (const s of [-1, 1]) k.box(s * (w / 2 + 0.06), 0, z + 0.2, 0.12, h + 0.1, 0.5, NEGRO);
  k.box(0, h, z + 0.2, w + 0.24, 0.1, 0.5, NEGRO);
  k.box(0, h + 0.02, z - 0.16, w + 0.3, 0.4, 0.3, 0x9a9ea2);
  for (let i = 0; i < 4; i++) k.box(0, h + 0.07 + i * 0.09, z - 0.32, w + 0.3, 0.02, 0.02, 0x7c8084);
  for (const s of [-1, 1]) k.box(s * (w / 2 + 0.02), 0, z - 0.05, 0.06, h, 0.06, 0x9a9ea2);   // las guías
  // el cartel de salida, la franja de aviso en el suelo y el felpudo
  k.pic(0, 3.5, z - 0.04, 1.5, 0.48, 0, -1, canvasTex(300, 96, (g, W, H) => {
    g.fillStyle = '#12843b'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.strokeRect(5, 5, W - 10, H - 10);
    g.fillStyle = '#ffffff'; g.font = '800 54px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('SALIDA', W / 2, H / 2 + 3);
  }), { glow: 0.8 });
  k.box(0, 0.003, z - 0.12, w, 0.004, 0.16, NEGRO, { list: k.shell });
  for (let i = 0; i < 8; i++) k.box(-w / 2 + 0.2 + i * 0.4, 0.004, z - 0.12, 0.2, 0.006, 0.16, 0xf2c21a, { list: k.shell });
  k.rug(0, z - 0.95, 2.4, 1.1, 0, 0x33363a);
  // no se pasa al otro lado: se sale con la tecla, como en los demás locales
  k.seg(-w / 2, z + 0.3, w / 2, z + 0.3);
  k.seg(-w / 2, z, -w / 2, z + 0.3);
  k.seg(w / 2, z, w / 2, z + 0.3);
}

function rotulos(k, canvasTex) {
  const cartel = poster({ bg: '#1a1a1c', fg: '#ffffff', title: 'CROSSFIT LANZAROTE', accent: '#d1261c' });
  // el rótulo grande del fondo, por encima de la franja roja
  k.pic(1.5, 4.2, 0.03, 7, 1.0, 0, 1, canvasTex(1024, 146, cartel), { glow: 0.3 });
  // las lonas negras sobre la franja de los lados
  for (const z of [8, 20]) k.pic(-ANCHO + 0.05, 2.92, z, 2.4, 0.6, 1, 0, canvasTex(512, 128, cartel));
  k.pic(ANCHO - 0.05, 2.92, 12, 2.4, 0.6, -1, 0, canvasTex(512, 128, cartel));
  // el paño verde del fondo, con un levantador pintado
  k.pic(-6.6, 1.9, 0.05, 5.2, 3.6, 0, 1, canvasTex(416, 288, (g, W, H) => {
    g.fillStyle = '#2f8f3e'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#1f6a2c'; g.strokeStyle = '#1f6a2c'; g.lineCap = 'round';
    const cx = W / 2;
    g.beginPath(); g.arc(cx, H * 0.36, H * 0.07, 0, Math.PI * 2); g.fill();                 // la cabeza
    g.lineWidth = H * 0.12; g.beginPath(); g.moveTo(cx, H * 0.46); g.lineTo(cx, H * 0.7); g.stroke();   // el tronco
    g.lineWidth = H * 0.07;
    g.beginPath(); g.moveTo(cx - W * 0.03, H * 0.72); g.lineTo(cx - W * 0.09, H * 0.95); g.moveTo(cx + W * 0.03, H * 0.72); g.lineTo(cx + W * 0.09, H * 0.95); g.stroke();
    g.beginPath(); g.moveTo(cx - W * 0.04, H * 0.47); g.lineTo(cx - W * 0.17, H * 0.2); g.moveTo(cx + W * 0.04, H * 0.47); g.lineTo(cx + W * 0.17, H * 0.2); g.stroke();
    g.lineWidth = H * 0.03; g.beginPath(); g.moveTo(cx - W * 0.34, H * 0.18); g.lineTo(cx + W * 0.34, H * 0.18); g.stroke();  // la barra
    for (const s of [-1, 1]) g.fillRect(cx + s * W * 0.3 - W * 0.02, H * 0.06, W * 0.04, H * 0.24);
  }));
  // la pizarra del WOD (solo el formato; nada de datos reales), en la pared de la izquierda
  k.pic(-ANCHO + 0.05, 1.35, 12, 3.4, 1.7, 1, 0, canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#d1261c'; g.fillRect(0, 0, W, 46);
    g.fillStyle = '#fff'; g.font = '800 34px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('WOD DEL DÍA', W / 2, 24);
    g.fillStyle = '#111'; g.font = '700 28px Arial'; g.textAlign = 'left';
    ['AMRAP 12 MIN', '10 Sentadillas con balón', '8 Dominadas', '6 Burpees', 'Remo 250 m'].forEach((l, i) => g.fillText(l, 22, 84 + i * 36));
  }));
  k.box(-ANCHO + 0.06, 0.44, 12, 0.05, 0.04, 3.5, GRIS);
  // el altavoz
  k.box(-ANCHO + 0.3, 3.0, 4, 0.4, 0.6, 0.4, NEGRO);
}

function banderas(k, canvasTex) {
  let n = 0;
  for (const z of [6.5, 11.5, 16.5, 21.5]) {
    k.box(0, 5.02, z, 15, 0.012, 0.012, 0x55595e);   // el cable
    for (const x of [-6, -3, 0, 3, 6]) {
      const tex = canvasTex(96, 64, BANDERAS[n++ % BANDERAS.length]);
      k.pic(x, 4.66, z, 0.96, 0.64, 0, 1, tex);
      k.pic(x, 4.66, z - 0.03, 0.96, 0.64, 0, -1, tex);
    }
  }
}

function equipo(k) {
  // ── la jaula de dominadas negra, suelta en medio de la nave (a lo largo) ──
  const JX = [2.0, 3.8], JZ = [8, 10, 12, 14, 16, 18];
  for (const x of JX) {
    for (const z of JZ) k.box(x, 0, z, 0.08, 2.75, 0.08, NEGRO);
    for (const z of JZ) k.block(x, z, 0.14, 0.14);
    k.box(x, 2.7, 13, 0.08, 0.08, 10.1, NEGRO);
  }
  for (const z of JZ) barraX(k, 2.9, 2.5, z, 1.8, 0.018, 0x2a2c30);        // las barras de dominadas
  for (const x of [2.55, 3.25]) {                                           // anillas
    k.box(x, 1.75, 18, 0.02, 0.75, 0.02, 0xd8cfa8);
    barraX(k, x, 1.66, 18, 0.03, 0.11, MADERA, 12);
  }
  k.cyl(2.2, 0.3, 8, 0.035, 0.035, 2.2, 0xc8a46a, { seg: 6 });               // la cuerda de trepar
  // soportes de sentadilla en la jaula, con la barra puesta
  for (const z of [10, 14]) {
    barraZ(k, 1.86, 1.42, z + 1, 2.2, 0.014, ACERO);
    for (const s of [-1, 1]) {
      barraZ(k, 1.86, 1.42, z + 1 + s * 0.86, 0.07, 0.225, z > 12 ? ROJO : NEGRO, 16);
      k.box(1.9, 1.36, z + 1 + s, 0.16, 0.05, 0.05, NEGRO);
    }
    k.block(1.86, z + 1, 0.3, 2.3);
  }

  // ── a la derecha: remos y bicis de aire en filas ──
  for (const z of [7, 10, 13]) for (const x of [6.3, 7.7]) remo(k, x, z);
  for (const z of [16.4, 18.6, 20.8]) for (const x of [6.4, 7.8]) biciAire(k, x, z);
  // esquís de pared (dos torres) al fondo a la derecha
  for (const x of [6.2, 7.6]) {
    k.box(x, 0, 0.45, 0.5, 0.05, 0.7, NEGRO);
    k.box(x, 0, 0.3, 0.12, 2.1, 0.12, NEGRO);
    k.box(x, 1.7, 0.42, 0.34, 0.4, 0.16, 0x2a2c30);
    k.block(x, 0.45, 0.5, 0.7);
  }

  // ── a la izquierda: la zona de la clase, con cajones, barras y discos ──
  for (const [x, z, ry] of [[-8.6, 9, 0], [-7.4, 6.2, 0.3], [-5.2, 9.6, PI2], [-3.4, 6.4, 0.1], [-6.4, 12.6, PI2], [-8.8, 20.6, 0], [-2.2, 23.2, 0.5]]) cajon(k, x, z, ry);
  cajon(k, -8.9, 3.2, 0, 0.75); cajon(k, -7.9, 3.2, 0, 0.5); cajon(k, -7.0, 3.2, 0, 0.6);
  for (const [x, z, c] of [[-2.6, 22.0, NEGRO], [-8.0, 14.4, ROJO], [-3.2, 12.2, 0x2a5fb0]]) barraConDiscos(k, x, z, c);
  // discos sueltos en el suelo
  for (const [x, z, c] of [[-4.4, 14.6, NEGRO], [-0.8, 15.2, 0x2a5fb0], [-7.6, 15.4, ROJO], [-0.6, 21.4, NEGRO]]) k.cyl(x, 0, z, 0.225, 0.225, 0.06, c, { seg: 16 });
  // los cuadros de cinta roja y blanca
  for (const [x, z] of [[-6, 17.6], [-2.6, 17.6], [-6, 20.4], [-2.6, 20.4]]) cintaSuelo(k, x, z, 2.2, 0xe8e8e4);
  for (const [x, z] of [[0.2, 24.5], [4.6, 22.6]]) cintaSuelo(k, x, z, 1.3, ROJO);

  // ── la pared de la izquierda: discos apilados, kettlebells, balones y el banco ──
  for (let i = 0; i < 5; i++) {
    const z = 23.6 + i * 0.62;
    k.box(-9.55, 0, z, 0.5, 0.06, 0.5, GRIS);
    for (let j = 0; j < 4 + (i % 3); j++) k.cyl(-9.55, 0.06 + j * 0.065, z, 0.225, 0.225, 0.06, [NEGRO, ROJO, 0x2a5fb0, 0xe0b020, NEGRO, 0x3a8a4a][(i + j) % 6], { seg: 16 });
  }
  k.block(-9.55, 24.85, 0.6, 3.2);
  k.box(-9.5, 0, 17.6, 0.5, 0.45, 3.4, GRIS);
  k.box(-9.5, 0.45, 17.6, 0.54, 0.04, 3.4, 0x2a2c30);
  for (let i = 0; i < 7; i++) kettlebell(k, -9.5, 0.49, 16.2 + i * 0.46, 0.1 + (i % 3) * 0.015, [NEGRO, 0x2a5fb0, ROJO][i % 3]);
  k.block(-9.5, 17.6, 0.6, 3.5);
  // la estantería de balones medicinales
  for (const z of [27.4, 29.8]) k.box(-9.6, 0, z, 0.45, 1.6, 0.05, 0x2a2c30);
  for (let j = 0; j < 3; j++) {
    k.box(-9.6, 0.04 + j * 0.52, 28.6, 0.45, 0.04, 2.4, 0x2a2c30);
    for (let i = 0; i < 4; i++) k.ball(-9.6, 0.25 + j * 0.52, 27.7 + i * 0.6, 0.17, [NEGRO, ROJO, 0x2a5fb0, 0x3a8a4a][(i + j) % 4]);
  }
  k.block(-9.6, 28.6, 0.5, 2.5);
  // el cubo de magnesio
  k.cyl(0.9, 0, 19.2, 0.2, 0.17, 0.42, BLANCO, { seg: 12 });
  k.cyl(0.9, 0.42, 19.2, 0.18, 0.18, 0.02, 0xfafafa, { seg: 12 });
  k.block(0.9, 19.2, 0.4, 0.4);

  // ── a la derecha de la entrada: el cuerpo azul de la oficina, con su ventana y su puerta ──
  k.box(8.4, 0, 27.5, 3.2, 3.1, 7, AZUL);
  k.box(6.79, 1.0, 26.4, 0.03, 1.15, 2.6, 0xdfe7ec);
  for (const z of [25.1, 26.4, 27.7]) k.box(6.77, 1.0, z, 0.05, 1.15, 0.05, BLANCO);
  k.box(6.77, 0.97, 26.4, 0.05, 0.05, 2.65, BLANCO); k.box(6.77, 2.13, 26.4, 0.05, 0.05, 2.65, BLANCO);
  k.box(6.79, 0, 29.6, 0.03, 2.1, 0.95, 0xe9e9e6);
  k.box(6.76, 1.0, 29.9, 0.05, 0.12, 0.04, ACERO);
  k.block(8.4, 27.5, 3.2, 7);
  // el banco y los casilleros junto a la entrada
  k.box(-4.6, 0.42, 31.5, 4.2, 0.06, 0.42, MADERA);
  for (const x of [-6.4, -4.6, -2.8]) k.box(x, 0, 31.5, 0.06, 0.42, 0.38, NEGRO);
  k.block(-4.6, 31.5, 4.2, 0.5);
  k.box(-8.4, 0, 31.6, 2.4, 1.9, 0.4, 0x3a3e44);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) k.box(-9.3 + i * 0.6, 0.12 + j * 0.6, 31.39, 0.5, 0.5, 0.02, [0x23262a, 0x2c3036][(i + j) % 2]);
  k.block(-8.4, 31.6, 2.4, 0.5);
}

/** la barra con discos que levanta la gente de la clase: va cogida al brazo derecho, a la altura de las manos */
function conBarra(color) {
  return (p, THREE) => {
    const barra = new THREE.Group();
    const acero = new THREE.MeshStandardMaterial({ color: ACERO, roughness: 0.35, metalness: 0.6 });
    const goma = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const eje = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.9, 8), acero);
    eje.rotation.z = PI2;
    barra.add(eje);
    for (const s of [-1, 1]) {
      const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 14), goma);
      disco.rotation.z = PI2; disco.position.x = s * 0.8;
      barra.add(disco);
    }
    // en el centro del cuerpo (el hombro derecho está a +x) y al final del brazo estirado
    barra.position.set(-p.armR.position.x, -0.6, 0.02);
    barra.rotation.z = -0.12;   // el brazo va algo abierto: la barra queda recta
    p.armR.add(barra);
  };
}

function gente() {
  return [
    {
      name: 'Entrenador', at: [-1.6, 27.4], face: 0, pose: 'stand', detail: 1, look: atleta(1, ROJO, { bottom: 0x101010 }),
      greet: () => '¡Pasa, pasa! ¿Vienes a probar?',
      talk: byVisit([
        (c) => [{ who: 'Entrenador', text: 'Aquí se entrena en grupo: calentamos, hacemos la técnica y luego el WOD.' }, { who: c.me, text: '¿Y si no he hecho crossfit nunca?', player: true }, { who: 'Entrenador', text: 'Todo se escala. Se empieza con lo que puedas y se va subiendo.' }],
        (c) => [{ who: 'Entrenador', text: 'Si quieres un reto, fuera tengo un WOD de calle: tres puntos por el barrio y vuelta aquí.' }, { who: c.me, text: '¿Dónde te encuentro?', player: true }, { who: 'Entrenador', text: 'En la acera, a unos pasos de la puerta.' }],
      ]),
      offer: {
        label: 'Clase de crossfit', price: 0, apply: wod,
        talk: (c) => [{ who: c.me, text: 'Me apunto a una clase.', player: true }, { who: 'Entrenador', text: '¡Vamos! Calienta, que empezamos ya.' }],
      },
    },
    // colgados de la jaula
    { name: '', at: [2.9, 10], face: 0, pose: 'pullup', detail: 1, look: atleta(2, 0xe8e8e4) },
    { name: '', at: [2.9, 16], face: 0, pose: 'pullup', detail: 1, look: atleta(3, 0x2c4f86) },
    // la clase: cada uno en su cuadro, con la barra por encima de la cabeza
    { name: '', at: [-6, 18.2], face: 0, pose: 'press', detail: 1, look: atleta(4, 0x1e2024, { bottom: 0x7a2a4a }), dress: conBarra(NEGRO) },
    { name: '', at: [-2.6, 18.2], face: 0, pose: 'press', detail: 1, look: atleta(6, 0xc87a9a), dress: conBarra(ROJO) },
    { name: '', at: [-6, 21.0], face: 0, pose: 'press', detail: 1, look: atleta(5, 0x3a3c42), dress: conBarra(0x2a5fb0) },
    { name: '', at: [-2.6, 21.0], face: 0, pose: 'squat', detail: 1, look: atleta(8, 0xd8271c) },
    // por la nave
    { name: '', at: [-4.2, 8.2], face: PI2, pose: 'squat', detail: 1, look: atleta(7, 0x5a8a5a) },
    { name: '', at: [-0.4, 11.4], face: -PI2, pose: 'kettle', detail: 1, look: atleta(10, 0xe0b020) },
    { name: '', at: [4.9, 20.2], face: PI2, pose: 'kettle', detail: 1, look: atleta(9, 0x1e2024) },
  ];
}

export const CROSSFIT_LANZAROTE = {
  id: 'crossfit-lanzarote',
  name: 'Crossfit Lanzarote',
  glyph: 'C',
  color: ROJO,
  // la puerta del lado corto que da a la Calle Polca (edificio del gimnasio, ~Calle Polca 2)
  door: { x: -1834.5, z: -1553.6, nx: -0.897, nz: 0.442 },
  doorWidth: 3.2,
  frameColor: 0x1a1a1c,
  ownFront: true,
  openDoor: true,
  sign: { size: [4.4, 0.9], y: 3.4, edge: 0x1a1a1c, px: [1024, 210], draw: poster({ bg: '#1a1a1c', fg: '#ffffff', title: 'CROSSFIT LANZAROTE', accent: '#d1261c' }) },
  light: { sun: 0xffffff, sunI: 1.3, hemiI: 1.1, sky: 0xe8eef2, ground: 0x7a7e82, exposure: 0.95 },
  build(k, { canvasTex, THREE }) {
    nave(k, THREE);
    puertaSalida(k, canvasTex);
    rotulos(k, canvasTex);
    banderas(k, canvasTex);
    equipo(k);
    return { spawn: [0, FONDO - 2.6, Math.PI], exit: [0, FONDO - 1.1], npcs: gente(), seats: [] };
  },
};
