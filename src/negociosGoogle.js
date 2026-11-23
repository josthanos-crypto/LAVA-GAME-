import HECHOS from './marcosHechos.json';

/**
 * Los negocios de las fichas de Google Maps que el juego no tenía (búsquedas por barrio de noviembre de 2026: bar,
 * restaurante, cafetería, supermercado, tienda, peluquería y taller en Argana, Altavista, Titerroy, el centro, Valterra,
 * San Francisco Javier, Maneje y Playa Honda). De cada ficha solo se toma el nombre y su punto (latitud y longitud):
 * nada inventado. Los nombres largos se acortan quitando la coletilla (p. ej. «Katu - Wine Bar & Tapas 🍷» → «Katu»).
 *
 * El cartel se pone solo, en `tuneNegociosGoogle`: en el edificio del mapa que tiene el punto (o el más cercano a menos
 * de 18 m), en la pared que mira a la calle más cerca del punto. No se pone si:
 *  - ya hay un cartel con ese nombre cerca, u otro cartel a menos de 5 m en esa pared;
 *  - la pared es una de las fachadas hechas a mano (`marcosHechos.json`, sacado de los `marco()` de src);
 *  - el negocio tiene modelo propio o está dentro de un centro comercial (lista FUERA).
 * k: el estilo del cartel de world.js (food, super, retail, gen).
 */

const L = (n, k, lat, lon) => ({ n, k, x: (lon + 13.55) * 97398, z: (28.9625 - lat) * 111320 });

