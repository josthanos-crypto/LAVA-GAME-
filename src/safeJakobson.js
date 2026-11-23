import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { alzarEdificio, paredAlta, ventana, medianera } from './edificioReal.js';

/**
 * Safe Tore Jakobson, la tienda de cajas de caudales para hostelería de la esquina de la calle Teruel con Colombia
 * (Colombia 58), al lado del solar del Jardín de los Presentes, con las vistas de la calle de Google de julio de 2025
 * desde las dos calles y mirando hacia arriba (solo se miran, no van dentro del juego): la casa blanca de la esquina,
 * de cuatro alturas (13,2 m y el alero; el bloque del mapa era de una planta, 4 m), con la moldura gruesa de varios
 * escalones encima del bajo; dos plantas de ventanas altas con las persianas de lamas gris oscuro (alguna ventana de
 * madera con el antepecho de tablas y alguna con la barandilla baja); la moldura de encima y la galería de madera de
 * arriba, con la fila de ventanitas, la barandilla de madera y el alero de madera con sus cabezas de viga. En el bajo,
 * por Teruel: la ventana grande de rombos de la esquina con el hueco en escalera encima, la ventana de rombos, la
 * puerta doble de cristal con la reja de rombos y el letrero de «SAFE» encima, las ventanitas estrechas de rombos,
 * la ventana alargada y el portón de tablas marrón del garaje; por Colombia: la ventanita de rombos de la esquina, la
 * puerta doble de cristal con el hueco en escalera encima, el otro letrero de «SAFE» sobre la ventana de rombos, el
 * farol, la puerta de madera oscura con su reja y, más allá, el escaparate y la puerta del final. Los cables negros
 * corren por encima del bajo. El letrero va sin el logotipo y sin los teléfonos. La pared que da al solar y la de
 * detrás son lisas.
 */

// la cara de Teruel (s 0 en la esquina de Colombia, hasta el solar en s 15,46) y la de Colombia (de sur a norte; la
// esquina en s 78,28), las dos con N hacia la calle
const T = marco([-838.17, -177.35], [-876.55, -161.31]);
const C = marco([-808, -105.12], [-838.17, -177.35]);
const ESQ = 78.28, ANCHO = 15.46, FONDO = 15.94;
const Z = 0.12, ZF = Z + 0.3, YB = 4.0, YM = 10.3, TECHO = 13.2, BLANCO = 0xf0eeea, MOLDURA = 0xe6e2da;
const MADERA = 0x6a4a30, OSCURA = 0x3a2a20;

/** antes de levantar la ciudad: la marca de que se monta y la casa a su altura */
export function tuneSafeJakobson(map) {
  map.safeJakobson = true;
  alzarEdificio(map, T, 0, ANCHO, FONDO, TECHO, [240, 238, 234]);
}

// ——— lo que se pinta en lienzo ———

/** la persiana de lamas gris oscuro, cerrada, de dos hojas */
function lamas(g, w, h) {
  g.fillStyle = '#3e403e';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a2c2a';
  for (let y = 4; y < h - 4; y += 6) g.fillRect(4, y, w - 8, 2);
  g.strokeStyle = '#4c4e4a';
  g.lineWidth = 4;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
}

/** la ventana de madera con los cristales arriba y el antepecho de tablas abajo */
function ventanaTablas(g, w, h) {
  g.fillStyle = '#6a4a30';
  g.fillRect(0, 0, w, h);
  const cielo = g.createLinearGradient(0, 0, 0, h * 0.55);
  cielo.addColorStop(0, '#5a6a78');
  cielo.addColorStop(1, '#2e363e');
  g.fillStyle = cielo;
  g.fillRect(w * 0.06, h * 0.05, w * 0.88, h * 0.5);
  g.strokeStyle = '#6a4a30';
  g.lineWidth = 4;
  for (const x of [w / 3, (2 * w) / 3]) { g.beginPath(); g.moveTo(x, h * 0.05); g.lineTo(x, h * 0.55); g.stroke(); }
  g.beginPath(); g.moveTo(0, h * 0.3); g.lineTo(w, h * 0.3); g.stroke();
  g.fillStyle = '#5a3e28';
  for (let x = w * 0.06; x < w * 0.94; x += w / 14) g.fillRect(x, h * 0.6, 2, h * 0.36);
}

