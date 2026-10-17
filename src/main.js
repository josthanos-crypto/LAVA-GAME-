import * as THREE from 'three';
import { loadMap, buildWorld, setupLights } from './world.js';
import { PlayerCar } from './car.js';
import { Traffic } from './traffic.js';
import { Peds } from './peds.js';
import { OnFoot, CHARACTERS, getLook, setLook } from './character.js';
import { Minimap } from './minimap.js';
import { Props, propLayout, makeHitSound } from './props.js';
import { ParkedCars } from './parked.js';
import { buildCoast } from './coast.js';
import { buildBeach } from './beach.js';
import { buildRoundabouts } from './roundabouts.js';
import { buildCivic } from './civic.js';
import { buildSanGines } from './sanGines.js';
import { buildFortBridge } from './fortBridge.js';
import { buildShops } from './shops.js';
import { buildCityDetail } from './cityDetail.js';
import { modelName, prewarmCars } from './carModels.js';
import { Input } from './input.js';
import { EngineSound } from './audio.js';
import { Ambience } from './ambience.js';
import { sound } from './sound.js';
import { buildStreetPhotos } from './streetPhotos.js';
import { buildFacadePhotos } from './facadePhotos.js';
import { buildLandmarks } from './landmarks.js';
import { DayNight } from './dayNight.js';
import { QUALITY_ORDER, applyQuality } from './quality.js';
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
import { LOCAL_DEFS, buildTanatorioFacade, tuneTanatorio } from './localesData.js';
import { buildTerrace } from './terrace.js';
import { Dachshunds } from './dogs.js';
import { Skaters } from './skaters.js';

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
      for (const s of lamps) s.intensity = night * 260;
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
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  const map = await loadMap(setProgress);
  // los clientes llevan su propio rótulo: el genérico del mapa no se pinta
  claimSigns(map, LOCAL_DEFS);
  // el tanatorio es una casa terrera blanca de una planta
  tuneTanatorio(map);
  const { sun, hemi, fill, sky, stars, clouds, cloudsMat } = setupLights(scene, map.meta.bounds);
  // reflejos de entorno sacados del propio cielo (se rehacen al moverse el sol)
  const skyEnv = new SkyEnvironment(renderer, scene, sky);
  const postfx = new PostFX(renderer, scene, camera);

  const { colliders, roadNames, animate, streetHeadMat, streetGlowMat, noAO, streetlights } =
    buildWorld(scene, map, setProgress, renderer);
  postfx.excludeFromAO(sky, stars, clouds, ...noAO);
  const landmarks = buildLandmarks(scene, map, setProgress);
  const streetPhotos = await buildStreetPhotos(scene, setProgress);
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
  let gameMinutes = params.has('t') ? Number(params.get('t')) * 60 : 11 * 60 + 30;
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
  const player = new PlayerCar(scene, spawn.x, spawn.z, spawn.heading);
  const traffic = new Traffic(scene, map.roads);
  // coches aparcados por las calles (se pueden robar); en el móvil, menos
  const parked = new ParkedCars(scene, map, { max: touch ? 8 : 14, colliders });
  // gente por la calle (en el móvil, la mitad)
  const peds = new Peds(scene, map.roads, { count: touch ? 64 : 150 });
  const onFoot = new OnFoot(scene);
  const headlamps = makeHeadlamps();
  peds.colliders = colliders;
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
  // la orilla cerrada (menos el muro de la misión, que es el que cede)
  const coast = buildCoast(scene, map, colliders, { skip: [story.site.wallLine] });
  // la playa del Reducto con su gente
  const beach = buildBeach(scene, map, { few: touch });
  const roundabouts = buildRoundabouts(scene, colliders);
  const civic = buildCivic(scene, map);
  buildSanGines(scene, map, colliders);
  const fortBridge = buildFortBridge(scene, map, colliders);
  const shops = buildShops(scene, map, colliders);
  const cityDetail = buildCityDetail(scene, map);
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
  // fachada del tanatorio y la oficina de Canary Consulting en el lateral (como en las fotos)
  const office = buildTanatorioFacade(scene, colliders);
  // terrazas techadas del Reducto (antes que los muebles que salen volando: añade sus mesas de fuera)
  const terrace = buildTerrace(scene, map, colliders, { locales, touch });
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
  const minimap = new Minimap($('minimap'), map, graph);
  const input = new Input();
  const engine = new EngineSound();
  // sillas, mesas, sombrillas, bancos y papeleras que salen volando
  const props = new Props(scene, propLayout(map), colliders);
  props.onHit = makeHitSound();
  // de fondo, la ciudad y, cerca de la orilla, las olas
  const ambience = new Ambience(map);
  const footPrev = new THREE.Vector2();
  const touchControls = touch ? new TouchControls($('touch'), input) : null;

  // camera modes: 0 chase, 1 far, 2 hood
  let camMode = 0;
  const CAMS = [
    { back: 7.2, up: 2.5, look: 1.25 },
    { back: 13, up: 5.2, look: 1.2 },
    { back: -0.4, up: 1.3, look: 1.1 },
  ];
  input.on('c', () => { camMode = (camMode + 1) % CAMS.length; toast(['Cámara cercana', 'Cámara lejana', 'Vista capó'][camMode]); });
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
    if (shops.nearShop(onFoot.pos.x, onFoot.pos.y)) { paron(); return; }
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
    qualityIdx = (qualityIdx + 1) % QUALITY_ORDER.length;
    toast(applyQ().label);
  });

  const toggleFoot = () => {
    if (mode === 'car') {
      if (player.speed > 3) { toast('Frena antes de bajar'); return; }
      const f = player.forward();
      parkedCars.push(player.detach());
      onFoot.placeAt(player.pos.x + f.y * 2.3, player.pos.y - f.x * 2.3, player.heading);
      onFoot.mesh.visible = true;
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
      onFoot.mesh.visible = false;
      mode = 'car';
      toast('Al volante');
      return;
    }
    const pk = parked.take(onFoot.pos.x, onFoot.pos.y, 3.6);
    if (pk) {
      player.adopt(pk);
      onFoot.mesh.visible = false;
      mode = 'car';
      toast('¡Coche mangado! · ' + modelName(pk.type));
      return;
    }
    const jacked = traffic.jackNearest(onFoot.pos.x, onFoot.pos.y, 4.2);
    if (jacked) {
      player.adopt(jacked);
      onFoot.mesh.visible = false;
      mode = 'car';
      toast('¡Coche mangado! · ' + modelName(jacked.type));
      return;
    }
    toast('No hay ningún coche cerca');
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
      player.adopt({ type: 'sport', color: 0xd8271c, brand: true, x: spawn.x, z: spawn.z, heading: spawn.heading });
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

  setProgress('Listo', 100);
  $('start-btn').style.display = 'inline-block';
  $('load-status').textContent = 'Arrecife cargado — ' + map.meta.roads + ' calles reales · ' + map.meta.buildings + ' edificios';

  const autoStart = params.has('auto');
  await new Promise(resolve => {
    if (autoStart) {
      $('loader').classList.add('hidden');
      $('hud').classList.add('on');
      resolve();
      return;
    }
    $('start-btn').addEventListener('click', () => {
      engine.start();
      if (touch) goFullscreen();
      $('loader').classList.add('hidden');
      $('hud').classList.add('on');
      setTimeout(() => toast('Misión principal: busca la columna morada'), 1500);
      resolve();
    }, { once: true });
  });

  let streetTimer = 0, lastStreet = '', streetHold = 0;
  let lastPeriod = '';
  const f0 = player.forward();
  const camPos = new THREE.Vector3(player.pos.x - f0.x * 7.2, 2.5, player.pos.y - f0.y * 7.2);
  const camTarget = new THREE.Vector3();
  let shakeAmt = 0;
  let lightTick = 0;
  let night = 0;
  const gauge = $('gauge-arc');
  const GAUGE_LEN = 100; // pathLength del arco

  const clock = new THREE.Clock();

  window.__game = {
    renderer, scene, camera, player, traffic, peds, onFoot, colliders, roadNames, map, input,
    toggleFoot, getMode: () => mode, parkedCars, parked, props, minimap, dayNight, landmarks, postfx, police, combat, dialog, missions, graph, customizer, story, coast, roundabouts, civic, shops, cityDetail,
    sound, engine, ambience, locales, terrace, dogs, skaters,
    setTime: (h) => { gameMinutes = h * 60; },
    step: (dt, fakeInput) => stepFrame(dt, fakeInput),
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

  // los coches que vas dejando tirados: como mucho 5; se retiran los más viejos que no tengas a la vista
  function tidyAbandoned(px, pz) {
    const own = parkedCars.filter(p => p.type !== 'tanqueta' && p.mesh !== player.mesh);
    if (own.length <= 5) return;
    const old = own.find(p => Math.hypot(p.x - px, p.z - pz) > 60);
    if (!old) return;
    scene.remove(old.mesh);
    parkedCars.splice(parkedCars.indexOf(old), 1);
  }

  function stepFrame(dt, fakeInput) {
    const inp = (combat.dead || customizer.open) ? { throttle: 0, steer: 0, handbrake: true } : (fakeInput || input);
    const now = performance.now() * 0.001;
    if (mode === 'car') player.update(dt, inp, colliders, map.meta.bounds);
    else onFoot.update(dt, inp, colliders);
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
    const slow = props.update(dt, combat.dead || locales.inside ? null : {
      x: act.pos.x, z: act.pos.y, vx, vz, car: mode === 'car', r: mode === 'car' ? player.RADIUS : 0.35,
    });
    if (slow > 0 && mode === 'car') player.vel.multiplyScalar(1 - slow);
    traffic.update(dt, world);
    parked.update(dt, world.pos.x, world.pos.y, parkedCars);
    const bump = combat.dead || locales.inside ? 0 : parked.collide(act, mode === 'car', parkedCars);
    if (bump > 1.5) props.onHit?.(Math.min(1, bump / 14), 'car');
    if (bump > 9 && mode === 'car') act.crashPulse = 1;
    if (lightTick <= 0) tidyAbandoned(world.pos.x, world.pos.y);
    const crowd = { driving: mode === 'car', carSpeed: player.speed, carVel: player.vel };
    peds.update(dt, world, crowd);
    dogs.update(dt, world, crowd);
    skaters.update(dt, world, crowd);
    beach?.update(dt, world.pos.x, world.pos.y);
    roundabouts.update(dt, world.pos.x, world.pos.y);
    civic.update(dt, world.pos.x, world.pos.y);
    fortBridge.update(dt);
    shops.update(dt);
    // la tiendita del chino: aviso al llegar a la puerta
    const atShop = mode === 'foot' && shops.nearShop(onFoot.pos.x, onFoot.pos.y);
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
    touchControls?.update(mode, customizer.open || combat.dead, story.waterReady(mode) ? 'Agua' : 'Disparar', locales.enterLabel);
    // golpe fuerte contra un edificio: daño
    if (act.crashPulse > 0.9 && wasCrash <= 0.9) combat.hurt(4 + player.speed * 0.3);
    wasCrash = act.crashPulse;
    actionHud.update(dt, { health: combat.health, wanted: police.wanted, mode: locales.inside ? 'inside' : mode, bust: police.bustT / 2, lostT: police.lostT });
    animate?.(now);
    streetPhotos?.update?.(world.pos.x, world.pos.y);
    facadePhotos?.update?.(world.pos.x, world.pos.y);
    engine.update(mode === 'car' ? player.speed : 0, mode === 'car' ? inp.throttle : 0, mode === 'car' && !combat.dead);
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
    gameMinutes = (gameMinutes + dt * 1.2) % 1440;
    night = dayNight.update(gameMinutes, act.pos.x, act.pos.y);
    // dentro de un local manda la luz de los plafones, sea de día o de noche
    if (locales.inside) locales.light({ sun, hemi, fill, renderer }, act.pos.x, act.pos.y);
    landmarks?.setNight?.(night);
    streetlights?.userData?.updateLamps?.(world.pos.x, world.pos.y, night, dt);
    if (streetGlowMat) streetGlowMat.opacity = THREE.MathUtils.smoothstep(night, 0.3, 0.7) * 0.32;
    lightTick -= dt;
    if (lightTick <= 0) {
      lightTick = 0.5;
      setCarLights(night);
    }
    // faros del jugador
    if (mode === 'car' && headlamps.group.parent !== player.mesh) player.mesh.add(headlamps.group);
    headlamps.group.visible = mode === 'car';
    headlamps.set(THREE.MathUtils.smoothstep(night, 0.35, 0.75), mode === 'car' && inp.throttle < 0);

    // camera
    const c0 = mode === 'car' ? CAMS[camMode] : locales.inside ? { back: 3.2, up: 1.75, look: 1.35 } : { back: 4.2, up: 1.9, look: 1.3 };
    // la tanqueta es enorme: cámara más alta y más atrás
    const c = mode === 'car' && player.type === 'tanqueta'
      ? { back: camMode === 2 ? -1.6 : c0.back * 1.6, up: camMode === 2 ? 2.7 : c0.up * 1.55, look: c0.look * 1.9 }
      : c0;
    const f = act.forward();
    const desired = new THREE.Vector3(act.pos.x - f.x * c.back, c.up, act.pos.y - f.y * c.back);
    const stiff = (mode === 'car' && camMode === 2) ? 1 : Math.min(1, dt * (mode === 'car' ? 4.5 : 6));
    // dentro, la cámara no atraviesa las paredes de la sala; al cruzar la puerta, salta con el personaje
    locales.clampCamera(desired, act.pos.x, act.pos.y, true);
    if (locales.consumeJump()) camPos.copy(desired);
    camPos.lerp(desired, stiff);
    locales.clampCamera(camPos, act.pos.x, act.pos.y);
    shakeAmt = Math.max(act.crashPulse * 0.35, shakeAmt - dt * 2);
    camera.position.copy(camPos);
    if (shakeAmt > 0.01) {
      camera.position.x += (Math.random() - 0.5) * shakeAmt;
      camera.position.y += (Math.random() - 0.5) * shakeAmt * 0.6;
    }
    camTarget.set(
      act.pos.x + f.x * (mode === 'car' ? 6 : 3),
      c.look,
      act.pos.y + f.y * (mode === 'car' ? 6 : 3),
    );
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
    const targetFov = mode === 'car' ? 58 + Math.min(16, player.speed * 0.32) : 58;
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

  function frame() {
    stepFrame(Math.min(clock.getDelta(), 0.05));
    requestAnimationFrame(frame);
  }
  frame();
}

init().catch(err => {
  console.error(err);
  setProgress('Error: ' + err.message, 100);
});
