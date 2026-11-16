import * as THREE from 'three';

/**
 * Señales de tráfico y prioridad en los cruces (para dibujarlas y para que el tráfico las respete).
 * Regla sencilla, como en una ciudad española: los cruces de cuatro o más brazos con una avenida
 * llevan semáforos que funcionan (verde, ámbar y rojo, la avenida y la calle por turnos); en los
 * cruces en T con una avenida, quien llega por la calle tiene STOP (si la calle es larga) o CEDA EL
 * PASO; entre calles normales no hay señal (prioridad a la derecha: se entra despacio y se cede si
 * hay alguien en el cruce). Además, discos de velocidad máxima a la salida de algunos cruces: 30 en
 * las calles y 50 en las avenidas.
 */

const key = (p) => Math.round(p[0]) + ',' + Math.round(p[1]);
const MAX_SIGNS = 2800;
const MAX_LIGHTS = 260;

// ciclo de los semáforos (s): avenida en verde, ámbar, todo rojo, calle en verde, ámbar, todo rojo
const CYCLE = 26;
export const lightClock = { t: 0 };

/** 'green' | 'yellow' | 'red' para quien llega al cruce n por una avenida (major) o por una calle */
export function lightState(n, major) {
  const t = (lightClock.t + (n.offset || 0)) % CYCLE;
  if (major) return t < 11 ? 'green' : t < 13.5 ? 'yellow' : 'red';
  return t < 14.5 ? 'red' : t < 23.5 ? 'green' : t < 25 ? 'yellow' : 'red';
}

/** nudos de la red de calles con coches: cuántos extremos de calle llegan y si alguno es avenida */
function nodes(roads) {
  const out = new Map();
  for (const r of roads) {
    if (r.ped || r.dirt || r.p.length < 2) continue;
    for (const e of [r.p[0], r.p[r.p.length - 1]]) {
      const k = key(e);
      const n = out.get(k) || { deg: 0, major: false, x: e[0], z: e[1] };
      n.deg++;
      if (r.major) n.major = true;
      out.set(k, n);
    }
  }
  return out;
}

/**
 * Para cada calle con coches, la señal de sus dos extremos: r._sign = [al llegar al principio, al
 * llegar al final] con 'stop', 'ceda', 'right' (cruce entre calles: prioridad a la derecha) o null.
 * Se calcula una vez y queda guardado en las calles.
 */