export const NEGOCIOS_GOOGLE = [
  // Argana
  L('Restaurante Las Delicias de Ines', 'food', 28.9775683, -13.570613),
  L('La Ripia', 'food', 28.9804368, -13.5707851),
  L('El Gorro Blanco', 'food', 28.9790953, -13.5658628),
  L('Restaurante Guanapay 3', 'food', 28.9775651, -13.5726078),
  L('Bar Tequila', 'food', 28.9752574, -13.5722957),
  L('Asadero El Campesino', 'food', 28.9822533, -13.5689526),
  L('Restaurante Suárez Rafael', 'food', 28.980819, -13.5739151),
  L('Bar Casa Juan Caballero', 'food', 28.9773757, -13.572439),
  L('Bar El Rubicón', 'food', 28.9813095, -13.5684745),
  L("Bar Pizzería Junior's", 'food', 28.9786553, -13.5700433),
  L('Café Bar Amanecer', 'food', 28.98091, -13.57112),
  L('Bar La Plaza', 'food', 28.9817957, -13.5684022),
  L('Gkbar', 'food', 28.9805537, -13.5701421),
  L('Bar El Volcán', 'food', 28.980926, -13.5678965),
  L('Bar Las Anclas', 'food', 28.983024, -13.5694743),
  L('La Carrucha Café', 'food', 28.9764012, -13.5706193),
  L('El Rincón de Berto', 'food', 28.9802516, -13.5678023),
  L('Cafetería Aminata', 'food', 28.9781408, -13.5695435),
  L('Tartas la Argentina', 'food', 28.9801735, -13.5680535),
  L('Rincón del Pan', 'food', 28.9792903, -13.5701758),
  L('Kandunga Gastrobar', 'food', 28.9779445, -13.5700078),
  L('Bar Cafetería Pis-Paz', 'food', 28.9799413, -13.5649857),
  L('Supermercado SPAR Argana', 'super', 28.9765457, -13.5671163),
  L('Supermercado Chacón Argana', 'super', 28.9781119, -13.5698928),
  L('Supermercado de la Madera', 'retail', 28.9752806, -13.5703756),
  L('Comercial Marcial Pérez', 'super', 28.9785841, -13.5748367),
  L('Frutería y Panadería Las Palmeras', 'super', 28.9818199, -13.5682217),
  L('La Tienda de Paula', 'super', 28.9821987, -13.5704574),
  L('Bazar Minimarket Pipa', 'super', 28.978178, -13.5723868),
  L('Modas Jybe', 'retail', 28.978178, -13.5723868),
  L('Dulcería-Bazar El Parque', 'retail', 28.9822058, -13.5704643),
  L("Maru's Peluqueros", 'gen', 28.9792851, -13.5702383),
  L('Milazzo Peluquería', 'gen', 28.9786891, -13.5700731),
  L('¡Qué Pelos!', 'gen', 28.9784131, -13.5722538),
  L('Peluquería Ortiz & Viera', 'gen', 28.9794886, -13.5712895),
  L('Arraez Peluqueros', 'gen', 28.9785155, -13.5702443),
  L('Peluquería Corto y Cambio', 'gen', 28.9806682, -13.570207),
  L('Centro Estética & Peluquería', 'gen', 28.9792477, -13.570324),
  L('Peluquería Any', 'gen', 28.9817378, -13.5675232),
  L('Tucán Negro', 'gen', 28.9740066, -13.5686648),
  L('Taller Krismotor21', 'gen', 28.9785659, -13.5716764),
  L('Taller Automóvil Rally ACR', 'gen', 28.9815667, -13.5668881),
  L('Taller Mecánico Casiano', 'gen', 28.9788536, -13.5730991),
  L('Taller Esteban Motorsport', 'gen', 28.9802606, -13.5713049),
  L('Neumáticos Orlando', 'gen', 28.976993, -13.572588),
  L('Lanzawagen', 'gen', 28.9799851, -13.5757514),
  L('Croc Mahey', 'gen', 28.9741258, -13.570268),
  L('Taller Sitofer', 'gen', 28.9803479, -13.5714275),
  L('Taller Automoción Nieves', 'gen', 28.9770356, -13.5692909),
  // Altavista y Maneje
  L('Bar La Garimba', 'food', 28.9719712, -13.5552271),
  L('El Único', 'food', 28.969593, -13.5515206),
  L('Bar Casa J. Antonio', 'food', 28.9753093, -13.5492285),
  L('Bar Pablo', 'food', 28.9758923, -13.5464971),
  L('Snack Bar El Túnel', 'food', 28.9741132, -13.5461255),
  L('Bar Sahara', 'food', 28.9702232, -13.5469337),
  L('El Bar Calinero', 'food', 28.9788894, -13.5476714),
  L('La Cucuteña', 'food', 28.9699128, -13.5547265),
  L('Winston', 'food', 28.9705599, -13.5543855),
  L('Asadero de Pollos Gran Aldea', 'food', 28.9709749, -13.5546954),
  L('Bar El Auténtico Ecuatoriano', 'food', 28.9704295, -13.5443927),
  L('El Maizal', 'food', 28.9685219, -13.5512218),
  L('Supermercado Chafari', 'super', 28.97011, -13.54986),
  L('Supermercado Chacón Valterra', 'super', 28.9687572, -13.5430409),
  L('Supermercado Saavedra', 'super', 28.9724763, -13.5568286),
  L('Autoservicio Saga', 'super', 28.974326, -13.5572295),
  L('Super Makro Rivera', 'super', 28.9695602, -13.5494932),
  L('La Bodeguita de Angi', 'super', 28.968282, -13.5523649),
  L('Minimarket El Maná', 'super', 28.9780889, -13.5572816),
  L('Wilton Estilistas Barbers', 'gen', 28.9694543, -13.5492772),
  L('Rubén Peluqueros', 'gen', 28.9743276, -13.5490974),
  L('The Men Salon', 'gen', 28.9704036, -13.5499163),
  L('Peluquería Yanet New Look', 'gen', 28.9689799, -13.54437),
  // Titerroy, Las Salinas y San Francisco Javier
  L('K-alma', 'gen', 28.9687727, -13.557091),
  L('Jorluz Peluquería', 'gen', 28.9692701, -13.5572133),
  L('Peluquería Nizglez Caballeros', 'gen', 28.9691514, -13.5574566),
  L('Ancor Peluqueros', 'gen', 28.9682289, -13.5584347),
  L('Salsero Gastrobar', 'food', 28.9655179, -13.5560836),
  L('Bar Tintan', 'food', 28.9651757, -13.556006),
  L('Gardenia Lounge Bar Café', 'food', 28.9653121, -13.5531148),
  L('Bar Los Cuarteles', 'food', 28.9689276, -13.5604917),
  L('La Tapería Moi&Vane', 'food', 28.9638383, -13.558899),
  L('Bar Casa Juani', 'food', 28.9676, -13.5530012),
  L('Bar Cafetería La Fonda', 'food', 28.9688756, -13.5593635),
  L('Gustito Peruano', 'food', 28.9640867, -13.5560473),
  L('Galicia Nuestra Casa', 'food', 28.9639827, -13.5570717),
  L('Cafetería Restaurante Lander', 'food', 28.964832, -13.5598347),
  L('Asadero de Pollos El Jaleo', 'food', 28.963346, -13.5539),
  L('La Perrería', 'food', 28.9686772, -13.5569942),
  L('TuStilo Lanzarote', 'retail', 28.9678938, -13.5590506),
  L('La Tiendita de Bea', 'retail', 28.9649012, -13.564367),
  L('Ecoventa Lanzarote', 'retail', 28.9630144, -13.5537601),
  L('Vendogangas.com', 'retail', 28.9652548, -13.5562049),
  L('Rincón Manolo Cafetería', 'food', 28.9644326, -13.5670645),
  L('Bar Cafetería San Francisco Javier', 'food', 28.9648707, -13.5669843),
  L('Un Rinconcito de Perú', 'food', 28.9687009, -13.5601173),
  L('So Sabura', 'food', 28.9656508, -13.566589),
  L('Bar y Cafetería La Amistad', 'food', 28.9713965, -13.5666312),
  L('Bar Las Salinas', 'food', 28.9608778, -13.5573716),
  L('El Serranito', 'food', 28.960905, -13.5574536),
  // el centro y Valterra
  L('El Rincón de Fajardo', 'food', 28.9617211, -13.5517239),
  L('Bar Enrique', 'food', 28.9598065, -13.5469924),
  L('El Baifo Gastrobar', 'food', 28.958862, -13.5507602),
  L('Katu', 'food', 28.9584786, -13.5494141),
  L('La Despensita', 'food', 28.9606947, -13.5489937),
  L('Barullo Gastrobar', 'food', 28.9590331, -13.5479774),
  L('Bar El Parral', 'food', 28.9615638, -13.5505864),
  L('Bar & Cafetería 4 Esquinas', 'food', 28.9627175, -13.549522),
  L('La Jaula', 'food', 28.9621104, -13.5481917),
  L('Restaurante Casa Víctor', 'food', 28.9580948, -13.5505805),
  L('El Caladero Gastrobar', 'food', 28.9590914, -13.5478348),
  L('SottoSopra', 'food', 28.9602502, -13.5468014),
  L('Bar Mesón La Virazón', 'food', 28.9582331, -13.5537343),
  L('El Jardín Secreto', 'food', 28.9598157, -13.5501453),
  L('Bar Andalucía 1960', 'food', 28.9589605, -13.5479466),
  L('Bar Bahía de Naos', 'food', 28.9674828, -13.5392034),
  L('Bar Cafetería El Telamon', 'food', 28.9647757, -13.5469371),
  L('Rofe Restaurante', 'food', 28.96466, -13.540923),
  L('Paniko Street Wear', 'retail', 28.9598138, -13.5520005),
  L('Trendz', 'retail', 28.9593387, -13.5487197),
  L('Jaira', 'retail', 28.9594129, -13.549603),
  L('Medina Menswear', 'retail', 28.959392, -13.549742),
  L('Siroco Concept Store', 'retail', 28.9587307, -13.5501264),
  L('Intersport Todo Deporte', 'retail', 28.9615985, -13.5499441),
  L('Tienda China', 'retail', 28.9582051, -13.5551769),
  L('Fortuna', 'retail', 28.9617297, -13.5511093),
  L('Me Encanta mi Tiendita Latina', 'super', 28.9646355, -13.5413076),
  L('Suministros Textiles Doreira', 'retail', 28.965419, -13.567127),
  L('Taller Llave 12 Bosch Car Service', 'gen', 28.974947, -13.536277),
  // Playa Honda
  L('Sabores Tapas y Restaurante', 'food', 28.9560632, -13.5920422),
  L('Forasteros Street Food', 'food', 28.9539434, -13.5914913),
  L('Bar Fusión Mayor 22', 'food', 28.9550412, -13.5915347),
  L('Mamma Mì Pizza', 'food', 28.9537745, -13.5915463),
  L('El Paso', 'food', 28.958051, -13.5915269),
  L('Marava', 'food', 28.9534575, -13.5896735),
  L('Kmayan Filipino Cuisine', 'food', 28.9542435, -13.5898376),
  L('El Turco Kebab', 'food', 28.9553866, -13.591601),
  L('Daniele Pizza al Taglio', 'food', 28.9541942, -13.5910621),
  L('El Rincón del Abuelo', 'food', 28.9543069, -13.5969628),
  L('La SEDe Vinoteca', 'food', 28.9546507, -13.5915724),
  L('Bar Centro de la 3ª Edad', 'food', 28.9529866, -13.5910114),
  L('Bar El Concord', 'food', 28.9538769, -13.5972675),
  L('San Borondón Cafetería', 'food', 28.9533626, -13.5907078),
  L('The Food Co.', 'super', 28.9594762, -13.5879692),
  L('Supermercado EuroSpar Playa Honda', 'super', 28.9557218, -13.5916312),
  L('HiperDino San Bartolomé', 'super', 28.957838, -13.5997637),
  L('Supermercado VidaNueva', 'super', 28.9543705, -13.5959475),
  L('Supermercado Kilco', 'super', 28.9543824, -13.5897837),
  L('Roper', 'super', 28.9578659, -13.5918),
  L('Alimentación Noeli', 'super', 28.9531822, -13.5954991),
];

