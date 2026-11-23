import * as THREE from 'three';
import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco, sombrillaGrande } from './restaurantesCharco.js';

/**
 * La Vela Café, en el centro comercial de la Marina Lanzarote, con la foto de Google Maps de noviembre de
 * 2025 (solo se mira, no va dentro del juego): la fachada de hormigón gris con sus chorreones, el logo
 * redondo blanco con «La Vela» en turquesa y «Café» en naranja con su espiral, la cristalera de perfiles
 * oscuros con la franja de arriba llena de dibujos turquesa (gofre, cruasán, helado, sándwich, taza) y
 * «Pasión por lo bueno!» dentro, y la terraza cerrada con mamparas de cristal de marco blanco redondeado
 * («La Vela» pegado en una), las dos sombrillas blancas grandes y las mesas con sus sillas. La cara del
 * bloque donde cae el rótulo del mapa mira hacia dentro del edificio: la cafetería da a la plaza del
 * noroeste. El bloque se queda como está.
 */

// la cara que da a la plaza (s desde el extremo del norte); el rótulo del mapa cae en s 18,4
const V = marco([1127.71, -28.4], [1112.77, -1.9]);
const Z = 0.12, S0 = 13.4, S1 = 23.4, ALTO = 5.2, GRIS = 0x9a9a96, PERFIL = 0x3a3e42, BLANCO = 0xf4f4f0;
const TURQUESA = '#1aa8a8', NARANJA = '#f0783a';

/** antes de levantar la ciudad: fuera el rótulo genérico */
export function tuneLaVela(map) {
  map.laVelaSign = null;
  const i = (map.signs || []).findIndex(s => s.name === 'La Vela');
  if (i >= 0) map.laVelaSign = map.signs.splice(i, 1)[0];
  map.laVela = true;
}

// ——— lo que se pinta en lienzo ———

/** el hormigón gris con los chorreones de agua de lluvia */
function hormigon(g, w, h) {
  g.fillStyle = '#a2a29e';
  g.fillRect(0, 0, w, h);
  let s = 19;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 1500; i++) { const v = 130 + r() * 50; g.fillStyle = `rgba(${v},${v},${v - 4},.35)`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.strokeStyle = 'rgba(80,80,76,.35)';
  for (let i = 0; i < 60; i++) {
    g.lineWidth = 1 + r() * 1.5;
    const x = r() * w;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 6, h * (0.2 + r() * 0.4)); g.stroke();
  }
  g.fillStyle = 'rgba(70,70,66,.4)';
  g.fillRect(0, h * 0.02, w, 3);
}

