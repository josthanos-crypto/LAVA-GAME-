import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, WHITE } from './restaurantesCharco.js';

/**
 * El Hotel Lancelot, en la avenida Mancomunidad, delante de la playa del Reducto, sacado de la foto de la
 * playa de su web en Google Maps (solo se mira, no va dentro del juego). La fachada de la playa: la planta
 * baja de cristal, cinco plantas de logias (los balcones metidos, con los antepechos blancos macizos, los
 * forjados y las aletas que salen) y, en la punta del este, el paño blanco liso con el logo azul y
 * «Hotel Lancelot»; arriba, la planta retranqueada. El mapa trae el bloque (21,7 m) con su forma: se deja
 * como está y se le pone la fachada por delante y la planta de arriba encima.
 */

// la fachada de la playa, de la esquina oeste a la este (z hacia la avenida, al sur)
const S = marco([-573.5, 464.0], [-546.8, 473.0]);
const PB = 4.2, PISO = 3.0, PISOS = 5, H = 21.7;
// las logias van de s 0,3 a 19, en seis vanos; el paño del logo, de 19 a la esquina
const L0 = 0.3, L1 = 19.0, VANOS = 6, FONDO = 0.9;

/** antes de levantar la ciudad: fuera el rótulo genérico del mapa (se pone el de la fachada) */
export function tuneHotelLancelot(map) {
  map.hotelLancelotSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'Lancelot Playa');
  if (i >= 0) map.hotelLancelotSign = map.signs.splice(i, 1)[0];
  map.hotelLancelot = true;
}

// ——— lo que se pinta en lienzo ———

/** el fondo de una logia: la pared en sombra, la puerta de cristal del cuarto con su cortina y el aplique */
function fondoLogia(seed) {
  return (g, w, h) => {
    let s = seed;
    const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    g.fillStyle = '#b9bcbb';
    g.fillRect(0, 0, w, h);
    const sombra = g.createLinearGradient(0, 0, 0, h);
    sombra.addColorStop(0, 'rgba(40,48,52,.55)');
    sombra.addColorStop(1, 'rgba(40,48,52,.15)');
    g.fillStyle = sombra;
    g.fillRect(0, 0, w, h);
    // la puerta corredera de cristal con la cortina, más o menos corrida
    const x0 = w * 0.18, cw = w * 0.64;
    g.fillStyle = '#2c383e';
    g.fillRect(x0, h * 0.12, cw, h * 0.88);
    g.fillStyle = r() < 0.5 ? '#e8e2d2' : '#d8e2e6';
    g.fillRect(x0 + 4, h * 0.14, cw * (0.3 + r() * 0.5), h * 0.84);
    g.fillStyle = '#d6d8d6';
    g.fillRect(x0 + cw / 2 - 2, h * 0.12, 4, h * 0.88);
    g.fillRect(x0 - 3, h * 0.1, cw + 6, 5);
  };
}

/** la planta baja: cristal oscuro con montantes y las columnas blancas */
function plantaBaja(g, w, h) {
  g.fillStyle = '#2f3b40';
  g.fillRect(0, 0, w, h);
  const luz = g.createLinearGradient(0, 0, 0, h);
  luz.addColorStop(0, 'rgba(230,240,245,.25)');
  luz.addColorStop(1, 'rgba(230,240,245,.05)');
  g.fillStyle = luz;
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#c4c8ca';
  for (let x = 0; x <= w; x += w / 12) g.fillRect(x - 1, 0, 3, h);
  g.fillRect(0, h * 0.78, w, 3);
}