// ——— geometría ———

function distSeg(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2));
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
}

function dentro(p, x, z) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, zi] = p[i], [xj, zj] = p[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}

function distPoligono(p, x, z) {
  if (dentro(p, x, z)) return 0;
  let d = Infinity;
  for (let i = 0; i < p.length - 1; i++) d = Math.min(d, distSeg(x, z, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]));
  return d;
}

function normaliza(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
}

/** lo cerca que queda una calle del punto (para saber qué pared da a la calle) */
function distCalle(calles, x, z) {
  let d = Infinity;
  for (const r of calles) {
    const p = r.pts || r.p;
    for (let i = 0; i < p.length - 1; i++) d = Math.min(d, distSeg(x, z, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]) - (r.w || 6) / 2);
  }
  return d;
}

function esHecho(ax, az, bx, bz) {
  for (const [hx0, hz0, hx1, hz1] of HECHOS) {
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (distSeg(mx, mz, hx0, hz0, hx1, hz1) < 2.5 && (distSeg(ax, az, hx0, hz0, hx1, hz1) < 4 || distSeg(bx, bz, hx0, hz0, hx1, hz1) < 4)) return true;
  }
  return false;
}

/** la pared del edificio que da a la calle más cerca del negocio, y el punto del cartel en ella */
function pared(b, calles, n) {
  const p = b.p;
  let mejor = null;
  for (let i = 0; i < p.length - 1; i++) {
    const [ax, az] = p[i], [bx, bz] = p[i + 1];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 3) continue;
    const ux = (bx - ax) / len, uz = (bz - az) / len;
    let nx = -uz, nz = ux;
    const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (dentro(p, mx + nx * 0.5, mz + nz * 0.5)) { nx = -nx; nz = -nz; }
    const borde = Math.min(3.2, len / 2);
    const t = Math.max(borde, Math.min(len - borde, (n.x - ax) * ux + (n.z - az) * uz));
    const sx = ax + ux * t, sz = az + uz * t;
    const calle = distCalle(calles, sx + nx * 2, sz + nz * 2);
    if (calle > 9) continue;
    const nota = Math.hypot(n.x - sx, n.z - sz) + calle * 0.6;
    if (!mejor || nota < mejor.nota) mejor = { nota, x: sx + nx * 0.08, z: sz + nz * 0.08, nx, nz, a: [ax, az], b: [bx, bz] };
  }
  return mejor;
}