/** el logo: «La Vela» en turquesa, la espiral naranja y «Café» */
function logo(g, w, h) {
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = TURQUESA;
  g.font = `italic 700 ${Math.round(h * 0.17)}px "Segoe Script", Georgia, serif`;
  g.fillText('La', w * 0.38, h * 0.2);
  g.font = `italic 700 ${Math.round(h * 0.36)}px "Segoe Script", Georgia, serif`;
  g.fillText('Vela', w * 0.42, h * 0.5);
  g.strokeStyle = NARANJA;
  g.lineWidth = h * 0.025;
  g.beginPath();
  for (let a = 0; a < Math.PI * 4; a += 0.2) { const rr = h * 0.01 * a; const x = w * 0.86 + Math.cos(a) * rr, y = h * 0.5 + Math.sin(a) * rr; a ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  g.fillStyle = NARANJA;
  g.font = `italic 700 ${Math.round(h * 0.2)}px "Segoe Script", Georgia, serif`;
  g.fillText('Café', w * 0.55, h * 0.8);
}

/** la franja de cristal de arriba con los dibujos turquesa */
function franjaDibujos(g, w, h) {
  g.fillStyle = '#c8d8dc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = TURQUESA;
  g.fillStyle = TURQUESA;
  g.lineWidth = h * 0.05;
  const n = 9, paso = w / n;
  for (let i = 0; i < n; i++) {
    const x = paso * (i + 0.5), y = h * 0.5, t = h * 0.28;
    switch (i % 6) {
      case 0: g.strokeRect(x - t, y - t, t * 2, t * 2); for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(x + k * t * 0.6, y - t); g.lineTo(x + k * t * 0.6, y + t); g.moveTo(x - t, y + k * t * 0.6); g.lineTo(x + t, y + k * t * 0.6); g.stroke(); } break;
      case 1: g.beginPath(); g.ellipse(x, y, t * 1.4, t * 0.7, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(x - t * 0.5, y - t * 0.6); g.lineTo(x - t * 0.3, y + t * 0.6); g.moveTo(x + t * 0.5, y - t * 0.6); g.lineTo(x + t * 0.3, y + t * 0.6); g.stroke(); break;
      case 2: g.beginPath(); g.moveTo(x - t * 0.6, y - t * 0.1); g.lineTo(x, y + t * 1.1); g.lineTo(x + t * 0.6, y - t * 0.1); g.closePath(); g.stroke(); g.beginPath(); g.arc(x, y - t * 0.4, t * 0.6, Math.PI, 0); g.stroke(); break;
      case 3: g.beginPath(); g.moveTo(x - t, y + t * 0.8); g.lineTo(x, y - t * 0.9); g.lineTo(x + t, y + t * 0.8); g.closePath(); g.stroke(); break;
      case 4: g.font = `italic 700 ${Math.round(h * 0.45)}px "Segoe Script", Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Vela', x, y); break;
      default: g.strokeRect(x - t * 0.7, y - t * 0.6, t * 1.2, t * 1.4); g.beginPath(); g.arc(x + t * 0.6, y, t * 0.35, -Math.PI / 2, Math.PI / 2); g.stroke(); break;
    }
  }
}

/** por el cristal de abajo: el café por dentro, oscuro de reflejos, con la barra, las mesas y la frase */
function dentro(frase) {
  return (g, w, h) => {
    g.fillStyle = '#4a4e52';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#d8d0c0';
    g.fillRect(0, h * 0.12, w, h * 0.5);
    g.fillStyle = '#b08a5a';
    g.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.25);
    g.fillStyle = '#5a4a3a';
    for (let x = 0.12; x < 0.9; x += 0.03) g.fillRect(w * x, h * 0.57, w * 0.008, h * 0.22);
    g.fillStyle = '#3a3a3c';
    g.fillRect(0, h * 0.8, w, h * 0.2);
    if (frase) {
      g.fillStyle = '#1a1a1c';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.font = `italic 700 ${Math.round(h * 0.07)}px "Segoe Script", Georgia, serif`;
      g.fillText('Pasión por lo bueno!', w / 2, h * 0.28);
    }
    const rf = g.createLinearGradient(0, 0, w, h);
    rf.addColorStop(0, 'rgba(200,220,230,.35)');
    rf.addColorStop(0.5, 'rgba(60,70,80,.25)');
    rf.addColorStop(1, 'rgba(200,220,230,.3)');
    g.fillStyle = rf;
    g.fillRect(0, 0, w, h);
  };
}

/** «La Vela» en la placa baja de la mampara (en la foto va pegado en el cristal) */
function placaMampara(g, w, h) {
  g.fillStyle = '#e8eef0';
  g.fillRect(0, 0, w, h);
  g.fillStyle = TURQUESA;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.6)}px "Segoe Script", Georgia, serif`;
  g.fillText('La Vela', w / 2, h * 0.52);
}

// ——— las piezas ———

/** la fachada: el hormigón gris, el logo redondo y la cristalera */
function fachada(k) {
  const sm = (S0 + S1) / 2, yC = 3.3;
  k.box(sm, 0, Z - 0.05, S1 - S0, ALTO, 0.1, GRIS);
  k.pic(sm, (yC + ALTO) / 2, Z + 0.004, S1 - S0, ALTO - yC, 0, 1, canvasTex(640, 122, hormigon));
  // la cristalera: los cristales de abajo, la franja de los dibujos y los perfiles oscuros
  const a = S0 + 0.3, b = S1 - 0.3, cols = 4, paso = (b - a) / cols;
  for (let i = 0; i < cols; i++) {
    const s0 = a + paso * i, s1 = s0 + paso;
    k.pic((s0 + s1) / 2, 1.3, Z + 0.01, paso, 2.6, 0, 1, canvasTex(160, 168, dentro(i === 3)), { glow: 0.05 });
  }
  k.pic((a + b) / 2, 2.95, Z + 0.01, b - a, 0.7, 0, 1, canvasTex(900, 70, franjaDibujos), { glow: 0.04 });
  for (let i = 0; i <= cols; i++) k.box(a + paso * i, 0, Z + 0.04, 0.09, yC, 0.1, PERFIL);
  for (const y of [0, 2.58, yC - 0.06]) k.box((a + b) / 2, y, Z + 0.04, b - a, 0.07, 0.1, PERFIL);
  // la rejilla y la lucecita negra de encima de la cristalera
  k.box(S0 + 1.6, yC + 0.12, Z + 0.02, 0.4, 0.22, 0.04, 0xe0e0dc);
  k.box(S1 - 3.0, yC + 0.05, Z + 0.06, 0.18, 0.24, 0.12, 0x1a1a1c);
  // el logo redondo blanco
  const r = 0.68, sL = S0 + 4.0, yL = 4.25;
  const disco = new THREE.CylinderGeometry(r, r, 0.06, 36);
  disco.rotateX(Math.PI / 2);
  disco.translate(sL, yL, Z + 0.03);
  k.add(disco, 0xffffff);
  k.pic(sL, yL, Z + 0.065, r * 1.4, r * 1.4, 0, 1, canvasTex(160, 160, logo));
}

/** una mampara de cristal de la terraza, con su marco blanco y la placa baja */
function mampara(k, s0, s1, d, conNombre) {
  const g = new THREE.PlaneGeometry(s1 - s0 - 0.1, 0.95);
  g.translate((s0 + s1) / 2, 0.68, d);
  k.glass.push(g);
  k.box((s0 + s1) / 2, 0.02, d, s1 - s0, 0.18, 0.05, BLANCO);
  k.box((s0 + s1) / 2, 1.16, d, s1 - s0, 0.05, 0.06, BLANCO);
  for (const s of [s0 + 0.03, s1 - 0.03]) k.box(s, 0, d, 0.06, 1.2, 0.06, BLANCO);
  if (conNombre) for (const n of [1, -1]) k.pic((s0 + s1) / 2, 0.11, d + n * 0.03, s1 - s0 - 0.2, 0.14, 0, n, canvasTex(160, 16, placaMampara));
}

/** la terraza cerrada: las mamparas, las dos sombrillas, las mesas y las sillas */
function terraza(k) {
  const d = 3.4, s0 = S0 + 0.4, s1 = S1 - 1.9;
  const n = 4, paso = (s1 - s0) / n;
  for (let i = 0; i < n; i++) mampara(k, s0 + paso * i, s0 + paso * (i + 1), d, i === 1);
  k.block((s0 + s1) / 2, d, s1 - s0, 0.12);
  // la mampara del lado, de la fachada a la de delante
  const g = new THREE.PlaneGeometry(d - 0.5, 0.95);
  g.rotateY(Math.PI / 2);
  g.translate(s0, 0.68, (d + 0.4) / 2);
  k.glass.push(g);
  k.box(s0, 0.02, (d + 0.4) / 2, 0.05, 0.18, d - 0.4, BLANCO);
  k.box(s0, 1.16, (d + 0.4) / 2, 0.06, 0.05, d - 0.4, BLANCO);
  k.block(s0, (d + 0.4) / 2, 0.12, d - 0.4);
  // las dos sombrillas blancas grandes
  for (const s of [S0 + 2.6, S0 + 6.3]) sombrillaGrande(k, s, 1.9, 0xf2f0ea);
  // las mesas redondas y las sillas grises de mimbre
  for (const [s, z] of [[S0 + 1.4, 1.1], [S0 + 3.6, 2.4], [S0 + 5.3, 1.1], [S0 + 7.4, 2.4]]) {
    k.table(s, z, { w: 0.7, round: true, top: 0xe8e8e4, leg: 0x3a3a3c });
    k.chair(s - 0.55, z, Math.PI / 2, 0x8a8478);
    k.chair(s + 0.55, z, -Math.PI / 2, 0x8a8478);
  }
}

/** se monta con lo demás de Valterra, en su primera fase */
export function buildLaVela(scene, colliders, map) {
  if (!map?.laVela) return null;
  const k = new Kit();
  fachada(k);
  terraza(k);
  const group = enMarco(k, V, 'laVela', colliders);
  scene.add(group);
  return { group };
}