export function roadSigns(roads) {
  if (roads._signsDone) return roads;
  const ns = nodes(roads);
  // los cruces grandes con avenida llevan semáforo (cada uno con su desfase en el ciclo)
  for (const [k, n] of ns) {
    if (n.major && n.deg >= 4) {
      n.lit = true;
      let h = 0;
      for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) % 9973;
      n.offset = h % CYCLE;
    }
  }
  // semáforos de OpenStreetMap (sentidos.json): el cruce más cercano a cada uno, a menos de 25 m, lo lleva seguro
  const sen = roads._sen;
  for (const [x, z] of sen?.luz || []) {
    let best = null, bd = 25;
    for (const n of ns.values()) {
      if (n.deg < 3) continue;
      const d = Math.hypot(n.x - x, n.z - z);
      if (d < bd) { bd = d; best = n; }
    }
    if (best && !best.lit) {
      best.lit = true; best.real = true;
      let h = 0;
      for (const ch of key([best.x, best.z])) h = (h * 31 + ch.charCodeAt(0)) % 9973;
      best.offset = h % CYCLE;
    }
  }
  // STOP y ceda el paso de OpenStreetMap: se los queda el extremo de la calle que llega al cruce por donde están
  // (a menos de 4 m de la calle y en sus últimos 25 m)
  for (const [list, kind] of [[sen?.stop || [], 'stop'], [sen?.ceda || [], 'ceda']]) {
    for (const [x, z] of list) {
      let best = null, bd = 4;
      for (const r of roads) {
        if (r.ped || r.dirt || r.glorieta || r.p.length < 2) continue;
        for (const end of [0, 1]) {
          const e = end ? r.p[r.p.length - 1] : r.p[0];
          if (Math.abs(e[0] - x) > 25 || Math.abs(e[1] - z) > 25) continue;
          const n = ns.get(key(e));
          if (!n || n.deg < 3) continue;
          // distancia del punto a la calle, solo en sus últimos 25 m
          let acc = 0;
          const pts = end ? [...r.p].reverse() : r.p;
          for (let i = 0; i + 1 < pts.length && acc < 25; i++) {
            const [ax, az] = pts[i], [bx, bz] = pts[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
            if (L2 < 0.01) continue;
            const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
            const d = Math.hypot(ax + dx * t - x, az + dz * t - z);
            if (d < bd && acc + Math.sqrt(L2) * t < 25) { bd = d; best = [r, end]; }
            acc += Math.sqrt(L2);
          }
        }
      }
      if (best) { (best[0]._osmSign ||= [null, null])[best[1]] = kind; roads._osmSigns = (roads._osmSigns || 0) + 1; }
    }
  }
  // en las rotondas manda el que va dentro: el arco no lleva señal y el que entra cede el paso
  for (const r of roads) {
    if (!r.glorieta) continue;
    for (const e of [r.p[0], r.p[r.p.length - 1]]) {
      const n = ns.get(key(e));
      if (n) n.glorieta = true;
    }
  }
  for (const r of roads) {
    if (r.ped || r.dirt || r.p.length < 2) continue;
    let len = 0;
    for (let i = 1; i < r.p.length; i++) len += Math.hypot(r.p[i][0] - r.p[i - 1][0], r.p[i][1] - r.p[i - 1][1]);
    r._sign = [0, 1].map((end) => {
      const n = ns.get(key(end ? r.p[r.p.length - 1] : r.p[0]));
      if (!n || n.deg < 3) return null;
      if (r.glorieta) return null;
      // sentido único (sentidos.js): al extremo por el que se entra no llega nadie, así que no lleva señal
      if (end ? r.ow < 0 : r.ow > 0) return null;
      if (n.glorieta) return 'ceda';
      if (n.lit) return 'light';
      // la señal que está de verdad en OpenStreetMap manda sobre la regla
      if (r._osmSign?.[end]) return r._osmSign[end];
      if (r.major) return null;
      if (n.major) return len > 40 ? 'stop' : 'ceda';
      return 'right';
    });
  }
  roads._signsDone = true;
  roads._nodes = ns;
  return roads;
}

