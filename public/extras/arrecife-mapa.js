/**
 * Retoca el mapa de Arrecife antes de que el juego lo construya: marca como
 * «skip» los edificios de OpenStreetMap que arrecife-extras.js rehace a mano
 * (el juego sigue usando su planta para los choques) y les pone una etiqueta
 * para que los extras encuentren su planta.
 */
(function () {
  // [etiqueta, x, z] del centro de la planta en el mapa
  const REHECHOS = [
    ['repsolTienda', -1204.6, -1332.5],
    ['burgerKing', -1241.5, -1094.9],
    ['decathlon', -1220, -1030.7],
    ['fujiKiwa', -1149.6, -1363.3],
    ['mitsubishi', -1096.7, -1265.4],
    ['talleres', -1035.9, -1198.7],
  ];
  // paseos de Playa Honda que traía el mapa v77 y faltaban
  const PASEOS = [
    { w: 4, major: 0, ped: 0, name: 'Residencial Playa Honda', p: [[-4155.5, 741.6], [-4169.1, 662.6], [-4243.8, 667.9]] },
    { w: 2, major: 0, ped: 1, name: 'Avenida Playa Honda', p: [[-3255.9, 1105.4], [-3260.4, 1111.1], [-3270, 1118.2], [-3319.3, 1156.4], [-3340.1, 1173.4], [-3357.8, 1193.7], [-3368.7, 1203.4], [-3389.7, 1222.6], [-3394.7, 1230], [-3402.8, 1240.5], [-3411.8, 1246.4], [-3431.1, 1252.1], [-3449.8, 1254.3], [-3459.4, 1253.8], [-3465.8, 1253.5], [-3477.1, 1248.2], [-3503.9, 1229], [-3509.9, 1221.2], [-3516.9, 1212.1], [-3540.1, 1195], [-3569.7, 1181.1], [-3578.6, 1179.6], [-3589.8, 1180.1], [-3612.7, 1184.3], [-3637.1, 1189.2], [-3651.5, 1191.7], [-3681.6, 1197], [-3696.9, 1200.2], [-3712.6, 1203.6], [-3728.7, 1207.2], [-3742.2, 1211], [-3745.4, 1211.9], [-3766.2, 1217.8], [-3790.9, 1223.6], [-3800.3, 1224.7], [-3813.9, 1224.2], [-3841.3, 1222.7], [-3845.8, 1222.5], [-3885.2, 1226.2], [-3917.2, 1230.5], [-3922.1, 1233.4], [-3925.9, 1239.2], [-3929.4, 1260.9], [-3934.4, 1291.5], [-3937, 1307.9], [-3939, 1328.5], [-3941.2, 1333.6], [-3947.8, 1337.2], [-3958.2, 1338.1], [-3974.6, 1338.8], [-3989.1, 1337.8], [-4008.9, 1335.8], [-4051.8, 1334], [-4065, 1335.1], [-4083.7, 1338.2], [-4092.2, 1343], [-4114.1, 1353.2], [-4123.3, 1357.6], [-4127.8, 1361.4], [-4129, 1364.9], [-4131.4, 1367.8], [-4213.1, 1384.8], [-4217.3, 1382.3], [-4221.4, 1359.9], [-4224.8, 1353.9], [-4232.6, 1346.4], [-4239.6, 1343.5], [-4248.2, 1342.3], [-4256.6, 1344.1], [-4267, 1348.8], [-4276, 1355.6], [-4279.2, 1359.7], [-4283.7, 1367.6], [-4289.8, 1388.5], [-4295.8, 1397], [-4299.9, 1400.3], [-4349, 1408.5], [-4383.9, 1413.9], [-4411.9, 1423.5], [-4422.1, 1426.6], [-4429.7, 1428.2], [-4453.9, 1423.4], [-4477.2, 1418.8], [-4516.6, 1409.6], [-4523.8, 1408.2], [-4532.1, 1407.8], [-4539.2, 1408.7], [-4548, 1410.9], [-4554.8, 1414.9], [-4568.4, 1426.4], [-4586.2, 1443.6], [-4597.8, 1455.8], [-4602.6, 1460.8], [-4627.8, 1487.2], [-4641.7, 1501.8], [-4678.8, 1536], [-4687.4, 1541.8]] },
    { w: 2, major: 0, ped: 1, name: 'Paseo de Sotavento', p: [[-3528.7, 1053.2], [-3528.7, 1057.6], [-3520.7, 1104.7], [-3518.2, 1107.6]] },
    { w: 2, major: 0, ped: 1, name: 'Avenida Playa Honda', p: [[-3681.6, 1197], [-3682.6, 1190.5], [-3687.4, 1161.2], [-3687.9, 1158.1]] },
    { w: 2, major: 0, ped: 1, name: 'Avenida Playa Honda', p: [[-3651.5, 1191.7], [-3652.4, 1185.3], [-3657.1, 1157.1], [-3657.9, 1152.7]] },
    { w: 2, major: 0, ped: 1, name: 'Avenida Playa Honda', p: [[-3637.1, 1189.2], [-3637.9, 1184.7], [-3642.6, 1154.1], [-3643.5, 1150.1]] },
    { w: 2, major: 0, ped: 1, name: 'Avenida Playa Honda', p: [[-3612.7, 1184.3], [-3613.7, 1178.2], [-3618.4, 1149.7], [-3619.2, 1145.7]] },
    { w: 2, major: 0, ped: 1, name: 'Avenida Playa Honda', p: [[-3806.7, 1123.7], [-3792.5, 1213.3]] },
  ];
  const dentro = (poly, x, z) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i], [xj, zj] = poly[j];
      if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const enMar = (sea, x, z) => !!sea && dentro(sea.outer, x, z) && !sea.holes.some(h => dentro(h, x, z));
  /** corta un paseo en los tramos que quedan en tierra */
  const enTierra = (r, sea) => {
    const out = [];
    let cur = [];
    for (const q of r.p) {
      if (enMar(sea, q[0], q[1])) { if (cur.length > 1) out.push({ ...r, p: cur }); cur = []; } else cur.push(q);
    }
    if (cur.length > 1) out.push({ ...r, p: cur });
    return out;
  };
  const centro = p => {
    const q = p.length > 1 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1] ? p.slice(0, -1) : p;
    return [q.reduce((s, a) => s + a[0], 0) / q.length, q.reduce((s, a) => s + a[1], 0) / q.length];
  };
  // paso inferior de la Circunvalación: la calle que sale de la rotonda de Tenderete hacia
  // Titerroy pasa por debajo. El terreno trae el terraplén de la carretera; se abre una
  // trinchera en pendiente suave a lo largo de la calle y los extras ponen el puente encima.
  const PASO = [[-1009, -1038], [-1000, -1023], [-990, -1007], [-973, -979], [-960, -957]];
  const PASO_ANCHO = 7, PASO_TALUD = 13; // m: fondo plano y transición hasta el terreno
  function trinchera(t) {
    const bin = atob(t.b64), bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const h = new Uint16Array(bytes.buffer);
    const at = (x, z) => { // bilineal, igual que el juego
      const s = Math.min(t.nx - 1, Math.max(0, (x - t.x0) / t.cell - 0.5)), o = Math.min(t.nz - 1, Math.max(0, (z - t.z0) / t.cell - 0.5));
      const i = Math.min(t.nx - 2, Math.floor(s)), a = Math.min(t.nz - 2, Math.floor(o)), r = s - i, l = o - a;
      return (h[a * t.nx + i] * (1 - r) + h[a * t.nx + i + 1] * r) * (1 - l) + (h[(a + 1) * t.nx + i] * (1 - r) + h[(a + 1) * t.nx + i + 1] * r) * l;
    };
    const lens = [0];
    for (let i = 1; i < PASO.length; i++) lens.push(lens[i - 1] + Math.hypot(PASO[i][0] - PASO[i - 1][0], PASO[i][1] - PASO[i - 1][1]));
    const total = lens[lens.length - 1];
    const h0 = at(...PASO[0]), h1 = at(...PASO[PASO.length - 1]);
    let n = 0;
    const i0 = Math.floor((-1040 - t.x0) / t.cell), i1 = Math.ceil((-930 - t.x0) / t.cell);
    const j0 = Math.floor((-1070 - t.z0) / t.cell), j1 = Math.ceil((-930 - t.z0) / t.cell);
    for (let j = Math.max(0, j0); j <= Math.min(t.nz - 1, j1); j++) {
      for (let i = Math.max(0, i0); i <= Math.min(t.nx - 1, i1); i++) {
        const x = t.x0 + (i + 0.5) * t.cell, z = t.z0 + (j + 0.5) * t.cell;
        let best = null;
        for (let k = 1; k < PASO.length; k++) {
          const [ax, az] = PASO[k - 1], [bx, bz] = PASO[k], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
          const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2));
          const d = Math.hypot(x - ax - dx * u, z - az - dz * u);
          if (!best || d < best.d) best = { d, s: lens[k - 1] + Math.sqrt(l2) * u };
        }
        if (best.d > PASO_ANCHO + PASO_TALUD) continue;
        const target = h0 + (h1 - h0) * best.s / total;
        const k = j * t.nx + i;
        if (h[k] <= target) continue;
        const w = best.d <= PASO_ANCHO ? 1 : 1 - (best.d - PASO_ANCHO) / PASO_TALUD;
        const ws = w * w * (3 - 2 * w);
        h[k] = Math.round(h[k] + (target - h[k]) * ws);
        n++;
      }
    }
    let s = '';
    const out = new Uint8Array(h.buffer);
    for (let i = 0; i < out.length; i += 0x8000) s += String.fromCharCode.apply(null, out.subarray(i, i + 0x8000));
    t.b64 = btoa(s);
    t.pasoTenderete = n;
    return t;
  }

  // El norte de Arrecife: el mapa se corta a la altura de la Calle Luján Pérez y de ahí al
  // camino de tierra el juego ponía una cuadrícula a ojo. Entran las calles y casas reales de
  // OpenStreetMap (arrecife-norte-datos.js) y la cuadrícula se queda fuera.
  const cerca = (a, b, d = 1) => Math.abs(a[0] - b[0]) < d && Math.abs(a[1] - b[1]) < d;
  const asfalto = r => !r.ped && !r.dirt && r.p.length > 1;
  /** si la punta q cae en medio de otra calle asfaltada, esa calle se parte ahí (el tráfico enlaza por las puntas) */
  function partir(roads, q, self) {
    for (let n = 0; n < roads.length; n++) {
      const r = roads[n];
      if (r === self || !asfalto(r)) continue;
      for (let i = 0; i < r.p.length - 1; i++) {
        const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
        const u = l2 ? Math.max(0, Math.min(1, ((q[0] - ax) * dx + (q[1] - az) * dz) / l2)) : 0;
        if (Math.hypot(q[0] - ax - dx * u, q[1] - az - dz * u) > 1) continue;
        let k;
        if (cerca(q, r.p[i], 0.8)) k = i;
        else if (cerca(q, r.p[i + 1], 0.8)) k = i + 1;
        else { r.p.splice(i + 1, 0, [q[0], q[1]]); k = i + 1; }
        q[0] = r.p[k][0]; q[1] = r.p[k][1];
        if (k > 0 && k < r.p.length - 1) roads.splice(n, 1, { ...r, p: r.p.slice(0, k + 1) }, { ...r, p: r.p.slice(k) });
        return;
      }
    }
  }
  function meterNorte(map) {
    const N = window.ARRECIFE_NORTE;
    if (!N || map.roads.some(r => r.norte)) return;
    const nuevas = N.calles.map(c => ({ ...c, p: c.p.map(q => [...q]), norte: 1 }));
    map.roads.push(...nuevas);
    for (const c of nuevas) if (asfalto(c)) for (const q of [c.p[0], c.p[c.p.length - 1]]) partir(map.roads, q, c);
    map.buildings.push(...N.casas.map(c => ({ ...c, norte: 1 })));
    // suelo fino donde van las calles nuevas, para que la arena no tape el asfalto en las cuestas
    for (const lado of [c => c.p[0][0] < -950, c => c.p[0][0] >= -950]) {
      const ps = nuevas.filter(c => asfalto(c) && lado(c)).flatMap(c => c.p);
      if (!ps.length) continue;
      const xs = ps.map(q => q[0]), zs = ps.map(q => q[1]);
      map.groundFine = [...(map.groundFine || []), { x0: Math.min(...xs) - 20, x1: Math.max(...xs) + 20, z0: Math.min(...zs) - 20, z1: Math.max(...zs) + 20 }];
    }
    // lo que el juego añade después (la cuadrícula inventada y el atajo a Campoamor) no entra
    const inventada = r => r.p?.length > 1 && N.inventadas.some(([a, b]) => cerca(r.p[0], a) && cerca(r.p[r.p.length - 1], b));
    const blindar = arr => Object.defineProperty(arr, 'push', {
      value(...items) { return Array.prototype.push.apply(this, items.filter(r => !inventada(r))); },
      configurable: true, writable: true,
    });
    let roads = blindar(map.roads);
    Object.defineProperty(map, 'roads', {
      get: () => roads, set: v => { roads = blindar(v.filter(r => !inventada(r))); }, enumerable: true, configurable: true,
    });
    map.arrecifeNorte = { calles: nuevas.length, casas: N.casas.length };
  }

  const fetch0 = window.fetch;
  window.fetch = async function (url, ...rest) {
    const res = await fetch0.call(this, url, ...rest);
    if (/map\/terreno\.json(\?|$)/.test(String(url))) {
      try {
        const t = trinchera(await res.clone().json());
        return new Response(JSON.stringify(t), { status: res.status, headers: { 'Content-Type': 'application/json' } });
      } catch (e) {
        console.warn('Paso inferior de Tenderete:', e);
        return res;
      }
    }
    if (!/map\/arrecife\.json(\?|$)/.test(String(url))) return res;
    try {
      const map = await res.clone().json();
      for (const b of map.buildings || []) {
        const [cx, cz] = centro(b.p || []);
        const r = REHECHOS.find(([, x, z]) => Math.hypot(cx - x, cz - z) < 2);
        if (r) { b.skip = true; b.arrecifeExtra = r[0]; }
      }
      // la Repsol de Tenderete la pintan los extras: fuera la gasolinera genérica
      map.fuel = (map.fuel || []).filter(f => Math.hypot(f.x + 1193, f.z + 1338.9) > 5);
      // Cabildo: la parte baja a 8,6 m; la alta, la portada y el reloj los ponen los extras
      for (const b of map.buildings || []) {
        if (dentro(b.p, -1250, 480) && b.h >= 10) { b.h = 8.6; b.s = 0; b.c = [214, 210, 202]; b.f = [244, 242, 236]; b.arrecifeExtra = 'cabildo'; }
      }
      if (!(map.roads || []).some(r => r.name === 'Paseo de Sotavento')) {
        for (const r of PASEOS) map.roads.push(...enTierra(r, map.sea));
      }
      try { meterNorte(map); } catch (e) { console.warn('Norte de Arrecife:', e); }
      // el juego lee este mismo objeto: así el filtro de calles inventadas sigue puesto
      const out = new Response(JSON.stringify(map), { status: res.status, headers: { 'Content-Type': 'application/json' } });
      out.json = async () => map;
      return out;
    } catch (e) {
      console.warn('Retoque del mapa de Arrecife:', e);
      return res;
    }
  };
})();
