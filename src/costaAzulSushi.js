import { Kit, canvasTex } from './interiorKit.js';
import { marco, enMarco } from './restaurantesCharco.js';
import { cristales } from './edificioReal.js';

/**
 * El edificio blanco de la Rambla Medular junto a la gasolinera (Valterra), el del Costa Azul Sushi (Google lo pone en
 * Pérez Galdós 96, igual que el Kyoto Ramen, que es un local pequeño de dentro y no tiene fachada a la calle), con las
 * vistas de la calle de Google de julio de 2025 y la foto aérea (solo se miran, no van dentro del juego; la gente no se
 * pone). El mapa no tenía nada ahí: solo el tejado pintado en el suelo entre la acera y la nave de detrás. De verdad es
 * un edificio de oficinas de bajo y tres plantas (14 m), forrado de placas blancas, con las ventanas corridas de marco
 * gris en grupos; en el bajo, por el lado de la gasolinera, el Costa Azul Sushi con el letrero dorado de onda blanca
 * («Costa Azul Sushi · Asiáticos · Mariscos · Planchas», sin el dibujo del delfín, que es su logotipo) y los
 * escaparates; luego la puerta del restaurante, la del portal, dos escaparates de un local vacío, el escaparate
 * forrado de mármol azul y dorado con el nombre, y la puerta de cristal del final; delante, la plataforma con la
 * barandilla blanca. En la punta del sureste, la pared ciega con dos ventanas, los armarios blancos de la luz y el
 * muro bajo con el parterre.
 */

// el contorno: la fachada de la Rambla (del noroeste, s 0, al sureste), la punta del sureste, la trasera pegada a la
// nave y la cara del noroeste, que da a la gasolinera (sacado de la foto aérea pintada en el suelo del juego)
const P = [[610.2, -587.0], [655.0, -551.5], [657.82, -565.17], [636.29, -604.6]];
const M = marco(P[0], P[1]);
const SE = marco(P[1], P[2]);
const NO = marco(P[3], P[0]);
const Z = 0.12, ZF = Z + 0.3, TECHO = 14, YB = 4.6, BLANCO = 0xf2f2ee, GRIS = 0x8a9096;
// las plantas de arriba (el antepecho de cada una) y los grupos de ventanas corridas de la fachada (centro y ancho)
const PLANTAS = [5.6, 8.7, 11.8];
const GRUPOS = [[5.5, 6.6], [14.5, 6.6], [30.5, 6.6], [39.5, 6.6], [47.5, 6.0]];

/** antes de levantar la ciudad: la marca de que se monta y el bloque del edificio, que el mapa no tenía */
export function tuneCostaAzulSushi(map) {
  if (!Array.isArray(map?.buildings)) return;
  map.costaAzulSushi = true;
  const p = P.map(q => q.slice());
  p.push(p[0].slice());
  map.buildings.push({ p, h: TECHO, k: 'gen', s: 0, c: [242, 242, 238], edificioReal: true });
}

// ——— lo que se pinta en lienzo ———

/** el forro de placas blancas, con las juntas finas un poco sueltas */
function placas(g, w, h) {
  g.fillStyle = '#f2f2ee';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(150,150,145,.35)';
  g.lineWidth = 1;
  let s = 7;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const fila = h / 7;
  for (let y = 0; y < h; y += fila) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = r() * 40; x < w; x += 40 + r() * 50) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + fila); g.stroke(); }
  }
}

/** el letrero dorado con la onda blanca por arriba y las letras blancas */
function letrero(g, w, h) {
  g.fillStyle = '#a88a4a';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#f4f2ec';
  g.beginPath();
  g.moveTo(0, 0);
  for (let x = 0; x <= w; x += 10) g.lineTo(x, h * (0.18 + 0.12 * Math.sin(x / 38) + 0.06 * Math.sin(x / 13)));
  g.lineTo(w, 0);
  g.closePath();
  g.fill();
  g.fillStyle = '#7e6634';
  g.fillRect(0, h - 4, w, 4);
  g.fillStyle = '#f8f6f0';
  g.strokeStyle = 'rgba(70,56,28,.8)';
  g.lineWidth = 2;
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `italic 800 ${Math.round(h * 0.42)}px "Segoe Script", "Brush Script MT", Georgia, serif`;
  g.strokeText('Costa Azul Sushi', w * 0.03, h * 0.6, w * 0.4);
  g.fillText('Costa Azul Sushi', w * 0.03, h * 0.6, w * 0.4);
  g.font = `italic 800 ${Math.round(h * 0.32)}px "Segoe Script", Georgia, serif`;
  for (const [t, x] of [['Asiáticos', 0.5], ['Mariscos', 0.64], ['Planchas', 0.8]]) {
    g.strokeText(t, w * x, h * 0.55, w * 0.13);
    g.fillText(t, w * x, h * 0.55, w * 0.13);
  }
}