/** las texturas de las placas: STOP, ceda el paso y los dos discos de velocidad */
function plateTex() {
  const c = document.createElement('canvas');
  c.width = 896; c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 896, 128);
  // STOP: octógono rojo con borde blanco
  const oct = (cx, cy, r) => {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = Math.PI / 8 + i * Math.PI / 4;
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    g.closePath();
  };
  g.fillStyle = '#ffffff'; oct(64, 64, 62); g.fill();
  g.fillStyle = '#c8102e'; oct(64, 64, 56); g.fill();
  g.fillStyle = '#ffffff';
  g.font = 'bold 34px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('STOP', 64, 66);
  // CEDA EL PASO: triángulo con el vértice abajo, borde rojo
  g.fillStyle = '#c8102e';
  g.beginPath(); g.moveTo(132, 8); g.lineTo(252, 8); g.lineTo(192, 120); g.closePath(); g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.moveTo(150, 19); g.lineTo(234, 19); g.lineTo(192, 98); g.closePath(); g.fill();
  // velocidad máxima 30 y 50 (y 20 y 40 al final del atlas, celdas 5 y 6)
  for (const [cx, txt] of [[320, '30'], [448, '50'], [704, '20'], [832, '40']]) {
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, 64, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c8102e'; g.beginPath(); g.arc(cx, 64, 58, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, 64, 45, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#111111'; g.font = 'bold 50px Arial, sans-serif';
    g.fillText(txt, cx, 68);
  }
  // entrada prohibida (R-101): disco rojo con la barra blanca
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(576, 64, 60, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c8102e'; g.beginPath(); g.arc(576, 64, 57, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; g.fillRect(576 - 42, 64 - 11, 84, 22);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * Pone las señales en la acera de la derecha de cada llegada a un cruce (STOP / CEDA) y algún disco
 * de velocidad a la salida. Mallas instanciadas: cientos de señales en dos llamadas de dibujo.
 */
export function buildTrafficSigns(scene, roads) {
  roadSigns(roads);
  const spots = [];   // { x, z, rot, kind: 0 stop, 1 ceda, 2 v30, 3 v50 }
  let n = 0;
  for (const r of roads) {
    if ((!r._sign && !r.ow) || r.ped || r.dirt || r.p.length < 2 || spots.length > MAX_SIGNS) continue;
    n++;
    for (const end of [0, 1]) {
      const e = end ? r.p[r.p.length - 1] : r.p[0];
      const q = end ? r.p[r.p.length - 2] : r.p[1];
      const L = Math.hypot(e[0] - q[0], e[1] - q[1]);
      if (L < 8) continue;
      const ux = (e[0] - q[0]) / L, uz = (e[1] - q[1]) / L;   // sentido de llegada al cruce
      const rx = -uz, rz = ux;                                  // derecha de quien llega
      const side = r.w / 2 + 0.7;
      const sign = r._sign?.[end];
      if (sign === 'stop' || sign === 'ceda') {
        // a 3,5 m del cruce, en la acera de la derecha, mirando a quien llega
        spots.push({ x: e[0] - ux * 3.5 + rx * side, z: e[1] - uz * 3.5 + rz * side, rot: Math.atan2(-ux, -uz), kind: sign === 'stop' ? 0 : 1 });
      }
      // entrada prohibida: en el extremo por el que salen los coches de una calle de sentido único, de cara
      // a quien quisiera meterse en contra
      const exits = end ? r.ow > 0 : r.ow < 0;
      const node = roads._nodes.get(key(e));
      if (exits && !r.glorieta && node && node.deg >= 3) {
        spots.push({ x: e[0] - ux * 4 - rx * side, z: e[1] - uz * 4 - rz * side, rot: Math.atan2(ux, uz), kind: 4 });
        continue;
      }
      // disco de velocidad a la salida del cruce (en el otro sentido), en una de cada cuatro calles
      if (L > 30 && (n + end) % 4 === 0 && !(end ? r.ow > 0 : r.ow < 0)) {
        // el disco dice la velocidad máxima de la calle (OpenStreetMap o la legal en ciudad, sentidos.js)
        const v = r.vmax || (r.major ? 50 : 30), kind = { 20: 5, 30: 2, 40: 6, 50: 3 }[v];
        if (kind !== undefined) spots.push({ x: e[0] - ux * 8 - rx * side, z: e[1] - uz * 8 - rz * side, rot: Math.atan2(ux, uz), kind });
      }
    }
  }
  if (!spots.length) return null;
  const group = new THREE.Group();
  group.name = 'senales';
  const poleGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.3, 6);
  poleGeo.translate(0, 0.24 + 1.15, 0);
  const poles = new THREE.InstancedMesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x8c9095, metalness: 0.5, roughness: 0.45 }), spots.length);
  const plateGeo = new THREE.PlaneGeometry(0.62, 0.62);
  // cada placa coge su cuarto de la textura con un atributo por instancia
  const plates = new THREE.InstancedMesh(plateGeo, new THREE.MeshStandardMaterial({ map: plateTex(), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5 }), spots.length);
  const kindAttr = new Float32Array(spots.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
  spots.forEach((p, i) => {
    q.setFromAxisAngle(up, p.rot);
    m.compose(new THREE.Vector3(p.x, 0, p.z), q, s);
    poles.setMatrixAt(i, m);
    const y = p.kind === 1 ? 2.3 : 2.35;
    m.compose(new THREE.Vector3(p.x, y, p.z), q, s);
    plates.setMatrixAt(i, m);
    kindAttr[i] = p.kind;
  });
  plateGeo.setAttribute('kind', new THREE.InstancedBufferAttribute(kindAttr, 1));
  plates.material.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float kind;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.x = (vMapUv.x + kind) / 7.0;\n#endif');
  };
  plates.material.customProgramCacheKey = () => 'senales-plates';
  poles.castShadow = true;
  plates.castShadow = true;
  group.add(poles, plates);
  const lights = buildLights(group, roads);
  scene.add(group);
  return {
    group, count: spots.length, lights: lights ? lights.count : 0,
    update(dt) { lightClock.t += dt; lights?.refresh(); },
  };
}

