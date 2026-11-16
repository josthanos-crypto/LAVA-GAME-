/**
 * LOS NEGOCIOS REALES DE SAN FRANCISCO JAVIER (Arrecife, Lanzarote).
 *
 * Todo lo que hay aquí está comprobado, no inventado. Dos fuentes:
 *
 *  1. OpenStreetMap (consulta a la API 0.6, octubre de 2026): los cuatro sitios con
 *     nombre dentro del polígono oficial del barrio (relation/2216873).
 *  2. La Guía de Servicios de Atlántico Hoy (guia.atlanticohoy.com), que publica
 *     dirección, teléfono y coordenadas de cada ficha. De ahí salen los comercios
 *     que OSM todavía no tiene mapeados en este barrio.
 *
 * Para no colocar nada a ojo: de cada ficha se toma su latitud y longitud reales y se
 * pasan a coordenadas del juego (x = (lon + 13,55) · 97398, z = (28,9625 − lat) · 111320).
 * Solo se queda lo que cae dentro del barrio. El cartel se pone en la fachada que mira
 * a la calle, calculada con el polígono del edificio y la calle más próxima.
 *
 * TOTAL: 15 negocios reales.
 *
 *   nombre                              tipo                  dirección
 *   ALDI                                supermercado          Rambla Medular 58
 *   Estación de Servicio Repsol         gasolinera            (Canary Green Corner)
 *   Campo de Fútbol San Francisco Javier deportivo
 *   IES Las Maretas (antes IES Arrecife) instituto
 *   Bar La Iguana                       bar                   C/ Enrique IV 51
 *   Bar Cafetería el Rincón de Manolo   bar                   C/ Enrique IV 35
 *   Armas Lira, S.C.P.                  bar cafetería         C/ Agustín Espinosa 45
 *   Montaña Viña                        bar                   C/ Carlos V 29
 *   Bazar Juana                         bazar                 C/ Carlos V 26
 *   Centro de Belleza Rosa Negra        peluquería            C/ Enrique IV 11
 *   Peluquería Magec                    peluquería            C/ Viriato 47
 *   Canestylo                           peluquería canina     C/ Carlos V 7
 *   Supermercado Rodríguez Padrón       supermercado          C/ Felipe II 3
 *   Aluminios Medina                    carpintería aluminio  C/ Juana de Arco 20
 *   Carpisur                            carpintería           C/ Enrique IV 65
 *
 * El ALDI tiene su propio modelo en `aldiSfj.js` (nave, franja azul, rótulo y
 * aparcamiento), así que aquí no lleva cartel de fachada.
 *
 * El resto de locales del barrio son fachadas de tienda que genera el juego a partir
 * de los edificios del mapa: no se les pone nombre porque no hay dato real.
 */

/** estilos de cartel que entiende world.js (SIGN_STYLE) */
const K = {
  bar: 'food',
  super: 'super',
  tienda: 'retail',
  taller: 'gen',
};

/**
 * Los negocios, con su dirección real y el punto exacto donde va el cartel.
 * `cartel` = [x, z, nx, nz]: posición en la fachada y normal hacia la calle.
 */
