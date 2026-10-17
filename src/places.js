/**
 * Sitios reales de Arrecife (latitud y longitud de OpenStreetMap, Wikidata y
 * directorios), pasados a coordenadas del juego: x hacia el este y z hacia el
 * sur, en metros desde el origen del mapa (28.9625, -13.55).
 */
const LAT0 = 28.9625, LON0 = -13.55;
const KX = 111320 * Math.cos(LAT0 * Math.PI / 180);
const KZ = 111320;
/** latitud/longitud → [x, z] del juego */
export const ll = (lat, lon) => [+((lon - LON0) * KX).toFixed(1), +((LAT0 - lat) * KZ).toFixed(1)];

export const PLACES = {
  // centro histórico y el Charco
  iglesiaSanGines: ll(28.95969, -13.54727),
  torreSanGines: ll(28.9594764, -13.5473091),
  casaGinory: ll(28.96194, -13.54408),        // Charco Vivo, antigua Casa Ginory (1960)
  chalanaCharco: ll(28.96219, -13.54624),
  cinesAtlantida: ll(28.96118, -13.5486),      // C/ León y Castillo 42
  castilloSanGabriel: ll(28.95637, -13.54766),
  parqueIslasCanarias: ll(28.95752, -13.55307),
  parqueRamirezCerda: ll(28.95812, -13.5489),  // el de la glorieta de la música
  islotefermina: ll(28.95461, -13.55351),
  casaArroyo: ll(28.95876, -13.54755),
  casaCultura: ll(28.95819, -13.54929),
  recintoFerial: ll(28.95586, -13.56459),
};

/** organismos oficiales (k: tipo de edificio) */
export const OFFICIAL = [
  { n: 'Cabildo de Lanzarote', k: 'cabildo', at: ll(28.95797, -13.56317) },
  { n: 'Ayuntamiento de Arrecife', k: 'ayto', at: ll(28.95926, -13.5468) },
  { n: 'Policía Local', k: 'policia', at: ll(28.95973, -13.54643) },
  { n: 'Comisaría Policía Nacional', k: 'policia', at: ll(28.96627, -13.5408) },
  { n: 'Correos', k: 'correos', at: ll(28.9581, -13.54977) },
  { n: 'Hospital Dr. José Molina Orosa', k: 'hospital', at: ll(28.97349, -13.56591) },
  { n: 'Centro de Salud Titerroy', k: 'salud', at: ll(28.96681, -13.55805) },
  { n: 'Casa de la Cultura Agustín de la Hoz', k: 'cultura', at: ll(28.95819, -13.54929) },
  { n: 'Casa de los Arroyo', k: 'cultura', at: ll(28.95876, -13.54755) },
];

/** hoteles y pensiones (el Gran Hotel tiene su propio modelo) */
export const HOTELS = [
  { n: 'Hotel Lancelot', at: ll(28.95829, -13.55564), stars: 3 },
  { n: 'Hotel Diamar', at: ll(28.95881, -13.55805), stars: 3 },
  { n: 'Hotel Miramar', at: ll(28.95859, -13.54774), stars: 3 },
  { n: 'Pensión Cardona', at: ll(28.95897, -13.55377), stars: 2 },
  { n: 'Hostal España', at: ll(28.96266, -13.54941), stars: 1 },
];

/** colegios e institutos */
export const SCHOOLS = [
  { n: 'IES Blas Cabrera Felipe', at: ll(28.96699, -13.55624) },
  { n: 'IES César Manrique', at: ll(28.96601, -13.56017) },
  { n: 'IES Arrecife', at: ll(28.96659, -13.56377) },
  { n: 'IES Las Salinas', at: ll(28.96004, -13.55892) },
  { n: 'IES Agustín Espinosa', at: ll(28.95802, -13.5522) },
  { n: 'CEO Argana', at: ll(28.97546, -13.56476) },
  { n: 'CEIP Adolfo Topham', at: ll(28.96657, -13.54906) },
  { n: 'CEIP Antonio Zerolo', at: ll(28.9601, -13.55817) },
  { n: 'CEIP Capellanía del Yágamo', at: ll(28.96666, -13.55954) },
  { n: 'CEIP Los Geranios', at: ll(28.97769, -13.54801) },
  { n: 'CEIP Titerroy', at: ll(28.97065, -13.55676) },
  { n: 'CEIP Benito Méndez Tarajano', at: ll(28.96823, -13.55766) },
  { n: 'CEIP Nieves Toledo', at: ll(28.96453, -13.54751) },
  { n: 'Escuela Oficial de Idiomas', at: ll(28.96856, -13.55302) },
  { n: 'Conservatorio de Música', at: ll(28.96563, -13.55538) },
  { n: 'Escuela de Arte Pancho Lasso', at: ll(28.96642, -13.5556) },
];