/** un semáforo en la acera de la derecha de cada llegada a un cruce con semáforos */
function buildLights(group, roads) {
  const spots = [];
  for (const r of roads) {
    if (!r._sign || spots.length >= MAX_LIGHTS) continue;
    for (const end of [0, 1]) {
      if (r._sign[end] !== 'light') continue;
      const e = end ? r.p[r.p.length - 1] : r.p[0];
      const q = end ? r.p[r.p.length - 2] : r.p[1];
      const L = Math.hypot(e[0] - q[0], e[1] - q[1]);
      if (L < 8) continue;
      const ux = (e[0] - q[0]) / L, uz = (e[1] - q[1]) / L, rx = -uz, rz = ux, side = r.w / 2 + 0.7;
      spots.push({ x: e[0] - ux * 4.2 + rx * side, z: e[1] - uz * 4.2 + rz * side, rot: Math.atan2(-ux, -uz), node: roads._nodes.get(key(e)), major: !!r.major });
    }
  }
  if (!spots.length) return null;
  const N = spots.length;
  const pole = new THREE.CylinderGeometry(0.06, 0.07, 3.1, 8);
  pole.translate(0, 0.24 + 1.55, 0);
  const box = new THREE.BoxGeometry(0.28, 0.82, 0.24);
  box.translate(0, 3.25, 0.05);
  const poles = new THREE.InstancedMesh(pole, new THREE.MeshStandardMaterial({ color: 0x3a3f45, metalness: 0.6, roughness: 0.45 }), N);
  const boxes = new THREE.InstancedMesh(box, new THREE.MeshStandardMaterial({ color: 0x1a1d20, roughness: 0.5 }), N);
  const lamp = (y) => { const g = new THREE.CircleGeometry(0.085, 14); g.translate(0, y, 0.175); return g; };
  const lamps = [3.5, 3.25, 3.0].map((y) => new THREE.InstancedMesh(lamp(y), new THREE.MeshBasicMaterial({ color: 0xffffff }), N));
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), one = new THREE.Vector3(1, 1, 1);
  spots.forEach((p, i) => {
    q.setFromAxisAngle(up, p.rot);
    m.compose(new THREE.Vector3(p.x, 0, p.z), q, one);
    for (const im of [poles, boxes, ...lamps]) im.setMatrixAt(i, m);
  });
  poles.castShadow = true;
  boxes.castShadow = true;
  group.add(poles, boxes, ...lamps);
  // rojo, ámbar y verde: encendido o apagado según el ciclo de su cruce
  const ON = [new THREE.Color(0xff2a1a), new THREE.Color(0xffb300), new THREE.Color(0x35e65a)];
  const OFF = [new THREE.Color(0x3a1310), new THREE.Color(0x3a2a0c), new THREE.Color(0x0f2a14)];
  let last = -1;
  const refresh = () => {
    const step = Math.floor(lightClock.t * 4);
    if (step === last) return;
    last = step;
    spots.forEach((p, i) => {
      const st = lightState(p.node, p.major);
      const k = st === 'red' ? 0 : st === 'yellow' ? 1 : 2;
      for (let j = 0; j < 3; j++) lamps[j].setColorAt(i, j === k ? ON[j] : OFF[j]);
    });
    for (const l of lamps) l.instanceColor.needsUpdate = true;
  };
  refresh();
  return { count: N, refresh };
}
