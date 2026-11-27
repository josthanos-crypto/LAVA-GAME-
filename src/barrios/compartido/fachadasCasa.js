import { aceras } from '../altavista/kitCalles.js';

/**
 * (Version 180) Las fachadas que seguían genéricas en Altavista, Argana Alta y Titerroy (y los tramos vecinos de
 * Maneje, San Francisco Javier y el borde norte del centro, por donde siguen esas calles), con la segunda
 * pasada de capturas de Look Around del PC de casa (carpeta «Downloads\Lava Game\recursos lava game 2026-11-25 web
 * casa fachadas», barrios altavista, argana_alta y titerroy: por cada paso, una foto de frente, otra a la izquierda y
 * otra a la derecha, con la coordenada y el rumbo en el CSV de cada barrio). Solo se miran; no van dentro del juego.
 * Cómo se hizo: cada paso se proyecta sobre su calle del mapa y se lanza un rayo a cada lado; si da a un bloque
 * genérico (no hecho a mano), la foto de ese lado dice qué hay: color, plantas, si es tienda o si es solar. Cada tramo
 * es una tirada de pasos seguidos que dan al mismo bloque: el kit de aceras recorta el bloque y levanta las casas en
 * el orden de las fotos. La coordenada de cada paso baila unos metros, así que el sitio de cada casa a lo largo de la
 * calle es aproximado, y los anchos salen de repartir el tramo entre los pasos. Alto 0 = solar. Casas de a hacia b.
 * Va al final de todo (compartido): así no pisa nada de lo que cada barrio ya hizo a mano.
 * (Version 181) Los rótulos de los negocios que se leen en esas fotos, confirmados por José Manuel el 26-11-2026
 * (`ROTULOS`): solo el nombre, en el punto de fachada del paso donde se ve. Si el mapa ya trae ese nombre cerca, no
 * se repite.
 */

const B = '#f1eee7';

