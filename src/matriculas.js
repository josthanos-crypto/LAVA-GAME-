import * as THREE from 'three';

/**
 * Matrículas (Version 133). Todas inventadas y al azar:
 *  - las de ahora: cuatro números y tres consonantes, con la banda azul europea (no dicen de qué isla son)
 *  - las antiguas de provincia, para los coches clásicos: GC (Las Palmas) o TF, cuatro números y dos letras
 * Debajo va el portamatrículas negro con el nombre de la isla, como los que ponen aquí en los coches.
 */

const CONS = 'BCDFGHJKLMNPRSTVWXYZ';
const LETRAS = 'ABCDEFGHJKLMNPRSTUVWXYZ';
const azar = (txt) => txt[Math.floor(Math.random() * txt.length)];
const num4 = () => String(Math.floor(Math.random() * 10000)).padStart(4, '0');

/** una matrícula al azar: { texto, vieja } */
export function matriculaAzar(vieja = false) {
  if (vieja) return { texto: `${Math.random() < 0.8 ? 'GC' : 'TF'} ${num4()} ${azar(LETRAS)}${azar(LETRAS)}`, vieja: true };
  return { texto: `${num4()} ${azar(CONS)}${azar(CONS)}${azar(CONS)}`, vieja: false };
}

const ISLAS = ['LANZAROTE', 'LANZAROTE', 'ARRECIFE', 'ISLAS CANARIAS'];

/** textura de la matrícula con su portamatrículas. 512 x 144 px */
export function matriculaTex({ texto, vieja = false }) {
  const W = 512, H = 144, PH = 112;   // PH: alto de la placa; debajo, la tira del portamatrículas
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  // portamatrículas
  x.fillStyle = '#0d0e10';
  x.fillRect(0, 0, W, H);
  // placa: blanca reflectante con un degradado muy suave y el reborde en relieve
  const g = x.createLinearGradient(0, 6, 0, PH - 4);
  g.addColorStop(0, '#fbfbf8');
  g.addColorStop(1, '#e6e6e0');
  x.fillStyle = g;
  x.beginPath();
  x.roundRect ? x.roundRect(6, 6, W - 12, PH - 8, 10) : x.rect(6, 6, W - 12, PH - 8);
  x.fill();
  x.strokeStyle = '#15171a';
  x.lineWidth = 3;
  x.beginPath();
  x.roundRect ? x.roundRect(11, 11, W - 22, PH - 18, 7) : x.rect(11, 11, W - 22, PH - 18);
  x.stroke();
  let x0 = 22;
  if (!vieja) {
    // banda europea: círculo de estrellas y la E
    x.fillStyle = '#1c47a0';
    x.beginPath();
    x.roundRect ? x.roundRect(13, 13, 54, PH - 22, [5, 0, 0, 5]) : x.rect(13, 13, 54, PH - 22);
    x.fill();
    x.fillStyle = '#f4d23c';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      x.beginPath();
      x.arc(40 + Math.cos(a) * 14, 40 + Math.sin(a) * 14, 2.2, 0, Math.PI * 2);
      x.fill();
    }
    x.fillStyle = '#ffffff';
    x.font = 'bold 30px Arial';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('E', 40, 84);
    x0 = 74;
  }
  // caracteres troquelados: una sombra fina abajo a la derecha les da el relieve
  x.font = 'bold 78px "Arial Narrow", "Barlow Condensed", Arial';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  const cx = (x0 + W - 14) / 2, cy = PH / 2 + 5, maxW = W - 14 - x0 - 16;
  x.fillStyle = 'rgba(0,0,0,0.25)';
  x.fillText(texto, cx + 2, cy + 2, maxW);
  x.fillStyle = '#101113';
  x.fillText(texto, cx, cy, maxW);
  // el nombre de la isla en el portamatrículas
  x.fillStyle = '#c9ccd0';
  x.font = '600 22px "Barlow Condensed", "Arial Narrow", Arial';
  x.fillText(ISLAS[Math.floor(Math.random() * ISLAS.length)], W / 2, PH + (H - PH) / 2 + 1);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** proporción ancho/alto de la matrícula con su portamatrículas (para la geometría: 0,52 m de ancho) */
export const MATRICULA_ALTO = 0.52 * 144 / 512;