/** cristal oscuro con la reja de rombos y su marco (las ventanas y puertas del bajo) */
function rombos(marcoColor, puerta) {
  return (g, w, h) => {
    g.fillStyle = '#2e3236';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.1)';
    g.fillRect(0, 0, w * 0.3, h);
    g.strokeStyle = 'rgba(190,190,180,.55)';
    g.lineWidth = 1.5;
    const p = 14;
    for (let x = -h; x < w + h; x += p) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + h, h); g.stroke();
      g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke();
    }
    g.strokeStyle = marcoColor;
    g.lineWidth = 7;
    g.strokeRect(3, 3, w - 6, h - 6);
    if (puerta) {
      g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
      g.lineWidth = 5;
      g.beginPath(); g.moveTo(0, h * 0.8); g.lineTo(w, h * 0.8); g.stroke();
    }
  };
}

/** el portón de tablas marrón del garaje, con su cerrojo */
function porton(g, w, h) {
  g.fillStyle = '#4e3a2a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#3a2a1e';
  for (let x = 6; x < w; x += 9) g.fillRect(x, 0, 2, h);
  g.strokeStyle = '#2a1e16';
  g.lineWidth = 5;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  g.fillStyle = '#8a8a86';
  g.fillRect(w * 0.47, h * 0.55, w * 0.06, h * 0.06);
}

/** la puerta de madera oscura con la reja en el cristal de arriba */
function puertaMadera(g, w, h) {
  g.fillStyle = '#3a2a20';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#2a3036';
  g.fillRect(w * 0.15, h * 0.08, w * 0.7, h * 0.45);
  g.strokeStyle = '#1a1410';
  g.lineWidth = 3;
  for (let x = w * 0.25; x < w * 0.85; x += w * 0.12) { g.beginPath(); g.moveTo(x, h * 0.08); g.lineTo(x, h * 0.53); g.stroke(); }
  g.strokeRect(w * 0.15, h * 0.6, w * 0.7, h * 0.32);
}

/** la fila de ventanitas de la galería de arriba */
function galeriaVentanas(g, w, h) {
  g.fillStyle = '#6a4a30';
  g.fillRect(0, 0, w, h);
  const n = Math.max(2, Math.round(w / 40));
  for (let i = 0; i < n; i++) {
    const x = (w / n) * i;
    const cielo = g.createLinearGradient(0, 0, 0, h);
    cielo.addColorStop(0, '#6a7a88');
    cielo.addColorStop(1, '#353d45');
    g.fillStyle = cielo;
    g.fillRect(x + 4, 4, w / n - 8, h - 8);
    g.fillStyle = 'rgba(230,226,215,.4)';
    g.fillRect(x + 4, 4, w / n - 8, h * 0.4);
  }
}

/** el letrero blanco de «SAFE», sin el logotipo ni los teléfonos */
function letrero(g, w, h) {
  g.fillStyle = '#ecebe6';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#9a968e';
  g.lineWidth = 3;
  g.strokeRect(2, 2, w - 4, h - 4);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#1e3a7a';
  g.font = `italic 800 ${Math.round(h * 0.3)}px Arial, sans-serif`;
  g.fillText('SAFE', w * 0.45, h * 0.2);
  g.font = `700 ${Math.round(h * 0.13)}px Arial, sans-serif`;
  g.fillText('CAJAS DE CAUDALES PARA HOSTELERÍA', w / 2, h * 0.45, w * 0.92);
  g.fillStyle = '#b8282a';
  g.font = `800 ${Math.round(h * 0.2)}px Georgia, serif`;
  g.fillText('TORE JAKOBSON, S.A.', w / 2, h * 0.7, w * 0.9);
}

// ——— las piezas ———

