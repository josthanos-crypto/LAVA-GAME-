import * as THREE from 'three';
// primero el terreno: deja preparados todos los materiales para seguir las cuestas
import { loadTerrain, terrainY, realHeight, terrainUniforms, wrapScene, setTerrainMode, tessellateFlat, waterAt } from './terrain.js';
import { loadMap, buildWorld, setupLights } from './world.js';
import { PlayerCar } from './car.js';
import { Roofs } from './tejados.js';
import { Traffic } from './traffic.js';
import { Peds } from './peds.js';
import { FotoGente } from './fotoGente.js';
import { OnFoot, CHARACTERS, getLook, setLook } from './character.js';
import { Minimap } from './minimap.js';
import { BigMap } from './bigMap.js';
import { Props, propLayout, makeHitSound } from './props.js';
import { ParkedCars } from './parked.js';
// la ciudad está partida por barrios: cada barrio construye lo suyo en su carpeta
// (src/barrios/<barrio>/index.js). Ver BARRIOS.md para el índice.
import { prepararBarrios, construirBarriosAlPrincipio, construirBarrios, construirBarriosConLocales } from './barrios/index.js';
import { modelName, prewarmCars, makeCar } from './carModels.js';
import { swingDoor, closeDoorNow, updateDoors, addCockpit, addDoor, showCarCard, blinkTick, blinkPhase } from './carKit.js';
import { buildWalkIndex, walkRise } from './aceras.js';
import { Contramano } from './contramano.js';
import { Input } from './input.js';
import { EngineSound, turboSound } from './audio.js';
import { makeHelmet, ridePose } from './motos.js';
import { Ambience } from './ambience.js';
import { sound } from './sound.js';
import { buildLandmarks } from './landmarks.js';
import { buildFacadePhotos } from './facadePhotos.js';
import { DayNight } from './dayNight.js';
import { Thrusters } from './thrusters.js';
import { Cielo } from './cielo.js';
import { QUALITY_ORDER, applyQuality } from './quality.js';
import { slimTextures, freeBigGeometry } from './memoria.js';
import { SkyEnvironment, PostFX } from './realism.js';
import { Police } from './police.js';
import { Combat } from './combat.js';
import { DialogBox } from './dialogue.js';
import { RoadGraph } from './roadGraph.js';
import { Missions } from './missions.js';
import { Customizer } from './customizer.js';
import { Acampada } from './acampada.js';
import { TouchControls, isTouchDevice, goFullscreen } from './touch.js';
import { Locales, claimSigns } from './locales.js';
import { LOCAL_DEFS } from './localesData.js';
import { Dachshunds } from './dogs.js';
import { Skaters } from './skaters.js';
import { Volcano } from './volcano.js';
import { LavaStones } from './stones.js';
import { startPlaces, findStart, carSpot } from './startPlaces.js';
import { store, DEMO } from './save.js';
// añadidos del PC de Arrecife (norte de Arrecife, Repsol, McDonald's, Cabildo, choques...): se montan solos sobre window.__game
import './arrecifeExtras.js';

/** HUD de misiones: dinero, objetivo con flecha y tiempo, resultado */
function makeMissionHud() {
  const fmt = (n) => n.toLocaleString('es-ES') + ' €';
  let resultT = 0;
  return {
    money(v, delta) {
      $('money').textContent = fmt(v);
      if (delta) {
        const d = $('money-delta');
        d.textContent = (delta > 0 ? '+' : '−') + fmt(Math.abs(delta));
        d.className = delta > 0 ? 'on up' : 'on down';
        clearTimeout(d._t);
        d._t = setTimeout(() => { d.className = ''; }, 2200);
      }
    },
    mission(title) { $('objective').classList.toggle('on', !!title); },
    objective(o) {
      const el = $('objective');
      if (!o) { el.classList.remove('on'); return; }
      el.classList.add('on');
      el.querySelector('.ot').textContent = o.text;
      const m = Math.floor(o.timer / 60), s = Math.floor(o.timer % 60);
      const tm = el.querySelector('.tm');
      tm.textContent = m + ':' + String(s).padStart(2, '0');
      tm.classList.toggle('hurry', o.timer < 15);
      const arrow = el.querySelector('.arrow');
      arrow.style.display = o.angle === undefined ? 'none' : '';
      if (o.angle !== undefined) arrow.style.transform = `rotate(${-o.angle}rad)`;
      el.querySelector('.ds').textContent = o.dist === undefined ? '' : (o.dist > 1000 ? (o.dist / 1000).toFixed(1) + ' km' : Math.round(o.dist) + ' m');
    },
    result(ok, title, sub) {
      const r = $('result');
      r.className = 'on ' + (ok ? 'ok' : 'ko');
      r.querySelector('.t').textContent = title;
      r.querySelector('.s').textContent = sub || '';
      clearTimeout(resultT);
      resultT = setTimeout(() => { r.className = ''; }, 3200);
    },
  };
}

/** HUD de acción: estrellas, salud, punto de mira y pantallas grandes */
function makeActionHud() {
  const stars = [...document.querySelectorAll('#stars i')];
  const bar = $('health-bar');
  const big = $('big');
  let hurtT = 0;
  return {
    hurt() { hurtT = 0.45; },
    big(title, sub) {
      if (!title) { big.classList.remove('on'); return; }
      big.querySelector('.t').textContent = title;
      big.querySelector('.s').textContent = sub || '';
      big.classList.add('on');
    },
    update(dt, { health, wanted, mode, bust, lostT }) {
      stars.forEach((s, i) => {
        s.classList.toggle('on', i < wanted);
        // las estrellas parpadean mientras no te ven (les estás dando esquinazo)
        s.classList.toggle('blink', i < wanted && lostT > 2);
      });
      $('stars').classList.toggle('on', wanted > 0);
      bar.style.width = health + '%';
      bar.classList.toggle('low', health < 30);
      $('crosshair').classList.toggle('on', mode === 'foot');
      hurtT = Math.max(0, hurtT - dt);
      $('hurt').style.opacity = Math.max(hurtT * 2, health < 30 ? 0.25 + Math.sin(performance.now() * 0.006) * 0.1 : 0);
      $('bust').style.opacity = bust > 0.05 ? 1 : 0;
      $('bust').style.setProperty('--p', bust);
    },
  };
}

const $ = (id) => document.getElementById(id);
const setProgress = (msg, pct) => {
  $('load-status').textContent = msg;
  $('load-bar').style.width = pct + '%';
};

function findSpawn(map) {
  let best = null, bestD = Infinity;
  for (const r of map.roads) {
    if (!r.major || !r.name || r.p.length < 2) continue;
    const mid = r.p[Math.floor(r.p.length / 2)];
    const d = Math.hypot(mid[0], mid[1]);
    if (d < bestD) { bestD = d; best = r; }
  }
  const r = best || map.roads[0];
  const i = Math.floor(r.p.length / 2);
  const [ax, az] = r.p[Math.max(0, i - 1)];
  const [bx, bz] = r.p[i];
  return { x: bx, z: bz, heading: Math.atan2(bx - ax, bz - az) };
}

/** faros reales para el coche del jugador: dos focos que iluminan la calzada */
function makeHeadlamps() {
  const g = new THREE.Group();
  const lamps = [];
  for (const sx of [-0.62, 0.62]) {
    const s = new THREE.SpotLight(0xfff1dc, 0, 70, 0.42, 0.55, 1.4);
    s.position.set(sx, 0.75, 2.2);
    s.target.position.set(sx * 1.4, 0, 18);
    g.add(s, s.target);
    lamps.push(s);
  }
  return {
    group: g,
    set(night, braking) {
      for (const s of lamps) s.intensity = THREE.MathUtils.smoothstep(night, 0.04, 0.3) * 260;
    },
  };
}

