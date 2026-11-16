import * as THREE from 'three';
import { Kit } from './interiorKit.js';
import { paveMesh, polyTris, plazaSlabs } from './suelos.js';

/**
 * La azotea del Tanatorio Arroyo (Juan de Quesada 31; la empresa es Funercanarias S.L.), como en la
 * foto desde arriba que mandó José Manuel: la casa terrera blanca con la azotea partida en trozos por
 * muretes blancos, unos de tela asfáltica negra y otros de hormigón gris gastado, el patio de baldosa
 * roja, el cuarto blanco del centro con su chimenea, aparatos de aire, la placa solar, el lucernario con
 * sus nervios blancos y la chimenea redonda de la esquina. Marco: desde la esquina sur (F) a lo largo de
 * la fachada hasta la esquina de la calle (x de 0 a 20,9); z hacia dentro, en negativo.
 */

const F = [670.4, -33.1], N_FRONT = [0.726, 0.688], S = 20.9;
const ROOF = 4.3;                      // la altura del edificio (tuneTanatorio)
const LIME = 0xf1f0ec, BLACK = 0x2a2b2d, GREY = 0xa8a297, CAP = 0xdedbd3;
// los muretes de dentro: dos a lo largo de la fachada y dos de fondo (la cuadrícula de la foto)
const XS = [7.0, 13.5], ZS = [-6.5, -13.5];

/** aparato de aire: caja gris clara con el ventilador oscuro */
function ac(k, x, z, ry = 0) {
  k.box(x, ROOF, z, 0.8, 0.55, 0.35, 0xd9dadc, { ry });
  k.cyl(x + Math.sin(ry) * 0.18, ROOF + 0.27, z + Math.cos(ry) * 0.18, 0.2, 0.2, 0.02, 0x2f3236, { seg: 14, rx: Math.PI / 2, ry });
}

function azotea() {
  const k = new Kit();
  // suelos de cada trozo, algo por encima del tejado genérico (que sigue la cuesta a su manera y los tapaba)
  const cell = (x0, x1, z0, z1, hex) => k.box((x0 + x1) / 2, ROOF + 0.18, (z0 + z1) / 2, x1 - x0, 0.06, z1 - z0, hex, { list: k.shell });
  const cx = [0.3, ...XS, S - 0.3], cz = [-0.3, ...ZS, -S + 0.3];
  // [fila][columna]; null: atrás a la izquierda van el lucernario y el patio rojo (foto ancha y foto aérea)
  const kind = [[GREY, GREY, BLACK], [GREY, BLACK, BLACK], [null, BLACK, 0x8f8a82]];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
    if (!kind[r][c]) continue;
    cell(cx[c], cx[c + 1], cz[r + 1], cz[r], kind[r][c]);
  }
  cell(0.3, 2.8, -S + 0.3, ZS[1], GREY);       // bajo el lucernario
  // muretes blancos con remate claro
  const wall = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0);
    k.box((x0 + x1) / 2, ROOF, (z0 + z1) / 2, 0.28, 0.45, len, LIME, { ry });
    k.box((x0 + x1) / 2, ROOF + 0.45, (z0 + z1) / 2, 0.34, 0.04, len + 0.04, CAP, { ry });
  };
  for (const x of XS) wall(x, -0.3, x, -S + 0.3);
  for (const z of ZS) wall(0.3, z, S - 0.3, z);
  wall(3.5, -0.3, 3.5, -6.5);                 // los dos trozos de hormigón de delante, partidos
  wall(10.2, -0.3, 10.2, -6.5);
  wall(2.8, ZS[1], 2.8, -S + 0.3);            // entre el lucernario y el patio
  // la chimenea redonda de la esquina y la placa solar inclinada
  k.cyl(1.0, ROOF, -9.5, 0.32, 0.36, 1.1, LIME, { seg: 14 }).cyl(1.0, ROOF + 1.1, -9.5, 0.4, 0.4, 0.08, CAP, { seg: 14 });
  const panel = new THREE.BoxGeometry(2.0, 0.05, 1.1);
  panel.rotateX(-0.55);
  panel.translate(11.8, ROOF + 0.55, -3.4);
  k.add(panel, 0x1d2c44);
  k.box(11.8, ROOF, -3.0, 1.9, 0.5, 0.08, 0x9aa0a6).box(11.8, ROOF, -3.8, 1.9, 0.12, 0.08, 0x9aa0a6);
  // el cuarto blanco del centro, con su puerta, la ventanita y la chimenea encima
  k.box(10.6, ROOF, -10.0, 4.4, 1.9, 4.0, LIME);
  k.box(10.6, ROOF + 1.9, -10.0, 4.6, 0.08, 4.2, CAP);
  k.box(8.37, ROOF, -10.6, 0.04, 1.75, 0.8, 0x3a3f45).box(12.83, ROOF + 1.0, -9.4, 0.04, 0.5, 0.7, 0x2a3540);
  k.cyl(9.4, ROOF + 1.9, -11.2, 0.28, 0.3, 0.9, LIME, { seg: 12 }).box(11.6, ROOF + 1.9, -9.0, 0.6, 0.15, 0.6, 0xc9c6bf);
  // aparatos de aire por los trozos negros
  ac(k, 16.2, -3.0); ac(k, 18.6, -4.6, Math.PI / 2); ac(k, 15.4, -10.8); ac(k, 8.4, -12.6, Math.PI / 2); ac(k, 11.0, -17.5); ac(k, 19.2, -19.6, Math.PI);
  // en la esquina de atrás, el lucernario: cristal oscuro con nervios blancos
  k.box(1.55, ROOF, -17.2, 2.2, 0.45, 6.4, 0x2a3540);
  for (let i = 0; i <= 9; i++) k.box(1.55, ROOF + 0.45, -14.2 - i * 0.667, 2.3, 0.06, 0.06, LIME);
  // atrás a la derecha, el trozo de hormigón con la máquina sobre su peana
  k.box(16.8, ROOF, -16.4, 3.0, 0.3, 2.2, LIME).box(16.8, ROOF + 0.3, -16.4, 1.4, 0.8, 1.0, 0xb9bcc0);
  // la claraboya redonda y los lucernarios del lado de la calle
  k.cyl(11.0, ROOF, -15.4, 0.6, 0.6, 0.35, 0xe6e6e2, { seg: 18 }).cyl(11.0, ROOF + 0.35, -15.4, 0.5, 0.5, 0.04, 0x3a4652, { seg: 18 });
  for (const z of [-8.6, -11.6]) k.box(18.8, ROOF, z, 1.6, 0.25, 1.1, 0x3a4652).box(18.8, ROOF + 0.25, z, 1.7, 0.04, 1.2, LIME);
  return k;
}

export function buildTanatorioRoof(scene) {
  const k = azotea();
  const { group } = k.build('azoteaTanatorio');
  group.position.set(F[0], 0, F[1]);
  group.rotation.y = Math.atan2(N_FRONT[0], N_FRONT[1]);
  scene.add(group);
  // el patio de baldosa roja (atrás, junto a la esquina del lucernario), en el mundo
  const ex = [N_FRONT[1], -N_FRONT[0]];
  const w = (x, z) => [F[0] + ex[0] * x + N_FRONT[0] * z, F[1] + ex[1] * x + N_FRONT[1] * z];
  const patio = paveMesh(polyTris([w(2.8, ZS[1]), w(XS[0], ZS[1]), w(XS[0], -S + 0.3), w(2.8, -S + 0.3)]), ROOF + 0.25, plazaSlabs(), 0xe08a62);
  if (patio) { patio.name = 'patioRojoTanatorio'; scene.add(patio); }
}