/** lo que llevan las dos fachadas: las paredes, la moldura gruesa, los cables, la moldura de arriba y la galería */
function cuerpo(k, s0, s1) {
  const c = (s0 + s1) / 2, L = s1 - s0;
  k.box(c, 0, Z + 0.15, L, YB, 0.3, BLANCO);
  k.block(c, Z + 0.15, L, 0.3);
  paredAlta(k, s0, s1, YB, TECHO, Z, BLANCO);
  // el zócalo sucio de abajo
  k.box(c, 0, ZF + 0.005, L, 0.35, 0.01, 0xd8d4cc);
  // la moldura gruesa de escalones encima del bajo
  k.box(c, YB - 0.2, ZF + 0.08, L, 0.2, 0.16, MOLDURA);
  k.box(c, YB, ZF + 0.14, L + 0.1, 0.25, 0.28, MOLDURA);
  k.box(c, YB + 0.25, ZF + 0.2, L + 0.2, 0.15, 0.4, 0xf2f0ec);
  // los cables negros corridos por debajo de la moldura
  for (const y of [3.55, 3.63]) k.box(c, y, ZF + 0.03, L, 0.03, 0.03, 0x1c1c1e);
  // la moldura de encima de la segunda planta
  k.box(c, YM, ZF + 0.08, L + 0.1, 0.3, 0.16, MOLDURA);
  // la galería de madera: la fila de ventanitas, la barandilla y el alero con sus cabezas de viga
  k.pic(c, (YM + 0.5 + TECHO - 0.2) / 2, ZF + 0.01, L - 0.2, TECHO - YM - 0.7, 0, 1, canvasTex(Math.round(L * 30), 64, galeriaVentanas));
  k.box(c, YM + 0.3, ZF + 0.1, L, 0.06, 0.12, MADERA);
  k.box(c, YM + 1.25, ZF + 0.14, L, 0.07, 0.1, MADERA);
  for (let x = s0 + 0.2; x <= s1 - 0.1; x += 0.22) k.box(x, YM + 0.36, ZF + 0.14, 0.04, 0.9, 0.04, MADERA);
  k.box(c, TECHO, Z + 0.15, L + 0.6, 0.14, 1.2, OSCURA);
  for (let x = s0 + 0.3; x < s1; x += 0.7) k.box(x, TECHO - 0.12, ZF + 0.35, 0.1, 0.12, 0.5, MADERA);
}

/** una ventana alta de las dos plantas: la persiana de lamas, la de madera con tablas o la de cristal con barandilla */
function ventanaAlta(k, s, y, tipo) {
  if (tipo === 'tablas') {
    k.pic(s, y + 0.95, ZF + 0.012, 1.3, 1.9, 0, 1, canvasTex(90, 130, ventanaTablas));
  } else if (tipo === 'barandilla') {
    ventana(k, s, y, 0.9, 1.9, Z, { carpinteria: '#3a2a20', alfeizar: MOLDURA });
    k.box(s, y + 0.62, ZF + 0.1, 1.0, 0.04, 0.05, 0x1c1c1e);
    for (let x = s - 0.45; x <= s + 0.46; x += 0.1) k.box(x, y, ZF + 0.1, 0.02, 0.62, 0.02, 0x1c1c1e);
  } else {
    k.pic(s, y + 0.95, ZF + 0.012, 0.85, 1.9, 0, 1, canvasTex(60, 130, lamas));
  }
  k.box(s, y - 0.06, ZF + 0.04, (tipo === 'tablas' ? 1.3 : 0.9) + 0.16, 0.06, 0.12, MOLDURA);
}

/** la fachada de Teruel, de la esquina de Colombia (s 0) al solar */
function teruel(k) {
  cuerpo(k, 0, ANCHO);
  // el canto de la esquina, donde se juntan las dos fachadas
  k.box(-0.21, 0, 0.21, 0.42, TECHO, 0.42, BLANCO);
  // la ventana grande de rombos de la esquina, con el hueco en escalera encima
  k.pic(1.85, 1.55, ZF + 0.012, 2.3, 2.1, 0, 1, canvasTex(230, 210, rombos('#3a2a20', false)));
  for (let i = 0; i < 3; i++) k.box(1.0 + i * 0.6, 2.85 + i * 0.12, ZF + 0.01, 0.6 + (2 - i) * 0.0, 0.36 - i * 0.12, 0.02, 0x3a3e42);
  // la ventana de rombos, la puerta doble de cristal con el letrero encima y las ventanitas de los lados
  k.pic(6.7, 1.5, ZF + 0.012, 1.6, 1.7, 0, 1, canvasTex(160, 170, rombos('#3a2a20', false)));
  k.pic(9.2, 1.25, ZF + 0.012, 0.6, 2.5, 0, 1, canvasTex(60, 250, rombos('#f2f0ec', false)));
  k.pic(10.55, 1.25, ZF + 0.012, 1.64, 2.5, 0, 1, canvasTex(164, 250, rombos('#2a2018', true)));
  k.pic(11.95, 1.25, ZF + 0.012, 0.5, 2.5, 0, 1, canvasTex(50, 250, rombos('#f2f0ec', false)));
  k.box(10.5, 2.75, ZF + 0.02, 1.62, 0.66, 0.03, 0xecebe6);
  k.pic(10.5, 3.08, ZF + 0.036, 1.62, 0.66, 0, 1, canvasTex(260, 106, letrero));
  // la ventana alargada encima del portón y el portón de tablas del garaje
  k.pic(13.9, 3.05, ZF + 0.012, 1.8, 0.75, 0, 1, canvasTex(180, 75, rombos('#e8e6e0', false)));
  k.pic(14.0, 1.15, ZF + 0.012, 2.05, 2.3, 0, 1, canvasTex(205, 230, porton));
  k.box(14.0, 2.3, ZF + 0.03, 2.15, 0.08, 0.06, MOLDURA);
  // las dos plantas: las ventanas altas en sus columnas
  for (const y of [YB + 1.1, YB + 4.1]) {
    ventanaAlta(k, 3.4, y, y > 6 ? 'barandilla' : 'lamas');
    ventanaAlta(k, 7.6, y, 'lamas');
    ventanaAlta(k, 11.25, y, 'lamas');
    ventanaAlta(k, 13.4, y, 'lamas');
  }
  // las paredes lisas: la que da al solar (por encima de la del solar) y la de detrás
  medianera(k, ANCHO + 0.07, YB, TECHO, FONDO, Z, 0xe8e6e0);
  k.box(ANCHO / 2, YB, -FONDO - 0.07, ANCHO, TECHO - YB, 0.12, 0xe8e6e0);
}