const ACERAS = [
  // ===== ALTAVISTA (carpeta altavista) =====
  // de Almería, acera sur, pasos 8-9
  { a: [-29.7, -1200.5], b: [-52.7, -1190.4], fondo: 9, casas: [
    [12.7, 4.0, '#f1eee7'], [12.4, 4.0, '#f1eee7']] },
  // Chimia, acera este, pasos 2-5
  { a: [-11.7, -1396.6], b: [-3.7, -1439.5], fondo: 9, casas: [
    [7.3, 6.6, '#efe6c8'], [7.3, 6.6, '#efe6c8'], [8.1, 4.0, '#f1eee7'], [10.1, 4.0, '#a9abad'], [10.8, 6.6, '#f1eee7']] },
  // Chimia, acera este, paso 1
  { a: [-11.7, -1396.6], b: [-9.6, -1408.1], fondo: 9, casas: [
    [11.7, 6.6, '#f1eee7']] },
  // de Granada, acera este, paso 3
  { a: [86.9, -1312.2], b: [88.8, -1322.4], fondo: 9, casas: [
    [10.4, 6.6, '#f1eee7', { tienda: true }]] },
  // de la Peña del Espino, acera este, pasos 2-4
  { a: [275.3, -1779.8], b: [280.6, -1809.3], fondo: 9, casas: [
    [13.5, 4.0, '#f1eee7'], [12, 4.0, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // de la Peña del Espino, acera este, pasos 7-10
  { a: [284.5, -1830.0], b: [292.6, -1874.9], fondo: 9, casas: [
    [7, 6.6, '#f1eee7'], [11.1, 6.6, '#f1eee7'], [13.3, 4.0, '#f1eee7'], [7.1, 4.0, '#f1eee7'], [7.1, 4.0, '#f1eee7']] },
  // de la Peña del Espino, acera este, paso 1
  { a: [272.5, -1763.6], b: [275.5, -1780.4], fondo: 9, casas: [
    [8.5, 6.6, '#f1eee7'], [8.5, 6.6, '#f1eee7']] },
  // Mosta, acera sur, pasos 1-2
  { a: [207.0, -1752.8], b: [174.6, -1759.3], fondo: 9, casas: [
    [11.1, 6.6, '#f1eee7'], [11.1, 6.6, '#f1eee7'], [10.9, 6.6, '#f1eee7']] },
  // Mosta, acera norte, pasos 14-16
  { a: [49.1, -1802.1], b: [10.7, -1808.8], fondo: 9, casas: [
    [10.3, 6.6, '#f1eee7'], [13.1, 4.0, '#f1eee7'], [7.8, 6.6, '#f1eee7'], [7.8, 6.6, '#f1eee7']] },
  // Mosta, acera sur, paso 17
  { a: [19.2, -1796.1], b: [9.5, -1797.8], fondo: 9, casas: [
    [9.9, 6.6, '#f1eee7']] },
  // Mosta, acera norte, paso 23
  { a: [272.5, -1763.5], b: [282.8, -1761.9], fondo: 9, casas: [
    [10.4, 0, B, { fondo: 16 }]] },
  // Mosta, acera norte, paso 33
  { a: [409.7, -1737.5], b: [416.0, -1738.4], fondo: 9, casas: [
    [6.4, 6.6, '#f1eee7']] },
  // Mosta, acera sur, pasos 15-16
  { a: [47.8, -1791.0], b: [9.5, -1797.7], fondo: 9, casas: [
    [8, 6.6, '#efe6c8'], [8, 6.6, '#efe6c8'], [8, 6.6, '#efe6c8'], [7.4, 4.0, '#ece8e0'], [7.4, 4.0, '#ece8e0']] },
  // Mosta, acera norte, paso 17
  { a: [21.2, -1807.3], b: [10.7, -1809.1], fondo: 9, casas: [
    [10.6, 6.6, '#f1eee7']] },
  // Mosta, acera sur, pasos 18-20
  { a: [188.9, -1755.2], b: [206.8, -1751.7], fondo: 9, casas: [
    [13.4, 6.6, '#f1eee7'], [12, 6.6, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // Blasco Ibáñez, acera este, paso 25
  { a: [153.8, -1076.6], b: [156.0, -1071.4], fondo: 9, casas: [
    [5.6, 6.6, '#f1eee7']] },
  // Blasco Ibáñez, acera este, pasos 34-37
  { a: [188.8, -996.0], b: [201.8, -966.8], fondo: 9, casas: [
    [9.4, 4.0, '#9d9890'], [9.9, 4.0, '#f1eee7'], [9.9, 4.0, '#f1eee7'], [4.5, 4.0, '#f1eee7']] },
  // Blasco Ibáñez, acera este, pasos 38-43
  { a: [216.1, -940.9], b: [230.8, -910.1], fondo: 9, casas: [
    [2.2, 9.4, '#f1eee7'], [2.2, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#ece8e0', { tienda: true }], [10, 6.6, '#f0dd96'], [10, 4.0, '#b9b2a4', { tienda: true }], [6.5, 4.0, '#efe6c8', { tienda: true }]] },
  // Blasco Ibáñez, acera este, pasos 45-49
  { a: [240.6, -884.2], b: [250.0, -863.4], fondo: 9, casas: [
    [6.1, 4.0, '#f1eee7'], [9.9, 4.0, '#efe6c8'], [10, 4.0, '#efe6c8'], [10, 6.6, '#f1eee7'], [4.5, 0, B, { fondo: 16 }]] },
  // Blasco Ibáñez, acera oeste, paso 5
  { a: [48.1, -1274.8], b: [55.3, -1257.4], fondo: 9, casas: [
    [9.4, 6.6, '#f1eee7'], [9.4, 6.6, '#f1eee7']] },
  // Blasco Ibáñez, acera oeste, paso 26
  { a: [147.4, -1064.3], b: [155.0, -1048.7], fondo: 9, casas: [
    [8.7, 6.6, '#ece8e0', { tienda: true }], [8.7, 6.6, '#ece8e0', { tienda: true }]] },
  // Blasco Ibáñez, acera oeste, paso 31
  { a: [169.4, -1017.0], b: [171.7, -1011.9], fondo: 9, casas: [
    [5.7, 6.6, '#e6d3b8']] },
  // Blasco Ibáñez, acera oeste, pasos 32-35
  { a: [172.4, -1012.2], b: [186.3, -979.3], fondo: 9, casas: [
    [10.8, 6.6, '#e6d3b8'], [10, 6.6, '#f1eee7'], [10, 6.6, '#efe6c8'], [5.1, 6.6, '#efe6c8']] },
  // Blasco Ibáñez, acera oeste, pasos 37-39
  { a: [191.2, -969.3], b: [206.5, -936.5], fondo: 9, casas: [
    [14, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [12.1, 4.0, '#f1eee7']] },
  // Blasco Ibáñez, acera oeste, pasos 41-44
  { a: [210.2, -925.4], b: [226.4, -891.7], fondo: 9, casas: [
    [6.2, 4.0, '#efe6c8'], [10, 4.0, '#efe6c8'], [10, 4.0, '#f1eee7'], [11.2, 4.0, '#f1eee7']] },
  // Blasco Ibáñez, acera oeste, paso 45
  { a: [231.6, -883.2], b: [236.7, -871.3], fondo: 9, casas: [
    [13, 4.0, '#f1eee7']] },
  // Blasco Ibáñez, acera oeste, pasos 47-49
  { a: [241.0, -862.2], b: [250.1, -842.5], fondo: 9, casas: [
    [5.9, 4.0, '#f1eee7', { tienda: true }], [9.9, 4.0, '#f1eee7'], [5.8, 6.6, '#f1eee7']] },
  // Blasco Ibáñez, acera oeste, paso 51
  { a: [253.5, -833.1], b: [262.2, -815.4], fondo: 9, casas: [
    [9.9, 6.6, '#f1eee7'], [9.9, 6.6, '#f1eee7']] },
  // ===== ARGANA ALTA (carpeta argana_alta) =====
  // de Luján Pérez, acera norte, pasos 1-6
  { a: [-2269.4, -1905.9], b: [-2239.3, -1915.8], fondo: 9, casas: [
    [4.5, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 0, B, { fondo: 16 }], [10, 0, B, { fondo: 16 }], [11, 0, B, { fondo: 16 }]] },
  // de Luján Pérez, acera norte, pasos 9-15
  { a: [-2218.7, -1921.9], b: [-2153.5, -1943.2], fondo: 9, casas: [
    [7.6, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10.1, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#e9c3a4'], [11, 6.6, '#e9c3a4']] },
  // de Luján Pérez, acera norte, pasos 21-24
  { a: [-2103.6, -1959.0], b: [-2073.0, -1969.1], fondo: 9, casas: [
    [6.7, 4.0, '#e4cfc9'], [10, 4.0, '#e4cfc9'], [10, 4.0, '#f1eee7'], [5.6, 4.0, '#f1eee7']] },
  // de Luján Pérez, acera norte, paso 27
  { a: [-2052.6, -1976.5], b: [-2040.0, -1980.9], fondo: 9, casas: [
    [13.4, 4.0, '#f1eee7']] },
  // de Luján Pérez, acera sur, paso 29
  { a: [-2008.9, -1976.0], b: [-2020.9, -1970.3], fondo: 9, casas: [
    [13.3, 6.6, '#f1eee7', { tienda: true }]] },
  // de Luján Pérez, acera norte, pasos 30-34
  { a: [-2029.4, -1985.6], b: [-1972.7, -2004.9], fondo: 9, casas: [
    [8.9, 6.6, '#f1eee7', { tienda: true }], [8.9, 6.6, '#f1eee7', { tienda: true }], [10, 6.6, '#f1eee7'], [10, 6.6, '#e6d3b8'], [10, 6.6, '#f1eee7'], [12.2, 4.0, '#f1eee7']] },
  // de Luján Pérez, acera norte, pasos 36-45
  { a: [-1949.0, -2013.1], b: [-1910.3, -2026.5], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7', { tienda: true }], [10, 0, B, { fondo: 16 }], [10, 6.6, '#f0dd96'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#efe6c8'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // de Luján Pérez, acera norte, pasos 47-50
  { a: [-1858.9, -2045.2], b: [-1824.3, -2057.1], fondo: 9, casas: [
    [7.1, 4.0, '#9d9890'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [9.5, 4.0, '#f1eee7']] },
  // de Luján Pérez, acera norte, pasos 52-56
  { a: [-1813.6, -2059.9], b: [-1767.3, -2075.9], fondo: 9, casas: [
    [9.6, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [9.5, 4.0, '#9d9890']] },
  // de Luján Pérez, acera norte, pasos 61-78
  { a: [-1731.1, -2088.9], b: [-1560.8, -2149.3], fondo: 9, casas: [
    [12, 6.6, '#e6d3b8'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#efe6c8'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#e2c079'], [10, 4.0, '#f1eee7', { tienda: true }], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7', { tienda: true }], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#e9b99c', { tienda: true }], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [8.7, 6.6, '#f1eee7']] },
  // de Luján Pérez, acera sur, pasos 14-17
  { a: [-2152.6, -1933.7], b: [-2146.9, -1935.6], fondo: 9, casas: [
    [4.5, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [5, 6.6, '#f0dd96'], [5, 0, B, { fondo: 16 }], [2.2, 0, B, { fondo: 16 }], [2.2, 6.6, '#f0dd96']] },
  // de Luján Pérez, acera sur, pasos 35-59
  { a: [-1933.0, -2007.6], b: [-1741.4, -2073.8], fondo: 9, casas: [
    [4.5, 6.6, '#e6d3b8'], [10, 6.6, '#e6d3b8'], [10, 4.0, '#e6d3b8'], [10, 0, B, { fondo: 16 }], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#e6d3b8'], [10, 6.6, '#e6d3b8'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#d9b996'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8', { tienda: true }], [4.5, 6.6, '#efe6c8', { tienda: true }]] },
  // Malagueña, acera norte, paso 29
  { a: [-1778.1, -1757.2], b: [-1770.0, -1761.1], fondo: 9, casas: [
    [9, 6.6, '#efe6c8']] },
  // Malagueña, acera norte, paso 32
  { a: [-1744.9, -1776.6], b: [-1733.0, -1782.6], fondo: 9, casas: [
    [13.3, 4.0, '#f1eee7']] },
  // Malagueña, acera norte, pasos 36-46
  { a: [-1692.5, -1790.4], b: [-1607.2, -1833.2], fondo: 9, casas: [
    [4.5, 0, B, { fondo: 16 }], [10, 6.6, '#f1eee7'], [10, 4.0, '#5f8f5a'], [10, 6.6, '#f1eee7', { tienda: true }], [10, 4.0, '#dd7d70'], [10, 6.6, '#d9b996'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [6.1, 6.6, '#f1eee7']] },
  // Malagueña, acera norte, paso 49
  { a: [-1585.6, -1854.0], b: [-1580.1, -1856.8], fondo: 9, casas: [
    [6.2, 6.6, '#f1eee7']] },
  // Malagueña, acera sur, paso 29
  { a: [-1766.6, -1732.8], b: [-1758.3, -1736.7], fondo: 9, casas: [
    [9.2, 6.6, '#e2c079']] },
  // de los Aires de Lima, acera norte, pasos 10-24
  { a: [-1860.3, -1603.1], b: [-1724.8, -1666.8], fondo: 9, casas: [
    [7.2, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7', { tienda: true }], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#e6d3b8'], [10, 6.6, '#f0dd96'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [12.6, 4.0, '#f1eee7']] },
  // de los Aires de Lima, acera norte, paso 28
  { a: [-1703.6, -1690.8], b: [-1688.5, -1698.2], fondo: 9, casas: [
    [8.4, 6.6, '#f1eee7', { tienda: true }], [8.4, 6.6, '#f1eee7', { tienda: true }]] },
  // de los Aires de Lima, acera norte, pasos 30-42
  { a: [-1668.7, -1696.8], b: [-1586.5, -1737.2], fondo: 9, casas: [
    [4.5, 0, B, { fondo: 16 }], [10, 0, B, { fondo: 16 }], [10, 4.0, '#f1eee7'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#efe6c8'], [10, 4.0, '#efe6c8'], [5, 0, B, { fondo: 16 }], [5, 6.6, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // de los Aires de Lima, acera norte, paso 59
  { a: [-1430.5, -1824.4], b: [-1417.4, -1831.0], fondo: 9, casas: [
    [7.3, 6.6, '#e9c3a4'], [7.3, 6.6, '#e9c3a4']] },
  // de los Aires de Lima, acera sur, pasos 27-39
  { a: [-1658.3, -1690.1], b: [-1637.8, -1700.2], fondo: 9, casas: [
    [4.5, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 0, B, { fondo: 16 }], [10, 4.0, '#efe6c8'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 0, B, { fondo: 16 }], [10, 0, B, { fondo: 16 }], [10, 0, B, { fondo: 16 }], [4.5, 4.0, '#efe6c8']] },
  // del León Felipe, acera este, pasos 27-28
  { a: [-2363.6, -1975.6], b: [-2355.5, -1964.1], fondo: 9, casas: [
    [5.7, 6.6, '#e6d3b8'], [8.4, 6.6, '#e6d3b8']] },
  // del León Felipe, acera este, pasos 35-37
  { a: [-2315.0, -1906.1], b: [-2307.2, -1895.1], fondo: 9, casas: [
    [4.5, 4.0, '#efe6c8'], [10, 6.6, '#efe6c8'], [4.5, 6.6, '#efe6c8']] },
  // del León Felipe, acera este, pasos 47-49
  { a: [-2245.4, -1807.6], b: [-2241.6, -1802.1], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7', { tienda: true }], [10, 6.6, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // Polca, acera oeste, pasos 11-13
  { a: [-1841.5, -1539.5], b: [-1856.3, -1569.1], fondo: 9, casas: [
    [12.4, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10.7, 6.6, '#f1eee7']] },
  // Polca, acera oeste, pasos 14-15
  { a: [-1856.3, -1569.3], b: [-1862.7, -1582.1], fondo: 9, casas: [
    [9.1, 6.6, '#f1eee7'], [5.2, 6.6, '#f1eee7']] },
  // Polca, acera oeste, paso 30
  { a: [-1944.2, -1730.8], b: [-1947.0, -1736.6], fondo: 9, casas: [
    [6.4, 6.6, '#e9c3a4', { tienda: true }]] },
  // Polca, acera este, pasos 10-12
  { a: [-1829.0, -1542.4], b: [-1840.1, -1564.6], fondo: 9, casas: [
    [5.4, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [9.5, 6.6, '#f1eee7']] },
  // Polca, acera este, pasos 17-19
  { a: [-1860.7, -1602.9], b: [-1872.0, -1627.8], fondo: 9, casas: [
    [6.9, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10.4, 6.6, '#efe6c8']] },
  // Polca, acera este, pasos 30-32
  { a: [-1924.3, -1737.5], b: [-1936.2, -1761.7], fondo: 9, casas: [
    [8.2, 6.6, '#e9c3a4', { tienda: true }], [10, 6.6, '#e9c3a4', { tienda: true }], [8.8, 6.6, '#e9c3a4', { tienda: true }]] },
  // Tajaraste, acera sur, paso 38
  { a: [-2012.1, -1826.1], b: [-2027.0, -1821.7], fondo: 9, casas: [
    [7.8, 6.6, '#efe6c8'], [7.8, 6.6, '#efe6c8']] },
  // Tajaraste, acera norte, pasos 66-70
  { a: [-1826.0, -1928.5], b: [-1777.7, -1949.0], fondo: 9, casas: [
    [13.6, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [8.9, 6.6, '#efe6c8']] },
  // Tajaraste, acera norte, pasos 12-16
  { a: [-1777.7, -1949.1], b: [-1825.8, -1928.0], fondo: 9, casas: [
    [10.1, 6.6, '#f1eee7'], [9.9, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [12.4, 6.6, '#f1eee7']] },
  // Tajaraste, acera sur, pasos 41-43
  { a: [-2045.7, -1822.8], b: [-2026.1, -1822.0], fondo: 9, casas: [
    [7.8, 6.6, '#e9c3a4', { tienda: true }], [10.5, 6.6, '#e9c3a4'], [4.5, 6.6, '#e9c3a4']] },
  // de Felo Monzón, acera norte, paso 1
  { a: [-1981.0, -1752.4], b: [-1959.4, -1761.8], fondo: 9, casas: [
    [7.8, 6.6, '#e9c3a4', { tienda: true }], [7.8, 6.6, '#e9c3a4', { tienda: true }], [7.8, 6.6, '#e9c3a4', { tienda: true }]] },
  // de Felo Monzón, acera norte, paso 5
  { a: [-1935.8, -1781.2], b: [-1929.1, -1784.5], fondo: 9, casas: [
    [7.5, 6.6, '#e9c3a4', { tienda: true }]] },
  // de Felo Monzón, acera norte, pasos 21-40
  { a: [-1732.2, -1870.7], b: [-1613.3, -1929.8], fondo: 9, casas: [
    [4.5, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [8.6, 6.6, '#efe6c8']] },
  // de Felo Monzón, acera sur, paso 1
  { a: [-1977.3, -1742.5], b: [-1954.6, -1752.4], fondo: 9, casas: [
    [8.3, 6.6, '#e9c3a4', { tienda: true }], [8.3, 6.6, '#e9c3a4', { tienda: true }], [8.3, 6.6, '#e9c3a4', { tienda: true }]] },
  // de Felo Monzón, acera sur, pasos 4-12
  { a: [-1936.0, -1761.8], b: [-1856.4, -1800.3], fondo: 9, casas: [
    [5.1, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [13.3, 6.6, '#e9c3a4']] },
  // de Felo Monzón, acera sur, pasos 14-19
  { a: [-1849.7, -1803.0], b: [-1792.7, -1830.5], fondo: 9, casas: [
    [9.5, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [13.8, 6.6, '#f1eee7']] },
  // de Felo Monzón, acera sur, pasos 32-40
  { a: [-1683.7, -1883.4], b: [-1605.2, -1921.9], fondo: 9, casas: [
    [5.1, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [12.3, 6.6, '#f0dd96']] },
  // Mazurca, acera este, paso 4
  { a: [-1803.3, -1875.9], b: [-1799.3, -1867.8], fondo: 9, casas: [
    [8.9, 6.6, '#e6d3b8']] },
  // Mazurca, acera este, paso 6
  { a: [-1792.9, -1855.7], b: [-1787.6, -1845.6], fondo: 9, casas: [
    [11.4, 6.6, '#e6d3b8']] },
  // Mazurca, acera este, paso 11
  { a: [-1773.1, -1814.7], b: [-1767.7, -1803.5], fondo: 9, casas: [
    [12.4, 6.6, '#f0dd96']] },
  // Mazurca, acera este, pasos 26-30
  { a: [-1698.7, -1659.5], b: [-1680.1, -1624.9], fondo: 9, casas: [
    [4.5, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [8.8, 4.0, '#f1eee7']] },
  // Mazurca, acera oeste, pasos 8-9
  { a: [-1792.6, -1830.5], b: [-1787.1, -1818.9], fondo: 9, casas: [
    [6, 6.6, '#efe6c8'], [6.9, 6.6, '#efe6c8']] },
  // Mazurca, acera oeste, paso 32
  { a: [-1687.7, -1607.9], b: [-1683.0, -1598.8], fondo: 9, casas: [
    [10.3, 6.6, '#f1eee7']] },
  // Mazurca, acera oeste, pasos 35-36
  { a: [-1675.4, -1584.4], b: [-1663.6, -1561.5], fondo: 9, casas: [
    [13.1, 4.0, '#f1eee7', { tienda: true }], [12.6, 4.0, '#f1eee7', { tienda: true }]] },
  // de Santiago Amón, acera sur, pasos 4-17
  { a: [-1734.4, -1998.8], b: [-1838.3, -1952.9], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [9.9, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [11.1, 6.6, '#f1eee7']] },
  // de Santiago Amón, acera norte, pasos 3-17
  { a: [-1701.1, -2022.6], b: [-1805.3, -1976.6], fondo: 9, casas: [
    [12.5, 6.6, '#f0dd96'], [5, 6.6, '#f0dd96'], [5, 6.6, '#f1eee7'], [5, 6.6, '#f1eee7'], [5, 6.6, '#f0dd96'], [5, 6.6, '#efe6c8'], [5, 6.6, '#f0dd96'], [9.9, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [10, 6.6, '#f0dd96'], [5, 6.6, '#f1eee7'], [5, 6.6, '#f0dd96'], [5, 6.6, '#f0dd96'], [5, 6.6, '#f1eee7'], [5, 6.6, '#f0dd96'], [5, 6.6, '#f1eee7'], [2.2, 6.6, '#f0dd96'], [2.2, 6.6, '#f1eee7']] },
  // de Agustina Ayala, acera norte, pasos 7-14
  { a: [-1786.8, -2007.6], b: [-1714.8, -2039.9], fondo: 9, casas: [
    [4.5, 6.6, '#e2c079'], [6.2, 6.6, '#f0dd96'], [6.2, 6.6, '#f1eee7'], [8.2, 6.6, '#f0dd96'], [8.2, 6.6, '#f0dd96'], [8.2, 6.6, '#f0dd96'], [13.1, 6.6, '#f1eee7'], [13.1, 6.6, '#f0dd96'], [9.4, 6.6, '#f0dd96'], [9.4, 6.6, '#f0dd96'], [9.3, 6.6, '#f0dd96'], [9.3, 6.6, '#f1eee7'], [7.9, 6.6, '#f0dd96'], [7.9, 6.6, '#f0dd96'], [7.9, 6.6, '#f0dd96'], [9.7, 6.6, '#f1eee7'], [9.7, 6.6, '#f1eee7']] },
  // de Agustina Ayala, acera sur, pasos 7-14
  { a: [-1849.6, -1970.1], b: [-1780.4, -2001.2], fondo: 9, casas: [
    [7.9, 6.6, '#f0dd96'], [12.3, 6.6, '#f0dd96'], [8.2, 6.6, '#f0dd96'], [8.2, 6.6, '#f0dd96'], [8.2, 6.6, '#f0dd96'], [8.7, 6.6, '#f0dd96'], [8.7, 6.6, '#f0dd96'], [8.7, 6.6, '#f0dd96'], [9.4, 6.6, '#f0dd96'], [9.4, 6.6, '#f0dd96'], [9.3, 6.6, '#f0dd96'], [9.3, 6.6, '#f0dd96'], [7.9, 6.6, '#f0dd96'], [7.9, 6.6, '#f0dd96'], [7.9, 6.6, '#f0dd96'], [4.5, 6.6, '#f1eee7']] },
  // Zaranda, acera norte, pasos 7-11
  { a: [-2122.1, -1916.4], b: [-2157.9, -1904.4], fondo: 9, casas: [
    [6.5, 4.0, '#ece8e0'], [10, 4.0, '#9d9890'], [10, 4.0, '#9d9890'], [10, 4.0, '#f1eee7'], [4.5, 0, B, { fondo: 16 }]] },
  // De Claudio Toledo Cabrera, acera norte, pasos 1-11
  { a: [-1680.3, -1624.9], b: [-1572.7, -1682.3], fondo: 9, casas: [
    [9.2, 6.6, '#f1eee7'], [9.2, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [13.6, 4.0, '#f1eee7']] },
  // De Claudio Toledo Cabrera, acera norte, pasos 12-19
  { a: [-1572.7, -1682.3], b: [-1508.2, -1717.2], fondo: 9, casas: [
    [6.4, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 4.0, '#f1eee7'], [10, 0, B, { fondo: 16 }], [10, 6.6, '#f1eee7'], [10, 0, B, { fondo: 16 }], [5, 0, B, { fondo: 16 }], [5, 6.6, '#f1eee7'], [7, 6.6, '#f1eee7']] },
  // De Claudio Toledo Cabrera, acera sur, paso 8
  { a: [-1605.7, -1650.1], b: [-1600.6, -1652.8], fondo: 9, casas: [
    [5.8, 6.6, '#e2c079']] },
  // De Claudio Toledo Cabrera, acera sur, paso 10
  { a: [-1587.8, -1659.9], b: [-1582.5, -1662.7], fondo: 9, casas: [
    [6, 6.6, '#e2c079']] },
  // De Claudio Toledo Cabrera, acera sur, paso 12
  { a: [-1569.8, -1669.7], b: [-1564.3, -1672.7], fondo: 9, casas: [
    [6.3, 6.6, '#e2c079']] },
  // De Claudio Toledo Cabrera, acera sur, paso 18
  { a: [-1510.5, -1693.2], b: [-1505.1, -1696.1], fondo: 9, casas: [
    [6.1, 6.6, '#e2c079']] },
  // De Claudio Toledo Cabrera, acera sur, paso 20
  { a: [-1492.1, -1702.8], b: [-1487.0, -1705.6], fondo: 9, casas: [
    [5.8, 6.6, '#e2c079']] },
  // de Miguel Hernández, acera sur, paso 3
  { a: [-2070.8, -1881.2], b: [-2081.6, -1877.4], fondo: 9, casas: [
    [11.5, 6.6, '#f1eee7']] },
  // Torriani, acera norte, paso 1
  { a: [-1538.4, -1509.0], b: [-1523.4, -1517.0], fondo: 9, casas: [
    [8.5, 6.6, '#f1eee7'], [8.5, 6.6, '#f1eee7']] },
  // Torriani, acera norte, pasos 3-4
  { a: [-1491.6, -1534.5], b: [-1471.7, -1545.2], fondo: 9, casas: [
    [7.9, 6.6, '#f1eee7'], [7.9, 6.6, '#f1eee7'], [6.8, 6.6, '#f1eee7']] },
  // Torriani, acera norte, paso 5
  { a: [-1465.0, -1548.7], b: [-1455.8, -1553.6], fondo: 9, casas: [
    [10.5, 6.6, '#f1eee7']] },
  // Torriani, acera norte, paso 7
  { a: [-1446.0, -1560.1], b: [-1429.5, -1569.2], fondo: 9, casas: [
    [9.4, 6.6, '#f1eee7'], [9.4, 6.6, '#f1eee7']] },
  // Torriani, acera norte, paso 12
  { a: [-1370.5, -1601.5], b: [-1362.2, -1606.1], fondo: 9, casas: [
    [9.4, 6.6, '#f1eee7']] },
  // de Alonso Quesada, acera este, pasos 1-2
  { a: [-1972.4, -2037.3], b: [-1963.8, -2008.6], fondo: 9, casas: [
    [9.9, 4.0, '#f1eee7', { tienda: true }], [9.9, 4.0, '#f1eee7', { tienda: true }], [10.1, 4.0, '#f1eee7']] },
  // de Alonso Quesada, acera oeste, paso 3
  { a: [-1966.1, -1989.2], b: [-1970.9, -1995.4], fondo: 9, casas: [
    [7.8, 4.0, '#dd7d70']] },
  // de Alonso Quesada, acera oeste, pasos 1-2
  { a: [-1978.9, -2025.0], b: [-1972.8, -2004.7], fondo: 9, casas: [
    [10, 4.0, '#f1eee7'], [11.2, 4.0, '#f1eee7']] },
  // de Gabriel Celaya, acera este, paso 1
  { a: [-2258.8, -2081.8], b: [-2254.8, -2063.5], fondo: 9, casas: [
    [9.4, 6.6, '#f0dd96'], [9.4, 6.6, '#f0dd96']] },
  // de Gabriel Celaya, acera oeste, paso 1
  { a: [-2269.7, -2082.0], b: [-2265.2, -2061.2], fondo: 9, casas: [
    [10.6, 6.6, '#f0dd96'], [10.6, 6.6, '#f0dd96']] },
  // de Palacio Valdés, acera oeste, pasos 2-3
  { a: [-1818.5, -1428.8], b: [-1830.2, -1442.1], fondo: 9, casas: [
    [9, 6.6, '#efe6c8'], [8.7, 4.0, '#f1eee7']] },
  // de Palacio Valdés, acera oeste, pasos 4-5
  { a: [-1831.3, -1443.7], b: [-1848.9, -1463.9], fondo: 9, casas: [
    [12.6, 6.6, '#f1eee7'], [7.1, 6.6, '#efe6c8'], [7.1, 6.6, '#efe6c8']] },
  // de Palacio Valdés, acera sur, pasos 6-8
  { a: [-1860.7, -1478.9], b: [-1885.1, -1497.0], fondo: 9, casas: [
    [9.2, 6.6, '#efe6c8'], [7.3, 4.0, '#9d9890'], [7.3, 4.0, '#9d9890'], [6.6, 4.0, '#f1eee7']] },
  // el Fausto, acera oeste, pasos 1-2
  { a: [-2080.9, -1358.6], b: [-2063.1, -1397.5], fondo: 9, casas: [
    [8.2, 6.6, '#f1eee7'], [8.2, 6.6, '#f1eee7'], [8.2, 6.6, '#f1eee7'], [9.1, 6.6, '#f1eee7'], [9.1, 6.6, '#f1eee7']] },
  // el Fausto, acera este, paso 3
  { a: [-2046.7, -1406.1], b: [-2051.7, -1395.2], fondo: 9, casas: [
    [12, 6.6, '#f1eee7']] },
  // el Fausto, acera oeste, pasos 4-6
  { a: [-2050.9, -1424.8], b: [-2032.3, -1465.3], fondo: 9, casas: [
    [11.1, 6.6, '#f1eee7'], [12.4, 6.6, '#f1eee7'], [10.5, 6.6, '#f1eee7'], [10.5, 6.6, '#f1eee7']] },
  // el Fausto, acera este, pasos 1-2
  { a: [-2065.2, -1366.8], b: [-2053.2, -1393.0], fondo: 9, casas: [
    [10.7, 6.6, '#f1eee7'], [9.1, 6.6, '#f1eee7'], [9.1, 6.6, '#f1eee7']] },
  // el Fausto, acera oeste, paso 3
  { a: [-2057.1, -1410.9], b: [-2062.1, -1400.0], fondo: 9, casas: [
    [12, 6.6, '#f1eee7']] },
  // el Fausto, acera este, pasos 4-6
  { a: [-2040.1, -1419.9], b: [-2022.8, -1457.7], fondo: 9, casas: [
    [11.1, 6.6, '#f1eee7'], [12.4, 6.6, '#f1eee7'], [9, 6.6, '#f1eee7'], [9, 6.6, '#f1eee7']] },
  // Sirinoque, acera oeste, paso 5
  { a: [-1592.2, -1799.5], b: [-1598.9, -1813.6], fondo: 9, casas: [
    [7.8, 4.0, '#e2c079'], [7.8, 4.0, '#e2c079']] },
  // de la Gloria Fuertes, acera este, paso 4
  { a: [-2107.7, -1971.5], b: [-2103.6, -1959.5], fondo: 9, casas: [
    [12.7, 6.6, '#e4cfc9']] },
  // de la Gloria Fuertes, acera este, pasos 2-3
  { a: [-2118.5, -2004.3], b: [-2107.0, -1970.4], fondo: 9, casas: [
    [8.9, 4.0, '#f1eee7'], [8.9, 4.0, '#f1eee7'], [9, 4.0, '#f1eee7'], [9, 4.0, '#f1eee7']] },
  // Seguidilla, acera sur, pasos 1-3
  { a: [-1464.3, -1940.7], b: [-1511.9, -1917.1], fondo: 9, casas: [
    [8.2, 6.6, '#e9c3a4'], [8.2, 6.6, '#e9c3a4'], [8.2, 6.6, '#e9c3a4'], [9.5, 6.6, '#a9abad'], [9.5, 6.6, '#a9abad'], [9.5, 6.6, '#a9abad']] },
  // Seguidilla, acera sur, paso 8
  { a: [-1548.0, -1899.6], b: [-1554.5, -1896.4], fondo: 9, casas: [
    [7.3, 4.0, '#e2c079']] },
  // Seguidilla, acera norte, pasos 13-14
  { a: [-1615.1, -1876.9], b: [-1643.1, -1863.1], fondo: 9, casas: [
    [7.8, 4.0, '#f1eee7'], [7.8, 4.0, '#f1eee7'], [7.8, 4.0, '#f1eee7'], [7.8, 4.0, '#f1eee7']] },
  // Seguidilla, acera norte, pasos 18-20
  { a: [-1675.3, -1848.1], b: [-1714.0, -1829.2], fondo: 9, casas: [
    [10, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [11.1, 6.6, '#e9c3a4'], [12, 6.6, '#e9c3a4']] },
  // Seguidilla, acera norte, pasos 10-12
  { a: [-1583.3, -1892.1], b: [-1617.4, -1875.1], fondo: 9, casas: [
    [7.2, 6.6, '#f0dd96'], [7.3, 6.6, '#f0dd96'], [7.3, 6.6, '#f0dd96'], [8.1, 6.6, '#f0dd96'], [8.1, 6.6, '#f0dd96']] },
  // Seguidilla, acera norte, pasos 15-16
  { a: [-1637.7, -1866.0], b: [-1670.9, -1849.7], fondo: 9, casas: [
    [9.6, 6.6, '#f0dd96'], [9.6, 6.6, '#f0dd96'], [8.9, 6.6, '#f0dd96'], [8.9, 6.6, '#f0dd96']] },
  // Seguidilla, acera norte, paso 17
  { a: [-1675.3, -1848.0], b: [-1682.8, -1844.3], fondo: 9, casas: [
    [8.4, 6.6, '#f0dd96']] },
  // de Camilo José Cela, acera norte, paso 5
  { a: [-2298.0, -1942.6], b: [-2310.7, -1939.9], fondo: 9, casas: [
    [13, 6.6, '#f1eee7', { tienda: true }]] },
  // Folias, acera sur, pasos 4-11
  { a: [-1697.6, -1928.5], b: [-1790.4, -1881.9], fondo: 9, casas: [
    [4.5, 6.6, '#efe6c8'], [12.8, 6.6, '#efe6c8'], [12.7, 6.6, '#efe6c8'], [9.1, 6.6, '#efe6c8'], [9.1, 6.6, '#efe6c8'], [10.4, 6.6, '#efe6c8'], [10.4, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8'], [9.3, 6.6, '#efe6c8'], [9.3, 6.6, '#efe6c8']] },
  // Folias, acera sur, pasos 13-21
  { a: [-1820.9, -1867.4], b: [-1939.4, -1811.7], fondo: 9, casas: [
    [7.9, 6.6, '#d9b996'], [13.3, 6.6, '#d9b996'], [8.3, 6.6, '#d9b996'], [8.3, 6.6, '#d9b996'], [8.5, 6.6, '#d9b996'], [8.5, 6.6, '#d9b996'], [8.8, 6.6, '#d9b996'], [8.8, 6.6, '#d9b996'], [10.1, 6.6, '#d9b996'], [10.1, 6.6, '#d9b996'], [10, 6.6, '#d9b996'], [10, 6.6, '#d9b996'], [9.3, 6.6, '#d9b996'], [9.3, 6.6, '#d9b996']] },
  // de María Morales Topham, acera norte, pasos 2-4
  { a: [-1599.8, -1911.0], b: [-1620.5, -1900.5], fondo: 9, casas: [
    [5.3, 6.6, '#f0dd96'], [9.1, 6.6, '#f0dd96'], [8.8, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera sur, pasos 5-6
  { a: [-1616.1, -1890.6], b: [-1632.9, -1882.1], fondo: 9, casas: [
    [9.4, 6.6, '#f0dd96'], [9.4, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera norte, pasos 7-8
  { a: [-1642.0, -1890.1], b: [-1654.1, -1884.0], fondo: 9, casas: [
    [6.8, 6.6, '#f0dd96'], [6.8, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera sur, pasos 9-10
  { a: [-1652.5, -1873.2], b: [-1676.5, -1861.1], fondo: 9, casas: [
    [7.3, 6.6, '#f0dd96'], [7.3, 6.6, '#f0dd96'], [12.2, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera sur, pasos 11-16
  { a: [-1680.7, -1859.2], b: [-1773.2, -1814.9], fondo: 9, casas: [
    [8.1, 6.6, '#f0dd96'], [7.5, 6.6, '#f0dd96'], [7.5, 6.6, '#f0dd96'], [8.9, 6.6, '#f0dd96'], [8.9, 6.6, '#f0dd96'], [8.5, 6.6, '#f0dd96'], [8.5, 6.6, '#f0dd96'], [10.2, 6.6, '#f0dd96'], [10.2, 6.6, '#f0dd96'], [8.1, 6.6, '#f0dd96'], [8.1, 6.6, '#f0dd96'], [8.1, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera sur, pasos 2-4
  { a: [-1589.0, -1903.9], b: [-1615.4, -1890.5], fondo: 9, casas: [
    [11.7, 6.6, '#f0dd96'], [9.1, 6.6, '#f0dd96'], [8.8, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera norte, pasos 5-6
  { a: [-1621.1, -1900.5], b: [-1637.9, -1892.0], fondo: 9, casas: [
    [9.4, 6.6, '#f0dd96'], [9.4, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera sur, pasos 7-8
  { a: [-1637.0, -1880.4], b: [-1649.1, -1874.3], fondo: 9, casas: [
    [6.8, 6.6, '#f0dd96'], [6.8, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera norte, pasos 9-10
  { a: [-1657.3, -1882.7], b: [-1678.2, -1872.1], fondo: 9, casas: [
    [7.3, 6.6, '#f0dd96'], [7.3, 6.6, '#f0dd96'], [8.8, 6.6, '#f0dd96']] },
  // de María Morales Topham, acera sur, paso 17
  { a: [-1773.1, -1814.7], b: [-1763.7, -1819.3], fondo: 9, casas: [
    [10.5, 6.6, '#f0dd96']] },
  // de Agustín Millares Sall, acera oeste, paso 1
  { a: [-2153.6, -1943.6], b: [-2160.5, -1964.0], fondo: 9, casas: [
    [10.8, 6.6, '#e9c3a4'], [10.8, 6.6, '#e9c3a4']] },
  // de Agustín Millares Sall, acera este, paso 2
  { a: [-2155.0, -1978.4], b: [-2151.2, -1967.0], fondo: 9, casas: [
    [12, 6.6, '#e9c3a4']] },
  // de Agustín Millares Sall, acera oeste, pasos 3-4
  { a: [-2158.5, -1958.4], b: [-2170.1, -1992.8], fondo: 9, casas: [
    [10.9, 6.6, '#e9c3a4'], [10.9, 6.6, '#e9c3a4'], [7.2, 6.6, '#e9c3a4'], [7.2, 6.6, '#e9c3a4']] },
  // de Agustín Millares Sall, acera este, paso 1
  { a: [-2147.2, -1954.8], b: [-2151.4, -1967.1], fondo: 9, casas: [
    [12.9, 6.6, '#e9c3a4']] },
  // de Agustín Millares Sall, acera oeste, paso 2
  { a: [-2164.2, -1975.3], b: [-2160.4, -1963.9], fondo: 9, casas: [
    [12, 6.6, '#e9c3a4']] },
  // de Agustín Millares Sall, acera este, pasos 3-4
  { a: [-2147.1, -1954.9], b: [-2162.1, -1999.4], fondo: 9, casas: [
    [9.6, 6.6, '#e9c3a4'], [9.6, 6.6, '#e9c3a4'], [9.6, 6.6, '#e9c3a4'], [9.1, 6.6, '#e9c3a4'], [9.1, 6.6, '#e9c3a4']] },
  // de Campoamor, acera oeste, pasos 21-22
  { a: [-2050.6, -1902.1], b: [-2046.9, -1922.3], fondo: 9, casas: [
    [10.2, 4.0, '#f1eee7', { tienda: true }], [10.3, 6.6, '#f1eee7']] },
  // de Campoamor, acera oeste, paso 26
  { a: [-2050.5, -1957.7], b: [-2049.2, -1964.3], fondo: 9, casas: [
    [6.7, 4.0, '#f1eee7']] },
  // de Campoamor, acera oeste, paso 29
  { a: [-2040.1, -1980.3], b: [-2041.6, -1988.8], fondo: 9, casas: [
    [8.6, 4.0, '#f1eee7']] },
  // de Campoamor, acera oeste, pasos 39-41
  { a: [-2057.6, -2085.1], b: [-2064.8, -2115.9], fondo: 9, casas: [
    [11.6, 4.0, '#f1eee7'], [10, 4.0, '#f0dd96'], [10, 6.6, '#f1eee7']] },
  // de Campoamor, acera este, pasos 30-32
  { a: [-2029.5, -1986.3], b: [-2035.1, -2017.8], fondo: 9, casas: [
    [7.1, 6.6, '#f1eee7'], [7.1, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7', { tienda: true }], [7.9, 6.6, '#f1eee7', { tienda: true }]] },
  // de Campoamor, acera este, pasos 34-36
  { a: [-2037.8, -2026.3], b: [-2043.2, -2060.4], fondo: 9, casas: [
    [13.2, 4.0, '#f1eee7'], [10.1, 4.0, '#f1eee7'], [11.2, 4.0, '#f1eee7', { tienda: true }]] },
  // de Campoamor, acera este, pasos 38-39
  { a: [-2043.6, -2072.9], b: [-2050.1, -2103.3], fondo: 9, casas: [
    [11.6, 0, B, { fondo: 16 }], [9.8, 4.0, '#f1eee7'], [9.8, 4.0, '#f1eee7']] },
  // de Campoamor, acera este, paso 41
  { a: [-2052.2, -2111.4], b: [-2054.0, -2119.4], fondo: 9, casas: [
    [8.2, 6.6, '#f1eee7']] },
  // ===== TITERROY (carpeta titerroy) =====
  // de Blas Cabrera Topham, acera oeste, pasos 1-2
  { a: [-759.2, -327.1], b: [-740.9, -291.2], fondo: 9, casas: [
    [9.4, 9.4, '#efe6c8', { tienda: true }], [9.4, 9.4, '#efe6c8', { tienda: true }], [10.7, 9.4, '#efe6c8', { tienda: true }], [10.7, 9.4, '#efe6c8', { tienda: true }]] },
  // la Fermina, acera este, paso 3
  { a: [-543.0, -1087.8], b: [-538.8, -1082.2], fondo: 9, casas: [
    [6.9, 6.6, '#e6d3b8']] },
  // la Fermina, acera este, paso 6
  { a: [-517.9, -1054.2], b: [-507.5, -1039.7], fondo: 9, casas: [
    [8.9, 4.0, '#f1eee7'], [8.9, 4.0, '#f1eee7']] },
  // la Fermina, acera oeste, paso 1
  { a: [-574.6, -1112.2], b: [-562.1, -1095.1], fondo: 9, casas: [
    [10.6, 4.0, '#f1eee7'], [10.6, 4.0, '#f1eee7']] },
  // la Fermina, acera oeste, paso 3
  { a: [-557.2, -1088.6], b: [-548.2, -1076.7], fondo: 9, casas: [
    [7.5, 4.0, '#9d9890'], [7.5, 4.0, '#9d9890']] },
  // la Fermina, acera oeste, paso 6
  { a: [-525.0, -1045.2], b: [-516.2, -1032.9], fondo: 9, casas: [
    [7.5, 4.0, '#f1eee7'], [7.5, 4.0, '#f1eee7']] },
  // del Doctor Severo Ochoa, acera sur, paso 2
  { a: [-692.6, -632.8], b: [-709.7, -618.6], fondo: 9, casas: [
    [11.1, 6.6, '#f1eee7'], [11.1, 6.6, '#f1eee7']] },
  // del Doctor Severo Ochoa, acera este, paso 8
  { a: [-758.2, -574.5], b: [-766.9, -564.1], fondo: 9, casas: [
    [13.6, 6.6, '#f1eee7', { tienda: true }]] },
  // del Doctor Severo Ochoa, acera este, paso 15
  { a: [-815.4, -506.4], b: [-825.8, -493.1], fondo: 9, casas: [
    [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7']] },
  // del Doctor Severo Ochoa, acera este, paso 17
  { a: [-844.7, -465.8], b: [-850.9, -458.5], fondo: 9, casas: [
    [9.6, 6.6, '#f1eee7']] },
  // del Doctor Severo Ochoa, acera oeste, pasos 7-8
  { a: [-754.6, -594.7], b: [-774.0, -571.6], fondo: 9, casas: [
    [10.1, 6.6, '#e6d3b8'], [10.1, 6.6, '#e6d3b8'], [9.9, 6.6, '#f1eee7', { tienda: true }]] },
  // del Doctor Severo Ochoa, acera oeste, pasos 14-15
  { a: [-812.9, -523.4], b: [-832.6, -498.4], fondo: 9, casas: [
    [9.1, 6.6, '#f1eee7', { tienda: true }], [9.1, 6.6, '#f1eee7', { tienda: true }], [13.7, 4.0, '#f1eee7']] },
  // la Carmen, acera sur, paso 8
  { a: [-831.7, -539.6], b: [-822.1, -531.2], fondo: 9, casas: [
    [12.7, 4.0, '#f1eee7']] },
  // el Rafael, acera norte, paso 1
  { a: [-808.0, -994.7], b: [-790.5, -1007.3], fondo: 9, casas: [
    [10.8, 4.0, '#f1eee7'], [10.8, 4.0, '#f1eee7']] },
  // el Rafael, acera norte, paso 6
  { a: [-763.2, -1015.2], b: [-743.1, -1025.0], fondo: 9, casas: [
    [11.1, 4.0, '#f1eee7'], [11.1, 4.0, '#f1eee7']] },
  // el Rafael, acera norte, paso 5
  { a: [-753.7, -1019.6], b: [-763.1, -1015.0], fondo: 9, casas: [
    [10.4, 6.6, '#f1eee7']] },
  // de José Pereyra Galviaty, acera este, paso 3
  { a: [-256.4, -548.2], b: [-267.9, -563.8], fondo: 9, casas: [
    [9.7, 6.6, '#f1eee7'], [9.7, 6.6, '#f1eee7']] },
  // Guadalajara, acera este, paso 3
  { a: [-764.0, -1303.5], b: [-753.6, -1289.4], fondo: 9, casas: [
    [8.8, 6.6, '#f1eee7', { tienda: true }], [8.8, 6.6, '#f1eee7', { tienda: true }]] },
  // Guadalajara, acera oeste, paso 3
  { a: [-767.3, -1289.0], b: [-758.2, -1276.5], fondo: 9, casas: [
    [7.7, 4.0, '#f1eee7'], [7.7, 4.0, '#f1eee7']] },
  // de Toledo, acera este, pasos 1-3
  { a: [-994.9, -1546.1], b: [-963.8, -1504.2], fondo: 9, casas: [
    [10.8, 4.0, '#f1eee7'], [10.8, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.7, 6.6, '#f1eee7'], [7.7, 6.6, '#f1eee7']] },
  // de Toledo, acera este, paso 7
  { a: [-953.6, -1490.7], b: [-948.4, -1483.8], fondo: 9, casas: [
    [8.7, 4.0, '#f1eee7']] },
  // de Toledo, acera este, paso 9
  { a: [-937.5, -1468.4], b: [-933.8, -1463.4], fondo: 9, casas: [
    [6.3, 4.0, '#f1eee7']] },
  // de Toledo, acera este, pasos 13-14
  { a: [-910.4, -1432.1], b: [-895.2, -1411.5], fondo: 9, casas: [
    [13.7, 6.6, '#f1eee7'], [11.9, 4.0, '#f1eee7']] },
  // de Toledo, acera este, paso 21
  { a: [-829.7, -1322.4], b: [-824.6, -1315.6], fondo: 9, casas: [
    [8.5, 6.6, '#f1eee7']] },
  // de Colombia, acera este, pasos 3-8
  { a: [-816.8, -144.1], b: [-801.2, -108.4], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7', { tienda: true }], [7.9, 6.6, '#f1eee7', { tienda: true }], [7.9, 6.6, '#f1eee7', { tienda: true }], [11.8, 4.0, '#f1eee7'], [5.4, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [8, 6.6, '#f1eee7']] },
  // de Colombia, acera oeste, pasos 9-12
  { a: [-805.0, -94.8], b: [-783.6, -46.4], fondo: 9, casas: [
    [11, 4.0, '#f1eee7'], [10.9, 6.6, '#e9c3a4'], [10.9, 4.0, '#f1eee7'], [10.1, 6.6, '#f1eee7'], [10.1, 6.6, '#f1eee7']] },
  // de Colombia, acera oeste, pasos 2-8
  { a: [-839.9, -176.6], b: [-808.5, -104.9], fondo: 9, casas: [
    [7.3, 6.6, '#f1eee7', { tienda: true }], [7.3, 6.6, '#f1eee7', { tienda: true }], [13.9, 4.0, '#f1eee7'], [7.9, 4.0, '#f1eee7', { tienda: true }], [7.9, 4.0, '#f1eee7', { tienda: true }], [11.8, 4.0, '#f1eee7'], [5.4, 4.0, '#f1eee7', { tienda: true }], [8.2, 4.0, '#f1eee7'], [8.5, 4.0, '#f1eee7']] },
  // de Colombia, acera este, pasos 10-12
  { a: [-792.1, -87.2], b: [-778.9, -57.4], fondo: 9, casas: [
    [9.8, 4.0, '#e2c079'], [10.9, 6.6, '#f1eee7'], [12, 4.0, '#f1eee7']] },
  // de Teruel, acera este, pasos 1-2
  { a: [-948.6, -83.8], b: [-934.6, -117.3], fondo: 9, casas: [
    [10, 9.4, '#a9abad'], [10, 9.4, '#a9abad'], [8.1, 9.4, '#e9c3a4'], [8.1, 9.4, '#e9c3a4']] },
  // de Teruel, acera sur, paso 5
  { a: [-898.0, -150.7], b: [-886.1, -155.1], fondo: 9, casas: [
    [12.7, 9.4, '#e9c3a4']] },
  // de Teruel, acera sur, paso 6
  { a: [-876.5, -161.5], b: [-863.9, -166.4], fondo: 9, casas: [
    [13.5, 6.6, '#f1eee7', { tienda: true }]] },
  // de Teruel, acera sur, pasos 8-10
  { a: [-831.8, -178.2], b: [-804.7, -187.5], fondo: 9, casas: [
    [6.4, 6.6, '#e9c3a4'], [7, 6.6, '#e9c3a4'], [7.6, 6.6, '#e9c3a4'], [7.6, 6.6, '#e9c3a4']] },
  // Guanareme, acera este, pasos 2-5
  { a: [-698.8, -1738.8], b: [-697.3, -1694.7], fondo: 9, casas: [
    [12.6, 4.0, '#f1eee7'], [13.2, 6.6, '#f1eee7'], [11.1, 4.0, '#f1eee7', { tienda: true }], [7.2, 4.0, '#f1eee7']] },
  // Guanareme, acera este, pasos 6-9
  { a: [-697.3, -1694.7], b: [-695.2, -1634.7], fondo: 9, casas: [
    [9, 4.0, '#f1eee7'], [9, 4.0, '#f1eee7'], [7.6, 6.6, '#f1eee7'], [7.6, 6.6, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [11.7, 0, B, { fondo: 16 }]] },
  // Guanareme, acera este, paso 12
  { a: [-684.6, -1594.0], b: [-684.4, -1584.7], fondo: 9, casas: [
    [9.3, 4.0, '#f1eee7']] },
  // Guanareme, acera oeste, pasos 2-12
  { a: [-707.7, -1738.5], b: [-702.5, -1580.4], fondo: 9, casas: [
    [12.6, 4.0, '#f1eee7'], [6.6, 6.6, '#e2c079'], [6.6, 6.6, '#f1eee7'], [5.5, 6.6, '#f1eee7'], [5.5, 6.6, '#e2c079'], [10.1, 6.6, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [8.4, 6.6, '#e6d3b8'], [8.4, 6.6, '#e6d3b8'], [8.4, 6.6, '#e6d3b8'], [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7'], [9.5, 6.6, '#f1eee7'], [10.9, 6.6, '#f1eee7']] },
  // Guanareme, acera oeste, paso 13
  { a: [-702.5, -1580.4], b: [-701.9, -1560.2], fondo: 9, casas: [
    [10.1, 4.0, '#dd7d70'], [10.1, 0, B, { fondo: 16 }]] },
  // del Doctor Gregorio Chil y Naranjo, acera oeste, pasos 1-2
  { a: [-566.2, -692.7], b: [-581.1, -714.0], fondo: 9, casas: [
    [8.7, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7']] },
  // del Doctor Gregorio Chil y Naranjo, acera oeste, pasos 6-7
  { a: [-592.0, -729.7], b: [-613.2, -758.7], fondo: 9, casas: [
    [7.7, 4.0, '#f1eee7'], [7.7, 4.0, '#f1eee7'], [7.7, 4.0, '#f1eee7'], [12.9, 6.6, '#efe6c8']] },
  // del Doctor Gregorio Chil y Naranjo, acera oeste, paso 8
  { a: [-619.0, -765.9], b: [-631.1, -782.1], fondo: 9, casas: [
    [10.1, 6.6, '#f1eee7'], [10.1, 6.6, '#f1eee7']] },
  // del Doctor Gregorio Chil y Naranjo, acera oeste, paso 9
  { a: [-636.4, -789.7], b: [-640.7, -795.5], fondo: 9, casas: [
    [7.2, 6.6, '#f1eee7']] },
  // del Doctor Gregorio Chil y Naranjo, acera este, pasos 1-2
  { a: [-557.3, -698.9], b: [-571.9, -719.9], fondo: 9, casas: [
    [8.7, 6.6, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7']] },
  // del Doctor Gregorio Chil y Naranjo, acera este, paso 8
  { a: [-611.9, -774.2], b: [-622.3, -788.2], fondo: 9, casas: [
    [8.7, 4.0, '#f1eee7'], [8.7, 4.0, '#f1eee7']] },
  // del Doctor Gregorio Chil y Naranjo, acera este, paso 9
  { a: [-627.0, -796.2], b: [-632.8, -804.0], fondo: 9, casas: [
    [9.7, 4.0, '#f1eee7']] },
  // Veracruz, acera este, paso 1
  { a: [-730.9, -1406.2], b: [-735.9, -1413.0], fondo: 9, casas: [
    [8.4, 6.6, '#f1eee7']] },
  // Veracruz, acera oeste, paso 3
  { a: [-763.0, -1416.7], b: [-753.2, -1403.5], fondo: 9, casas: [
    [16.4, 0, B, { fondo: 16 }]] },
  // de Maciot de Bethencourt, acera este, paso 8
  { a: [-645.2, -1617.1], b: [-644.8, -1604.7], fondo: 9, casas: [
    [12.4, 4.0, '#e6d3b8']] },
  // de Maciot de Bethencourt, acera este, pasos 10-13
  { a: [-646.0, -1635.3], b: [-647.3, -1670.1], fondo: 9, casas: [
    [11.6, 4.0, '#f1eee7'], [10.2, 4.0, '#f1eee7'], [10.2, 4.0, '#f1eee7'], [4.5, 4.0, '#f1eee7']] },
  // de Maciot de Bethencourt, acera oeste, pasos 2-3
  { a: [-650.6, -1501.4], b: [-651.3, -1525.2], fondo: 9, casas: [
    [12.8, 6.6, '#f1eee7'], [11, 4.0, '#f1eee7']] },
  // de Guatemala, acera sur, paso 1
  { a: [-622.1, -184.9], b: [-634.8, -178.3], fondo: 9, casas: [
    [7.2, 4.0, '#d9b996'], [7.2, 4.0, '#d9b996']] },
  // de Guatemala, acera norte, pasos 2-3
  { a: [-655.7, -181.7], b: [-667.7, -175.4], fondo: 9, casas: [
    [6.9, 6.6, '#efe6c8'], [6.7, 4.0, '#f1eee7']] },
  // de Guatemala, acera norte, paso 1
  { a: [-631.0, -194.3], b: [-640.6, -189.4], fondo: 9, casas: [
    [10.7, 6.6, '#f1eee7']] },
  // de Guatemala, acera sur, pasos 2-3
  { a: [-650.3, -171.4], b: [-668.1, -162.2], fondo: 9, casas: [
    [6.9, 6.6, '#f1eee7'], [13.1, 4.0, '#f1eee7']] },
  // Timbayba, acera norte, paso 1
  { a: [-697.1, -745.0], b: [-686.0, -753.2], fondo: 9, casas: [
    [13.8, 4.0, '#f1eee7']] },
  // Timbayba, acera sur, pasos 2-3
  { a: [-680.1, -746.1], b: [-652.4, -766.3], fondo: 9, casas: [
    [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [8.6, 6.6, '#e2c079'], [8.6, 6.6, '#e2c079']] },
  // Timbayba, acera norte, pasos 4-5
  { a: [-671.6, -763.9], b: [-638.0, -788.4], fondo: 9, casas: [
    [8.5, 4.0, '#f1eee7'], [8.5, 4.0, '#f1eee7'], [8.2, 6.6, '#e9c3a4'], [8.2, 6.6, '#e9c3a4'], [8.2, 6.6, '#e9c3a4']] },
  // Timbayba, acera sur, paso 6
  { a: [-631.1, -782.1], b: [-637.9, -777.1], fondo: 9, casas: [
    [8.4, 4.0, '#dd7d70']] },
  // Timbayba, acera sur, pasos 7-11
  { a: [-622.5, -788.5], b: [-574.4, -823.3], fondo: 9, casas: [
    [13.5, 4.0, '#f1eee7'], [11.3, 4.0, '#f1eee7'], [12.9, 4.0, '#f1eee7'], [12.2, 4.0, '#f1eee7'], [9.4, 4.0, '#f1eee7']] },
  // Timbayba, acera sur, paso 1
  { a: [-692.1, -737.2], b: [-680.5, -745.7], fondo: 9, casas: [
    [7.2, 6.6, '#f1eee7'], [7.2, 6.6, '#f1eee7']] },
  // Timbayba, acera norte, pasos 2-3
  { a: [-685.5, -753.5], b: [-657.9, -773.7], fondo: 9, casas: [
    [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7']] },
  // Timbayba, acera sur, pasos 4-5
  { a: [-666.1, -756.4], b: [-632.6, -781.0], fondo: 9, casas: [
    [8.5, 4.0, '#f1eee7'], [8.5, 4.0, '#f1eee7'], [8.2, 6.6, '#f1eee7'], [8.2, 6.6, '#f1eee7'], [8.2, 6.6, '#f1eee7']] },
  // Timbayba, acera norte, paso 6
  { a: [-636.4, -789.7], b: [-643.4, -784.6], fondo: 9, casas: [
    [8.6, 4.0, '#f1eee7']] },
  // Timbayba, acera norte, pasos 8-12
  { a: [-615.9, -804.5], b: [-574.1, -834.7], fondo: 9, casas: [
    [10.1, 6.6, '#f1eee7'], [12.9, 4.0, '#f1eee7'], [12.2, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [7.9, 4.0, '#f1eee7']] },
  // de Carlos III, acera norte, pasos 3-5
  { a: [-385.2, -815.6], b: [-416.3, -792.3], fondo: 9, casas: [
    [11.4, 4.0, '#f1eee7'], [13, 4.0, '#9d9890'], [7.3, 6.6, '#e6d3b8'], [7.3, 6.6, '#e6d3b8']] },
  // de Carlos III, acera sur, paso 5
  { a: [-407.4, -785.0], b: [-401.1, -789.6], fondo: 9, casas: [
    [7.8, 4.0, '#f1eee7']] },
  // de Carlos III, acera norte, paso 6
  { a: [-415.0, -793.6], b: [-429.3, -782.9], fondo: 9, casas: [
    [8.9, 4.0, '#f1eee7', { tienda: true }], [8.9, 4.0, '#f1eee7', { tienda: true }]] },
  // de Carlos III, acera norte, pasos 9-10
  { a: [-459.2, -761.4], b: [-467.1, -755.4], fondo: 9, casas: [
    [4.5, 6.6, '#a9abad', { tienda: true }], [6.2, 4.0, '#f1eee7', { tienda: true }]] },
  // de Carlos III, acera norte, pasos 11-13
  { a: [-475.1, -746.6], b: [-513.9, -717.9], fondo: 9, casas: [
    [12.9, 4.0, '#f1eee7'], [9.6, 4.0, '#efe6c8'], [9.6, 4.0, '#efe6c8'], [8.1, 4.0, '#f1eee7'], [8.1, 4.0, '#f1eee7']] },
  // de Carlos III, acera norte, pasos 14-16
  { a: [-521.9, -711.9], b: [-550.6, -690.4], fondo: 9, casas: [
    [7.2, 4.0, '#f1eee7'], [7.2, 4.0, '#f1eee7'], [13.9, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7']] },
  // de Carlos III, acera norte, pasos 17-20
  { a: [-559.9, -684.3], b: [-595.4, -658.3], fondo: 9, casas: [
    [7.2, 4.0, '#f1eee7'], [7.2, 4.0, '#f1eee7'], [4.6, 4.0, '#5f8f5a'], [4.6, 4.0, '#ece8e0'], [10, 4.0, '#5f8f5a'], [10.2, 4.0, '#f1eee7']] },
  // Alcalde Ginés de la Hoz, acera oeste, paso 2
  { a: [-631.7, -619.3], b: [-617.9, -600.2], fondo: 9, casas: [
    [7.8, 6.6, '#f1eee7'], [7.8, 6.6, '#f1eee7'], [7.8, 6.6, '#f1eee7']] },
  // la Pardela, acera sur, pasos 3-4
  { a: [-688.6, -1223.7], b: [-678.7, -1232.3], fondo: 9, casas: [
    [6.6, 0, B, { fondo: 16 }], [6.5, 4.0, '#f1eee7']] },
  // la Pardela, acera sur, pasos 8-11
  { a: [-629.9, -1280.2], b: [-570.1, -1321.3], fondo: 9, casas: [
    [11.2, 6.6, '#e6d3b8', { tienda: true }], [11.2, 6.6, '#e6d3b8', { tienda: true }], [10.4, 4.0, '#f1eee7'], [10.4, 4.0, '#f1eee7'], [10.4, 4.0, '#f1eee7'], [9.5, 4.0, '#f1eee7'], [9.5, 4.0, '#f1eee7']] },
  // Gaida, acera oeste, paso 3
  { a: [-995.8, -703.9], b: [-989.0, -712.1], fondo: 9, casas: [
    [10.7, 4.0, '#f1eee7']] },
  // Gaida, acera oeste, paso 4
  { a: [-981.0, -721.0], b: [-975.2, -727.9], fondo: 9, casas: [
    [9, 6.6, '#efe6c8']] },
  // Gaida, acera oeste, pasos 5-8
  { a: [-974.7, -727.5], b: [-954.6, -751.7], fondo: 9, casas: [
    [4.8, 6.6, '#f1eee7'], [7.7, 6.6, '#f1eee7'], [7.5, 6.6, '#f1eee7'], [11.5, 6.6, '#f1eee7']] },
  // Gaida, acera oeste, paso 9
  { a: [-954.5, -751.6], b: [-948.6, -758.6], fondo: 9, casas: [
    [9.2, 6.6, '#e9c3a4']] },
  // Gaida, acera este, pasos 10-12
  { a: [-934.5, -759.9], b: [-910.8, -787.5], fondo: 9, casas: [
    [8.3, 4.0, '#e6d3b8'], [9.9, 6.6, '#f1eee7'], [9.1, 6.6, '#e9c3a4'], [9.1, 6.6, '#e9c3a4']] },
  // Gaida, acera oeste, pasos 13-15
  { a: [-929.2, -781.6], b: [-892.6, -824.2], fondo: 9, casas: [
    [9, 6.6, '#f1eee7'], [9, 6.6, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [21.3, 0, B, { fondo: 16 }]] },
  // Gaida, acera este, paso 3
  { a: [-993.3, -690.7], b: [-980.6, -705.9], fondo: 9, casas: [
    [9.9, 4.0, '#efe6c8'], [9.9, 4.0, '#efe6c8']] },
  // Gaida, acera este, pasos 4-9
  { a: [-963.1, -726.3], b: [-941.6, -752.1], fondo: 9, casas: [
    [2.2, 6.6, '#efe6c8'], [2.2, 6.6, '#e9c3a4'], [8.8, 6.6, '#efe6c8'], [7.7, 6.6, '#efe6c8'], [7.5, 6.6, '#efe6c8'], [5, 6.6, '#f1eee7'], [5, 6.6, '#efe6c8'], [10.2, 4.0, '#f1eee7']] },
  // Gaida, acera oeste, pasos 10-12
  { a: [-941.7, -766.7], b: [-923.2, -788.3], fondo: 9, casas: [
    [7.8, 6.6, '#efe6c8'], [9.9, 6.6, '#efe6c8'], [10.7, 6.6, '#efe6c8']] },
  // Gaida, acera este, paso 15
  { a: [-896.5, -802.7], b: [-886.2, -814.7], fondo: 9, casas: [
    [7.9, 4.0, '#f1eee7'], [7.9, 4.0, '#f1eee7']] },
  // de Vicente Guerra, acera sur, paso 1
  { a: [-323.7, -588.9], b: [-307.8, -599.6], fondo: 9, casas: [
    [19.1, 0, B, { fondo: 16 }]] },
  // de Vicente Guerra, acera norte, pasos 2-4
  { a: [-306.0, -614.6], b: [-288.8, -626.1], fondo: 9, casas: [
    [8.1, 0, B, { fondo: 16 }], [14.4, 0, B, { fondo: 16 }], [4.5, 6.6, '#e9c3a4']] },
  // Caracas, acera este, paso 2
  { a: [-846.7, -1632.0], b: [-839.6, -1622.3], fondo: 9, casas: [
    [12, 6.6, '#efe6c8']] },
  // Caracas, acera oeste, pasos 3-5
  { a: [-860.7, -1616.6], b: [-841.2, -1590.0], fondo: 9, casas: [
    [12.1, 6.6, '#f1eee7'], [13.2, 6.6, '#f1eee7'], [7.7, 4.0, '#f1eee7']] },
  // Caracas, acera oeste, paso 2
  { a: [-861.0, -1616.4], b: [-856.4, -1610.0], fondo: 9, casas: [
    [7.9, 4.0, '#f1eee7']] },
  // Caracas, acera este, pasos 3-5
  { a: [-846.2, -1630.8], b: [-819.9, -1595.0], fondo: 9, casas: [
    [11.1, 4.0, '#f1eee7'], [11.1, 4.0, '#f1eee7'], [11.1, 4.0, '#f1eee7'], [11.1, 4.0, '#f1eee7']] },
  // Tindaya, acera sur, paso 3
  { a: [-524.1, -1190.4], b: [-536.4, -1181.3], fondo: 9, casas: [
    [7.6, 6.6, '#f1eee7'], [7.6, 6.6, '#f1eee7']] },
  // Tindaya, acera sur, paso 5
  { a: [-553.0, -1169.2], b: [-562.1, -1162.5], fondo: 9, casas: [
    [11.3, 4.0, '#f1eee7']] },
  // Tindaya, acera norte, pasos 4-5
  { a: [-550.3, -1201.9], b: [-580.3, -1179.7], fondo: 9, casas: [
    [9.2, 9.4, '#f1eee7'], [9.2, 9.4, '#f1eee7'], [9.5, 9.4, '#f1eee7'], [9.5, 9.4, '#f1eee7']] },
  // Tindaya, acera sur, paso 7
  { a: [-580.5, -1148.9], b: [-570.2, -1156.5], fondo: 9, casas: [
    [12.8, 4.0, '#f1eee7']] },
  // del Fray Mendo de Viedma, acera norte, paso 1
  { a: [-842.2, -777.3], b: [-828.2, -787.6], fondo: 9, casas: [
    [8.7, 4.0, '#a9abad'], [8.7, 4.0, '#a9abad']] },
  // del Fray Mendo de Viedma, acera sur, pasos 2-9
  { a: [-824.6, -779.3], b: [-771.7, -818.1], fondo: 9, casas: [
    [8, 4.0, '#a9abad'], [8, 4.0, '#e9b99c'], [8, 4.0, '#e9b99c'], [8, 4.0, '#e4cfc9'], [8, 4.0, '#e9b99c'], [8, 4.0, '#e9b99c'], [8, 4.0, '#efe6c8'], [9.7, 4.0, '#d9b996']] },
  // del Fray Mendo de Viedma, acera sur, paso 1
  { a: [-836.1, -770.8], b: [-823.0, -780.5], fondo: 9, casas: [
    [8.1, 4.0, '#f1eee7'], [8.1, 4.0, '#f1eee7']] },
  // del Fray Mendo de Viedma, acera norte, pasos 2-9
  { a: [-829.8, -786.4], b: [-777.3, -824.9], fondo: 9, casas: [
    [8, 4.0, '#7fa3c7'], [8, 4.0, '#e4cfc9'], [8, 4.0, '#a9abad'], [8, 4.0, '#a9abad'], [8, 4.0, '#e9b99c'], [8, 4.0, '#e4cfc9'], [8, 4.0, '#e4cfc9'], [9.1, 4.0, '#f1eee7']] },
  // de Francisco Acosta Espinosa, acera norte, paso 1
  { a: [-825.2, -756.0], b: [-811.5, -766.1], fondo: 9, casas: [
    [8.5, 4.0, '#f1eee7'], [8.5, 4.0, '#f1eee7']] },
  // de Francisco Acosta Espinosa, acera sur, pasos 2-7
  { a: [-802.0, -760.7], b: [-755.5, -794.8], fondo: 9, casas: [
    [8.8, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [12, 4.0, '#f1eee7'], [12, 4.0, '#f1eee7'], [8.8, 4.0, '#f1eee7']] },
  // de Francisco Acosta Espinosa, acera sur, paso 1
  { a: [-818.7, -748.4], b: [-805.5, -758.0], fondo: 9, casas: [
    [8.2, 4.0, '#f1eee7'], [8.2, 4.0, '#f1eee7']] },
  // de Francisco Acosta Espinosa, acera norte, pasos 2-7
  { a: [-807.9, -768.7], b: [-760.8, -803.3], fondo: 9, casas: [
    [8.8, 4.0, '#a9abad'], [8, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [12, 4.0, '#e6d3b8'], [12, 4.0, '#d9b996'], [9.6, 4.0, '#f1eee7']] },
  // la Niña, acera sur, paso 2
  { a: [-1039.6, -838.4], b: [-1029.8, -830.2], fondo: 9, casas: [
    [12.8, 4.0, '#f1eee7']] },
  // de Antonio María Manrique, acera sur, pasos 2-7
  { a: [-664.6, -828.2], b: [-716.4, -789.7], fondo: 9, casas: [
    [9.9, 4.0, '#e9b99c'], [9.9, 4.0, '#e9b99c'], [12.1, 4.0, '#f1eee7'], [8, 4.0, '#d9b996'], [7.6, 4.0, '#d9b996'], [8, 4.0, '#f1eee7'], [9.2, 4.0, '#e2c079']] },
  // de Antonio María Manrique, acera norte, paso 8
  { a: [-733.6, -789.2], b: [-720.1, -799.3], fondo: 9, casas: [
    [8.4, 4.0, '#a9abad'], [8.4, 4.0, '#a9abad']] },
  // de Antonio María Manrique, acera sur, paso 9
  { a: [-720.7, -786.7], b: [-727.8, -781.3], fondo: 9, casas: [
    [8.9, 4.0, '#f1eee7']] },
  // de Antonio María Manrique, acera norte, pasos 2-7
  { a: [-670.0, -836.2], b: [-722.1, -797.4], fondo: 9, casas: [
    [10.1, 4.0, '#d9b996'], [10.1, 4.0, '#d9b996'], [12.1, 4.0, '#d9b996'], [8, 4.0, '#f1eee7'], [7.6, 4.0, '#e6d3b8'], [8, 4.0, '#d9b996'], [9.2, 4.0, '#e9b99c']] },
  // de Antonio María Manrique, acera sur, paso 8
  { a: [-727.8, -781.2], b: [-714.2, -791.3], fondo: 9, casas: [
    [8.5, 4.0, '#f1eee7'], [8.5, 4.0, '#f1eee7']] },
  // de Antonio María Manrique, acera norte, paso 9
  { a: [-726.6, -794.6], b: [-733.7, -789.3], fondo: 9, casas: [
    [8.9, 4.0, '#e4cfc9']] },
  // de Antonio María Manrique, acera sur, paso 10
  { a: [-727.8, -781.3], b: [-721.3, -786.2], fondo: 9, casas: [
    [8.1, 4.0, '#e4cfc9']] },
  // Tinamala, acera sur, pasos 4-8
  { a: [-636.3, -741.7], b: [-674.5, -714.0], fondo: 9, casas: [
    [5, 4.0, '#e9b99c'], [5, 6.6, '#9d9890'], [9.7, 6.6, '#9d9890'], [8.5, 4.0, '#f1eee7', { tienda: true }], [4.1, 4.0, '#a9abad'], [4.1, 4.0, '#d9b996'], [10.8, 4.0, '#e2c079']] },
  // Tinamala, acera norte, pasos 12-14
  { a: [-695.1, -711.6], b: [-714.8, -696.5], fondo: 9, casas: [
    [10.4, 4.0, '#e6d3b8', { tienda: true }], [8.4, 4.0, '#d9b996'], [6.1, 4.0, '#d9b996']] },
  // Tinamala, acera sur, paso 15
  { a: [-698.8, -694.4], b: [-715.0, -682.1], fondo: 9, casas: [
    [10.2, 4.0, '#d9b996'], [10.2, 4.0, '#d9b996']] },
  // Tinamala, acera norte, pasos 4-8
  { a: [-641.6, -749.0], b: [-680.3, -721.0], fondo: 9, casas: [
    [10, 4.0, '#f1eee7'], [9.7, 4.0, '#f1eee7'], [8.5, 4.0, '#b9b2a4'], [8.2, 4.0, '#d9b996'], [11.4, 4.0, '#d9b996']] },
  // Tinamala, acera sur, pasos 12-14
  { a: [-688.8, -702.2], b: [-715.0, -682.1], fondo: 9, casas: [
    [9.8, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [7.5, 4.0, '#f1eee7'], [7.5, 4.0, '#f1eee7']] },
  // Tinamala, acera norte, paso 15
  { a: [-705.9, -703.7], b: [-715.0, -696.7], fondo: 9, casas: [
    [11.5, 4.0, '#f1eee7']] },
  // el Bartolo, acera norte, paso 1
  { a: [-831.2, -625.5], b: [-823.5, -619.0], fondo: 9, casas: [
    [10.1, 4.0, '#f1eee7']] },
  // de Navarra, acera sur, pasos 2-7
  { a: [-477.0, -1051.7], b: [-502.5, -1032.9], fondo: 9, casas: [
    [4.5, 6.6, '#e6d3b8'], [6, 4.0, '#f1eee7'], [6, 0, B, { fondo: 16 }], [15.9, 0, B, { fondo: 16 }], [12.1, 6.6, '#f1eee7'], [8, 4.0, '#f1eee7'], [6.8, 4.0, '#f1eee7']] },
  // de Navarra, acera norte, pasos 2-7
  { a: [-451.2, -1080.9], b: [-507.3, -1039.5], fondo: 9, casas: [
    [7.4, 4.0, '#efe6c8'], [7.4, 4.0, '#efe6c8'], [12, 6.6, '#f1eee7'], [8, 4.0, '#9d9890'], [8, 4.0, '#9d9890'], [12.1, 4.0, '#9d9890'], [8, 4.0, '#efe6c8'], [6.8, 4.0, '#efe6c8']] },
  // Lebrillo, acera norte, pasos 2-3
  { a: [-598.2, -325.1], b: [-564.4, -318.0], fondo: 9, casas: [
    [12.1, 6.6, '#f1eee7', { tienda: true }], [11.2, 4.0, '#f1eee7'], [11.2, 4.0, '#f1eee7']] },
  // Lebrillo, acera sur, pasos 1-3
  { a: [-607.8, -319.1], b: [-571.2, -311.4], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7'], [8.9, 4.0, '#efe6c8'], [8.9, 4.0, '#efe6c8'], [8.6, 6.6, '#f1eee7'], [8.6, 6.6, '#f1eee7']] },
  // Lebrillo, acera norte, pasos 4-5
  { a: [-540.8, -314.7], b: [-523.6, -311.2], fondo: 9, casas: [
    [8.7, 4.0, '#f1eee7'], [8.7, 4.0, '#f1eee7']] },
  // de Aragón, acera sur, paso 11
  { a: [-932.1, -219.2], b: [-911.4, -217.3], fondo: 9, casas: [
    [10.4, 4.0, '#f1eee7'], [10.4, 4.0, '#f1eee7']] },
  // Aconcagua, acera sur, paso 1
  { a: [-830.6, -1558.1], b: [-844.9, -1547.5], fondo: 9, casas: [
    [8.9, 4.0, '#f1eee7'], [8.9, 4.0, '#f1eee7']] },
  // Aconcagua, acera norte, paso 1
  { a: [-829.0, -1573.3], b: [-841.1, -1564.3], fondo: 9, casas: [
    [7.5, 6.6, '#f1eee7'], [7.5, 6.6, '#f1eee7']] },
  // Aconcagua, acera norte, paso 3
  { a: [-860.4, -1549.8], b: [-877.0, -1537.2], fondo: 9, casas: [
    [10.4, 4.0, '#f1eee7'], [10.4, 4.0, '#f1eee7']] },
  // Aconcagua, acera norte, paso 7
  { a: [-925.0, -1499.3], b: [-938.4, -1489.1], fondo: 9, casas: [
    [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7']] },
  // de Santa Teresa de Jesús, acera norte, paso 11
  { a: [-827.9, -259.1], b: [-821.7, -258.5], fondo: 9, casas: [
    [6.2, 4.0, '#f1eee7']] },
  // de Santa Teresa de Jesús, acera sur, pasos 2-4
  { a: [-927.5, -261.0], b: [-879.6, -255.9], fondo: 9, casas: [
    [7.8, 6.6, '#a9abad', { tienda: true }], [7.8, 6.6, '#a9abad', { tienda: true }], [7.8, 6.6, '#a9abad', { tienda: true }], [8.2, 4.0, '#f1eee7'], [8.2, 4.0, '#f1eee7'], [8.2, 4.0, '#f1eee7']] },
  // de Santa Teresa de Jesús, acera sur, pasos 7-11
  { a: [-846.8, -253.6], b: [-822.5, -251.1], fondo: 9, casas: [
    [4.5, 4.0, '#f1eee7'], [12.3, 4.0, '#f1eee7'], [12.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [6.2, 4.0, '#f1eee7']] },
  // Copacabana, acera norte, paso 1
  { a: [-895.0, -1411.4], b: [-877.6, -1424.8], fondo: 9, casas: [
    [21.9, 0, B, { fondo: 16 }]] },
  // Copacabana, acera sur, paso 1
  { a: [-881.1, -1408.6], b: [-871.5, -1416.0], fondo: 9, casas: [
    [12.2, 4.0, '#e6d3b8']] },
  // la Santa María, acera este, pasos 2-3
  { a: [-709.0, -674.1], b: [-715.1, -682.3], fondo: 9, casas: [
    [4.7, 4.0, '#efe6c8'], [5.5, 6.6, '#f1eee7']] },
  // la Santa María, acera este, pasos 4-7
  { a: [-683.4, -638.1], b: [-660.6, -608.9], fondo: 9, casas: [
    [12.1, 4.0, '#e9b99c'], [13, 4.0, '#f1eee7'], [5.1, 4.0, '#f1eee7'], [6.8, 6.6, '#f1eee7']] },
  // la Santa María, acera oeste, pasos 4-7
  { a: [-692.4, -632.3], b: [-669.5, -603.0], fondo: 9, casas: [
    [13.1, 6.6, '#f1eee7'], [13, 4.0, '#f1eee7'], [5.1, 6.6, '#f1eee7'], [6, 4.0, '#f1eee7']] },
  // la Cristina, acera sur, pasos 1-2
  { a: [-161.0, -814.6], b: [-195.5, -791.3], fondo: 9, casas: [
    [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [8.3, 6.6, '#f1eee7', { tienda: true }], [8.3, 6.6, '#f1eee7', { tienda: true }], [8.3, 6.6, '#f1eee7', { tienda: true }]] },
  // de Felipe II, acera oeste, paso 23
  { a: [-1307.2, -73.6], b: [-1312.1, -88.8], fondo: 9, casas: [
    [8, 6.6, '#e2c079'], [8, 6.6, '#e2c079']] },
  // de Felipe II, acera oeste, paso 1
  { a: [-1380.9, -306.5], b: [-1377.9, -297.1], fondo: 9, casas: [
    [9.8, 6.6, '#e9c3a4']] },
  // de Felipe II, acera oeste, paso 24
  { a: [-1312.1, -88.8], b: [-1307.2, -73.6], fondo: 9, casas: [
    [8, 6.6, '#f1eee7'], [8, 6.6, '#f1eee7']] },
  // de la Princesa Yaiza, acera oeste, pasos 1-7
  { a: [-668.9, -1342.7], b: [-674.4, -1428.5], fondo: 9, casas: [
    [11.9, 6.6, '#f1eee7'], [12.8, 6.6, '#e9c3a4'], [12, 6.6, '#e9c3a4'], [10, 6.6, '#e9c3a4'], [10, 6.6, '#d9b996'], [7.1, 6.6, '#d9b996'], [7.1, 6.6, '#d9b996'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7']] },
  // de la Princesa Yaiza, acera este, pasos 8-9
  { a: [-655.7, -1428.2], b: [-657.4, -1455.0], fondo: 9, casas: [
    [9.9, 4.0, '#efe6c8'], [9.9, 4.0, '#efe6c8'], [7.2, 6.6, '#a9abad']] },
  // de la Princesa Yaiza, acera este, pasos 1-7
  { a: [-658.1, -1345.0], b: [-663.5, -1429.2], fondo: 9, casas: [
    [10.3, 4.0, '#f1eee7'], [12.8, 4.0, '#f1eee7'], [12, 6.6, '#f1eee7'], [10, 6.6, '#f1eee7'], [10, 6.6, '#a9abad'], [7.1, 4.0, '#f1eee7'], [7.1, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7']] },
  // de la Princesa Yaiza, acera oeste, pasos 8-9
  { a: [-674.2, -1427.0], b: [-676.7, -1467.4], fondo: 9, casas: [
    [9.9, 4.0, '#f1eee7'], [9.9, 4.0, '#f1eee7'], [10.4, 4.0, '#f1eee7'], [10.4, 4.0, '#f1eee7']] },
  // Tebete, acera este, paso 3
  { a: [-626.7, -1180.5], b: [-613.0, -1160.4], fondo: 9, casas: [
    [8.1, 6.6, '#f1eee7'], [8.1, 6.6, '#f1eee7'], [8.1, 6.6, '#f1eee7']] },
  // Tebete, acera oeste, paso 3
  { a: [-631.6, -1167.8], b: [-621.3, -1152.8], fondo: 9, casas: [
    [9.1, 6.6, '#f1eee7'], [9.1, 6.6, '#f1eee7']] },
  // Managua, acera sur, paso 1
  { a: [-748.8, -1737.7], b: [-728.6, -1737.6], fondo: 9, casas: [
    [10.1, 6.6, '#f1eee7'], [10.1, 6.6, '#f1eee7']] },
  // Managua, acera sur, pasos 3-6
  { a: [-698.8, -1739.6], b: [-658.7, -1740.0], fondo: 9, casas: [
    [11.4, 6.6, '#f1eee7'], [9.5, 6.6, '#f1eee7'], [8.4, 4.0, '#efe6c8', { tienda: true }], [10.7, 4.0, '#efe6c8', { tienda: true }]] },
  // Managua, acera sur, pasos 7-9
  { a: [-649.7, -1740.8], b: [-613.0, -1741.8], fondo: 9, casas: [
    [13.2, 6.6, '#f1eee7'], [13.2, 9.4, '#e9c3a4'], [10.4, 9.4, '#e9c3a4']] },
  // del Mar del Plata, acera sur, paso 1
  { a: [-747.2, -1394.7], b: [-759.3, -1385.9], fondo: 9, casas: [
    [7.5, 6.6, '#e9c3a4'], [7.5, 6.6, '#e9c3a4']] },
  // del Mar del Plata, acera norte, paso 1
  { a: [-753.0, -1403.5], b: [-762.9, -1396.4], fondo: 9, casas: [
    [12.2, 4.0, '#f1eee7']] },
  // del Mar del Plata, acera norte, pasos 2-3
  { a: [-785.0, -1384.8], b: [-798.9, -1374.6], fondo: 9, casas: [
    [13.6, 0, B, { fondo: 16 }], [4.5, 4.0, '#f1eee7']] },
  // del Castillo de las Coloradas, acera oeste, paso 1
  { a: [-625.4, -212.4], b: [-618.0, -228.1], fondo: 9, casas: [
    [8.7, 6.6, '#e2c079'], [8.7, 6.6, '#e2c079']] },
  // del Castillo de las Coloradas, acera este, paso 2
  { a: [-597.0, -244.7], b: [-600.8, -236.7], fondo: 9, casas: [
    [8.8, 6.6, '#a9abad', { tienda: true }]] },
  // del Castillo de las Coloradas, acera oeste, pasos 3-6
  { a: [-608.2, -242.9], b: [-591.1, -278.7], fondo: 9, casas: [
    [10.2, 6.6, '#a9abad', { tienda: true }], [13.1, 6.6, '#a9abad'], [8.9, 6.6, '#f1eee7', { tienda: true }], [7.5, 6.6, '#f1eee7', { tienda: true }]] },
  // del Castillo de las Coloradas, acera este, paso 1
  { a: [-615.8, -205.5], b: [-607.4, -223.1], fondo: 9, casas: [
    [9.7, 6.6, '#e2c079', { tienda: true }], [9.7, 6.6, '#e2c079', { tienda: true }]] },
  // del Castillo de las Coloradas, acera oeste, paso 2
  { a: [-605.2, -252.1], b: [-610.4, -241.3], fondo: 9, casas: [
    [12, 6.6, '#f1eee7', { tienda: true }]] },
  // del Castillo de las Coloradas, acera este, paso 3
  { a: [-601.8, -234.7], b: [-597.0, -244.7], fondo: 9, casas: [
    [11, 0, B, { fondo: 16 }]] },
  // del Castillo de las Coloradas, acera este, pasos 7-8
  { a: [-578.0, -283.5], b: [-558.6, -309.5], fondo: 9, casas: [
    [9.2, 6.6, '#b9b2a4'], [9.2, 6.6, '#b9b2a4'], [7, 4.0, '#e6d3b8'], [7, 4.0, '#e6d3b8']] },
  // Juan Luzardo, acera norte, pasos 3-5
  { a: [-1109.0, -434.8], b: [-1069.8, -401.5], fondo: 9, casas: [
    [9.2, 6.6, '#f1eee7'], [9.2, 6.6, '#f1eee7'], [9.3, 6.6, '#f1eee7'], [9.3, 6.6, '#f1eee7'], [7.2, 6.6, '#f1eee7'], [7.2, 6.6, '#f1eee7']] },
  // Maracaibo, acera este, pasos 2-9
  { a: [-801.9, -1622.0], b: [-806.5, -1628.8], fondo: 9, casas: [
    [4.5, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [8.1, 4.0, '#f1eee7'], [8, 6.6, '#f1eee7'], [7.8, 4.0, '#f1eee7'], [8.1, 6.6, '#f1eee7'], [8.3, 4.0, '#f1eee7'], [4.5, 4.0, '#f1eee7']] },
  // Maracaibo, acera este, paso 1
  { a: [-776.0, -1583.9], b: [-787.2, -1600.4], fondo: 9, casas: [
    [10, 4.0, '#f1eee7'], [10, 4.0, '#f1eee7']] },
  // Tenique, acera este, pasos 1-8
  { a: [-681.9, -1186.7], b: [-645.1, -1135.5], fondo: 9, casas: [
    [4.5, 6.6, '#efe6c8'], [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [11.9, 6.6, '#f1eee7'], [12, 4.0, '#f1eee7'], [8.1, 4.0, '#e6d3b8'], [8.3, 6.6, '#f1eee7'], [6.4, 4.0, '#f1eee7'], [4.5, 4.0, '#f1eee7']] },
  // Tenique, acera oeste, pasos 1-8
  { a: [-686.9, -1178.8], b: [-652.2, -1130.6], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7'], [8.6, 4.0, '#d9b996'], [8.6, 4.0, '#d9b996'], [11.9, 4.0, '#a9abad'], [12, 6.6, '#a9abad'], [8.1, 4.0, '#a9abad'], [8.3, 4.0, '#f1eee7'], [6.4, 4.0, '#f1eee7'], [4.5, 4.0, '#f1eee7']] },
  // Tingafa, acera oeste, paso 3
  { a: [-593.4, -861.3], b: [-600.7, -870.8], fondo: 9, casas: [
    [12, 4.0, '#f1eee7']] },
  // Tingafa, acera oeste, paso 2
  { a: [-603.3, -874.4], b: [-594.3, -862.6], fondo: 9, casas: [
    [7.4, 6.6, '#efe6c8'], [7.4, 6.6, '#efe6c8']] },
  // de Juan Brito, acera sur, pasos 2-5
  { a: [-646.9, -314.7], b: [-693.2, -314.0], fondo: 9, casas: [
    [7.1, 6.6, '#f1eee7', { tienda: true }], [7.1, 6.6, '#f1eee7', { tienda: true }], [11.8, 6.6, '#f1eee7', { tienda: true }], [9.7, 6.6, '#f1eee7', { tienda: true }], [10.6, 6.6, '#f1eee7', { tienda: true }]] },
  // Doctor Juan Negrìn, acera sur, paso 2
  { a: [-218.4, 48.4], b: [-228.7, 39.3], fondo: 9, casas: [
    [13.7, 6.6, '#f1eee7', { tienda: true }]] },
  // Doctor Juan Negrìn, acera norte, paso 6
  { a: [-251.0, -10.4], b: [-243.2, -3.8], fondo: 9, casas: [
    [10.3, 9.4, '#e6d3b8', { tienda: true }]] },
  // Doctor Juan Negrìn, acera sur, pasos 7-11
  { a: [-253.0, 6.4], b: [-304.7, -37.4], fondo: 9, casas: [
    [13.1, 9.4, '#e6d3b8', { tienda: true }], [8.6, 9.4, '#e6d3b8', { tienda: true }], [8.6, 9.4, '#e6d3b8', { tienda: true }], [11.9, 4.0, '#f1eee7'], [12.2, 4.0, '#f1eee7'], [13.3, 4.0, '#efe6c8']] },
  // Doctor Juan Negrìn, acera norte, pasos 12-13
  { a: [-300.0, -46.2], b: [-317.6, -61.1], fondo: 9, casas: [
    [11.5, 9.4, '#f1eee7', { tienda: true }], [11.5, 9.4, '#f1eee7', { tienda: true }]] },
  // Doctor Juan Negrìn, acera sur, paso 14
  { a: [-328.6, -42.0], b: [-334.3, -46.8], fondo: 9, casas: [
    [7.3, 9.4, '#f1eee7', { tienda: true }]] },
  // Doctor Juan Negrìn, acera sur, pasos 16-18
  { a: [-348.9, -74.8], b: [-381.3, -102.4], fondo: 9, casas: [
    [6.8, 4.0, '#e4cfc9'], [11.2, 4.0, '#efe6c8'], [11.2, 6.6, '#f1eee7', { tienda: true }], [13.4, 4.0, '#f1eee7']] },
  // Doctor Juan Negrìn, acera sur, paso 19
  { a: [-389.4, -107.2], b: [-401.3, -117.5], fondo: 9, casas: [
    [7.9, 4.0, '#f1eee7'], [7.9, 4.0, '#f1eee7']] },
  // Doctor Juan Negrìn, acera sur, pasos 20-22
  { a: [-401.2, -117.5], b: [-453.0, -161.2], fondo: 9, casas: [
    [10.3, 6.6, '#f1eee7', { tienda: true }], [9, 6.6, '#f1eee7'], [9, 6.6, '#f1eee7'], [9, 6.6, '#f1eee7'], [10.2, 6.6, '#f1eee7', { tienda: true }], [10.2, 6.6, '#f1eee7', { tienda: true }], [10.2, 6.6, '#f1eee7', { tienda: true }]] },
  // Doctor Juan Negrìn, acera norte, pasos 1-4
  { a: [-184.2, 52.1], b: [-229.9, 12.3], fondo: 9, casas: [
    [8.2, 6.6, '#f1eee7', { tienda: true }], [8.2, 6.6, '#f1eee7', { tienda: true }], [8.2, 6.6, '#f1eee7', { tienda: true }], [9.7, 9.4, '#e9c3a4'], [9.7, 9.4, '#e9c3a4'], [7.5, 9.4, '#e9c3a4', { tienda: true }], [7.5, 9.4, '#e9c3a4', { tienda: true }], [4.5, 0, B, { fondo: 16 }]] },
  // Doctor Juan Negrìn, acera norte, pasos 8-11
  { a: [-266.8, -18.3], b: [-297.2, -44.1], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7', { tienda: true }], [11.9, 4.0, '#f1eee7'], [12.2, 4.0, '#9d9890'], [11.9, 4.0, '#efe6c8']] },
  // Doctor Juan Negrìn, acera sur, pasos 12-13
  { a: [-306.3, -38.8], b: [-323.4, -53.3], fondo: 9, casas: [
    [11.5, 9.4, '#d9b996', { tienda: true }], [10.9, 9.4, '#d9b996']] },
  // Doctor Juan Negrìn, acera norte, paso 14
  { a: [-314.7, -58.5], b: [-328.2, -70.0], fondo: 9, casas: [
    [8.9, 6.6, '#a9abad', { tienda: true }], [8.9, 6.6, '#a9abad', { tienda: true }]] },
  // Doctor Juan Negrìn, acera norte, paso 16
  { a: [-335.4, -76.7], b: [-344.5, -84.5], fondo: 9, casas: [
    [12, 6.6, '#a9abad', { tienda: true }]] },
  // Doctor Juan Negrìn, acera norte, pasos 17-20
  { a: [-353.4, -91.6], b: [-393.8, -125.8], fondo: 9, casas: [
    [7.5, 6.6, '#d9b996', { tienda: true }], [7.5, 6.6, '#d9b996', { tienda: true }], [9.2, 6.6, '#e6d3b8'], [9.2, 6.6, '#e6d3b8'], [7.7, 6.6, '#a9abad'], [7.7, 6.6, '#a9abad'], [4.5, 6.6, '#efe6c8', { tienda: true }]] },
  // Avenida de Eugenio Rijo Rocha, acera oeste, pasos 1-2
  { a: [-635.3, -628.1], b: [-658.2, -656.7], fondo: 9, casas: [
    [8.2, 6.6, '#efe6c8', { tienda: true }], [8.2, 6.6, '#efe6c8', { tienda: true }], [8.2, 6.6, '#efe6c8', { tienda: true }], [11.9, 4.0, '#f1eee7']] },
  // Avenida de Eugenio Rijo Rocha, acera oeste, paso 3
  { a: [-666.9, -672.5], b: [-670.8, -677.7], fondo: 9, casas: [
    [6.5, 6.6, '#f1eee7']] },
  // Avenida de Eugenio Rijo Rocha, acera este, paso 4
  { a: [-668.3, -705.3], b: [-661.1, -695.7], fondo: 9, casas: [
    [12, 6.6, '#e6d3b8', { tienda: true }]] },
  // Avenida de Eugenio Rijo Rocha, acera este, pasos 1-2
  { a: [-620.2, -640.0], b: [-643.0, -668.4], fondo: 9, casas: [
    [8.3, 4.0, '#f1eee7'], [8.3, 4.0, '#f1eee7'], [8.3, 4.0, '#f1eee7'], [11.5, 4.0, '#f1eee7']] },
  // Avenida de Eugenio Rijo Rocha, acera oeste, paso 4
  { a: [-688.6, -701.8], b: [-675.8, -684.7], fondo: 9, casas: [
    [10.7, 6.6, '#efe6c8', { tienda: true }], [10.7, 6.6, '#efe6c8', { tienda: true }]] },
  // Paraná, acera norte, paso 1
  { a: [-880.1, -1223.4], b: [-855.7, -1241.1], fondo: 9, casas: [
    [10.1, 4.0, '#f1eee7'], [10.1, 4.0, '#f1eee7'], [10.1, 4.0, '#f1eee7']] },
  // Paraná, acera norte, paso 2
  { a: [-855.8, -1241.3], b: [-862.7, -1236.2], fondo: 9, casas: [
    [8.5, 6.6, '#f1eee7']] },
  // de Zaragoza, acera oeste, pasos 3-6
  { a: [-655.4, -115.7], b: [-671.4, -146.3], fondo: 9, casas: [
    [9.8, 0, B, { fondo: 16 }], [9.6, 4.0, '#f1eee7'], [7.4, 4.0, '#f1eee7'], [7.7, 6.6, '#f1eee7']] },
  // de Zaragoza, acera este, paso 1
  { a: [-633.7, -94.5], b: [-637.6, -101.8], fondo: 9, casas: [
    [8.3, 6.6, '#a9abad']] },
  // de Zaragoza, acera este, pasos 2-7
  { a: [-637.7, -101.8], b: [-669.3, -161.9], fondo: 9, casas: [
    [7.6, 4.0, '#f1eee7'], [7.6, 4.0, '#f1eee7'], [7.6, 6.6, '#f1eee7'], [7.6, 6.6, '#f1eee7'], [9.6, 4.0, '#f1eee7'], [7.4, 6.6, '#efe6c8'], [9.9, 6.6, '#efe6c8', { tienda: true }], [10.7, 4.0, '#f1eee7']] },
  // de Luis de Guadarfia, acera norte, pasos 2-3
  { a: [-722.8, -902.5], b: [-731.9, -895.8], fondo: 9, casas: [
    [7.7, 4.0, '#f1eee7'], [4.5, 4.0, '#f1eee7']] },
  // el Peral, acera norte, paso 7
  { a: [-896.9, -915.4], b: [-911.9, -905.4], fondo: 9, casas: [
    [9, 4.0, '#dd7d70', { tienda: true }], [9, 4.0, '#dd7d70', { tienda: true }]] },
  // el Antonio, acera sur, paso 1
  { a: [-408.2, -583.1], b: [-401.4, -587.8], fondo: 9, casas: [
    [8.2, 4.0, '#f1eee7']] },
  // de Cuenca, acera norte, pasos 1-4
  { a: [-288.7, -822.9], b: [-299.8, -815.1], fondo: 9, casas: [
    [4.5, 4.0, '#f1eee7'], [15.2, 0, B, { fondo: 16 }], [9.7, 6.6, '#f1eee7'], [9.7, 6.6, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // el Faustino, acera norte, paso 4
  { a: [-443.5, -845.7], b: [-435.0, -851.8], fondo: 9, casas: [
    [10.4, 6.6, '#f1eee7']] },
  // el Faustino, acera norte, paso 2
  { a: [-435.0, -851.8], b: [-444.6, -844.8], fondo: 9, casas: [
    [11.9, 4.0, '#f1eee7', { tienda: true }]] },
  // Gusa, acera este, paso 1
  { a: [-814.6, -541.2], b: [-796.3, -564.1], fondo: 9, casas: [
    [9.8, 6.6, '#9d9890'], [9.8, 6.6, '#9d9890'], [9.8, 6.6, '#9d9890']] },
  // de Santander, acera oeste, paso 2
  { a: [-605.3, -336.4], b: [-599.5, -342.9], fondo: 9, casas: [
    [8.6, 0, B, { fondo: 16 }]] },
  // de Santander, acera este, pasos 3-4
  { a: [-582.6, -346.1], b: [-573.4, -356.1], fondo: 9, casas: [
    [4.2, 6.6, '#9d9890'], [4.2, 4.0, '#f1eee7'], [5.2, 4.0, '#f1eee7']] },
  // de Santander, acera oeste, pasos 5-6
  { a: [-595.6, -346.9], b: [-579.1, -364.9], fondo: 9, casas: [
    [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [7.7, 4.0, '#f1eee7']] },
  // de Santander, acera este, paso 1
  { a: [-605.9, -306.6], b: [-596.3, -317.4], fondo: 9, casas: [
    [7.2, 9.4, '#f1eee7'], [7.2, 9.4, '#f1eee7']] },
  // de Santander, acera este, paso 2
  { a: [-596.9, -329.2], b: [-591.2, -335.5], fondo: 9, casas: [
    [8.5, 4.0, '#f1eee7', { tienda: true }]] },
  // de Santander, acera oeste, pasos 3-4
  { a: [-590.0, -353.0], b: [-579.1, -364.9], fondo: 9, casas: [
    [8.4, 6.6, '#e6d3b8'], [7.8, 4.0, '#e6d3b8', { tienda: true }]] },
  // de Santander, acera este, paso 5
  { a: [-586.3, -341.5], b: [-573.1, -355.8], fondo: 9, casas: [
    [9.7, 4.0, '#f1eee7', { tienda: true }], [9.7, 4.0, '#f1eee7', { tienda: true }]] },
  // Yagabo, acera sur, pasos 9-11
  { a: [-946.4, 114.0], b: [-1004.7, 93.0], fondo: 9, casas: [
    [10.1, 9.4, '#efe6c8'], [10.1, 9.4, '#efe6c8'], [10.3, 9.4, '#efe6c8'], [10.3, 9.4, '#efe6c8'], [10.6, 9.4, '#efe6c8'], [10.6, 9.4, '#efe6c8']] },
  // Yagabo, acera norte, paso 2
  { a: [-795.4, 154.0], b: [-801.2, 151.9], fondo: 9, casas: [
    [6.2, 9.4, '#efe6c8']] },
  // Yagabo, acera norte, paso 4
  { a: [-838.2, 137.2], b: [-844.0, 135.1], fondo: 9, casas: [
    [6.2, 9.4, '#efe6c8']] },
  // Yagabo, acera norte, pasos 6-7
  { a: [-887.3, 120.4], b: [-920.0, 108.4], fondo: 9, casas: [
    [12.9, 6.6, '#efe6c8', { tienda: true }], [11, 6.6, '#efe6c8', { tienda: true }], [11, 6.6, '#efe6c8', { tienda: true }]] },
  // Yagabo, acera norte, paso 11
  { a: [-975.3, 82.5], b: [-997.6, 74.4], fondo: 9, casas: [
    [7.9, 4.0, '#f0dd96'], [7.9, 4.0, '#f0dd96'], [7.9, 4.0, '#f0dd96']] },
  // de Juan Ramón Jiménez, acera oeste, pasos 1-2
  { a: [-846.9, -818.0], b: [-855.9, -844.6], fondo: 9, casas: [
    [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [8.6, 4.0, '#f1eee7'], [4.5, 4.0, '#f1eee7']] },
  // de Juan Ramón Jiménez, acera oeste, paso 3
  { a: [-852.5, -845.0], b: [-850.9, -835.0], fondo: 9, casas: [
    [10.2, 4.0, '#f1eee7']] },
  // de Juan Ramón Jiménez, acera oeste, paso 4
  { a: [-864.6, -868.8], b: [-863.0, -859.5], fondo: 9, casas: [
    [9.4, 4.0, '#f1eee7']] },
  // los Andes, acera este, paso 4
  { a: [-879.6, -1223.4], b: [-890.1, -1236.5], fondo: 9, casas: [
    [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7']] },
  // los Andes, acera este, paso 7
  { a: [-879.6, -1223.4], b: [-890.1, -1236.5], fondo: 9, casas: [
    [16.7, 0, B, { fondo: 16 }]] },
  // de Bolivia, acera oeste, paso 1
  { a: [-676.6, -170.3], b: [-685.5, -188.3], fondo: 9, casas: [
    [10, 6.6, '#efe6c8'], [10, 6.6, '#efe6c8']] },
  // de Bolivia, acera este, pasos 2-4
  { a: [-674.4, -187.4], b: [-694.6, -228.3], fondo: 9, casas: [
    [8.4, 6.6, '#efe6c8'], [8.4, 6.6, '#efe6c8'], [14, 6.6, '#e6d3b8'], [7.4, 4.0, '#f1eee7', { tienda: true }], [7.4, 4.0, '#f1eee7', { tienda: true }]] },
  // de Bolivia, acera oeste, paso 5
  { a: [-696.2, -210.8], b: [-704.9, -228.4], fondo: 9, casas: [
    [9.9, 4.0, '#f1eee7', { tienda: true }], [9.9, 4.0, '#f1eee7', { tienda: true }]] },
  // de Bolivia, acera este, paso 1
  { a: [-668.0, -175.4], b: [-676.6, -192.8], fondo: 9, casas: [
    [9.7, 6.6, '#e9c3a4', { tienda: true }], [9.7, 6.6, '#e9c3a4', { tienda: true }]] },
  // de Bolivia, acera oeste, pasos 2-4
  { a: [-682.6, -183.4], b: [-704.9, -228.4], fondo: 9, casas: [
    [8.4, 6.6, '#e9c3a4'], [8.4, 6.6, '#e9c3a4'], [14, 6.6, '#e9c3a4', { tienda: true }], [9.7, 6.6, '#e6d3b8'], [9.7, 6.6, '#e6d3b8']] },
  // de Bolivia, acera este, paso 5
  { a: [-688.0, -214.9], b: [-694.6, -228.3], fondo: 9, casas: [
    [7.5, 4.0, '#e6d3b8', { tienda: true }], [7.5, 4.0, '#e6d3b8', { tienda: true }]] },
  // de la Isla Margarita, acera norte, paso 1
  { a: [-755.9, -1597.6], b: [-775.6, -1583.4], fondo: 9, casas: [
    [8.1, 6.6, '#efe6c8'], [8.1, 6.6, '#efe6c8'], [8.1, 6.6, '#efe6c8']] },
  // de Antonio Nieves Santos Taxista, acera este, pasos 2-4
  { a: [-771.7, -313.2], b: [-784.4, -289.7], fondo: 9, casas: [
    [10.2, 6.6, '#efe6c8', { tienda: true }], [9.7, 6.6, '#efe6c8'], [6.9, 6.6, '#efe6c8']] },
  // Agustín Espinosa, acera norte, paso 2
  { a: [-1364.0, -38.9], b: [-1383.3, -35.8], fondo: 9, casas: [
    [9.8, 6.6, '#f1eee7'], [9.8, 6.6, '#f1eee7']] },
  // de Antonio Bermúdez, acera este, paso 2
  { a: [-1312.9, 32.4], b: [-1314.8, 25.8], fondo: 9, casas: [
    [6.8, 6.6, '#a9abad']] },
  // Avenida de Hernández Pacheco, acera oeste, paso 1
  { a: [-908.5, -566.1], b: [-897.2, -579.5], fondo: 9, casas: [
    [8.8, 4.0, '#f1eee7', { tienda: true }], [8.8, 4.0, '#f1eee7', { tienda: true }]] },
  // Avenida de Hernández Pacheco, acera este, paso 1
  { a: [-900.6, -557.2], b: [-888.1, -571.9], fondo: 9, casas: [
    [9.6, 4.0, '#f1eee7'], [9.6, 4.0, '#f1eee7']] },
  // el Vicente, acera sur, paso 1
  { a: [-597.1, -1008.9], b: [-591.5, -1012.9], fondo: 9, casas: [
    [6.9, 6.6, '#f1eee7']] },
  // de Álvarez Rixo, acera este, paso 1
  { a: [-534.9, -747.0], b: [-523.9, -731.5], fondo: 9, casas: [
    [9.5, 4.0, '#f1eee7'], [9.5, 4.0, '#f1eee7']] },
  // de Álvarez Rixo, acera oeste, paso 1
  { a: [-543.1, -741.0], b: [-532.1, -725.6], fondo: 9, casas: [
    [9.4, 4.0, '#f1eee7'], [9.4, 4.0, '#f1eee7']] },
  // Timple, acera oeste, paso 1
  { a: [-1216.8, -201.7], b: [-1214.2, -188.1], fondo: 9, casas: [
    [13.8, 6.6, '#f1eee7']] },
  // Timple, acera oeste, paso 2
  { a: [-1213.4, -181.8], b: [-1210.8, -168.2], fondo: 9, casas: [
    [13.8, 6.6, '#f1eee7']] },
  // Timple, acera oeste, pasos 3-4
  { a: [-1209.3, -162.6], b: [-1206.7, -149.0], fondo: 9, casas: [
    [6.8, 6.6, '#f1eee7'], [7, 6.6, '#f1eee7']] },
  // Timple, acera oeste, pasos 5-6
  { a: [-1205.5, -141.3], b: [-1202.9, -127.7], fondo: 9, casas: [
    [5.6, 6.6, '#f1eee7'], [8.2, 6.6, '#f1eee7']] },
  // Timple, acera oeste, pasos 7-8
  { a: [-1201.8, -122.5], b: [-1199.2, -108.9], fondo: 9, casas: [
    [6.5, 6.6, '#f1eee7'], [7.3, 6.6, '#f1eee7']] },
  // Timple, acera oeste, pasos 9-10
  { a: [-1198.0, -102.8], b: [-1195.4, -89.2], fondo: 9, casas: [
    [6.5, 6.6, '#f1eee7'], [7.3, 6.6, '#f1eee7']] },
  // Timple, acera oeste, pasos 11-12
  { a: [-1194.3, -83.1], b: [-1191.7, -69.5], fondo: 9, casas: [
    [6.6, 6.6, '#f1eee7'], [7.3, 6.6, '#f1eee7']] },
  // Timple, acera oeste, paso 13
  { a: [-1189.1, -58.1], b: [-1186.7, -44.4], fondo: 9, casas: [
    [13.9, 6.6, '#f1eee7']] },
  // de Manuel José Álvarez, acera oeste, paso 1
  { a: [-475.4, -746.4], b: [-487.9, -764.1], fondo: 9, casas: [
    [10.9, 4.0, '#f1eee7'], [10.9, 4.0, '#f1eee7']] },
  // de Manuel José Álvarez, acera este, paso 1
  { a: [-467.4, -755.4], b: [-478.3, -770.9], fondo: 9, casas: [
    [9.5, 6.6, '#a9abad'], [9.5, 6.6, '#a9abad']] },
  // del Alcalde Lorenzo Cabrera, acera norte, pasos 1-2
  { a: [-693.2, -652.6], b: [-666.9, -672.6], fondo: 9, casas: [
    [10.4, 9.4, '#e9c3a4', { tienda: true }], [10.4, 9.4, '#e9c3a4', { tienda: true }], [12.3, 6.6, '#f1eee7']] },
  // Bernegal, acera este, paso 1
  { a: [-534.3, -267.3], b: [-546.1, -254.2], fondo: 9, casas: [
    [8.8, 9.4, '#f1eee7', { tienda: true }], [8.8, 9.4, '#f1eee7', { tienda: true }]] },
  // la Pinta, acera este, pasos 2-3
  { a: [-698.3, -603.2], b: [-703.5, -610.1], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // el Forito, acera norte, paso 2
  { a: [-1296.1, -242.6], b: [-1278.8, -248.0], fondo: 9, casas: [
    [9, 4.0, '#f1eee7'], [9, 4.0, '#f1eee7']] },
  // el Forito, acera sur, paso 2
  { a: [-1292.0, -232.6], b: [-1274.0, -238.2], fondo: 9, casas: [
    [9.4, 6.6, '#efe6c8'], [9.4, 6.6, '#efe6c8']] },
  // el Forito, acera norte, paso 3
  { a: [-1278.8, -247.9], b: [-1284.9, -246.0], fondo: 9, casas: [
    [6.4, 4.0, '#f1eee7']] },
  // Tampico, acera norte, pasos 1-6
  { a: [-782.4, -285.5], b: [-738.9, -274.0], fondo: 9, casas: [
    [4.5, 9.4, '#efe6c8'], [4.5, 9.4, '#efe6c8'], [8.1, 9.4, '#efe6c8'], [9.7, 6.6, '#a9abad'], [9.9, 9.4, '#efe6c8'], [13.7, 9.4, '#efe6c8', { tienda: true }]] },
  // Tampico, acera sur, paso 1
  { a: [-782.2, -274.7], b: [-775.2, -272.8], fondo: 9, casas: [
    [7.3, 9.4, '#efe6c8']] },
  // Tampico, acera sur, paso 2
  { a: [-789.2, -276.6], b: [-782.2, -274.8], fondo: 9, casas: [
    [7.3, 6.6, '#f1eee7']] },
  // Tampico, acera sur, paso 3
  { a: [-782.2, -274.7], b: [-775.2, -272.8], fondo: 9, casas: [
    [7.3, 6.6, '#f1eee7']] },
  // Tampico, acera sur, paso 4
  { a: [-775.2, -272.8], b: [-765.5, -270.3], fondo: 9, casas: [
    [10, 6.6, '#f1eee7']] },
  // Tampico, acera sur, pasos 5-7
  { a: [-763.6, -269.7], b: [-732.1, -261.4], fondo: 9, casas: [
    [9.1, 6.6, '#efe6c8'], [11.2, 6.6, '#efe6c8', { tienda: true }], [12.3, 6.6, '#a9abad']] },
  // de Venezuela, acera este, pasos 6-8
  { a: [-812.5, -249.0], b: [-813.8, -238.8], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7', { tienda: true }], [6, 6.6, '#f1eee7', { tienda: true }]] },
  // de Venezuela, acera oeste, paso 1
  { a: [-821.9, -242.6], b: [-827.5, -220.2], fondo: 9, casas: [
    [7.7, 4.0, '#f1eee7'], [7.7, 4.0, '#f1eee7'], [7.7, 4.0, '#f1eee7']] },
  // de Venezuela, acera este, pasos 3-9
  { a: [-814.7, -227.9], b: [-812.1, -249.0], fondo: 9, casas: [
    [11.4, 6.6, '#f1eee7', { tienda: true }], [4.5, 6.6, '#f1eee7', { tienda: true }], [4.5, 6.6, '#f1eee7', { tienda: true }], [9.8, 6.6, '#f1eee7', { tienda: true }]] },
  // de Pamplona, acera norte, paso 6
  { a: [-531.6, -1129.9], b: [-514.3, -1142.5], fondo: 9, casas: [
    [10.7, 6.6, '#efe6c8'], [10.7, 6.6, '#efe6c8']] },
  // de Pamplona, acera norte, pasos 2-3
  { a: [-470.6, -1164.2], b: [-482.0, -1155.4], fondo: 9, casas: [
    [7.8, 4.0, '#f1eee7'], [6.5, 4.0, '#f1eee7']] },
  // Paseo Ana Suárez, acera norte, paso 1
  { a: [-610.7, -964.2], b: [-600.2, -958.4], fondo: 9, casas: [
    [12, 4.0, '#f1eee7']] },
  // Paseo Ana Suárez, acera norte, paso 2
  { a: [-588.9, -952.0], b: [-600.2, -958.2], fondo: 9, casas: [
    [12.9, 6.6, '#f1eee7']] },
  // de Carlos V, acera norte, pasos 6-8
  { a: [-1699.6, -264.7], b: [-1679.6, -268.1], fondo: 9, casas: [
    [7.7, 6.6, '#efe6c8'], [7.8, 4.0, '#f1eee7'], [4.8, 4.0, '#f1eee7']] },
  // de Carlos V, acera sur, pasos 2-3
  { a: [-1747.4, -237.8], b: [-1727.6, -241.2], fondo: 9, casas: [
    [11.6, 6.6, '#efe6c8'], [8.4, 4.0, '#f1eee7']] },
  // de Carlos V, acera norte, pasos 13-15
  { a: [-1653.2, -272.7], b: [-1624.6, -277.4], fondo: 9, casas: [
    [11.6, 6.6, '#f1eee7', { tienda: true }], [9.4, 4.0, '#e2c079', { tienda: true }], [8, 4.0, '#f1eee7']] },
  // Lope de Vega, acera este, pasos 1-3
  { a: [-753.9, -885.9], b: [-754.9, -894.9], fondo: 9, casas: [
    [8.9, 6.6, '#f1eee7'], [4.5, 6.6, '#f1eee7']] },
  // Lope de Vega, acera este, paso 5
  { a: [-748.7, -888.4], b: [-756.9, -899.3], fondo: 9, casas: [
    [13.6, 6.6, '#f1eee7']] },
  // de Madrid, acera este, paso 1
  { a: [-715.7, -1017.4], b: [-720.0, -1025.1], fondo: 9, casas: [
    [8.8, 4.0, '#f1eee7']] },
  // el Valbanera, acera oeste, pasos 2-3
  { a: [-896.6, -748.6], b: [-903.5, -737.7], fondo: 9, casas: [
    [6.8, 4.0, '#f1eee7'], [6.1, 4.0, '#f1eee7']] },
  // el Valbanera, acera oeste, paso 1
  { a: [-878.6, -777.2], b: [-886.3, -765.0], fondo: 9, casas: [
    [7.2, 4.0, '#9d9890'], [7.2, 4.0, '#9d9890']] },
  // Monseñor Óscar Romero, acera oeste, pasos 2-3
  { a: [-507.1, -689.6], b: [-488.4, -664.8], fondo: 9, casas: [
    [8.1, 4.0, '#f1eee7'], [8.1, 4.0, '#f1eee7'], [7.4, 4.0, '#f1eee7'], [7.4, 4.0, '#f1eee7']] },
  // Monseñor Óscar Romero, acera este, paso 4
  { a: [-475.0, -660.2], b: [-480.5, -667.2], fondo: 9, casas: [
    [8.9, 4.0, '#f1eee7']] },
  // de Tinguafaya, acera este, paso 1
  { a: [-728.1, -1302.4], b: [-726.1, -1282.7], fondo: 9, casas: [
    [9.9, 6.6, '#efe6c8'], [9.9, 6.6, '#efe6c8']] },
  // de Tinguafaya, acera oeste, paso 1
  { a: [-747.8, -1300.6], b: [-747.0, -1293.7], fondo: 9, casas: [
    [7, 6.6, '#f1eee7', { tienda: true }]] },
  // ===== TITERROY, repaso (Version 182): la otra copia de la carpeta, la de Downloads sin «Lava Game», =====
  // ===== que tiene 157 pasos que no estaban en la primera. Van despues: recortan sobre lo ya puesto arriba =====
  // del Doctor Severo Ochoa, acera oeste, paso 19
  { a: [-846.6, -484.9], b: [-854.1, -476.0], fondo: 9, casas: [
    [11.6, 4.0, '#f1eee7']] },
  // México, acera oeste, pasos 18-24
  { a: [-651.0, 112.7], b: [-669.3, 77.7], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7'], [12.1, 6.6, '#f1eee7'], [10.4, 6.6, '#f1eee7'], [7, 6.6, '#f1eee7'], [7, 6.6, '#f1eee7'], [13.7, 6.6, '#f1eee7'], [9.7, 6.6, '#f1eee7'], [4.5, 6.6, '#f1eee7', { tienda: true }]] },
  // México, acera este, pasos 17-24
  { a: [-622.5, 144.7], b: [-650.6, 91.1], fondo: 9, casas: [
    [7.6, 4.0, '#f1eee7', { tienda: true }], [13.5, 4.0, '#f1eee7', { tienda: true }], [12.1, 4.0, '#f1eee7'], [10.4, 4.0, '#f1eee7', { tienda: true }], [7, 4.0, '#f1eee7'], [7, 4.0, '#f1eee7'], [13.7, 4.0, '#d9b996'], [9.7, 4.0, '#e6d3b8'], [4.5, 4.0, '#f1eee7']] },
  // de Toledo, acera este, paso 7
  { a: [-963.6, -1504.3], b: [-953.6, -1490.8], fondo: 9, casas: [
    [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7']] },
  // la Pardela, acera sur, paso 10
  { a: [-598.8, -1305.8], b: [-592.4, -1311.9], fondo: 9, casas: [
    [8.8, 4.0, '#f1eee7']] },
  // de Vicente Guerra, acera norte, pasos 8-10
  { a: [-231.9, -663.2], b: [-183.3, -694.4], fondo: 9, casas: [
    [8.9, 6.6, '#f1eee7'], [8.9, 6.6, '#f1eee7'], [8.9, 6.6, '#f1eee7'], [11.2, 4.0, '#f1eee7'], [11.2, 4.0, '#f1eee7'], [4.3, 4.0, '#f1eee7'], [4.3, 0, B, { fondo: 16 }]] },
  // de Vicente Guerra, acera sur, pasos 8-10
  { a: [-232.8, -649.6], b: [-169.2, -690.6], fondo: 9, casas: [
    [8.7, 6.6, '#f1eee7'], [8.7, 6.6, '#f1eee7'], [8.7, 6.6, '#f1eee7'], [8.7, 6.6, '#f1eee7'], [11.2, 6.6, '#f1eee7'], [11.2, 6.6, '#f1eee7'], [9.2, 4.0, '#f1eee7'], [9.2, 4.0, '#f1eee7']] },
  // del Fray Mendo de Viedma, acera sur, pasos 9-16
  { a: [-760.4, -825.6], b: [-704.3, -867.0], fondo: 9, casas: [
    [6.4, 4.0, '#e6d3b8'], [8.5, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [8, 4.0, '#a9abad'], [8, 4.0, '#f1eee7'], [8, 4.0, '#a9abad'], [7.4, 4.0, '#f1eee7'], [7.4, 4.0, '#f1eee7']] },
  // del Fray Mendo de Viedma, acera norte, paso 17
  { a: [-717.4, -869.8], b: [-710.3, -875.0], fondo: 9, casas: [
    [8.8, 4.0, '#efe6c8']] },
  // del Fray Mendo de Viedma, acera norte, pasos 11-16
  { a: [-756.3, -841.0], b: [-710.3, -875.0], fondo: 9, casas: [
    [10.5, 4.0, '#d9b996'], [8, 6.6, '#f1eee7'], [8, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [8, 4.0, '#a9abad'], [7.4, 4.0, '#a9abad'], [7.4, 4.0, '#a9abad']] },
  // del Fray Mendo de Viedma, acera sur, paso 17
  { a: [-711.2, -861.5], b: [-704.1, -866.8], fondo: 9, casas: [
    [8.9, 4.0, '#a9abad']] },
  // Tinamala, acera norte, paso 7
  { a: [-591.6, -789.2], b: [-582.0, -796.4], fondo: 9, casas: [
    [12, 4.0, '#efe6c8']] },
  // Tinamala, acera norte, paso 4
  { a: [-536.9, -828.5], b: [-546.1, -821.8], fondo: 9, casas: [
    [11.4, 4.0, '#f1eee7']] },
  // Tinamala, acera norte, paso 5
  { a: [-564.3, -809.5], b: [-572.6, -803.4], fondo: 9, casas: [
    [10.3, 4.0, '#e4cfc9']] },
  // Tinamala, acera sur, pasos 7-8
  { a: [-576.1, -786.5], b: [-598.8, -769.4], fondo: 9, casas: [
    [8, 4.0, '#f1eee7'], [8, 4.0, '#f1eee7'], [12.4, 4.0, '#f1eee7']] },
  // Lebrillo, acera norte, pasos 9-11
  { a: [-523.5, -311.6], b: [-472.3, -301.3], fondo: 9, casas: [
    [9.6, 4.0, '#f1eee7'], [9.6, 4.0, '#f1eee7'], [8.1, 4.0, '#f1eee7'], [8.1, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7'], [8.4, 4.0, '#f1eee7']] },
  // Lebrillo, acera sur, pasos 9-11
  { a: [-510.8, -299.1], b: [-474.2, -291.8], fondo: 9, casas: [
    [4.5, 6.6, '#f1eee7'], [8.1, 6.6, '#f1eee7', { tienda: true }], [8.1, 6.6, '#f1eee7', { tienda: true }], [8.4, 6.6, '#efe6c8'], [8.4, 6.6, '#efe6c8']] },
  // de Santa Teresa de Jesús, acera norte, paso 12
  { a: [-811.9, -257.6], b: [-794.4, -255.9], fondo: 9, casas: [
    [8.8, 4.0, '#f1eee7'], [8.8, 4.0, '#f1eee7']] },
  // de Santa Teresa de Jesús, acera norte, paso 14
  { a: [-777.5, -254.0], b: [-768.0, -253.1], fondo: 9, casas: [
    [9.5, 4.0, '#f1eee7']] },
  // de Santa Teresa de Jesús, acera sur, pasos 12-14
  { a: [-803.2, -247.8], b: [-771.3, -244.5], fondo: 9, casas: [
    [7.1, 6.6, '#f1eee7', { tienda: true }], [7.1, 6.6, '#f1eee7', { tienda: true }], [11.3, 6.6, '#f1eee7'], [6.8, 4.0, '#f1eee7']] },
  // Gaire, acera este, paso 5
  { a: [-867.4, -670.1], b: [-863.1, -675.3], fondo: 9, casas: [
    [6.8, 4.0, '#f1eee7']] },
  // Sorondongo, acera norte, paso 5
  { a: [-1265.9, 46.8], b: [-1280.6, 49.8], fondo: 9, casas: [
    [7.5, 4.0, '#f1eee7'], [7.5, 4.0, '#f1eee7']] },
  // Tingafa, acera este, paso 5
  { a: [-579.3, -854.5], b: [-567.6, -839.8], fondo: 9, casas: [
    [9.4, 4.0, '#f1eee7'], [9.4, 4.0, '#f1eee7']] },
  // Tingafa, acera este, paso 7
  { a: [-556.6, -836.4], b: [-546.2, -821.8], fondo: 9, casas: [
    [18, 0, B, { fondo: 16 }]] },
  // de la Princesa Artiaga, acera oeste, pasos 3-5
  { a: [-801.0, -1672.2], b: [-782.2, -1645.2], fondo: 9, casas: [
    [8.1, 4.0, '#f1eee7'], [8.1, 4.0, '#f1eee7'], [9, 4.0, '#f1eee7'], [7.8, 4.0, '#f1eee7']] },
  // de la Princesa Artiaga, acera sur, paso 7
  { a: [-771.9, -1624.4], b: [-763.4, -1617.1], fondo: 9, casas: [
    [11.2, 6.6, '#f1eee7']] },
  // Agustín Espinosa, acera sur, paso 19
  { a: [-1572.9, 19.0], b: [-1583.2, 20.6], fondo: 9, casas: [
    [10.5, 6.6, '#f1eee7']] },
  // Agustín Espinosa, acera norte, paso 3
  { a: [-1383.9, -38.9], b: [-1397.0, -36.8], fondo: 9, casas: [
    [13.3, 6.6, '#f1eee7']] },
  // Agustín Espinosa, acera norte, paso 23
  { a: [-1656.2, 10.3], b: [-1666.5, 11.9], fondo: 9, casas: [
    [10.4, 0, B, { fondo: 16 }]] },
  // Tampico, acera sur, paso 1
  { a: [-805.4, -280.6], b: [-789.2, -276.7], fondo: 9, casas: [
    [8.3, 6.6, '#f1eee7'], [8.3, 6.6, '#f1eee7']] },
  // Tampico, acera sur, paso 7
  { a: [-732.0, -260.9], b: [-723.4, -257.7], fondo: 9, casas: [
    [9.1, 6.6, '#f1eee7', { tienda: true }]] },
];

// rótulos: [nombre, x, z, normal hacia la calle (x, z), tipo]
const ROTULOS = [
  ['Superservicio Altavista', 241.4, -861.4, 0.906, -0.424, 'super'],  // Blasco Ibáñez, paso 47
  ['Locutorio Amistad', -1960.6, -2009.1, 0.327, 0.945, 'tech'],  // de Luján Pérez, paso 36
  ['Las Cristinas', -1592.5, -2138.1, 0.334, 0.942, 'retail'],  // de Luján Pérez, paso 75
  ['Winners Salón Argana', -1749.2, -2071.1, -0.332, -0.943, 'gen'],  // de Luján Pérez, paso 58
  ['Codere', -1739.8, -2074.4, -0.332, -0.943, 'gen'],  // de Luján Pérez, paso 59
  ['Casiano', -2248.1, -1811.5, -0.824, 0.567, 'food'],  // del León Felipe, paso 47
  ['Chacón', -1944.3, -1731.2, 0.896, -0.444, 'retail'],  // Polca, paso 30
  ['Toldos Lanzarote', -1700.8, -1663.4, -0.881, 0.473, 'gen'],  // Mazurca, paso 26
  ['Carpintería de Aluminio Willy', -1686.7, -1637.1, -0.881, 0.473, 'gen'],  // Mazurca, paso 29
  ['Spar', -1671.7, -1577.1, 0.890, -0.456, 'super'],  // Mazurca, paso 35
  ['Suma', -2034.6, -2015.0, -0.985, 0.175, 'super'],  // de Campoamor, paso 32
  ['Calzados Suárez', -765.7, -565.5, -0.767, -0.642, 'retail'],  // del Doctor Severo Ochoa, paso 8
  ['Mercería Kevais', -818.3, -516.6, 0.785, 0.619, 'retail'],  // del Doctor Severo Ochoa, paso 14
  ['Anabel Pets', -818.2, -147.4, -0.915, 0.403, 'retail'],  // de Colombia, paso 4
  ['Dolphinland', -825.7, -144.2, 0.915, -0.403, 'gen'],  // de Colombia, paso 4
  ['Dulcita', -460.7, -760.3, 0.601, 0.799, 'food'],  // de Carlos III, paso 9
  ['Keidea Muebles', -592.4, -276.1, 0.903, 0.429, 'retail'],  // del Castillo de las Coloradas, paso 6
  ['TravelsAir', -607.8, -246.7, 0.903, 0.429, 'gen'],  // del Castillo de las Coloradas, paso 2
  ['Parrilla', -610.0, -217.7, -0.903, -0.429, 'retail'],  // del Castillo de las Coloradas, paso 1
  ['Glassdrive', -668.2, -314.4, -0.015, -1.000, 'gen'],  // de Juan Brito, paso 3
  ['New Electric', -687.6, -314.1, -0.015, -1.000, 'tech'],  // de Juan Brito, paso 5
  ['Jasmine de Lanzarote', -195.8, 42.0, -0.618, 0.786, 'retail'],  // Doctor Juan Negrìn, paso 1
  ['Itahisa Supermercado', -247.5, -2.7, -0.647, 0.763, 'super'],  // Doctor Juan Negrìn, paso 7
  ['Generali', -319.3, -62.4, -0.647, 0.763, 'bank'],  // Doctor Juan Negrìn, paso 14
  ['ICSE', -304.4, -49.9, -0.647, 0.763, 'gen'],  // Doctor Juan Negrìn, paso 12
  ['Di Casa', -333.2, -45.9, 0.647, -0.763, 'retail'],  // Doctor Juan Negrìn, paso 14
  ['Studio MK', -397.6, -129.0, -0.648, 0.762, 'retail'],  // Doctor Juan Negrìn, paso 20
  ['Correos Express', -581.5, -362.2, 0.736, 0.677, 'gen'],  // de Santander, paso 4
  ['Proyecto ARO', -582.2, -346.0, -0.736, -0.677, 'gen'],  // de Santander, paso 5
  ['Quirónprevención', -813.3, -239.2, -0.992, -0.123, 'gen'],  // de Venezuela, paso 7
  ['Gimnasio Pabellón Municipal de Titerroy', -502.2, -683.1, 0.827, -0.563, 'gen'],  // Monseñor Óscar Romero, paso 2
];

const llano = s => String(s == null ? '' : s).normalize('NFD').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

export function tuneFachadasCasa(map) {
  aceras(map, ACERAS);
  map.fachadasCasa = ACERAS.length;
  if (!Array.isArray(map.signs)) map.signs = [];
  let puestos = 0;
  for (const [name, x, z, nx, nz, k] of ROTULOS) {
    const n = llano(name);
    const repe = map.signs.some(s => Math.hypot(s.x - x, s.z - z) < 150 && (() => {
      const m = llano(s.name);
      if (m.length <= 3) return false;
      return m.includes(n) ? true : n.includes(m);
    })());
    if (repe) continue;
    map.signs.push({ x, z, nx, nz, name, k });
    puestos++;
  }
  map.rotulosCasa = puestos;
}