/** el escaparate forrado de mármol blanco con vetas azules y doradas y el nombre (sin el delfín del logotipo) */
function marmol(g, w, h) {
  g.fillStyle = '#eef0f2';
  g.fillRect(0, 0, w, h);
  let s = 11;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 9; i++) {
    g.strokeStyle = i % 3 === 0 ? '#c8a050' : 'rgba(40,80,160,.6)';
    g.lineWidth = 1 + r() * 3;
    g.beginPath();
    let x = r() * w, y = r() * h;
    g.moveTo(x, y);
    for (let j = 0; j < 6; j++) { x += (r() - 0.5) * 60; y += (r() - 0.3) * 40; g.lineTo(x, y); }
    g.stroke();
  }
  const az = g.createLinearGradient(0, 0, w, h);
  az.addColorStop(0, '#2c5aa8');
  az.addColorStop(0.5, '#4a7ac8');
  az.addColorStop(1, '#1f3e8a');
  g.fillStyle = az;
  g.fillRect(w * 0.3, 0, w * 0.4, h * 0.62);
  g.strokeStyle = 'rgba(240,244,250,.7)';
  g.lineWidth = 3;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(w * (0.32 + r() * 0.3), h * r() * 0.6); g.quadraticCurveTo(w * (0.35 + r() * 0.3), h * r() * 0.6, w * (0.32 + r() * 0.36), h * r() * 0.6); g.stroke(); }
  g.fillStyle = '#2a2a2a';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 700 ${Math.round(h * 0.13)}px "Segoe Script", Georgia, serif`;
  g.fillText('Costa Azul', w / 2, h * 0.76, w * 0.5);
  g.font = `700 ${Math.round(h * 0.06)}px Arial, sans-serif`;
  g.fillText('SUSHI', w / 2, h * 0.86);
}

/** el escaparate grande: el cristal oscuro con el reflejo de la calle y el marco blanco */
function escaparate(g, w, h) {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, '#9aaab4');
  gr.addColorStop(0.55, '#5a6a74');
  gr.addColorStop(1, '#3a444a');
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.12)';
  g.fillRect(w * 0.1, 0, w * 0.15, h);
  g.fillRect(w * 0.55, 0, w * 0.06, h);
}

/** la ventana corrida de una planta: los vidrios oscuros entre los montantes grises */
function corrida(paneles) {
  return (g, w, h) => {
    g.fillStyle = '#3e4a5a';
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(200,215,230,.18)';
    g.fillRect(0, 0, w, h * 0.35);
    g.fillStyle = '#8a9096';
    const p = w / paneles;
    for (let i = 0; i <= paneles; i++) g.fillRect(Math.min(i * p, w - 4), 0, 4, h);
    g.fillRect(0, 0, w, 4);
    g.fillRect(0, h - 4, w, 4);
  };
}

// ——— las piezas ———

/** la fachada de la Rambla: el forro, las ventanas corridas, el bajo con el restaurante y la plataforma */
function fachada(k) {
  const L = M.len;
  k.box(L / 2, 0, Z + 0.15, L, TECHO, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, (YB + TECHO) / 2, ZF + 0.003, L, TECHO - YB, 0, 1, canvasTex(Math.round(L * 12), 120, placas));
  // las plantas: el vierteaguas blanco de cada una y los grupos de ventanas corridas
  for (const y of PLANTAS) {
    for (const [s, w] of GRUPOS) {
      k.pic(s, y + 0.85, ZF + 0.01, w, 1.5, 0, 1, canvasTex(Math.round(w * 30), 45, corrida(Math.round(w / 0.95))));
      k.box(s, y - 0.08, ZF + 0.08, w + 0.4, 0.12, 0.25, 0xe6e6e2);
      k.box(s, y + 1.62, ZF + 0.05, w + 0.3, 0.1, 0.12, 0xe6e6e2);
    }
  }
  k.box(L / 2, TECHO - 0.3, ZF + 0.04, L, 0.3, 0.1, 0xe4e4e0);
  // el bajo: el forro de abajo y la losa que lo separa de las plantas
  k.pic(L / 2, YB / 2, ZF + 0.003, L, YB, 0, 1, canvasTex(Math.round(L * 12), 40, placas));
  k.box(L / 2, YB - 0.05, ZF + 0.1, L, 0.12, 0.2, 0xe4e4e0);
  // el Costa Azul Sushi: el letrero dorado y los tres escaparates
  k.box(10.5, 3.2, ZF + 0.1, 19.2, 1.3, 0.12, 0xa88a4a);
  k.pic(10.5, 3.85, ZF + 0.162, 19.2, 1.3, 0, 1, canvasTex(1500, 102, letrero));
  for (const [s, w] of [[4.6, 5.2], [10.6, 5.2], [16.6, 5.0]]) {
    k.pic(s, 1.55, ZF + 0.012, w, 2.9, 0, 1, canvasTex(Math.round(w * 30), 90, escaparate), { glow: 0.15 });
    for (const x of [s - w / 2, s + w / 2]) k.box(x, 0.1, ZF + 0.03, 0.14, 3.0, 0.08, 0xf4f4f2);
    k.box(s, 0.08, ZF + 0.03, w, 0.12, 0.1, 0xf4f4f2);
  }
  // la puerta del restaurante, de cristal con marco de madera, metida en su hueco
  k.box(20.6, 0, ZF + 0.01, 1.9, 2.6, 0.04, 0x8a6a48);
  k.pic(20.6, 1.25, ZF + 0.035, 1.6, 2.35, 0, 1, canvasTex(60, 90, cristales('#8a6a48', 2, 'rgba(200,200,190,.25)')));
  // la puerta del local de al lado (de cristal, marco gris) y la del portal (oscura) con la alarma roja
  k.box(24.4, 0, ZF + 0.01, 1.2, 2.5, 0.04, GRIS);
  k.pic(24.4, 1.2, ZF + 0.035, 1.0, 2.3, 0, 1, canvasTex(40, 90, cristales('#8a9096', 1, 'rgba(200,200,190,.2)')));
  k.box(28.4, 0, ZF + 0.01, 1.3, 2.6, 0.04, 0x3a3634);
  k.box(28.4, 0.05, ZF + 0.04, 1.1, 2.45, 0.02, 0x241f1e);
  k.box(29.4, 2.55, ZF + 0.05, 0.25, 0.3, 0.08, 0xc82a2a);
  // los dos escaparates del local vacío
  for (const [s, w] of [[35.6, 5.6], [41.8, 5.4]]) {
    k.pic(s, 1.6, ZF + 0.012, w, 3.0, 0, 1, canvasTex(Math.round(w * 30), 95, escaparate), { glow: 0.1 });
    for (const x of [s - w / 2, s + w / 2]) k.box(x, 0.1, ZF + 0.03, 0.18, 3.1, 0.1, 0xf4f4f2);
    k.box(s, 3.1, ZF + 0.03, w, 0.14, 0.1, 0xf4f4f2);
  }
  // el escaparate forrado de mármol azul y dorado con el nombre
  k.pic(48.6, 1.6, ZF + 0.014, 4.6, 3.0, 0, 1, canvasTex(230, 150, marmol));
  for (const x of [46.3, 50.9]) k.box(x, 0.1, ZF + 0.03, 0.16, 3.1, 0.1, 0xf4f4f2);
  k.box(48.6, 3.1, ZF + 0.03, 4.6, 0.14, 0.1, 0xf4f4f2);
  // la puerta de cristal del final, con su marco
  k.box(54.6, 0, ZF + 0.02, 1.5, 2.7, 0.05, 0xe8e6e0);
  k.pic(54.6, 1.25, ZF + 0.05, 1.2, 2.45, 0, 1, canvasTex(50, 95, cristales('#d8d4cc', 2, 'rgba(200,200,190,.2)')));
  // la plataforma de delante, un poco más alta que la acera, con la barandilla blanca de rombos y los escalones
  const p0 = 18.8, p1 = 56.4, pc = (p0 + p1) / 2;
  k.box(pc, 0, ZF + 0.9, p1 - p0, 0.3, 1.8, 0xd8d4cc);
  k.box(pc, 1.05, ZF + 1.75, p1 - p0, 0.05, 0.05, 0xf2f2f0);
  k.box(pc, 0.35, ZF + 1.75, p1 - p0, 0.04, 0.04, 0xf2f2f0);
  for (let s = p0; s <= p1 + 0.01; s += 1.2) {
    k.box(s, 0.3, ZF + 1.75, 0.05, 0.78, 0.05, 0xf2f2f0);
    k.box(s + 0.6, 0.38, ZF + 1.75, 0.03, 0.7, 0.03, 0xf2f2f0);
  }
  k.block(pc, ZF + 1.75, p1 - p0, 0.1);
  for (let i = 0; i < 2; i++) k.box(p1 + 0.5 + i * 0.4, 0, ZF + 0.9, 0.4, 0.2 - i * 0.1, 1.8, 0xd8d4cc);
  // la señal de 40 de la acera, delante del escaparate de mármol
  k.cyl(49.6, 0, ZF + 2.9, 0.04, 0.04, 2.4, 0x9a9a98, { seg: 8 });
  k.cyl(49.6, 2.4, ZF + 2.9, 0.3, 0.3, 0.04, 0xc82a2a, { seg: 20, rx: Math.PI / 2 });
  k.cyl(49.6, 2.4, ZF + 2.92, 0.22, 0.22, 0.04, 0xf4f4f2, { seg: 20, rx: Math.PI / 2 });
}

/** la punta del sureste: la pared ciega con dos ventanas, los armarios de la luz y el muro bajo del parterre */
function puntaSE(k) {
  const L = SE.len;
  k.box(L / 2, 0, Z + 0.15, L, TECHO, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, TECHO / 2, ZF + 0.003, L, TECHO, 0, 1, canvasTex(Math.round(L * 12), 120, placas));
  for (const y of [PLANTAS[1], PLANTAS[2]]) k.pic(2.6, y + 0.9, ZF + 0.01, 1.1, 1.6, 0, 1, canvasTex(40, 60, cristales('#8a9096', 1)));
  // los tres armarios blancos de la luz, junto a la esquina de la fachada
  k.box(1.9, 0, ZF + 0.4, 2.4, 1.9, 0.6, 0xeceae4);
  for (const s of [1.1, 1.9, 2.7]) k.box(s, 0.15, ZF + 0.71, 0.7, 1.6, 0.02, 0xdcdad4);
  k.block(1.9, ZF + 0.4, 2.4, 0.6);
  // el muro bajo blanco del parterre, que sigue la acera hacia el sureste
  k.box(L / 2 + 1, 0, ZF + 3.4, L + 2, 0.75, 0.25, 0xeceae4);
  k.block(L / 2 + 1, ZF + 3.4, L + 2, 0.25);
  k.box(L / 2 + 1, 0, ZF + 2.4, L + 2, 0.5, 1.8, 0x6a5040);
  for (const s of [3.5, 5.5, 8, 10.5, 12.5]) k.ball(s, 0.7, ZF + 2.4, 0.4, 0x5a7a3a);
}

/** la cara del noroeste, la de la gasolinera: el forro y las ventanas de las plantas */
function caraNO(k) {
  const L = NO.len;
  k.box(L / 2, 0, Z + 0.15, L, TECHO, 0.3, BLANCO);
  k.block(L / 2, Z + 0.15, L, 0.3);
  k.pic(L / 2, TECHO / 2, ZF + 0.003, L, TECHO, 0, 1, canvasTex(Math.round(L * 12), 120, placas));
  for (const y of PLANTAS) for (const [s, w] of [[L - 6, 6.0], [L - 16, 6.0]]) {
    k.pic(s, y + 0.85, ZF + 0.01, w, 1.5, 0, 1, canvasTex(Math.round(w * 30), 45, corrida(6)));
    k.box(s, y - 0.08, ZF + 0.08, w + 0.4, 0.12, 0.25, 0xe6e6e2);
  }
}

/** se monta con lo demás de Valterra */
export function buildCostaAzulSushi(scene, colliders, map) {
  if (!map?.costaAzulSushi) return null;
  const grupos = [[fachada, M, 'costaAzulSushi'], [puntaSE, SE, 'costaAzulSushiSE'], [caraNO, NO, 'costaAzulSushiNO']].map(([f, m, n]) => {
    const k = new Kit();
    f(k);
    const g = enMarco(k, m, n, colliders);
    scene.add(g);
    return g;
  });
  return { group: grupos[0], grupos };
}