async function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', stencil: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.7;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  $('app').appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.3, 3000);
  // el tamaño del lienzo: en el iPhone, al girar el móvil o entrar en pantalla completa, Safari
  // avisa tarde (o no avisa) y el juego se quedaba en media pantalla; se reajusta con resize,
  // con el giro (dos veces, que iOS da el tamaño nuevo con retraso) y con un vigilante periódico
  const fitScreen = () => {
    if (camera.aspect !== innerWidth / innerHeight) {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
    const cv = renderer.domElement;
    if (cv.clientWidth !== innerWidth || cv.clientHeight !== innerHeight) renderer.setSize(innerWidth, innerHeight);
  };
  addEventListener('resize', fitScreen);
  addEventListener('orientationchange', () => { fitScreen(); setTimeout(fitScreen, 350); setTimeout(fitScreen, 900); });
  window.visualViewport?.addEventListener('resize', fitScreen);
  document.addEventListener('fullscreenchange', () => setTimeout(fitScreen, 120));
  setInterval(fitScreen, 1200);

  const map = await loadMap(setProgress);
  // las alturas del terreno (IGN): si no se pueden leer, el juego sigue llano
  await loadTerrain(map);
  // relieve exagerado x2 tierra adentro para que las cuestas se vean (la costa queda a su altura); ?relieve=1 = real
  terrainUniforms.terrainExag.value = Number(new URLSearchParams(location.search).get('relieve')) || 2.35;
  // los clientes llevan su propio rótulo: el genérico del mapa no se pinta
  claimSigns(map, LOCAL_DEFS);
  // dónde hay acera (10 cm más alta): el coche se sube al bordillo con su suspensión
  buildWalkIndex(map.roads);
  // cada barrio retoca el mapa antes de levantar la ciudad (fachadas, alturas, quitar lo que sobra)
  prepararBarrios(map);
  const { sun, hemi, fill, sky, stars, clouds, cloudsMat } = setupLights(scene, map.meta.bounds);
  // reflejos de entorno sacados del propio cielo (se rehacen al moverse el sol)
  const skyEnv = new SkyEnvironment(renderer, scene, sky);
  const postfx = new PostFX(renderer, scene, camera);

  const { colliders, roadNames, animate, streetHeadMat, streetGlowMat, noAO, streetlights } =
    buildWorld(scene, map, setProgress, renderer);
  postfx.excludeFromAO(sky, stars, clouds, ...noAO);
  const landmarks = buildLandmarks(scene, map, setProgress);
  const streetPhotos = null;   // sin paneles de fotos flotando (los pidio quitar José Manuel, Version 73)
  // fotos reales pegadas a las fachadas de Argana Alta (map/argana_assets.json)
  const facadePhotos = await buildFacadePhotos(scene, map, setProgress);

  const dayNight = new DayNight({
    scene, sun, hemi, fill, sky, stars, clouds, renderer, streetHeadMat, cloudsMat,
  });

  const params = new URLSearchParams(location.search);
  const touch = isTouchDevice();
  if (touch) document.body.classList.add('touch');
  // en el móvil se empieza en calidad baja (tecla Q / botón Calidad para subirla)
  let qualityIdx = QUALITY_ORDER.indexOf(params.get('q') || (touch ? 'low' : 'high'));
  if (qualityIdx < 0) qualityIdx = 2;
  // si el aparato no llega, la calidad baja sola (ver frame); al elegirla con Q (o con ?q=) ya no se toca
  let autoQuality = !params.get('q');
  let gameMinutes = params.has('t') ? Number(params.get('t')) * 60 : 11 * 60 + 30;
  // el sol dibujado, la luna con sus fases y la lluvia (con ?lluvia llueve siempre)
  let gameDay = 0;
  const cielo = new Cielo(scene, params.has('lluvia'));
  const applyQ = () => {
    const q = applyQuality(QUALITY_ORDER[qualityIdx], { renderer, sun, streetPhotos, facadePhotos, postfx });
    dayNight.allowShadows = q.shadows;
    return q;
  };
  applyQ();

  setProgress('Sacando el coche del garaje…', 88);
  await new Promise(r => setTimeout(r, 30));

  // todos los coches y sus rótulos listos antes de arrancar (sin tirones al aparecer uno nuevo)
  prewarmCars();
  const spawn = findSpawn(map);
  // el coche elegido en la pantalla de inicio (modelo y color); si no hay nada, el deportivo rojo
  let carSel = { t: 'sport', c: 0xd8271c };
  try {
    const saved = JSON.parse(store.get('lava.car') || 'null');
    if (saved && modelName(saved.t)) carSel = { t: saved.t, c: saved.c >>> 0 };
  } catch { /* elección guardada rota: se ignora */ }
  const player = new PlayerCar(scene, spawn.x, spawn.z, spawn.heading, carSel.t, carSel.c);
  // los tejados, para conducir por encima (se sube con el turbo salto del roadster)
  player.roofs = new Roofs(map.buildings);
  const traffic = new Traffic(scene, map.roads, { count: isTouchDevice() ? 26 : 44 });
  // coches aparcados por las calles (se pueden robar); en el móvil, menos
  const parked = new ParkedCars(scene, map, { max: touch ? 8 : 14, colliders });
  // gente por la calle (en el móvil, la mitad)
  // un 20% menos de gente (lo pidio Jose Manuel) y, en el PC, con el detalle alto
  const peds = new Peds(scene, map.roads, { count: touch ? 51 : 120, detail: touch ? 1 : 2 });
  // gente de foto, de pie en las aceras (public/gente/)
  const fotoGente = new FotoGente(scene, peds, { count: touch ? 5 : 10 });
  const onFoot = new OnFoot(scene);
  // rejilla de 6 m con todas las calles, paseos y puentes: encima de ellos se está en seco
  // aunque debajo haya mar (el Puente de las Bolas, la calzada del castillo)
  const dryGrid = new Set();
  for (const r of map.roads) {
    const half = r.w / 2 + 2.5;
    for (let i = 0; i + 1 < r.p.length; i++) {
      const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
      const L = Math.hypot(bx - ax, bz - az), steps = Math.max(1, Math.ceil(L / 3));
      for (let t = 0; t <= steps; t++) {
        const x = ax + (bx - ax) * (t / steps), z = az + (bz - az) * (t / steps);
        for (let dx = -half; dx <= half + 0.1; dx += 3) {
          for (let dz = -half; dz <= half + 0.1; dz += 3) {
            dryGrid.add(Math.round((x + dx) / 6) + ',' + Math.round((z + dz) / 6));
          }
        }
      }
    }
  }
  /** agua de verdad en (x, z): mar o Charco, y sin calle, puente ni pantalán encima */
  function overWater(x, z) {
    if (!waterAt(x, z)) return false;
    if (dryGrid.has(Math.round(x / 6) + ',' + Math.round(z / 6))) return false;
    // el pantalán de la Escuela de Pesca (escuelaMar.js)
    const du = (x - 766.4) * 0.55 + (z + 26.2) * 0.835, dv = -(x - 766.4) * 0.835 + (z + 26.2) * 0.55;
    if (du > -8 && du < 37 && Math.abs(dv) < 4.5) return false;
    return true;
  }
  onFoot.waterAt = overWater;   // en el mar o en el Charco se nada (character.js)
  // rejilla fina de la calzada (sin margen): los peatones no se paran en medio de la calle
  const carGrid = new Set();
  for (const r of map.roads) {
    if (r.ped || r.dirt || r.p.length < 2) continue;
    const half = r.w / 2 + 0.2;
    for (let i = 1; i < r.p.length; i++) {
      const [ax, az] = r.p[i - 1], [bx, bz] = r.p[i];
      const L = Math.hypot(bx - ax, bz - az), steps = Math.max(1, Math.ceil(L / 1.5));
      for (let t = 0; t <= steps; t++) {
        const x = ax + (bx - ax) * (t / steps), z = az + (bz - az) * (t / steps);
        for (let dx = -half; dx <= half + 0.1; dx += 1.5) {
          for (let dz = -half; dz <= half + 0.1; dz += 1.5) {
            carGrid.add(Math.round((x + dx) / 3) + ',' + Math.round((z + dz) / 3));
          }
        }
      }
    }
  }
  peds.onRoad = (x, z) => carGrid.has(Math.round(x / 3) + ',' + Math.round(z / 3));
  const headlamps = makeHeadlamps();
  peds.colliders = colliders;
  // peatones y tráfico se ven: la gente espera a que paren los coches y los coches ceden en los pasos
  peds.traffic = traffic;
  traffic.crossers = peds.crossers;
  const contramano = new Contramano(map.roads);
  const graph = new RoadGraph(map.roads);
  const police = new Police(scene, map.roads, colliders, graph);
  const dialog = new DialogBox($('dialog'));
  const actionHud = makeActionHud();
  const combat = new Combat({ scene, peds, traffic, police, colliders, dialog, hud: actionHud });
  peds.onEvent = (type, p) => combat.pedEvent(type, p);
  police.onShoot = (car, d) => combat.copShot(car, d, active());
  police.onBusted = () => combat.busted();
  police.onSpotted = () => combat.spotted();
  police.onHitPlayer = (force) => combat.hurt(force * 0.9);
  let wasCrash = 0;
  let mode = 'car';
  const parkedCars = [];
  const active = () => (mode === 'car' ? player : onFoot);
  // misión principal: la acampada del Parque Islas Canarias
  const story = new Acampada({ scene, map, graph, colliders, police, dialog, toast, player, parkedCars, onFoot, getMode: () => mode });
  postfx.excludeFromAO(...story.jet.objects, story.hose);

  // los barrios: cada uno construye lo suyo en su carpeta (src/barrios/). Índice en BARRIOS.md
  // la costa (compartido) va primero, para que lo demás se dibuje encima
  const barrios = construirBarriosAlPrincipio({ scene, map, colliders, story });
  construirBarrios({ scene, map, colliders, touch, story }, barrios);
  const centro = barrios['arrecife-centro'];
  const valterra = barrios.valterra;
  const comun = barrios.compartido;
  // locales de los clientes: se entra con F y se habla con T
  const locales = new Locales({
    scene, map, colliders, dialog, defs: LOCAL_DEFS, touch,
    hooks: {
      toast: (m) => toast(m),
      heal: () => { combat.health = 100; },
      pay: (n) => { if (missions.money < n) return false; missions.addMoney(-n); return true; },
      addMinutes: (m) => { gameMinutes += m; },
      getLook: () => getLook(onFoot.charKey),
      setLook: (look) => { setLook(onFoot.charKey, look); onFoot.rebuild(look); },
      wanted: () => police.wanted,
      who: () => ({ key: onFoot.charKey, name: CHARACTERS[onFoot.charKey].name }),
      hour: () => gameMinutes / 60,
    },
  });
  // segunda fase de los barrios: lo que necesita los locales ya creados
  // (terrazas con sus mesas, el alcalde en el Ayuntamiento, el tanatorio y su oficina)
  await construirBarriosConLocales({ scene, map, colliders, touch, locales, salida: barrios });
  // los nombres de siempre para el resto de main.js
  const { office } = valterra;
  const { maccheroni, buganvillas, farmacia, escuelaZerolo, esquinaMillares, terrace, mayor } = centro;
  // perros salchicha (con correa y sueltos por la plaza) y gente en patineta
  const dogs = new Dachshunds(scene, peds, { leashed: touch ? 4 : 8, free: touch ? 2 : 3, plaza: terrace?.plaza, colliders });
  const skaters = new Skaters(scene, map.roads, { count: touch ? 3 : 6, loop: terrace?.loop, loopCount: touch ? 1 : 2 });
  skaters.onEvent = (why, s, line) => {
    const a = active();
    if (Math.hypot(s.x - a.pos.x, s.z - a.pos.y) < 25) dialog.say(s.name, line, 1.8);
  };
  // dentro de un local no se dispara
  combat.altFire = (m) => !!locales.inside || story.waterReady(m);
  const missions = new Missions({
    scene, graph, police, combat, dialog, hud: makeMissionHud(), spawn,
    story, charName: () => CHARACTERS[onFoot.charKey].name,
  });
  // el volcán al fondo y las piedras de lava escondidas (una en la puerta de cada cliente)
  const volcano = new Volcano(scene, { touch });
  postfx.excludeFromAO(volcano.group);
  const stonesEl = $('stones');
  const showStones = (n, total, pop) => {
    $('stones-n').textContent = n;
    $('stones-t').textContent = '/ ' + total;
    stonesEl.classList.add('on');
    if (pop) { stonesEl.classList.remove('pop'); void stonesEl.offsetWidth; stonesEl.classList.add('pop'); }
  };
  // el coche Lava se gana al reunir todas las piedras (se recuerda; con ?lava en la dirección, ya desde el principio)
  let lavaUnlocked = store.get('lava.coche') === '1' || params.has('lava');
  const stones = new LavaStones(scene, map, locales.defs.map(d => ({ name: d.name, ...d.door })), {
    onPick: (n, total, reward) => {
      missions.addMoney(reward);
      showStones(n, total, true);
      toast(`Piedra de lava ${n} de ${total}`);
    },
    onAll: (bonus) => {
      missions.addMoney(bonus);
      lavaUnlocked = true;
      store.set('lava.coche', '1');
      setTimeout(() => toast('¡Todas las piedras de lava! Premio de ' + bonus + ' €'), 1600);
      setTimeout(() => toast('¡Coche Lava desbloqueado! Pulsa L para traerlo'), 4600);
    },
  });
  if (stones.count >= stones.total) lavaUnlocked = true;
  showStones(stones.count, stones.total, false);
  postfx.excludeFromAO(stones.root);
  const minimap = new Minimap($('minimap'), map, graph);
  const input = new Input();
  input.onPad = () => toast('Mando conectado · RT acelera, LT frena, Y sube y baja');
  const engine = new EngineSound();
  // sillas, mesas, sombrillas, bancos y papeleras que salen volando
  const props = new Props(scene, propLayout(map), colliders);
  // el golpe suena y, con mando, vibra
  const hitSound = makeHitSound();
  props.onHit = (f, kind) => { hitSound(f, kind); input.rumble(f); };
  // de fondo, la ciudad y, cerca de la orilla, las olas
  const ambience = new Ambience(map);
  const footPrev = new THREE.Vector2();
  const touchControls = touch ? new TouchControls($('touch'), input) : null;

  // camera modes: 0 chase, 1 far, 2 hood, 3 primera persona (desde el asiento, con salpicadero y volante)
  let camMode = 0;
  const CAMS = [
    { back: 7.8, up: 3.5, look: 1.05 },
    { back: 13, up: 6.1, look: 1.1 },
    { back: -0.4, up: 1.3, look: 1.1 },
    { back: -0.4, up: 1.3, look: 1.1 },
  ];
  input.on('c', () => { camMode = (camMode + 1) % CAMS.length; toast(['Cámara cercana', 'Cámara lejana', 'Vista capó', 'Primera persona'][camMode]); });
  // I = vista de dentro del coche directa (y volver a la cámara de fuera)
  input.on('i', () => { camMode = camMode === 3 ? 0 : 3; toast(camMode === 3 ? 'Vista interior' : 'Cámara cercana'); });
  // los intermitentes van solos: se encienden al girar y se quitan al acabar · H = luces de emergencia
  // (las teclas Z y X ahora cambian de arma: el inventario de combat.js)
  let blinkSide = null, hazard = false, blinkTurn = 0, blinkPrevH = 0, blinkWasOn = false, blinkStraightT = 0;
  const setBlink = (side) => {
    if (mode !== 'car') return;
    blinkSide = blinkSide === side ? null : side;
    blinkTurn = 0;
    blinkPrevH = player.heading;
  };
  input.on('z', () => { combat.cycleWeapon(-1); });
  input.on('x', () => { combat.cycleWeapon(1); });
  const blinkHud = { l: $('blink-l'), r: $('blink-r') };
  // el arma a la vista: cartelito del HUD y aviso al cambiar con Z / X
  const armaHud = $('arma-hud');
  combat.onWeapon = (w) => {
    if (armaHud) { armaHud.textContent = `${w.icon} ${w.name}`; armaHud.classList.add('on'); }
    toast('Arma: ' + w.name);
  };
  if (armaHud) { armaHud.textContent = `${combat.weapon.icon} ${combat.weapon.name}`; armaHud.classList.add('on'); }
  // subir y bajar llevan su momento: se abre la puerta, se entra o se sale, se cierra (los mandos esperan)
  let freezeT = 0;
  const later = [];
  // N = saltar tramo del día (mañana → mediodía → atardecer → noche)
  const TIME_JUMPS = [8 * 60, 12 * 60, 19 * 60 + 15, 22 * 60];
  let timeJump = 1;
  input.on('n', () => {
    timeJump = (timeJump + 1) % TIME_JUMPS.length;
    gameMinutes = TIME_JUMPS[timeJump];
    toast(['Mañana', 'Mediodía', 'Atardecer', 'Noche'][timeJump] + ' en Arrecife');
  });
  // P = modo foto: la cámara gira despacio alrededor del coche o del personaje
  let photo = params.has('orbit') ? Number(params.get('orbit')) : null;
  input.on('p', () => {
    photo = photo === null ? 0 : null;
    toast(photo === null ? 'Modo foto desactivado' : 'Modo foto');
  });
  // M = personalizar el personaje (se ve girando a su alrededor)
  const customizer = new Customizer($('custom'), {
    onChange: (look) => onFoot.rebuild(look),
    onClose: () => { photo = null; },
  });
  input.on('m', () => {
    if (customizer.open) { customizer.hide(); return; }
    if (mode === 'car') {
      if (player.speed > 3) { toast('Para el coche para cambiarte de ropa'); return; }
      toggleFoot();
    }
    customizer.show(onFoot.charKey);
    photo = 0;
  });
  // T = hablar con quien tengas al lado (o hacer un parón en la tiendita del chino)
  input.on('t', () => {
    if (mode !== 'foot') { toast('Bájate del coche para hablar (F)'); return; }
    // la gente de los locales (y el camarero de la terraza del Reducto)
    if (locales.talk(onFoot)) return;
    if (comun.shops.nearShop(onFoot.pos.x, onFoot.pos.y)) { paron(); return; }
    if (combat.talk(onFoot, onFoot.charKey, CHARACTERS[onFoot.charKey].name, gameMinutes / 60) === false) toast('No hay nadie cerca para hablar');
  });
  // V (o el altavoz de arriba a la izquierda, o ··· en el móvil) = quitar o poner el sonido
  const soundBtn = $('sound-btn');
  const showSound = (muted) => {
    soundBtn.classList.toggle('off', muted);
    soundBtn.setAttribute('aria-label', muted ? 'Poner el sonido' : 'Quitar el sonido');
    soundBtn.title = (muted ? 'Poner el sonido' : 'Quitar el sonido') + ' (V)';
    const item = document.querySelector('#touch .tc-menu [data-k="v"]');
    if (item) item.textContent = muted ? 'Poner sonido' : 'Silenciar';
  };
  sound.onChange = showSound;
  showSound(sound.muted);
  const toggleSound = () => toast(sound.toggle() ? 'Sonido quitado' : 'Sonido puesto');
  input.on('v', toggleSound);
  soundBtn.addEventListener('click', () => { toggleSound(); soundBtn.blur(); });
  input.on('q', () => {
    autoQuality = false;
    qualityIdx = (qualityIdx + 1) % QUALITY_ORDER.length;
    toast(applyQ().label);
  });

  // la puerta del conductor (izquierda): dónde queda, en la calle, el hueco por el que se sube o se baja
  const doorSpot = (out) => {
    const door = swingDoor(player.mesh, out ? 0.45 : 0.3);
    const f = player.forward();
    const side = (door?.side ?? 0.95) + (out ? 0.45 : 0.4), along = (door?.mid ?? 0.3) - 0.15;
    return { x: player.pos.x + f.y * side + f.x * along, z: player.pos.y - f.x * side + f.y * along };
  };
  // al subir: el personaje junto a la puerta abierta, mirando al coche, y al momento se mete dentro
  const boardCar = () => {
    const at = doorSpot(false);
    onFoot.placeAt(at.x, at.z, player.heading - Math.PI / 2);
    onFoot.mesh.visible = true;
    later.push({ t: 0.38, fn: () => { if (mode === 'car') onFoot.mesh.visible = false; } });
    freezeT = 0.75;
    blinkSide = null;
    hazard = false;
    showCarCard(player.type);
  };
  const toggleFoot = () => {
    if (mode === 'car') {
      if (player.jump) { toast('Espera a caer'); return; }
      if (player.air > 1.5) { toast('Baja del tejado para salir del coche'); return; }
      if (player.speed > 3) { toast('Frena antes de bajar'); return; }
      // se abre la puerta y sale por ella, mirando hacia fuera (de la moto o del quad, se baja por un lado)
      dropRider();
      const at = doorSpot(true);
      player.mesh.userData.indicate?.(false, false);
      parkedCars.push(player.detach());
      onFoot.placeAt(at.x, at.z, player.heading + Math.PI / 2);
      footPrev.set(at.x, at.z);
      onFoot.mesh.visible = false;
      later.push({ t: 0.28, fn: () => { if (mode === 'foot') onFoot.mesh.visible = true; } });
      freezeT = 0.5;
      mode = 'foot';
      toast(CHARACTERS[onFoot.charKey].name + ' baja del coche');
      return;
    }
    let bi = -1, bd = Infinity;
    parkedCars.forEach((p, i) => {
      const d = Math.hypot(p.x - onFoot.pos.x, p.z - onFoot.pos.y);
      if (d < (p.reach || 3.8) && d < bd) { bd = d; bi = i; }
    });
    // si hay un aparcado de la calle más cerca que el tuyo, te subes a ese
    if (bi >= 0 && parked.nearest(onFoot.pos.x, onFoot.pos.y) < bd) bi = -1;
    if (bi >= 0) {
      player.adopt(parkedCars.splice(bi, 1)[0]);
      mode = 'car';
      boardCar();
      toast('Al volante');
      return;
    }
    const pk = parked.take(onFoot.pos.x, onFoot.pos.y, 3.6);
    if (pk) {
      player.adopt(pk);
      mode = 'car';
      boardCar();
      toast('¡Coche mangado! · ' + modelName(pk.type));
      return;
    }
    const jacked = traffic.jackNearest(onFoot.pos.x, onFoot.pos.y, 4.2);
    if (jacked) {
      player.adopt(jacked);
      mode = 'car';
      boardCar();
      toast('¡Coche mangado! · ' + modelName(jacked.type));
      return;
    }
    toast('No hay ningún coche cerca');
  };
  // en moto o en quad se ve al personaje encima, con casco: va dentro de la carrocería, que se inclina en las curvas
  let rider = null;   // { mesh, helmet, body }
  const dropRider = () => {
    if (!rider) return;
    rider.helmet.parent?.remove(rider.helmet);
    rider.body.remove(rider.mesh);
    if (rider.mesh === onFoot.mesh) {
      scene.add(onFoot.mesh);
      onFoot.unride();
    }
    rider = null;
  };
  const syncRider = () => {
    const seat = mode === 'car' && player.mesh.userData.bike;
    if (!seat) { dropRider(); return; }
    // (al cambiar de personaje con 1–5 se monta el nuevo)
    if (!rider || rider.mesh !== onFoot.mesh || rider.body !== player.body) {
      dropRider();
      const helmet = makeHelmet(0x111214);
      onFoot.parts.head.add(helmet);
      player.body.add(onFoot.mesh);
      onFoot.mesh.position.set(0, seat.y - 0.93, seat.z);
      onFoot.mesh.rotation.set(0, 0, 0);
      ridePose(onFoot.parts, seat);
      rider = { mesh: onFoot.mesh, helmet, body: player.body };
    }
    onFoot.mesh.visible = true;
  };

  // F / E: en la puerta de un local se entra (o se sale); si no, al coche
  const useF = () => {
    if (mode === 'foot' && !customizer.open && locales.useDoor(onFoot)) return;
    if (!locales.inside) toggleFoot();
  };
  input.on('f', useF);
  input.on('e', useF);

  ['1', '2', '3', '4'].forEach((k, i) => input.on(k, () => {
    const key = ['noah', 'michael', 'jose', 'iria'][i];
    onFoot.setCharacter(key);
    dialog.fem = CHARACTERS[key].sex === 'f';
    toast('Ahora eres ' + CHARACTERS[key].name);
  }));
  input.on('r', () => {
    if (mode !== 'car') return;
    let bestPt = null, bestH = 0, bestD = Infinity;
    for (const r of map.roads) {
      for (let i = 0; i < r.p.length - 1; i++) {
        const [ax, az] = r.p[i], [bx, bz] = r.p[i + 1];
        const mx = (ax + bx) / 2, mz = (az + bz) / 2;
        const d = Math.hypot(mx - player.pos.x, mz - player.pos.y);
        if (d < bestD) { bestD = d; bestPt = [mx, mz]; bestH = Math.atan2(bx - ax, bz - az); }
      }
    }
    if (bestPt) player.placeAt(bestPt[0], bestPt[1], bestH);
    toast('Coche recolocado');
  });

  // tras DETENIDO / HAS MUERTO: vuelves al coche en el punto de salida
  combat.onRespawn = () => {
    locales.forceOut();
    for (let i = parkedCars.length - 1; i >= 0; i--) if (parkedCars[i].mesh === player.mesh) parkedCars.splice(i, 1);
    onFoot.mesh.visible = false;
    mode = 'car';
    // si caíste con la tanqueta, te devuelven tu deportivo
    if (player.type === 'tanqueta') {
      player.adopt({ type: carSel.t, color: carSel.c, brand: carSel.t === 'sport', x: spawn.x, z: spawn.z, heading: spawn.heading });
      story.hideTruck();
    }
    player.placeAt(spawn.x, spawn.z, spawn.heading);
  };

  // parón en la tiendita del chino: refresco, pipas y a seguir
  let wasAtShop = false;
  function paron() {
    if (dialog.busy) return;
    const me = CHARACTERS[onFoot.charKey].name;
    const paid = missions.money >= 2;
    dialog.play([
      { who: 'Mei', text: '¡Hola, mi niño! ¿Qué te pongo?' },
      { who: me, text: 'Un refresco bien frío y unas pipas, que vengo reventado.', player: true },
      { who: 'Mei', text: paid ? 'Dos euros. Siéntate ahí un ratito, que hace calor.' : 'Hoy invita la casa. ¡Otro día me pagas!' },
    ], () => {
      combat.health = 100;
      if (paid) missions.addMoney(-2);
      gameMinutes += 15;
      toast('Parón en la tiendita · salud al 100%');
    });
  }

  let toastTimer = 0;
  function toast(msg) {
    $('toast').textContent = msg;
    $('toast').classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('on'), 1800);
  }

  // calzadas, aceras y plazas en trozos pequeños para que sigan las cuestas sin que asome el suelo
  const flatT0 = performance.now();
  const flatAdded = tessellateFlat(scene, touch ? 8 : 6);
  const flatMs = Math.round(performance.now() - flatT0);
  // en el móvil, rótulos y suelos dibujados a la mitad de tamaño (memoria.js): si no, se queda sin memoria
  const slimMB = touch ? Math.round(slimTextures(scene)) : 0;
  // y las formas grandes, fuera de la memoria en cuanto estén en la tarjeta gráfica
  const freedMB = touch ? Math.round(freeBigGeometry(scene)) : 0;
  let slimTimer = 4;
  setProgress('Listo', 100);
  $('start-btn').style.display = 'inline-block';
  $('load-status').textContent = 'Arrecife cargado — ' + map.meta.roads + ' calles reales · ' + map.meta.buildings + ' edificios';

  // ¿por dónde quieres empezar? (y la demo sin policía, para ir viendo la ciudad tranquilo)
  const places = startPlaces(map, locales);
  // en la demo no se recuerda nada: se empieza en el centro y sin policía
  const prefs = {
    get: (k, d) => store.get(k) ?? d,
    set: (k, v) => store.set(k, v),
  };
  let pickId = prefs.get('lava.start', 'centro');
  const asked = params.has('start') && findStart(params.get('start'), places, map);
  if (asked?.id && places.some(p => p.id === asked.id)) pickId = asked.id;
  if (!places.some(p => p.id === pickId)) pickId = 'centro';
  const chips = document.querySelector('#start-pick .chips');
  for (const p of places) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.dataset.id = p.id;
    if (p.client) b.classList.add('client');
    b.classList.toggle('sel', p.id === pickId);
    b.addEventListener('click', () => {
      pickId = p.id;
      $('start-where').value = '';
      chips.querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
    });
    chips.append(b);
  }
  // 🚗 cada jugador elige su coche: modelo y color (se guarda y se aplica al momento)
  const CAR_TYPES = ['sport', 'super', 'muscle', 'cabrio', 'beetle', 'hatch', 'sedan', 'estate', 'suv', 'pickup', 'kangoo', 'van', 'truck', 'rear'];
  const CAR_COLORS = [0xd8271c, 0x2456a5, 0xf2f2f2, 0x1b1d20, 0x8d9298, 0x2e7d46, 0xe8b422, 0xe8702a, 0x7b3fa0, 0x58a8c8];
  const carModelsBox = $('car-models'), carColorsBox = $('car-colors');
  if (carModelsBox && carColorsBox) {
    const applyCar = () => {
      const old = player.mesh;   // el coche de antes se quita (si no, quedaba un fantasma debajo)
      player.adopt({ type: carSel.t, color: carSel.c, brand: carSel.t === 'sport', x: spawn.x, z: spawn.z, heading: spawn.heading });
      if (old && old !== player.mesh) scene.remove(old);
      prefs.set('lava.car', JSON.stringify(carSel));
    };
    for (const t of CAR_TYPES) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = modelName(t);
      b.dataset.t = t;
      b.classList.toggle('sel', t === carSel.t);
      b.addEventListener('click', () => {
        carSel.t = t;
        carModelsBox.querySelectorAll('button').forEach(x => x.classList.toggle('sel', x === b));
        applyCar();
      });
      carModelsBox.append(b);
    }
    for (const c of CAR_COLORS) {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'cdot' + (c === carSel.c ? ' sel' : '');
      d.style.background = '#' + c.toString(16).padStart(6, '0');
      d.setAttribute('aria-label', 'Color');
      d.addEventListener('click', () => {
        carSel.c = c;
        carColorsBox.querySelectorAll('.cdot').forEach(x => x.classList.toggle('sel', x === d));
        applyCar();
      });
      carColorsBox.append(d);
    }
    $('car-btn').addEventListener('click', () => $('car-pick').classList.toggle('on'));
  }
  const names = new Set([...places.map(p => p.label), ...map.roads.map(r => r.name).filter(Boolean)]);
  $('start-list').append(...[...names].sort((a, b) => a.localeCompare(b, 'es')).map(n => Object.assign(document.createElement('option'), { value: n })));
  $('start-where').addEventListener('input', () => {
    $('start-where').classList.remove('bad');
    chips.querySelectorAll('button').forEach(x => x.classList.toggle('sel', !$('start-where').value && x.dataset.id === pickId));
  });
  $('start-nopolice').checked = DEMO || params.has('demo') || prefs.get('lava.demo', '0') === '1';
  if (DEMO) {
    document.title = 'Lava Game · Demo';
    const tag = document.querySelector('#loader .tag');
    if (tag) tag.textContent = 'Demo · partida nueva · no se guarda nada';
  }
  $('start-pick').classList.add('on');

  let demo = false;
  const begin = (target, noPolice) => {
    if (target?.at) {
      const spot = carSpot(map, target.at, target.look, target.on);
      if (spot) {
        player.placeAt(spot.x, spot.z, spot.heading);
        Object.assign(spawn, spot);
      }
    }
    demo = noPolice;
    if (demo) {
      police.clear();
      police.add = () => {};
    }
  };

  const autoStart = params.has('auto');
  await new Promise(resolve => {
    if (autoStart) {
      begin(findStart(params.get('start'), places, map), params.has('demo'));
      $('loader').classList.add('hidden');
      $('hud').classList.add('on');
      resolve();
      return;
    }
    const go = () => {
      const typed = $('start-where').value.trim();
      const target = typed ? findStart(typed, places, map) : places.find(p => p.id === pickId);
      if (!target) {
        $('start-where').classList.remove('bad');
        void $('start-where').offsetWidth;
        $('start-where').classList.add('bad');
        $('load-status').textContent = `No encuentro «${typed}»: prueba con otra calle o elige un sitio`;
        return;
      }
      const noPolice = $('start-nopolice').checked;
      if (!typed) prefs.set('lava.start', pickId);
      prefs.set('lava.demo', noPolice ? '1' : '0');
      begin(target, noPolice);
      // si se escribió el sitio y se pulsó Enter, el cuadro de texto ya no se queda con las teclas
      document.activeElement?.blur?.();
      $('start-btn').removeEventListener('click', go);
      engine.start();
      if (touch) goFullscreen();
      $('loader').classList.add('hidden');
      $('hud').classList.add('on');
      toast(target.id === 'centro' ? 'Arrecife' : target.label);
      setTimeout(() => toast(demo ? 'Demo sin policía: pasea tranquilo' : 'Misión principal: busca la columna morada'), 1900);
      resolve();
    };
    $('start-btn').addEventListener('click', go);
    $('start-where').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });

  // el roadster con turbo salto (Chispa Órbita), la moto (Tinajo Rayo) y el quad (Malpaís Jable): aparcados a tu
  // lado al empezar; con la O, la B o la U (o en el menú del móvil) vienen a donde estés. De cada uno hay uno:
  // el que dejaste por ahí se va
  const GARAGE = {
    roadster: { color: 0xf2f2f2, name: 'el roadster', start: [[3.3, 0], [-3.3, 0]] },
    moto: { color: 0xd8271c, name: 'la moto', start: [[3.2, -5.2], [-3.2, -5.2], [0, -7.5]] },
    quad: { color: 0xe2661b, name: 'el quad', start: [[3.3, 5.6], [-3.3, 5.6], [0, 8.5]] },
    // el premio de las piedras de lava (tecla L): no se aparca al empezar
    lava: { color: 0x0b0b0d, name: 'el coche Lava', start: [] },
  };
  // el coche Lava brilla en naranja por debajo y en los bajos de las puertas
  const lavaGlowTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d'), grad = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    grad.addColorStop(0, 'rgba(255,170,60,1)');
    grad.addColorStop(0.45, 'rgba(255,90,20,0.55)');
    grad.addColorStop(1, 'rgba(255,60,10,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const lavaGlow = (group, dims) => {
    const midZ = (dims.zf + dims.zr) / 2;
    const under = new THREE.Mesh(new THREE.PlaneGeometry(dims.width * 1.9, dims.length * 1.35),
      new THREE.MeshBasicMaterial({ map: lavaGlowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }));
    under.rotation.x = -Math.PI / 2;
    // justo encima del asfalto (y = 0 del coche): más abajo lo tapa la calzada
    under.position.set(0, 0.035, midZ);
    group.add(under);
    postfx.excludeFromAO(under);
    const strip = new THREE.MeshBasicMaterial({ color: 0xff6a12, toneMapped: false });
    for (const sx of [-1, 1]) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, dims.length * 0.55), strip);
      s.position.set(sx * (dims.width / 2 + 0.005), 0.22, midZ);
      group.add(s);
    }
  };
  const parkVehicle = (type, quiet = false, start = false) => {
    const G = GARAGE[type];
    if (mode === 'car' && player.type === type) { if (!quiet) toast('Ya vas en ' + G.name); return; }
    if (locales.inside) return;
    for (let i = parkedCars.length - 1; i >= 0; i--) {
      if (parkedCars[i].type === type) { scene.remove(parkedCars[i].mesh); parkedCars.splice(i, 1); }
    }
    const me = mode === 'car' ? player : onFoot;
    const h = me.heading, fx = Math.sin(h), fz = Math.cos(h);
    // al lado del coche (derecha o izquierda) o delante de ti si vas a pie; si no cabe, delante o detrás
    // (a pie, a menos de 3,8 m para que la F llegue)
    const tries = start ? G.start : mode === 'car' ? [[3.3, 0], [-3.3, 0], [0, 7], [0, -7]] : [[0, 3.2], [2.8, 1.2], [-2.8, 1.2], [0, -3.2]];
    const fits = (x, z) => [-1.4, 0, 1.4].every(o => !colliders.circleContacts(x + fx * o, z + fz * o, 1.05).length) &&
      parkedCars.every(c => Math.hypot(c.x - x, c.z - z) > 2.6);
    let at = null;
    for (const [side, ahead] of tries) {
      const x = me.pos.x + fz * side + fx * ahead, z = me.pos.y - fx * side + fz * ahead;
      if (fits(x, z)) { at = [x, z]; break; }
    }
    if (!at) { if (!quiet) toast('Aquí no cabe ' + G.name); return; }
    const { group, body, wheels, dims } = makeCar(type, G.color);
    if (type === 'lava') lavaGlow(group, dims);
    group.position.set(at[0], 0.16, at[1]);
    group.rotation.y = h;
    scene.add(group);
    parkedCars.push({ mesh: group, body, wheels, dims, type, color: G.color, brand: false, x: at[0], z: at[1], heading: h });
    if (!quiet) toast('Ahí tienes ' + G.name);
  };
  for (const type of ['roadster', 'moto', 'quad']) parkVehicle(type, true, true);
  setTimeout(() => toast(touch ? 'Roadster al lado: súbete y pulsa Salto' : 'Roadster al lado: súbete y pulsa J'), 3900);
  setTimeout(() => toast('También tienes una moto y un quad al lado'), 6000);
  input.on('o', () => parkVehicle('roadster'));
  input.on('b', () => parkVehicle('moto'));
  input.on('u', () => parkVehicle('quad'));
  // L: el coche Lava, si ya has reunido todas las piedras
  input.on('l', () => {
    if (lavaUnlocked) { parkVehicle('lava'); return; }
    toast(`El coche Lava es el premio por reunir las ${stones.total} piedras de lava (llevas ${stones.count})`);
  });
  // J: el turbo salto (solo el roadster lo lleva)
  input.on('j', () => {
    if (mode !== 'car' || customizer.open || locales.inside || combat.dead) return;
    if (!player.JUMP) { toast('Solo salta el roadster: tecla O'); return; }
    if (player.boost()) { closeDoorNow(player.mesh); turboSound(player.jump.T); }
  });

  let streetTimer = 0, lastStreet = '', streetHold = 0;
  const streetZone = $('street').querySelector('.zone');
  let lastPeriod = '';
  const f0 = player.forward();
  const camPos = new THREE.Vector3(player.pos.x - f0.x * 7.2, 2.5, player.pos.y - f0.y * 7.2);
  const camTarget = new THREE.Vector3();
  let shakeAmt = 0;
  let fpCockpit = null;   // el puesto del conductor que se está viendo (primera persona)
  let fpAoCar = null;     // el coche que se esconde del pase de oclusión mientras vas dentro
  let lightTick = 0;
  let night = 0;
  const rainGrey = new THREE.Color(0x97a1aa);
  let carSink = 0;
  // red de seguridad: el último sitio bueno del coche, por si la física diera un NaN
  const lastGood = new THREE.Vector2();
  let lastGoodH = 0, lastGoodOk = false;
  const gauge = $('gauge-arc');
  const GAUGE_LEN = 100; // pathLength del arco

  const clock = new THREE.Clock();

  // cuestas: el cielo y el volcán del fondo no se tocan; la regata flota al nivel del mar (terrain.js)
  for (const o of [sky, stars, clouds, volcano.group]) setTerrainMode(o, 'none');
  setTerrainMode(centro.regatta.group, 'level');
  wrapScene(scene);
  let terrainTick = 0;

  // mapa grande (G, clic en el minimapa o «Mapa» en el móvil): el juego se para mientras está abierto
  const travelBlock = () =>
    police.wanted > 0 ? 'Con la policía detrás no se puede ir: despístala primero'
      : missions.active ? 'En mitad de una misión no se puede ir'
      : player.type === 'tanqueta' ? 'Con la tanqueta no se puede ir'
      : combat.dead ? 'Ahora no se puede ir' : '';
  const bigMap = new BigMap($('bigmap'), {
    minimap, map, places,
    canGo: travelBlock,
    onGo: (spot) => {
      locales.forceOut();
      for (let i = parkedCars.length - 1; i >= 0; i--) if (parkedCars[i].mesh === player.mesh) parkedCars.splice(i, 1);
      onFoot.mesh.visible = false;
      mode = 'car';
      player.placeAt(spot.x, spot.z, spot.heading);
      const f = player.forward(), c = CAMS[camMode];
      camPos.set(spot.x - f.x * c.back, c.up, spot.z - f.y * c.back);
      toast(spot.label);
    },
    onClose: () => {
      input.paused = false;
      sound.duck(false);
      clock.getDelta();
    },
  });
  const openMap = () => {
    if (bigMap.isOpen) { bigMap.close(); return; }
    if (customizer.open || dialog.busy) return;
    const w = locales.inside ? locales.proxy : active();
    input.paused = true;
    input.keys.clear();
    combat.trigger = false;
    engine.update(0, 0, false);
    sound.duck(true);
    bigMap.open({ x: w.pos.x, z: w.pos.y, heading: w.heading ?? active().heading }, missions.nav);
  };
  input.on('g', openMap);
  $('minimap-wrap').addEventListener('click', openMap);

  window.__game = {
    renderer, scene, camera, player, traffic, peds, fotoGente, onFoot, colliders, roadNames, map, input,
    toggleFoot, getMode: () => mode, parkedCars, parked, props, minimap, dayNight, landmarks, postfx, police, combat, dialog, missions, graph, customizer, story,
    coast: comun.coast, roundabouts: comun.roundabouts, civic: comun.civic, shops: comun.shops, cityDetail: comun.cityDetail,
    sound, engine, ambience, locales, terrace, dogs, skaters, volcano, stones, mayor,
    regatta: centro.regatta, charco: centro.charco, calleReal: centro.calleReal, parqueRamirez: centro.parqueRamirez, senales: comun.senales, terrainY, terrainUniforms, bigMap, openMap, flatAdded, flatMs, slimMB, freedMB, facadePhotos,
    setTime: (h) => { gameMinutes = h * 60; },
    setDay: (d) => { gameDay = d; },
    cielo, overWater,
    step: (dt, fakeInput) => stepFrame(dt, fakeInput),
    // para las pruebas de los coches (pruebas/tcoche.cjs)
    setCam: (k) => { camMode = k; }, blink: (side) => setBlink(side), makeCar, kit: { addDoor, addCockpit, swingDoor }, walkRise,
    pick: (nx, ny) => {
      const rc = new THREE.Raycaster();
      rc.setFromCamera(new THREE.Vector2(nx, ny), camera);
      return rc.intersectObjects(scene.children, true).slice(0, 4).map(h => {
        const path = [];
        for (let o = h.object; o && path.length < 4; o = o.parent) path.push(o.name || o.type);
        return `${h.distance.toFixed(2)} ${path.join('<')} vis=${h.object.visible}`;
      });
    },
  };

  const foodSigns = (map.signs || []).filter(s => s.k === 'food');
  let lastFood = '', lastFoodT = 0;
  const landmarkHints = [
    { x: -440, z: 560, name: 'Arrecife Gran Hotel', r: 55 },
    { x: 420, z: 40, name: 'El Charco de San Ginés', r: 70 },
    { x: -450, z: 480, name: 'Playa del Reducto', r: 60 },
  ];
  let lastLandmark = '', lastLandmarkT = 0;

  function setCarLights(n) {
    player.mesh?.userData?.setLights?.(n);
    for (const c of traffic.cars) c.mesh?.userData?.setLights?.(n);
    for (const p of parkedCars) p.mesh?.userData?.setLights?.(n);
    parked.setLights(n);
  }

  // la cámara no se mete en los edificios: si hay una pared entre el coche y la cámara, se acerca
  // y sube un poco para seguir viendo el coche desde arriba (los muros bajos de la costa no cuentan)
  const CAM_SKIP = new Set(['coast', 'bridge', 'sculpture']);
  let camPull = 0;
  let camSlope = 0;   // pendiente de la calle que sigue la cámara, suavizada
  function pullCamera(v, px, pz, lift) {
    const dx = v.x - px, dz = v.z - pz, L = Math.hypot(dx, dz);
    if (L < 0.8) return 0;
    const t = colliders.rayHit(px, pz, v.x, v.z, CAM_SKIP);
    if (t >= 1) return 0;
    const keep = Math.max(0.6, t * L - 0.5) / L;
    v.x = px + dx * keep;
    v.z = pz + dz * keep;
    if (lift) v.y += (1 - keep) * 4.5;
    return 1 - keep;
  }

  // los coches que vas dejando tirados: como mucho 5; se retiran los más viejos que no tengas a la vista
  function tidyAbandoned(px, pz) {
    // (el roadster, la moto y el quad del garaje no se retiran)
    const own = parkedCars.filter(p => p.type !== 'tanqueta' && !GARAGE[p.type] && p.mesh !== player.mesh);
    if (own.length <= 5) return;
    const old = own.find(p => Math.hypot(p.x - px, p.z - pz) > 60);
    if (!old) return;
    scene.remove(old.mesh);
    parkedCars.splice(parkedCars.indexOf(old), 1);
  }

  const thrusters = new Thrusters(scene);
  // las bocanadas son sprites: en el pase de oclusión salían como cuadros negros alrededor del roadster
  postfx.excludeFromAO(thrusters.group);
  function stepFrame(dt, fakeInput) {
    freezeT = Math.max(0, freezeT - dt);
    for (let i = later.length - 1; i >= 0; i--) if ((later[i].t -= dt) <= 0) later.splice(i, 1)[0].fn();
    updateDoors(dt);
    const inp = (combat.dead || customizer.open || freezeT > 0) ? { throttle: 0, steer: 0, handbrake: true } : (fakeInput || input);
    const now = performance.now() * 0.001;
    if (mode === 'car') player.update(dt, inp, colliders, map.meta.bounds);
    else onFoot.update(dt, inp, colliders);
    thrusters.update(dt, player, mode === 'car', night, inp.throttle || 0);
    // si la física se fuera a NaN (un golpe rarísimo, un borde del terreno), el coche
    // vuelve al último sitio bueno en vez de dejar el juego cortado con la pantalla helada
    if (mode === 'car') {
      if (Number.isFinite(player.pos.x) && Number.isFinite(player.pos.y) && Number.isFinite(player.heading)) {
        lastGood.set(player.pos.x, player.pos.y); lastGoodH = player.heading; lastGoodOk = true;
      } else if (lastGoodOk) {
        player.pos.set(lastGood.x, lastGood.y);
        player.heading = lastGoodH;
        player.vel.set(0, 0);
      }
    }
    // el mar es de verdad: el coche que cae al agua se hunde y se sigue a nado
    if (mode === 'car' && player.air < 1.2 && overWater(player.pos.x, player.pos.y)) {
      carSink += dt;
      player.vel.multiplyScalar(Math.max(0, 1 - dt * 2.2));
      player.mesh.position.y -= Math.min(2.4, carSink * 1.2);
      if (carSink > 1.4) {
        const sunkMesh = player.mesh;
        dropRider();
        player.mesh.userData.indicate?.(false, false);
        player.detach();   // el coche se queda en el fondo (no vuelve a la lista de aparcados)
        sunkMesh.position.y = -2.6;
        later.push({ t: 4, fn: () => scene.remove(sunkMesh) });
        onFoot.placeAt(player.pos.x, player.pos.y, player.heading);
        footPrev.set(player.pos.x, player.pos.y);
        onFoot.mesh.visible = true;
        mode = 'foot';
        carSink = 0;
        freezeT = 0.3;
        toast('¡Al agua! El coche se ha hundido');
      }
    } else {
      carSink = 0;
    }
    syncRider();
    // cuestas: al caer de un cambio de rasante, golpe de la suspensión
    if (mode === 'car' && player.landed > 0.15) props.onHit?.(player.landed * 0.7, 'car');
    const act = active();
    // atropellar mobiliario: el coche lo lanza y pierde algo de velocidad; a pie se le da una patada
    let vx = act.vel.x, vz = act.vel.y;
    if (mode !== 'car') {
      const jump = act.pos.distanceTo(footPrev) > 2; // al bajarse del coche
      vx = jump ? 0 : (act.pos.x - footPrev.x) / dt; vz = jump ? 0 : (act.pos.y - footPrev.y) / dt;
    }
    footPrev.copy(act.pos);
    // dentro de un local, la calle sigue a lo suyo alrededor de la puerta
    const world = locales.inside ? locales.proxy : act;
    // en pleno turbo salto el roadster pasa por encima de todo
    const flying = mode === 'car' && player.air > 1.5;
    const slow = props.update(dt, combat.dead || locales.inside || flying ? null : {
      x: act.pos.x, z: act.pos.y, vx, vz, car: mode === 'car', r: mode === 'car' ? player.RADIUS : 0.35,
    });
    if (slow > 0 && mode === 'car') player.vel.multiplyScalar(1 - slow);
    comun.senales?.update(dt);
    traffic.update(dt, world);
    parked.update(dt, world.pos.x, world.pos.y, parkedCars);
    const bump = combat.dead || locales.inside || flying ? 0 : parked.collide(act, mode === 'car', parkedCars);
    if (bump > 1.5) props.onHit?.(Math.min(1, bump / 14), 'car');
    if (bump > 9 && mode === 'car') act.crashPulse = 1;
    if (lightTick <= 0) tidyAbandoned(world.pos.x, world.pos.y);
    const crowd = { driving: mode === 'car', carSpeed: player.speed, carVel: player.vel, flying };
    peds.update(dt, world, crowd);
    fotoGente.update(dt, world, camera, crowd);
    dogs.update(dt, world, crowd);
    skaters.update(dt, world, crowd);
    centro.beach?.update(dt, world.pos.x, world.pos.y);
    centro.regatta.update(dt, now, world.pos.x, world.pos.y);
    centro.charco?.update(now, world.pos.x, world.pos.y);
    centro.calleReal?.update();
    comun.roundabouts.update(dt, world.pos.x, world.pos.y);
    comun.civic.update(dt, world.pos.x, world.pos.y);
    centro.fortBridge.update(dt);
    comun.shops.update(dt);
    // la tiendita del chino: aviso al llegar a la puerta
    const atShop = mode === 'foot' && comun.shops.nearShop(onFoot.pos.x, onFoot.pos.y);
    if (atShop && !wasAtShop) toast('La tiendita del chino · pulsa T para hacer un parón');
    wasAtShop = atShop;
    police.update(dt, world, { playerSpeed: mode === 'car' ? player.speed : onFoot.speed });
    combat.update(dt, act, mode);
    story.update(dt, world, mode, combat.trigger && !combat.dead && !customizer.open && !locales.inside);
    missions.update(dt, world);
    dialog.update(dt);
    locales.update(dt, onFoot, mode, act);
    terrace?.update();
    office.update();
    maccheroni.update();
    buganvillas.update();
    farmacia.update();
    escuelaZerolo.update();
    esquinaMillares.update();
    centro.parqueRamirez.update();
    centro.atlantida.update();
    centro.charcoEntrada.update();
    centro.ayuntamiento.update();
    stones.update(now, act.pos.x, act.pos.y, { car: mode === 'car', blocked: !!locales.inside || combat.dead });
    touchControls?.update(mode, customizer.open || combat.dead, story.waterReady(mode) ? 'Agua' : 'Disparar', locales.enterLabel, !!player.JUMP && !player.jump);
    // golpe fuerte contra un edificio: daño
    if (act.crashPulse > 0.9 && wasCrash <= 0.9) combat.hurt(4 + player.speed * 0.3);
    wasCrash = act.crashPulse;
    actionHud.update(dt, { health: combat.health, wanted: police.wanted, mode: locales.inside ? 'inside' : mode, bust: police.bustT / 2, lostT: police.lostT });
    animate?.(now);
    streetPhotos?.update?.(world.pos.x, world.pos.y);
    facadePhotos?.update?.(world.pos.x, world.pos.y);
    engine.update(mode === 'car' ? player.speed : 0, mode === 'car' ? inp.throttle : 0, mode === 'car' && !combat.dead,
      mode === 'car' ? THREE.MathUtils.clamp(player.slope * 10 * Math.sign(player.forwardSpeed || 1), -1, 1) : 0);
    ambience.update(dt, world.pos.x, world.pos.y, mode === 'car', !!locales.inside);

    if (mode === 'foot' && !locales.inside) {
      for (const s of foodSigns) {
        const d = Math.hypot(s.x - act.pos.x, s.z - act.pos.y);
        if (d < 5 && (s.name !== lastFood || now - lastFoodT > 25)) {
          lastFood = s.name;
          lastFoodT = now;
          toast(s.name);
          break;
        }
      }
    }

    for (const L of locales.inside ? [] : landmarkHints) {
      const d = Math.hypot(L.x - act.pos.x, L.z - act.pos.y);
      if (d < L.r && (L.name !== lastLandmark || now - lastLandmarkT > 40)) {
        lastLandmark = L.name;
        lastLandmarkT = now;
        toast(L.name);
        break;
      }
    }

    // ciclo día/noche (mueve el sol)
    const prevMinutes = gameMinutes;
    gameMinutes = (gameMinutes + dt * 1.2) % 1440;
    if (gameMinutes < prevMinutes - 700) gameDay++;   // medianoche: otro día (avanza la fase de la luna)
    night = dayNight.update(gameMinutes, act.pos.x, act.pos.y);
    // el disco del sol, la luna con su fase y la lluvia; lloviendo, menos luz y el cielo gris
    const rain = cielo.update(dt, gameMinutes, gameDay, camera.position, dayNight.sunDir, night);
    if (rain > 0.02) {
      sun.intensity *= 1 - 0.7 * rain;
      hemi.intensity *= 1 - 0.2 * rain;
      if (scene.fog) {
        scene.fog.color.lerp(rainGrey, 0.5 * rain);
        if (scene.fog.isFogExp2) scene.fog.density *= 1 + 1.25 * rain;
      }
    }
    // en el campo de arriba (casaCampo.js) se ve lejos: Arrecife, el Gran Hotel y el mar a 4 km, como en las fotos
    // desde la casa; la cámara llega más lejos y la neblina es más clara
    const farK = THREE.MathUtils.clamp((-2450 - act.pos.y) / 400, 0, 1);
    if (scene.fog?.isFogExp2) scene.fog.density *= 1 - 0.45 * farK;
    const far = 3000 + 3000 * farK;
    if (Math.abs(camera.far - far) > 1) { camera.far = far; camera.updateProjectionMatrix(); }
    // dentro de un local manda la luz de los plafones, sea de día o de noche
    if (locales.inside) locales.light({ sun, hemi, fill, renderer }, act.pos.x, act.pos.y);
    landmarks?.setNight?.(night);
    streetlights?.userData?.updateLamps?.(world.pos.x, world.pos.y, night, dt);
    if (streetGlowMat) streetGlowMat.opacity = THREE.MathUtils.smoothstep(night, 0.04, 0.3) * 0.4;
    lightTick -= dt;
    if (lightTick <= 0) {
      lightTick = 0.5;
      setCarLights(night);
    }
    // faros del jugador
    if (mode === 'car' && headlamps.group.parent !== player.mesh) player.mesh.add(headlamps.group);
    headlamps.group.visible = mode === 'car';
    headlamps.set(THREE.MathUtils.smoothstep(night, 0.1, 0.4), mode === 'car' && inp.throttle < 0);

    // cuestas: todo se dibuja respecto a la altura del terreno bajo el jugador (terrain.js)
    // (dentro de un local, la altura del propio local: con la de la puerta de la calle el suelo de dentro se
    // pintaba más abajo y la cámara quedaba casi en el techo)
    terrainUniforms.terrainBase.value = terrainY(act.pos.x, act.pos.y);
    terrainTick -= dt;
    if (terrainTick <= 0) { terrainTick = 2; wrapScene(scene); }

    // camera
    const c0 = mode === 'car' ? CAMS[camMode] : locales.inside ? { back: 3.2, up: 1.75, look: 1.35 } : { back: 4.2, up: 1.9, look: 1.3 };
    // la tanqueta es enorme: cámara más alta y más atrás
    const c = mode === 'car' && player.type === 'tanqueta'
      ? { back: camMode === 2 ? -1.6 : c0.back * 1.6, up: camMode === 2 ? 2.7 : c0.up * 1.55, look: c0.look * 1.9 }
      : c0;
    const f = act.forward();
    // cuestas: la cámara se inclina solo un poco con la calle (un tercio de la pendiente del coche o del
    // suelo que pisas): si se inclinara del todo, la calle se vería llana; así se ve subir o bajar delante
    const slopeNow = mode === 'car' ? player.slope
      : (terrainY(act.pos.x + f.x * 2, act.pos.y + f.y * 2) - terrainY(act.pos.x - f.x * 2, act.pos.y - f.y * 2)) / 4;
    const camTilt = THREE.MathUtils.clamp(slopeNow, -0.3, 0.3) * 0.35;
    camSlope = locales.inside ? 0 : camSlope + (camTilt - camSlope) * Math.min(1, dt * 3);
    const lift = mode === 'car' ? player.air : 0;   // en un salto, la cámara acompaña al coche
    // en el turbo salto sube del todo, algo por encima y más atrás: se ve el coche volar y la ciudad debajo
    const boost = mode === 'car' && player.jump ? Math.min(1, player.air / 3) : 0;
    const back = c.back + boost * 3.5;
    // por los tejados la cámara sube del todo con el coche; en los saltitos de los cambios de rasante, algo menos
    const follow = Math.max(Math.min(1, 0.6 + lift * 0.2), 0.6 + 0.5 * boost);
    const desired = new THREE.Vector3(act.pos.x - f.x * back, c.up - camSlope * c.back + lift * follow + boost * 2.5, act.pos.y - f.y * back);
    const stiff = (mode === 'car' && camMode === 2) ? 1 : Math.min(1, dt * (mode === 'car' ? 4.5 + boost * 4 : 6));
    // sentado a la mesa: la cámara al otro lado y algo de lado, para ver la cara y el plato
    const seated = mode === 'foot' && onFoot.sitting;
    if (seated) desired.set(act.pos.x + f.x * 1.75 + f.y * 0.9, 1.7, act.pos.y + f.y * 1.75 - f.x * 0.9);
    // dentro, la cámara no atraviesa las paredes de la sala; al cruzar la puerta, salta con el personaje
    locales.clampCamera(desired, act.pos.x, act.pos.y, !seated);
    // por encima de los tejados no hay paredes que esquivar
    const high = lift > 4;
    const pulled = locales.inside || high ? 0 : pullCamera(desired, act.pos.x, act.pos.y, true);
    camPull += (pulled - camPull) * Math.min(1, dt * 5);
    if (locales.consumeJump()) camPos.copy(desired);
    camPos.lerp(desired, stiff);
    locales.clampCamera(camPos, act.pos.x, act.pos.y);
    if (!locales.inside && !high) pullCamera(camPos, act.pos.x, act.pos.y, false);
    shakeAmt = Math.max(act.crashPulse * 0.35, shakeAmt - dt * 2);
    camera.position.copy(camPos);
    if (shakeAmt > 0.01) {
      camera.position.x += (Math.random() - 0.5) * shakeAmt;
      camera.position.y += (Math.random() - 0.5) * shakeAmt * 0.6;
    }
    // con una pared detrás, la cámara (más cerca y más alta) mira hacia abajo, al coche
    const ahead = (mode === 'car' ? 6 : 3) * (1 - 0.85 * camPull);
    camTarget.set(
      act.pos.x + f.x * ahead,
      c.look - 0.7 * camPull + camSlope * ahead + lift,
      act.pos.y + f.y * ahead,
    );
    if (seated) camTarget.set(act.pos.x + f.x * 0.45, 0.95, act.pos.y + f.y * 0.45);
    camera.lookAt(camTarget);
    if (photo !== null) {
      if (!params.has('orbit')) photo += dt * 0.25;
      const a = act.heading + photo;
      const R = mode === 'foot' ? 3.3 : 6.2;
      // con el menú abierto el personaje queda a la izquierda, libre del panel
      camera.position.set(act.pos.x + Math.sin(a) * R, mode === 'foot' ? 1.35 : 1.45, act.pos.y + Math.cos(a) * R);
      locales.clampCamera(camera.position, act.pos.x, act.pos.y);
      camera.lookAt(act.pos.x, mode === 'foot' ? 1.0 : 0.75, act.pos.y);
      if (customizer.open) camera.translateX(0.9);
    }
    // primera persona: los ojos del conductor, dentro del coche, mirando por el parabrisas
    const cockpit = mode === 'car' && camMode === 3 && photo === null ? addCockpit(player.mesh) : null;
    if (fpCockpit && fpCockpit !== cockpit) fpCockpit.inside(false);
    fpCockpit = cockpit;
    // desde dentro, la oclusión ambiental no debe ver la carrocería que te rodea (lo oscurecería todo)
    const aoCar = cockpit ? player.mesh : null;
    if (aoCar !== fpAoCar) {
      if (fpAoCar) postfx.aoHidden.splice(postfx.aoHidden.indexOf(fpAoCar), 1);
      if (aoCar) postfx.aoHidden.push(aoCar);
      fpAoCar = aoCar;
    }
    if (cockpit) {
      cockpit.inside(true);
      player.body.updateWorldMatrix(true, false);
      const eye = player.body.localToWorld(cockpit.eye.clone());
      camera.position.copy(eye);
      if (shakeAmt > 0.01) {
        camera.position.x += (Math.random() - 0.5) * shakeAmt * 0.2;
        camera.position.y += (Math.random() - 0.5) * shakeAmt * 0.12;
      }
      camTarget.set(eye.x + f.x * 12, eye.y - 0.75 + player.slope * 12, eye.z + f.y * 12);
      camera.lookAt(camTarget);
      // al volver a la cámara de fuera, que no salga volando desde el asiento
      camPos.copy(desired);
      cockpit.update(dt, {
        steer: player.steerVis, kmh: player.forwardSpeed * 3.6, reverse: player.forwardSpeed < -0.5,
        left: false, right: false, lights: night > 0.35, // sin intermitentes desde la Version 71
      });
    }
    camera.near = cockpit ? 0.05 : 0.3;
    const targetFov = cockpit ? 68 + Math.min(10, player.speed * 0.2) : mode === 'car' ? 58 + Math.min(16, player.speed * 0.32) : 58;
    camera.fov += (targetFov - camera.fov) * dt * 3;
    // cámara fija para las fotos de prueba
    const ov = window.__game?.camOverride;
    if (ov) { camera.position.set(...ov.pos); camera.lookAt(...ov.look); camera.fov = ov.fov || 60; }
    camera.updateProjectionMatrix();

    // cielo, estrellas y nubes acompañan a la cámara
    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
    clouds.position.x = camera.position.x;
    clouds.position.z = camera.position.z;
    cloudsMat.uniforms.time.value = now;
    volcano.update(camera, night, now, scene.fog?.color);
    skyEnv.update(dayNight.sunDir, night);
    postfx.update(locales.inside ? 0.12 : night, now);

    // HUD
    const kmh = Math.round((mode === 'car' ? player.speed : onFoot.speed) * 3.6);
    $('speed').textContent = kmh;
    if (gauge) gauge.style.strokeDashoffset = GAUGE_LEN * (1 - Math.min(1, kmh / 180));
    streetTimer -= dt;
    if (streetTimer <= 0) {
      streetTimer = 0.4;
      const name = locales.inside ? locales.inside.name : roadNames.nearestData(act.pos.x, act.pos.y, 25) || '';
      // en los cruces el nombre se perdía un instante y parpadeaba: se mantiene un poco el último
      streetHold = name ? 2 : streetHold - 0.4;
      if (name && name !== lastStreet) {
        lastStreet = name;
        $('street-name').textContent = name;
      }
      $('street').classList.toggle('on', streetHold > 0 && !!lastStreet);
      // encima del nombre, la cuesta de verdad (IGN, sin exagerar) en el sentido de la marcha
      const fw = act.forward();
      if (mode === 'car' && !locales.inside && contramano.check(act.pos.x, act.pos.y, fw.x, fw.y, player.forwardSpeed, 0.4)) toast('Dirección prohibida: vas a contramano');
      const rise = locales.inside ? 0
        : (realHeight(act.pos.x + fw.x * 5, act.pos.y + fw.y * 5) - realHeight(act.pos.x - fw.x * 5, act.pos.y - fw.y * 5)) / 10;
      const pct = Math.round(Math.abs(rise) * 100);
      streetZone.textContent = pct >= 3 ? `${rise > 0 ? '▲ Sube' : '▼ Baja'} un ${pct} %` : 'Arrecife · Lanzarote';
      streetZone.classList.toggle('slope', pct >= 3);
    }
    const hh = String(Math.floor(gameMinutes / 60)).padStart(2, '0');
    const mm = String(Math.floor(gameMinutes % 60)).padStart(2, '0');
    const period = dayNight.label(gameMinutes);
    $('clock').textContent = hh + ':' + mm;
    if (period !== lastPeriod) {
      lastPeriod = period;
      const place = $('clockwrap')?.querySelector?.('.place');
      if (place) place.textContent = period ? `Arrecife · ${period}` : 'Islas Canarias';
    }

    // GPS: ruta hasta el destino de la misión, encargos y policía en el minimapa
    const ms = missions.active;
    minimap.draw({
      x: world.pos.x, z: world.pos.y, heading: act.heading, t: now, dt,
      speed: mode === 'car' ? player.speed : onFoot.speed,
      street: streetHold > 0 ? lastStreet : '',
      nav: missions.nav,
      checkpoints: ms?.kind === 'carrera' ? ms.points.slice(ms.idx + 1) : null,
      givers: ms ? null : missions.givers,
      police: police.wanted > 0 ? police.cars.filter(c => c.active) : null,
      places: locales.places,
    });

    postfx.render();
  }

  // si el aparato se queda sin memoria, el navegador apaga el 3D: se avisa y se sigue en la misma calle con menos calidad
  const lost = $('lost');
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost.classList.add('on');
    lost.querySelector('button').focus();
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => lost.classList.remove('on'));
  lost.querySelector('button').addEventListener('click', () => {
    const u = new URL(location.href);
    u.searchParams.set('q', 'low');
    u.searchParams.set('auto', '');
    if (lastStreet) u.searchParams.set('start', lastStreet);
    if (demo) u.searchParams.set('demo', '');
    location.replace(u.toString());
  });

  // si algo falla en un fotograma, el juego sigue: antes un solo error lo dejaba congelado para siempre.
  // y si el MISMO error se repite sin parar (el juego se vería "cortado": la pantalla quieta), se intenta
  // curar solo recolocando al jugador en el último sitio bueno; si ni así, se ofrece seguir en la misma calle
  // pausa (Esc, o Menú en el mando): el juego se para como con el mapa abierto
  let pausa = false;
  const pausaEl = $('pausa');
  const setPausa = (on) => {
    pausa = on;
    pausaEl?.classList.toggle('on', on);
    input.paused = on;
    input.keys.clear();
    combat.trigger = false;
    if (on) engine.update(0, 0, false);
    sound.duck(on);
    if (!on) clock.getDelta();
  };
  pausaEl?.querySelector('button')?.addEventListener('click', () => setPausa(false));
  // en la fase de captura: así, con el mapa abierto, Esc solo lo cierra (lo hace bigMap después)
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.repeat) return;
    if (pausa) { setPausa(false); return; }
    if (bigMap.isOpen || customizer.open || locales.inside || combat.dead) return;
    setPausa(true);
  }, true);

  const seenErrors = new Set();
  let errRun = 0;
  // fotogramas de verdad por segundo: con menos de 24 durante 8 s seguidos se baja un escalón de calidad
  // (al arrancar hay 10 s de margen: los primeros tirones son de preparar los gráficos)
  let fpsFrames = 0, fpsT0 = performance.now(), slowSecs = -10;
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    fpsFrames++;
    const now = performance.now();
    if (now - fpsT0 >= 1000) {
      const fps = (fpsFrames * 1000) / (now - fpsT0);
      fpsFrames = 0;
      fpsT0 = now;
      slowSecs = fps < 24 && !bigMap.isOpen && !document.hidden ? slowSecs + 1 : 0;
      if (autoQuality && slowSecs >= 8 && qualityIdx > 0) {
        qualityIdx--;
        slowSecs = -20;
        toast(applyQ().label + ' · bajada sola para que vaya fluido (Q para cambiarla)');
      }
    }
    try {
      if (!bigMap.isOpen && !pausa) stepFrame(dt);
      // los interiores y los coches nuevos se montan sobre la marcha: se aligeran también
      if (touch && (slimTimer -= dt) < 0) { slimTimer = 4; slimTextures(scene); }
      errRun = 0;
    } catch (err) {
      const key = String(err?.message || err);
      window.__lastError = key;
      errRun++;
      if (!seenErrors.has(key)) {
        seenErrors.add(key);
        console.error(err);
        toast('Ha fallado algo, pero el juego sigue');
      }
      if (errRun === 45) {
        // un segundo y medio fallando seguido: recolocación de emergencia
        try {
          carSink = 0;
          freezeT = 0;
          if (lastGoodOk) {
            if (mode === 'car') {
              player.pos.set(lastGood.x, lastGood.y);
              player.heading = lastGoodH;
              player.vel.set(0, 0);
            } else {
              onFoot.placeAt(lastGood.x, lastGood.y, lastGoodH);
              footPrev.set(lastGood.x, lastGood.y);
            }
          }
          toast('El juego se ha recolocado solo');
        } catch { /* si tampoco se puede, el cartel de abajo */ }
      }
      if (errRun === 150) {
        // sigue fallando: el cartel con el botón de seguir en la misma calle (con el porqué)
        const d = $('lost-d');
        if (d) d.textContent = 'El juego se ha atascado (' + key.slice(0, 120) + '). Pulsa y sigues en la misma calle.';
        const t = $('lost-t');
        if (t) t.textContent = 'El juego se ha atascado';
        lost.classList.add('on');
      }
      try { postfx.render(); } catch { /* este fotograma se queda sin pintar */ }
    }
  }
  frame();
}

init().catch(err => {
  console.error(err);
  setProgress('Error: ' + err.message, 100);
});
