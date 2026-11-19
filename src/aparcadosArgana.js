/**
 * (Version 155) Argana Alta: las calles estrechas de sentido único, con coches aparcados en línea.
 *
 * En los vídeos de José Manuel (recursos\argana alta: IMG_5153, fotogramas 271 a 381, y los cinco trozos de «Argana
 * hasta Tanatorio») las calles del barrio son de un solo carril con coches aparcados en línea pegados al bordillo, a
 * los dos lados o a uno, y aceras estrechas. En el juego eran un carril de 3,6 m entre dos aceras de 2,5 m, sin un
 * solo coche aparcado (parked.js solo aparca en calles de 7,6 m o más).
 *
 * `tuneAparcadosArgana(map)` va justo DESPUÉS de ajusteCalles.js (que mide la acera de cada lado hasta la fachada):
 *  - la calzada crece a costa de la acera, que se queda en `ACERA` metros (`r.wAntes` guarda la anchura de antes);
 *  - si quedan `DOS_LADOS` metros o más, se aparca a los dos lados; con `UN_LADO` o más, solo a la izquierda de la
 *    marcha (como en el vídeo); con menos, la calle se queda como estaba;
 *  - los coches no se ponen en los cruces ni pegados a las esquinas, y pasan a `map.lotSpots` (los pone parked.js,
 *    que no aparca por su cuenta en estas calles: `r.noParking`).
 * El carril que queda entre las dos filas es estrecho (unos 3 m), como en la calle de verdad.
 */
const ZONA = { x0: -2200, x1: -1240, z0: -2640, z1: -1380 };
const ACERA = 1.25, DOS_LADOS = 6.9, UN_LADO = 5.5;
const PASO = 5.6, LLENO = 0.64, ESQUINA = 9;

const hash = (n) => { const v = Math.sin(n * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v); };
const dentro = (r) => r.p.every(([x, z]) => x > ZONA.x0 && x < ZONA.x1 && z > ZONA.z0 && z < ZONA.z1);
const esCalle = (r) => r.ow && !r.major && !r.ped && !r.dirt && !r.glorieta && r.p.length >= 2 && r.w <= 6.6 && dentro(r);

function distSeg(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L2));
  return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t);
}

export function tuneAparcadosArgana(map) {
  const calles = map.roads.filter(esCalle);
  const st = { calles: 0, dosLados: 0, unLado: 0, coches: 0 };
  // las demás calzadas de la zona, para no aparcar en los cruces
  const otras = map.roads.filter(r => !r.ped && r.p.length >= 2 && r.p.some(([x, z]) => x > ZONA.x0 - 30 && x < ZONA.x1 + 30 && z > ZONA.z0 - 30 && z < ZONA.z1 + 30));
  const spots = [];
  calles.forEach((r, ri) => {
    // lo que crece la calzada: hasta dejar la acera en ACERA por el lado más justo (un lado sin fachada cuenta 2,2)
    const crece = Math.min(r.aceraL ?? 2.2, r.aceraR ?? 2.2) - ACERA;
    const ancho = +(r.w + 2 * Math.max(0, crece)).toFixed(2);
    if (ancho < UN_LADO) return;
    r.wAntes = r.w;
    r.w = ancho;
    if (r.aceraL != null) r.aceraL -= crece;
    if (r.aceraR != null) r.aceraR -= crece;
    r.noParking = true;
    st.calles++;
    const dos = ancho >= DOS_LADOS;
    dos ? st.dosLados++ : st.unLado++;
    const off = ancho / 2 - 0.95;
    let total = 0;
    for (let i = 1; i < r.p.length; i++) total += Math.hypot(r.p[i][0] - r.p[i - 1][0], r.p[i][1] - r.p[i - 1][1]);
    let acc = 0, next = ESQUINA, id = ri * 131;
    for (let i = 1; i < r.p.length; i++) {
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i], len = Math.hypot(bx - ax, bz - az);
      if (len < 0.01) continue;
      const ux = (bx - ax) / len, uz = (bz - az) / len;
      for (; next < acc + len && next < total - ESQUINA; next += PASO) {
        const t = next - acc, cx = ax + ux * t, cz = az + uz * t;
        // sin cruce al lado: ninguna otra calzada a menos de su media anchura + la de esta + 2,5 m
        if (otras.some(o => o !== r && o.p.some((q, k) => k && distSeg(cx, cz, o.p[k - 1], q) < o.w / 2 + ancho / 2 + 2.5))) continue;
        // la izquierda de la marcha es (uz, -ux); la derecha, (-uz, ux). Todos miran hacia donde va la calle
        for (const lado of dos ? [1, -1] : [1]) {
          if (hash(++id) > LLENO) continue;
          spots.push([+(cx + uz * off * lado).toFixed(2), +(cz - ux * off * lado).toFixed(2), Math.atan2(ux, uz)]);
        }
      }
      acc += len;
    }
  });
  st.coches = spots.length;
  if (Array.isArray(map.lotSpots)) map.lotSpots.push(...spots);
  map.aparcadosArgana = st;
  return st;
}