export const NEGOCIOS_SFJ = [
  // --- los cuatro que ya estaban en OpenStreetMap -------------------------------
  {
    nombre: 'ALDI', tipo: 'supermercado', direccion: 'Calle Rambla Medular 58',
    telefono: '900 902 466', x: -1164, z: 105, osm: 'way/1368710278',
    nota: 'tiene modelo propio en aldiSfj.js',
  },
  {
    nombre: 'Repsol', largo: 'Estación de Servicio Repsol Canary Green Corner',
    tipo: 'gasolinera', x: -1753, z: -295, osm: 'node/1907362609',
    nota: 'el mapa ya traía el cartel sin nombre: se le pone el nombre',
  },
  {
    nombre: 'Campo de Fútbol San Francisco Javier', tipo: 'deportivo',
    x: -1458, z: -419, osm: 'way/56128398', nota: 'es un área del mapa, ya tiene nombre',
  },
  {
    // se llamaba IES Arrecife hasta 2017; desde entonces es el IES Las Maretas (La Voz de Lanzarote)
    nombre: 'IES Las Maretas', largo: 'Instituto de Educación Secundaria Las Maretas',
    tipo: 'instituto', x: -1352, z: -461, osm: 'way/194831462',
    cartel: [-1366.6, -448.1, -0.721, 0.693], k: K.taller,
  },

  // --- comercios del barrio (Guía de Atlántico Hoy, con coordenadas) -------------
  {
    nombre: 'Bar La Iguana', tipo: 'bar', direccion: 'Calle Enrique IV 51',
    telefono: '928 810 368', x: -1597, z: -232,
    cartel: [-1597.0, -231.6, -0.159, -0.987], k: K.bar,
  },
  {
    nombre: 'Rincón de Manolo', largo: 'Bar Cafetería el Rincón de Manolo',
    tipo: 'bar', direccion: 'Calle Enrique IV 35', x: -1623, z: -231,
    cartel: [-1622.5, -227.6, -0.156, -0.988], k: K.bar,
  },
  {
    nombre: 'Armas Lira', largo: 'Armas Lira, S.C.P.', tipo: 'bar cafetería',
    direccion: 'Calle Agustín Espinosa 45', telefono: '928 346 348',
    x: -1616, z: 10, cartel: [-1615.0, 16.0, -0.159, -0.987], k: K.bar,
  },
  {
    nombre: 'Montaña Viña', tipo: 'bar', direccion: 'Calle Carlos V 29',
    telefono: '928 810 914', x: -1537, z: -281,
    cartel: [-1537.8, -284.3, -0.226, -0.974], k: K.bar,
  },
  {
    nombre: 'Bazar Juana', tipo: 'bazar', direccion: 'Calle Carlos V 26',
    telefono: '928 800 914', x: -1591, z: -285,
    cartel: [-1590.9, -283.9, 0.167, 0.986], k: K.tienda,
  },
  {
    nombre: 'Rosa Negra', largo: 'Centro de Belleza Rosa Negra', tipo: 'peluquería',
    direccion: 'Calle Enrique IV 11', telefono: '928 801 872', x: -1536, z: -239,
    cartel: [-1536.4, -241.2, -0.161, -0.987], k: K.tienda,
  },
  {
    nombre: 'Peluquería Magec', tipo: 'peluquería', direccion: 'Calle Viriato 47',
    telefono: '928 805 208', x: -1501, z: -144,
    cartel: [-1495.7, -145.1, 0.979, -0.202], k: K.tienda,
  },
  {
    nombre: 'Canestylo', tipo: 'peluquería canina', direccion: 'Calle Carlos V 7',
    telefono: '928 802 279', x: -1391, z: -312,
    cartel: [-1391.3, -313.5, -0.197, -0.980], k: K.tienda,
  },
  {
    nombre: 'Supermercado Rodríguez Padrón', tipo: 'supermercado',
    direccion: 'Calle Felipe II 3', telefono: '928 815 418', x: -1316, z: -79,
    cartel: [-1309.5, -81.1, 0.952, -0.306], k: K.super,
  },
  {
    nombre: 'Aluminios Medina', tipo: 'carpintería de aluminio',
    direccion: 'Calle Juana de Arco 20', telefono: '928 844 773', x: -1458, z: -98,
    cartel: [-1457.1, -95.2, 0.300, 0.954], k: K.taller,
  },
  {
    nombre: 'Carpisur', tipo: 'carpintería', direccion: 'Calle Enrique IV 65',
    telefono: '928 806 475', x: -1734, z: -210,
    cartel: [-1735.9, -208.6, 0.340, -0.940], k: K.taller,
  },
];

/** límites del barrio en metros del juego */
export const CAJA_SFJ = { x0: -1799, x1: -1036, z0: -582, z1: 432 };

/**
 * Retoques al mapa antes de levantar la ciudad.
 *
 *  - Pone nombre al cartel mudo de la gasolinera Repsol (ya estaba dibujada a 5 m del
 *    nodo de OSM).
 *  - Añade los carteles de los comercios reales que el mapa no tenía. Se colocan ya
 *    calculados (fachada + normal) para que queden pegados a la pared y mirando a la
 *    calle, no flotando en medio.
 */
export function tuneNegociosSfj(map) {
  const signs = (map.signs ||= []);

  // 1) la gasolinera: el cartel mudo que ya estaba
  const repsol = NEGOCIOS_SFJ.find((n) => n.tipo === 'gasolinera');
  for (const s of signs) {
    if (s.name) continue;
    if (Math.hypot(s.x - repsol.x, s.z - repsol.z) < 12) {
      s.name = repsol.nombre;
      s.k = 'gen';
    }
  }

  // 2) los comercios del barrio: un cartel por negocio, sin duplicar
  let añadidos = 0;
  for (const n of NEGOCIOS_SFJ) {
    if (!n.cartel) continue;                      // ALDI, Repsol y el campo van aparte
    const [x, z, nx, nz] = n.cartel;
    const ya = signs.some((s) => s.name === n.nombre && Math.hypot(s.x - x, s.z - z) < 4);
    if (ya) continue;
    signs.push({
      x, z, nx, nz,
      name: n.nombre,
      k: n.k || 'gen',
      // datos que no usa el motor pero que dejan el mapa documentado
      ph: 1,
      sfj: 1,
    });
    añadidos++;
  }

  if (map.meta && añadidos) map.meta.signs = signs.length;

  return { añadidos, total: signs.length };
}

/** solo los negocios que caen dentro del barrio (para la ficha y para depurar) */
export function negociosDentroDeSfj() {
  return NEGOCIOS_SFJ.filter(
    (n) => n.x >= CAJA_SFJ.x0 && n.x <= CAJA_SFJ.x1 && n.z >= CAJA_SFJ.z0 && n.z <= CAJA_SFJ.z1,
  );
}
