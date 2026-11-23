import { buildWalkIndex } from './aceras.js';

/**
 * La Calle Tanganillo (Argana Alta): el atajo de verdad desde el campo de arriba a la Calle Tenderete.
 * Faltaba en el mapa del juego y para ir de la casa del camino de tierra al HiperDino había que dar
 * la vuelta por Campoamor y Tajaraste (unos 2,85 km, cuando en la realidad son unos 2,4).
 * Puntos de OpenStreetMap (vías 230559749 y 360758772, y el enlace sin nombre 152627357, 96761022 y
 * 230248582), pasados a metros del juego. Empieza en el final de la calle del campo que baja por Mario
 * Benedetti (campoDatos.js, CAMPO_CALLES) y acaba en un punto de la calle que ya había: roadGraph une
 * las calles por sus puntos, así que también entra en las rutas.
 */
const TANGANILLO = [[-1895.0, -2301.0], [-1882.6, -2284.9], [-1872.7, -2264.9], [-1855.1, -2228.0],
  [-1836.7, -2191.1], [-1826.7, -2171.5], [-1817.6, -2160.2], [-1813.7, -2156.9], [-1807.4, -2151.8],
  [-1792.7, -2138.8], [-1789.1, -2129.0], [-1781.5, -2106.4]];
const ENLACE = [[-1781.5, -2106.4], [-1770.0, -2109.5], [-1761.1, -2104.3], [-1753.7, -2096.0],
  [-1745.6, -2086.8], [-1738.2, -2081.61]];
// el primer trozo de la Calle Tenderete (vía 145335740), que tampoco estaba: de la Luján Pérez, por el final de
// la Agustina Ayala y el principio de la Santiago Amón, hasta la Tenderete que ya había, cruzando los dos sentidos
// de la Tajaraste (sin él el GPS daba la vuelta)
const TENDERETE = [[-1738.2, -2081.61], [-1717.5, -2057.2], [-1703.07, -2040.59], [-1693.6, -2029.8],
  [-1688.01, -2023.87], [-1660.59, -1993.06], [-1654.22, -1986.02]];

export function tuneCalleTanganillo(map) {
  if (map.roads.some((r) => r.name === 'Calle Tanganillo')) return;
  map.roads.push(
    // las tres son de la misma clase que Tenderete y Tajaraste (tertiary en OSM): el GPS las trata igual
    { w: 7, major: 1, name: 'Calle Tanganillo', p: TANGANILLO },
    { w: 7, major: 1, name: '', p: ENLACE },
    { w: 7, major: 1, name: 'Calle Tenderete', p: TENDERETE },
  );
  // fuera de la foto aérea el suelo va en trozos de 60 m y en esta cuesta asomaba por encima del asfalto:
  // aquí, cuadrícula fina de 10 m (world.js, como en Playa Honda)
  map.groundFine = [...(map.groundFine || []), { x0: -1920, x1: -1630, z0: -2320, z1: -1918 }];
  // main.js hace el índice de aceras antes de que los barrios toquen el mapa: se rehace con la calle nueva
  buildWalkIndex(map.roads);
}