/** el logo del hotel: el símbolo azul redondo, «Hotel Lancelot» y la línea de debajo */
function logo(g, w, h) {
  // el fondo un poco más gris que el blanco de la pared, para que no se note el cuadro
  g.fillStyle = '#e6e5e0';
  g.fillRect(0, 0, w, h);
  const cx = w / 2, cy = h * 0.32, r = h * 0.2;
  // el símbolo: dos medias lunas que se abrazan, en azul
  g.fillStyle = '#1f4fa0';
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e6e5e0';
  g.beginPath(); g.arc(cx + r * 0.32, cy - r * 0.18, r * 0.62, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1f4fa0';
  g.beginPath(); g.arc(cx + r * 0.1, cy + r * 0.05, r * 0.42, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e6e5e0';
  g.beginPath(); g.arc(cx - r * 0.1, cy + r * 0.2, r * 0.22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1b3f80';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `500 ${Math.round(h * 0.16)}px "Segoe UI", Arial, sans-serif`;
  g.fillText('Hotel Lancelot', w / 2, h * 0.7);
  g.fillRect(w * 0.42, h * 0.84, w * 0.16, 2);
}

// ——— las piezas ———

/** la fachada de la playa, en el marco S */
function fachada(k) {
  const anchoVano = (L1 - L0) / VANOS;
  // la planta baja de cristal y su marquesina blanca a lo largo
  k.pic((L0 + L1) / 2, PB / 2, 0.06, L1 - L0, PB - 0.3, 0, 1, canvasTex(1024, 160, plantaBaja));
  k.box((L0 + L1) / 2, PB - 0.3, 0.6, L1 - L0, 0.3, 1.2, WHITE);
  for (let i = 0; i <= VANOS; i++) k.box(L0 + i * anchoVano, 0, 0.3, 0.35, PB, 0.35, WHITE);
  // las logias: el fondo de cada una, el forjado que sale, el antepecho macizo y las aletas entre vanos
  for (let p = 0; p < PISOS; p++) {
    const y = PB + p * PISO;
    for (let v = 0; v < VANOS; v++) {
      const s = L0 + (v + 0.5) * anchoVano;
      k.pic(s, y + PISO / 2, 0.06, anchoVano - 0.2, PISO - 0.25, 0, 1, canvasTex(128, 128, fondoLogia(7 + p * 13 + v * 31)));
      k.box(s, y, FONDO - 0.06, anchoVano - 0.2, 1.0, 0.12, WHITE);
    }
    k.box((L0 + L1) / 2, y - 0.12, FONDO / 2 + 0.05, L1 - L0 + 0.3, 0.24, FONDO, WHITE);
    for (let i = 0; i <= VANOS; i++) k.box(L0 + i * anchoVano, y, FONDO / 2 + 0.05, 0.22, PISO, FONDO, WHITE);
  }
  // el remate de arriba de las logias, con la baranda de la terraza
  const yTop = PB + PISOS * PISO;
  k.box((L0 + L1) / 2, yTop - 0.12, FONDO / 2 + 0.05, L1 - L0 + 0.3, 0.3, FONDO, WHITE);
  k.box((L0 + L1) / 2, yTop + 0.18, FONDO, L1 - L0 + 0.3, 1.0, 0.1, WHITE);
  // el paño blanco liso de la punta del este, que sale como las logias, con el logo
  const P0 = L1, P1 = S.len;
  k.box((P0 + P1) / 2, PB - 0.3, FONDO / 2 + 0.05, P1 - P0, H - PB + 0.3, FONDO + 0.1, WHITE);
  k.pic((P0 + P1) / 2, PB + 8.6, FONDO + 0.11, 5.4, 3.6, 0, 1, canvasTex(540, 360, logo));
  k.pic((P0 + P1) / 2, PB / 2, 0.06, P1 - P0, PB - 0.3, 0, 1, canvasTex(512, 160, plantaBaja));
  // la planta de arriba retranqueada, encima del bloque del mapa
  k.box(11.0, H, -4.5, 17.0, 2.8, 6.0, WHITE);
  for (let s = 3.5; s < 19; s += 2.6) k.pic(s, H + 1.3, -1.48, 1.6, 1.8, 0, 1, canvasTex(96, 112, fondoLogia(99 + s * 7)));
  k.box(11.0, H + 2.8, -4.5, 17.4, 0.15, 6.4, 0xe2e2de);
}

/** segunda fase, como los demás de este barrio */
export function buildHotelLancelot(scene, colliders, map) {
  if (!map?.hotelLancelot) return null;
  const k = new Kit();
  fachada(k);
  const group = enMarco(k, S, 'hotelLancelot', colliders);
  scene.add(group);
  return { group };
}
