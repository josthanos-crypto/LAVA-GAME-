/**
 * Los edificios de la Marina Lanzarote, con la foto aérea del puerto deportivo de marzo de 2017 y las de los
 * locales (Karma, Intrigo, La Vela, La Corona…; solo se miran, no van dentro del juego): son blancos, con la
 * azotea clara, y en el juego salían con el tejado gris oscuro y la fachada del color genérico. Aquí solo se
 * cambian sus colores en el mapa antes de levantar la ciudad; la forma y la altura se quedan como están.
 */

// el centro de cada edificio de la Marina en el mapa (se buscan por el centro, a menos de 3 m)
const EDIFICIOS = [[1041, 85], [1210, -240], [1026, 132], [1184, -196], [1076, 22], [1017, 180], [1173, -134], [1127, -41]];
const AZOTEA = [204, 207, 210], FACHADA = [244, 243, 238];

/** antes de levantar la ciudad: azotea clara y fachada blanca */
export function tuneEdificiosMarina(map) {
  let n = 0;
  for (const b of map.buildings || []) {
    const p = b.p || [];
    if (!p.length) continue;
    const cx = p.reduce((a, q) => a + q[0], 0) / p.length, cz = p.reduce((a, q) => a + q[1], 0) / p.length;
    if (!EDIFICIOS.some(([x, z]) => Math.hypot(cx - x, cz - z) < 3)) continue;
    b.c = AZOTEA.slice();
    b.f = FACHADA.slice();
    n++;
  }
  map.edificiosMarina = n;
}
