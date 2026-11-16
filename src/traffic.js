import * as THREE from 'three';
import { randomTrafficCar } from './carModels.js';
import { roadSigns, lightState } from './senales.js';
import { addIndicators, blinkPhase } from './carKit.js';
import { makeGuagua, GUAGUA_LEN } from './guaguas.js';

const N_CARS = 26;
const STOP_LINE = 3.6;      // dónde se para el coche antes del cruce (m)
const BOX = 3.4;            // radio del cruce: si hay un coche dentro, está ocupado
const ACCEL = 2.8, BRAKE = 7;
const TURN_LAG = 0.28;      // segundos de retraso del coche respecto a su carril (suaviza los giros)
const CAR_LEN = 4.5;        // largo de un coche normal: las guaguas (guaguas.js) son más largas

function endKey(p) { return Math.round(p[0]) + ',' + Math.round(p[1]); }

/** las guaguas van por las avenidas, las calles anchas (con su anchura de antes de ajustarla a las fachadas) y
 *  las calles que tienen parada (paradasGuagua.js) */
function busRoad(r) { return !!r.major || (r.wOsm || r.w) >= 8 || !!r._paradas; }

const PARADA_S = 8;   // segundos que la guagua se queda en cada parada

/** metros desde el principio de la calle hasta donde va el coche */
function along(car) {
  const r = car.road, p = r.p;
  if (!r._cum) {
    r._cum = [0];
    for (let i = 1; i < p.length; i++) r._cum.push(r._cum[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
  }
  const c = r._cum, n = p.length - 1;
  if (!car.reverse) return c[car.seg] + (c[car.seg + 1] - c[car.seg]) * car.t;
  return c[n - car.seg] - (c[n - car.seg] - c[n - car.seg - 1]) * car.t;
}

/** velocidad de crucero en una calle: la máxima de la calle (sentidos.js: OpenStreetMap o la legal), algo por
 *  debajo y con variación; las guaguas, más despacio */
function cruise(car, road) {
  const vmax = (road.vmax || (road.major ? 50 : 30)) / 3.6;
  return vmax * (car.bus ? 0.65 : 0.85) * (0.85 + Math.random() * 0.25);
}

/**
 * Tráfico de la ciudad. Los coches van por la derecha, aceleran y frenan poco a poco, guardan
 * distancia con el de delante, frenan si el jugador (a pie o en coche) se les pone delante y
 * respetan las señales de los cruces (senales.js): en el STOP paran del todo y salen cuando el
 * cruce está libre; en el CEDA EL PASO y en los cruces entre calles (prioridad a la derecha)
 * entran despacio y esperan si hay alguien. Las avenidas tienen prioridad.
 * Antes de cada cruce eligen ya por dónde van a seguir y, si van a girar, ponen el intermitente.
 * Entre ellos van las guaguas azules de Arrecife (guaguas.js): por las calles anchas y más despacio.
 * Van en su propia lista (this.buses): así no se roban (jackNearest) ni salen despedidas en los
 * choques de arrecifeExtras.js, que solo miran this.cars; los coches sí las respetan y el jugador
 * choca con ellas en todo su largo.
 */
export class Traffic {
  constructor(scene, roads, { count = N_CARS } = {}) {
    roadSigns(roads);
    this.nodes = roads._nodes;
    // (por los caminos de tierra del campo no pasan coches)
    this.roads = roads.filter(r => !r.ped && !r.dirt && r.p.length >= 2);
    // graph: endpoint key -> [{road, fromStart}]
    this.graph = new Map();
    for (const r of this.roads) {
      if (r.p.length < 2) continue;
      const a = endKey(r.p[0]), b = endKey(r.p[r.p.length - 1]);
      if (!this.graph.has(a)) this.graph.set(a, []);
      if (!this.graph.has(b)) this.graph.set(b, []);
      if (r.glorieta) {
        // los arcos de rotonda son de un solo sentido (antihorario, extraData.js)
        this.graph.get(r.gloFwd ? a : b).push({ road: r, reverse: !r.gloFwd });
      } else if (r.ow) {
        // calle de sentido único (sentidos.js, datos de OpenStreetMap): solo se entra por su principio
        this.graph.get(r.ow > 0 ? a : b).push({ road: r, reverse: r.ow < 0 });
      } else {
        this.graph.get(a).push({ road: r, reverse: false });
        this.graph.get(b).push({ road: r, reverse: true });
      }
    }

    this.cars = [];
    for (let i = 0; i < count; i++) {
      const { group, type, color, brand } = randomTrafficCar(['moto', 'quad', 'moto'][i] || null);
      group.visible = false;
      addIndicators(group);
      scene.add(group);
      this.cars.push({
        mesh: group, type, color, brand, road: null, seg: 0, t: 0, reverse: false,
        speed: 8, v: 0, x: 0, z: 0, heading: 0, stopped: 0, wait: 0, cleared: false,
        next: null, turn: null, blinkT: 0,
      });
    }
    // las guaguas: tres en el ordenador y dos en el móvil (que lleva menos tráfico)
    this.buses = [];
    const nBus = count >= 30 ? 3 : 2;
    for (let i = 0; i < nBus; i++) {
      const { group } = makeGuagua();
      group.visible = false;
      scene.add(group);
      this.buses.push({
        mesh: group, type: 'guagua', color: null, brand: false, bus: true, len: GUAGUA_LEN,
        road: null, seg: 0, t: 0, reverse: false,
        speed: 6, v: 0, x: 0, z: 0, heading: 0, stopped: 0, wait: 0, cleared: false,
        next: null, turn: null, blinkT: 0,
      });
    }
    this.lists = [this.cars, this.buses];
  }

  // roba el coche más cercano: lo quita del tráfico y devuelve su modelo
  jackNearest(x, z, maxD = 4) {
    let best = null, bd = maxD;
    for (const c of this.cars) {
      if (!c.road) continue;
      const d = Math.hypot(c.x - x, c.z - z);
      if (d < bd) { bd = d; best = c; }
    }
    if (!best) return null;
    const info = { type: best.type, color: best.color, brand: best.brand, x: best.x, z: best.z, heading: best.heading };
    best.road = null;
    best.mesh.visible = false;
    return info;
  }

  /** el conductor frena en seco y se queda parado unos segundos (disparos, choques) */
  panic(car, seconds = 8) {
    car.stopped = Math.max(car.stopped, seconds);
  }

  spawnNear(car, px, pz) {
    for (let tries = 0; tries < 30; tries++) {
      const r = this.roads[Math.floor(Math.random() * this.roads.length)];
      if (r.glorieta) continue;   // dentro de una rotonda no aparece nadie
      if (car.bus && !busRoad(r)) continue;
      const [x, z] = r.p[0];
      const d = Math.hypot(x - px, z - pz);
      if (d > 120 && d < 450) {
        car.road = r;
        car.reverse = r.ow ? r.ow < 0 : Math.random() < 0.5;
        car.seg = 0;
        car.t = Math.random();
        car.speed = cruise(car, r);
        car.v = car.speed;
        car.stopped = 0;
        car.wait = 0;
        car.cleared = false;
        car.next = null;
        car.turn = null;
        car.blinkT = 0;
        car.fresh = true;
        car.mesh.visible = true;
        return;
      }
    }
    car.mesh.visible = false;
    car.road = null;
  }

  pathPoint(car, segIdx) {
    const pts = car.road.p;
    return car.reverse ? pts[pts.length - 1 - segIdx] : pts[segIdx];
  }

  /** metros que le quedan hasta el final de su calle (el cruce) */
  distToEnd(car) {
    const n = car.road.p.length - 1;
    let d = 0;
    for (let s = car.seg; s < n; s++) {
      const a = this.pathPoint(car, s), b = this.pathPoint(car, s + 1);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      d += s === car.seg ? (1 - car.t) * len : len;
    }
    return d;
  }

  /**
   * al acercarse al cruce elige ya la calle por la que va a seguir y mira si eso es girar:
   * 'l' a la izquierda, 'r' a la derecha, null recto (o sin salida)
   */
  chooseNext(car) {
    const pts = car.road.p, n = pts.length - 1;
    const endPt = car.reverse ? pts[0] : pts[n];
    const options = this.graph.get(endKey(endPt)) || [];
    let usable = options.filter(o => o.road !== car.road);
    // la guagua sigue por las calles anchas mientras pueda
    if (car.bus) {
      const wide = usable.filter(o => busRoad(o.road));
      if (wide.length) usable = wide;
    }
    // sin salida: media vuelta solo si la calle es de doble sentido (si no, el coche se retira)
    const next = usable.length ? usable[Math.floor(Math.random() * usable.length)] : options.find(o => o.road === car.road);
    car.next = next || null;
    car.turn = null;
    if (!next || next.road === car.road) return;
    const a = this.pathPoint(car, n - 1), b = this.pathPoint(car, n);
    const q = next.road.p, m = q.length - 1;
    const [c, d] = next.reverse ? [q[m], q[m - 1]] : [q[0], q[1]];
    const d1x = b[0] - a[0], d1z = b[1] - a[1], d2x = d[0] - c[0], d2z = d[1] - c[1];
    // hacia dónde gira: positivo = izquierda (la izquierda del coche es (dz, −dx))
    const left = (d2x * d1z - d2z * d1x) / ((Math.hypot(d1x, d1z) * Math.hypot(d2x, d2z)) || 1);
    car.turn = left > 0.35 ? 'l' : left < -0.35 ? 'r' : null;
  }

  /** ¿está libre el cruce? nadie dentro y, si llego por una calle que cede, nadie llegando por la avenida */
  junctionClear(node, car, yieldToMajor) {
    for (const list of this.lists) for (const o of list) {
      if (o === car || !o.road) continue;
      const d = Math.hypot(o.x - node.x, o.z - node.z);
      if (d < BOX) return false;
      if (yieldToMajor && o.road.major && d < 18 && o.v > 2) {
        // ¿viene hacia el cruce?
        const hx = Math.sin(o.heading), hz = Math.cos(o.heading);
        if ((node.x - o.x) * hx + (node.z - o.z) * hz > 0) return false;
      }
    }
    return true;
  }

  /** velocidad a la que quiere ir ahora: señal del cruce, coche de delante y el jugador */
  targetSpeed(car, player) {
    let target = car.stopped > 0 ? 0 : car.speed;
    const end = car.reverse ? 0 : 1;
    const sign = car.road._sign ? car.road._sign[end] : null;
    if (sign && !car.cleared) {
      const dEnd = this.distToEnd(car);
      const node = this.nodes.get(endKey(end ? car.road.p[car.road.p.length - 1] : car.road.p[0]));
      if (dEnd < 30) target = Math.min(target, 3 + dEnd * 0.3);   // se acerca al cruce despacio
      if (node && sign === 'light') {
        // semáforo: en rojo (o en ámbar si aún da tiempo a frenar) se para en la línea; en verde pasa
        const st = lightState(node, !!car.road.major);
        if (st === 'red' || (st === 'yellow' && dEnd > 7)) {
          target = dEnd <= STOP_LINE + 0.4 ? 0 : Math.min(target, Math.max(0, (dEnd - STOP_LINE) * 0.85));
        } else {
          target = Math.max(target, car.speed * 0.7);
          if (dEnd < 8 && !this.junctionClear(node, car, false)) target = Math.min(target, Math.max(0, (dEnd - STOP_LINE) * 0.85));
        }
      } else if (node && sign === 'stop') {
        if (dEnd <= STOP_LINE + 0.4) {
          target = 0;
          if (car.v < 0.4) car.wait += this.dt;
          if (car.wait > 1.3 && (this.junctionClear(node, car, true) || car.wait > 7)) car.cleared = true;
        } else target = Math.min(target, Math.max(0.6, (dEnd - STOP_LINE) * 0.85));
      } else if (node && dEnd < 10) {
        const major = sign === 'ceda';
        if (!this.junctionClear(node, car, major)) {
          target = Math.min(target, Math.max(0, (dEnd - STOP_LINE) * 0.85));
          car.wait += this.dt;
          if (car.wait > 6) car.cleared = true;
        } else target = Math.min(target, major ? 3.2 : 4.5);
      }
    }
    // la guagua para en las paradas de su lado (a la derecha de la marcha) y espera PARADA_S segundos
    if (car.bus && car.road._paradas && car.road.p.length >= 2) {
      const pos = along(car), lado = car.reverse ? -1 : 1;
      for (const st of car.road._paradas) {
        if (st.side !== lado || st === car.lastStop) continue;
        const ahead = car.reverse ? pos - st.d : st.d - pos;
        if (ahead < -2 || ahead > 30) continue;
        if (ahead < 1.2) {
          car.dwell = (car.dwell ?? PARADA_S) - this.dt;
          target = 0;
          if (car.dwell <= 0) { car.lastStop = st; car.dwell = undefined; }
        } else target = Math.min(target, Math.max(1.2, ahead * 0.55));
        break;
      }
    }
    // el coche de delante (en su carril) y el jugador; con una guagua, la distancia es mayor
    const hx = Math.sin(car.heading), hz = Math.cos(car.heading);
    const myLen = car.len || CAR_LEN;
    const ahead = (x, z, gap, k, reach = 14, wide = 2) => {
      const rx = x - car.x, rz = z - car.z;
      const along = rx * hx + rz * hz;
      if (along <= 0 || along > reach) return;
      const lat = Math.abs(rx * hz - rz * hx);
      if (lat < wide) target = Math.min(target, Math.max(0, (along - gap) * k));
    };
    // peatones cruzando o esperando en un paso (peds.js): se les deja pasar
    if (this.crossers) {
      for (const p of this.crossers) {
        if (p.road !== car.road && p.road !== car.next?.road) continue;
        if (Math.abs(p.x - car.x) < 18 && Math.abs(p.z - car.z) < 18) ahead(p.x, p.z, 4.5 + (myLen - CAR_LEN) / 2, 1.2, 17, p.wide);
      }
    }
    for (const list of this.lists) for (const o of list) {
      if (o === car || !o.road) continue;
      const extra = (myLen + (o.len || CAR_LEN)) / 2 - CAR_LEN;
      if (Math.abs(o.x - car.x) < 14 + extra && Math.abs(o.z - car.z) < 14 + extra) ahead(o.x, o.z, 5.5 + extra, 1.4, 14 + extra);
    }
    if (player) ahead(player.pos.x, player.pos.y, 4.2 + (myLen - CAR_LEN) / 2, 1.3, 14 + (myLen - CAR_LEN) / 2);
    return target;
  }

  advance(car, dist) {
    const pts = car.road.p;
    const nSegs = pts.length - 1;
    let remaining = dist;
    let guard = 0;
    while (remaining > 0 && guard++ < 12) {
      const a = this.pathPoint(car, car.seg);
      const b = this.pathPoint(car, car.seg + 1);
      if (!a || !b) { car.road = null; car.mesh.visible = false; return; }   // calle de un solo tramo recorrida al revés: el coche se retira
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 0.001;
      const distLeft = (1 - car.t) * len;
      if (remaining < distLeft) {
        car.t += remaining / len;
        remaining = 0;
      } else {
        remaining -= distLeft;
        car.seg++;
        car.t = 0;
        if (car.seg >= nSegs) {
          if (!car.next) this.chooseNext(car);
          const next = car.next;
          car.next = null;
          // sigue con el intermitente puesto mientras dobla la esquina
          car.blinkT = car.turn ? 2.2 : 0;
          if (!next) { car.road = null; car.mesh.visible = false; return; }
          car.road = next.road;
          car.reverse = next.reverse;
          car.seg = 0;
          car.t = 0;
          car.speed = cruise(car, car.road);
          car.wait = 0;
          car.cleared = false;
        }
      }
    }
    const a = this.pathPoint(car, car.seg);
    const b = this.pathPoint(car, car.seg + 1);
    // sentido único de un carril: por el centro; si no, por el carril de la derecha
    const lane = car.road.ow && car.road.w < 9 ? 0 : car.road.w * 0.22;
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz) || 0.001;
    // por la derecha (en España): la derecha de quien va de a a b es (−dz, dx)
    const rx = -dz / len, rz = dx / len;
    const tx = a[0] + dx * car.t + rx * lane, tz = a[1] + dz * car.t + rz * lane;
    const th = Math.atan2(dx, dz);
    if (car.fresh || Math.hypot(tx - car.x, tz - car.z) > 12) {
      car.x = tx; car.z = tz; car.heading = th; car.fresh = false;
    } else {
      // el coche sigue a su punto del carril con algo de retraso: así traza la curva al doblar una
      // esquina en vez de saltar de una calle a la siguiente
      const k = 1 - Math.exp(-(this.dt || 0.033) / TURN_LAG);
      car.x += (tx - car.x) * k;
      car.z += (tz - car.z) * k;
      let dh = th - car.heading;
      dh -= Math.round(dh / (Math.PI * 2)) * Math.PI * 2;
      car.heading += dh * k;
    }
  }

  update(dt, player) {
    const px = player.pos.x, pz = player.pos.y;
    this.dt = dt;
    this.clock = (this.clock || 0) + dt;
    // las luces de las guaguas, como las de los coches (main.js solo enciende las de this.cars)
    const ref = this.cars.find(c => c.type !== 'moto' && c.type !== 'quad' && c.mesh.userData.headlights?.length);
    const lit = ref ? ref.mesh.userData.headlights[0].emissiveIntensity : 0;
    if (lit !== this.busLights) {
      this.busLights = lit;
      for (const b of this.buses) b.mesh.userData.setLights?.(lit / 3.05);
    }
    for (const list of this.lists) for (const car of list) {
      if (!car.road) { this.spawnNear(car, px, pz); continue; }

      if (car.stopped > 0) car.stopped -= dt;
      // a 40 m del cruce decide por dónde sigue y pone el intermitente
      if (!car.next && this.distToEnd(car) < 40) this.chooseNext(car);
      const target = this.targetSpeed(car, player);
      car.v += target > car.v ? Math.min(target - car.v, ACCEL * dt) : -Math.min(car.v - target, BRAKE * dt);
      if (car.v > 0.01) this.advance(car, car.v * dt);
      if (!car.road) continue;

      const d = Math.hypot(car.x - px, car.z - pz);
      if (d > 650) { this.spawnNear(car, px, pz); continue; }

      // bump player (por debajo de un coche que va saltando, no); la guagua empuja en todo su largo
      let bx = car.x, bz = car.z;
      if (car.bus) {
        const hx = Math.sin(car.heading), hz = Math.cos(car.heading), half = car.len / 2 - 1.3;
        const s = Math.max(-half, Math.min(half, (px - car.x) * hx + (pz - car.z) * hz));
        bx = car.x + hx * s; bz = car.z + hz * s;
      }
      const dHit = car.bus ? Math.hypot(bx - px, bz - pz) : d;
      if (dHit < 2.6 && !(player.air > 1.5)) {
        let nx = px - bx, nz = pz - bz;
        const nd = Math.hypot(nx, nz) || 1;
        nx /= nd; nz /= nd;
        const push = (2.6 - dHit);
        player.pos.x += nx * push * 0.7;
        player.pos.y += nz * push * 0.7;
        const vn = player.vel.x * nx + player.vel.y * nz;
        if (vn < 0) {
          player.vel.x -= nx * vn * 1.4;
          player.vel.y -= nz * vn * 1.4;
          player.vel.multiplyScalar(0.8);
          if (vn < -6) { player.crashPulse = 1; this.panic(car, 6); }
        }
      }

      car.blinkT = Math.max(0, car.blinkT - dt);
      const signal = car.next ? car.turn : car.blinkT > 0 ? car.turn : null;
      const on = signal && d < 160 && blinkPhase(this.clock);
      car.mesh.userData.indicate?.(on && signal === 'l', on && signal === 'r');
      car.mesh.position.set(car.x, 0.16, car.z);
      car.mesh.rotation.y = car.heading;
      // lejos: sin detalles; muy lejos: ni se dibuja
      car.mesh.visible = d < 330;
      car.mesh.userData.setDetail?.(d < 70);
      // de lejos, la carrocería ligera (carModels.js setDist, Version 133)
      car.mesh.userData.setDist?.(d);
    }
  }
}