/** antes de levantar la ciudad: un cartel por negocio, en su pared */
export function tuneNegociosGoogle(map) {
  const signs = (map.signs ||= []);
  const puestos = [];
  for (const n of NEGOCIOS_GOOGLE) {
    const nombre = normaliza(n.n);
    if (signs.some((s) => Math.hypot(s.x - n.x, s.z - n.z) < 80 && (normaliza(s.name).includes(nombre) || nombre.includes(normaliza(s.name)) && normaliza(s.name).length > 5))) continue;
    let b = null, db = 18;
    for (const c of map.buildings || []) {
      if (!c.p || c.skip || c.p.length < 4) continue;
      const [x0, z0] = c.p[0];
      if (Math.abs(x0 - n.x) > 260 || Math.abs(z0 - n.z) > 260) continue;
      const d = distPoligono(c.p, n.x, n.z);
      if (d < db) { db = d; b = c; }
    }
    if (!b) continue;
    const calles = (map.roads || []).filter((r) => { const p = r.pts || r.p; return p && p.some((q) => Math.abs(q[0] - n.x) < 160 && Math.abs(q[1] - n.z) < 160); });
    const w = pared(b, calles, n);
    if (!w || esHecho(w.a[0], w.a[1], w.b[0], w.b[1])) continue;
    if (signs.some((s) => Math.hypot(s.x - w.x, s.z - w.z) < 5)) continue;
    const s = { x: w.x, z: w.z, nx: w.nx, nz: w.nz, name: n.n, k: n.k, google: 1 };
    signs.push(s);
    puestos.push(s);
  }
  if (map.meta) map.meta.signs = signs.length;
  map.negociosGoogle = puestos.length;
  return puestos;
}