/** la fachada de Colombia, de su final (s 62,34) a la esquina de Teruel (s 78,28) */
function colombia(k) {
  const s0 = ESQ - FONDO, d = x => ESQ - x;
  cuerpo(k, s0, ESQ);
  // la ventanita de rombos de la esquina y la puerta doble de cristal con el hueco en escalera encima
  k.pic(d(0.75), 1.25, ZF + 0.012, 0.55, 2.5, 0, 1, canvasTex(55, 250, rombos('#f2f0ec', false)));
  k.pic(d(2.13), 1.25, ZF + 0.012, 1.6, 2.5, 0, 1, canvasTex(160, 250, rombos('#2a2018', true)));
  for (let i = 0; i < 3; i++) k.box(d(1.45) - i * 0.5, 2.8 + i * 0.13, ZF + 0.01, 0.55, 0.42 - i * 0.13, 0.02, 0x3a3e42);
  // el letrero de «SAFE» encima de la ventana de rombos, y el farol
  k.box(d(4.1), 2.7, ZF + 0.02, 1.62, 0.66, 0.03, 0xecebe6);
  k.pic(d(4.1), 3.03, ZF + 0.036, 1.62, 0.66, 0, 1, canvasTex(260, 106, letrero));
  k.pic(d(4.65), 1.45, ZF + 0.012, 1.7, 1.6, 0, 1, canvasTex(170, 160, rombos('#3a2a20', false)));
  k.box(d(3.0), 1.9, ZF + 0.08, 0.12, 0.25, 0.12, 0x2a2a2c);
  // la puerta de madera oscura, el escaparate y la puerta del final
  k.pic(d(6.95), 1.2, ZF + 0.012, 1.25, 2.4, 0, 1, canvasTex(125, 240, puertaMadera));
  k.pic(d(9.8), 1.5, ZF + 0.012, 2.4, 1.8, 0, 1, canvasTex(240, 180, rombos('#3a2a20', false)));
  k.pic(d(13.8), 1.2, ZF + 0.012, 1.3, 2.4, 0, 1, canvasTex(130, 240, puertaMadera));
  // las dos plantas
  for (const y of [YB + 1.1, YB + 4.1]) {
    ventanaAlta(k, d(1.1), y, 'lamas');
    ventanaAlta(k, d(4.1), y, 'lamas');
    ventanaAlta(k, d(7.3), y, y > 6 ? 'barandilla' : 'tablas');
    ventanaAlta(k, d(10.6), y, 'lamas');
    ventanaAlta(k, d(13.7), y, 'tablas');
  }
}

/** se monta con lo demás de Arrecife Centro */
export function buildSafeJakobson(scene, colliders, map) {
  if (!map?.safeJakobson) return null;
  const kt = new Kit();
  teruel(kt);
  const gt = enMarco(kt, T, 'safeTeruel', colliders);
  scene.add(gt);
  const kc = new Kit();
  colombia(kc);
  const gc = enMarco(kc, C, 'safeColombia', colliders);
  scene.add(gc);
  return { group: gt, colombia: gc };
}