/** instalaciones deportivas con nombre */
export const SPORTS = [
  { n: 'Ciudad Deportiva de Lanzarote', k: 'estadio', at: ll(28.9667, -13.55431) },
  { n: 'Pabellón Municipal de Titerroy', k: 'pabellon', at: ll(28.96844, -13.55535) },
  { n: 'Palacio Municipal de los Deportes', k: 'pabellon', at: ll(28.97796, -13.57095) },
];

/** esculturas de las rotondas (las que tienen sitio conocido) */
export const SCULPTURES = [
  { n: 'Barlovento · César Manrique', k: 'barlovento', at: [-484.0, 499.2] },
  { n: 'Homenaje a la Vela Latina', k: 'vela', at: [-1283.5, 590.1] },
  { n: 'Pescador con marlín', k: 'marlin', at: [736.9, 186.7] },
];

/**
 * rotondas sacadas del mapa (anillos de calle casi circulares, comprobados
 * sobre la foto aérea): [x, z, radio del eje del anillo, ancho de calzada]
 */
export const ROUNDABOUTS = [
  [-252.3, -338.1, 9.7, 6.5], [-404.2, -351.2, 17.1, 11], [175.1, -530.9, 18.4, 11], [-484.0, 499.2, 11.4, 9.5],
  [700.1, -48.2, 8.0, 8], [636.9, -310.5, 7.8, 8], [273.5, -688.1, 16.8, 11], [736.9, 186.7, 17.5, 8],
  [560.2, -602.7, 15.6, 9.5], [-737.6, -374.4, 27.5, 11], [-743.6, 370.2, 6.8, 9.5], [949.3, -320.2, 13.8, 9.5],
  [-1036.5, -140.9, 22.1, 11], [-1063.6, 498.9, 8.7, 9.5], [355.4, -1154.5, 12.4, 11], [-1298.1, -346.4, 10.5, 9.5],
  [-1283.5, 590.1, 31.2, 9.5], [-1015.5, -1047.0, 10.9, 8], [-779.3, -1243.4, 6.0, 8], [-492.1, -1525.9, 11.4, 8],
  [1212.3, -1159.8, 10.8, 6.5], [-1241.9, -1148.9, 8.1, 6.5], [465.8, -1719.5, 26.7, 11], [1091.2, -1419.1, 12.4, 6.5],
  [-1198.1, -1377.4, 9.6, 8], [-1758.9, -556.3, 9.3, 9.5], [-1560.9, -1146.9, 10.2, 8], [-596.6, -1866.0, 13.1, 8],
  [2122.5, -220.6, 8.6, 6.5], [-1597.2, -1587.4, 7.5, 8], [2080.5, -1028.9, 8.9, 8], [2127.3, -1189.7, 9.4, 8],
  [2361.2, -1134.3, 15.1, 8], [2361.5, -1241.4, 20.6, 8], [-2056.8, -1829.1, 11.3, 8], [-2269.5, -1738.0, 9.0, 8],
  [-2319.0, -1706.4, 8.2, 8], [2384.2, -1667.6, 22.4, 11],
];
/** radio de la isleta (el bordillo, pegado a la calzada) */
export const islandR = ([, , r, w]) => Math.max(1.6, r - w / 2 + 0.05);

/** la Calle Real (León y Castillo), del mar hacia dentro */
export const CALLE_REAL = [
  'CaixaBank', 'Farmacia Matallana', 'Vodafone', 'Sabor a España', 'Cines Atlántida',
  'Farmacia Tenorio', 'Sam Parfums', 'Seguridad Social', 'Farmacia Borrego', 'Open Mall', 'Endesa',
];
