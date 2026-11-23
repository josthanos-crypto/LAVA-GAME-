import * as THREE from 'three';

/**
 * Fotos reales pegadas a las fachadas de Argana Alta.
 *
 * Cada foto del manifiesto (public/map/argana_assets.json) dice en qué edificio
 * va y qué pared mira a la calle. Aquí se busca esa pared, se comprueba que la
 * normal sale hacia fuera del edificio y se pega un plano a 6 cm del muro.
 *
 * Las texturas ya vienen recortadas (solo fachada, sin cielo ni calzada) y
 * optimizadas a JPG. Se cargan solo las que están cerca del jugador y se
 * liberan al alejarse: no hay que tener 16 MB de fotogramas en la GPU.
 */

const MANIFIESTO = 'map/argana_assets.json';
const RADIO_CARGA = 120;     // m: se empiezan a cargar las fotos de alrededor
const RADIO_DESCARGA = 170;  // m: se sueltan las que quedan atrás
const PASO = 6;              // m: no se recalcula en cada fotograma
const SEPARACION = 0.16;     // m: por delante de la cornisa (12 cm) para que no la atraviese
const RESPALDO = 0.14;       // m: plano liso del color del muro, tapa ventanas y puertas detrás de la foto

function areaFirmada(pts) {
  let a = 0;
  for (let i = 0; i < pts.length - 1; i++) a += pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1];
  return a / 2;
}

/** punto dentro del polígono (para saber en qué edificio cae el ancla) */
function dentro(pts, x, z) {
  let dentro = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i], [xj, zj] = pts[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) dentro = !dentro;
  }
  return dentro;
}

function centroide(pts) {
  let x = 0, z = 0;
  for (const [a, b] of pts) { x += a; z += b; }
  return [x / pts.length, z / pts.length];
}

/** el edificio que contiene el punto o, si el mapa lo ha movido, el más cercano */
function buscarEdificio(map, at) {
  if (!at) return null;
  const [x, z] = at;
  const exacto = map.buildings.find((b) => dentro(b.p, x, z));
  if (exacto) return exacto;
  let mejor = null, mejorD = 18;
  for (const b of map.buildings) {
    const [cx, cz] = centroide(b.p);
    const d = Math.hypot(cx - x, cz - z);
    if (d < mejorD) { mejorD = d; mejor = b; }
  }
  return mejor;
}

/**
 * Paredes del edificio con la normal hacia FUERA. OSM mezcla polígonos
 * horarios y antihorarios: se usa el mismo criterio que world.js, que es el
 * que pinta las fachadas de verdad.
 */
function paredesDe(b) {
  const pts = b.p;
  if (!pts || pts.length < 4) return [];
  const out = areaFirmada(pts) >= 0 ? 1 : -1;
  const [bx, bz] = centroide(pts);
  const paredes = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i], [ex, ez] = pts[i + 1];
    const dx = ex - ax, dz = ez - az;
    const len = Math.hypot(dx, dz);
    if (len < 3) continue;
    let nx = (out * dz) / len, nz = (-out * dx) / len;
    const mx = (ax + ex) / 2, mz = (az + ez) / 2;
    // por si el polígono viniera raro: la normal tiene que alejarse del centro
    if ((mx - bx) * nx + (mz - bz) * nz < 0) { nx = -nx; nz = -nz; }
    paredes.push({ ax, az, bx: ex, bz: ez, dx, dz, len, nx, nz, mx, mz });
  }
  return paredes;
}

/**
 * ¿Hay calle delante de esta pared? Si a 1,5·3·6·9 m por delante hay otro
 * edificio, la pared está dentro de la manzana: la foto quedaría escondida
 * detrás de la fachada de al lado. Se comprueba antes de pegarla.
 */
function despejada(map, edificio, p) {
  for (const d of [1.6, 3, 6, 9]) {
    const x = p.mx + p.nx * d, z = p.mz + p.nz * d;
    for (const b of map.buildings) {
      if (b === edificio) continue;
      if (!b.p || b.p.length < 3) continue;
      if (dentro(b.p, x, z)) return false;
    }
  }
  return true;
}

/** la pared que se ve desde la calle: la más cercana al punto indicado */
function elegirPared(map, edificio, foto) {
  const objetivo = foto.wallAt || foto.facing;
  const facing = foto.facing;
  let mejor = null, mejorD = Infinity;
  for (const p of paredesDe(edificio)) {
    if (facing) {
      const d = Math.hypot(facing[0] - p.mx, facing[1] - p.mz) || 1;
      const encara = ((facing[0] - p.mx) * p.nx + (facing[1] - p.mz) * p.nz) / d;
      if (encara < 0.05) continue;   // de espaldas a la calle
    }
    if (!despejada(map, edificio, p)) continue;   // dentro de la manzana
    if (objetivo) {
      const d = Math.hypot(objetivo[0] - p.mx, objetivo[1] - p.mz);
      if (d < mejorD) { mejorD = d; mejor = p; }
    } else if (p.len > (mejor?.len || 0)) mejor = p;
  }
  return mejor;
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Borde difuminado para que la foto se funda con la pared en vez de quedar
 * como un póster recortado. Blanco = opaco, negro = transparente.
 */
function mascaraSuave() {
  const N = 128, borde = 0.12;
  const datos = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const dx = Math.min(x, N - 1 - x) / (N * borde);
      const dy = Math.min(y, N - 1 - y) / (N * borde);
      const t = Math.min(1, dx, dy);
      const a = Math.round((t * t * (3 - 2 * t)) * 255);
      const i = (y * N + x) * 4;
      datos[i] = datos[i + 1] = datos[i + 2] = a;
      datos[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(datos, N, N, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export async function buildFacadePhotos(scene, map, onProgress) {
  const vacio = { update() {}, setMax() {}, count: 0, loaded: () => 0, info: () => [] };
  let datos = null;
  try {
    datos = await (await fetch(MANIFIESTO)).json();
  } catch {
    return vacio;
  }
  const fotos = Array.isArray(datos) ? datos : datos?.photos;
  if (!fotos?.length || !map.buildings?.length) return vacio;

  onProgress?.('Pegando las fotos de las fachadas de Argana Alta…', 85);

  const grupo = new THREE.Group();
  grupo.name = 'facadePhotos';
  scene.add(grupo);

  const cargador = new THREE.TextureLoader();
  const suave = mascaraSuave();
  const slots = [];

  for (const foto of fotos) {
    if (!foto.texture || !foto.buildingAt) continue;
    const edificio = buscarEdificio(map, foto.buildingAt);
    if (!edificio || edificio.skip) continue;   // los que tienen modelo propio no llevan calcomanía
    const pared = elegirPared(map, edificio, foto);
    if (!pared) continue;

    const altoEdificio = Math.max(edificio.h || 5, 2.5);
    const alto = Math.min(foto.height || 4, altoEdificio * 0.96);
    const anchoPedido = foto.width || alto * (foto.aspect || 1.5);
    const ancho = Math.min(anchoPedido, pared.len * 0.98);
    // si la foto es más ancha que la pared, se achica; si no, se centra donde dice u
    const u = clamp(foto.u ?? 0.5, ancho / (2 * pared.len), 1 - ancho / (2 * pared.len));
    const cx = pared.ax + pared.dx * u;
    const cz = pared.az + pared.dz * u;

    const material = new THREE.MeshStandardMaterial({
      // la foto viene de un fotograma a pleno sol: se baja un poco para que
      // no brille más que la pared que la rodea
      color: 0xd3d1cc,
      roughness: 0.98,
      metalness: 0,
      map: null,
      alphaMap: suave,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    });
    const malla = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), material);
    malla.position.set(cx + pared.nx * SEPARACION, alto / 2 + 0.12, cz + pared.nz * SEPARACION);
    // el plano mira a la calle (la normal del muro), no al interior del edificio
    malla.rotation.y = Math.atan2(pared.nx, pared.nz);
    malla.visible = false;
    malla.renderOrder = 2;
    malla.receiveShadow = true;

    // respaldo liso: la foto tapa esa parte de la fachada, así no se ven
    // las ventanas y puertas del edificio genérico por los bordes difuminados.
    // Va dentro de la malla para que se cargue y se suelte con ella.
    const colorMuro = edificio.c
      ? new THREE.Color(edificio.c[0] / 255, edificio.c[1] / 255, edificio.c[2] / 255).lerp(new THREE.Color(1, 1, 0.97), 0.35)
      : new THREE.Color(0xd9d8d4);
    const respaldo = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.max(1, ancho - 0.3), Math.max(1, alto - 0.2)),
      new THREE.MeshStandardMaterial({ color: colorMuro, roughness: 0.95, metalness: 0 }),
    );
    respaldo.position.set(0, 0, RESPALDO - SEPARACION);
    respaldo.receiveShadow = true;
    malla.add(respaldo);

    // marco de la puerta o del escaparate: tapa el borde difuminado y hace que
    // la foto se lea como un hueco de verdad, no como un póster pegado
    if (foto.frame) {
      const t = foto.frameWidth || 0.12;
      const d = 0.18;
      const matMarco = new THREE.MeshStandardMaterial({
        color: foto.frameColor || 0xd8d6cf, roughness: 0.7, metalness: 0.05,
      });
      const barra = (w, h, x, y) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matMarco);
        m.position.set(x, y, 0.02);
        m.castShadow = m.receiveShadow = true;
        malla.add(m);
      };
      barra(ancho + 2 * t, t, 0, alto / 2 + t / 2);       // dintel
      barra(ancho + 2 * t, t, 0, -alto / 2 - t / 2);      // umbral
      barra(t, alto, -ancho / 2 - t / 2, 0);              // jamba izquierda
      barra(t, alto, ancho / 2 + t / 2, 0);               // jamba derecha
    }
    malla.userData = {
      id: foto.id || foto.texture,
      url: foto.texture,
      x: cx,
      z: cz,
      pared,
      ancho,
      alto,
      loaded: false,
      loading: false,
      failed: false,
    };
    grupo.add(malla);
    slots.push(malla);
  }

  if (!slots.length) {
    scene.remove(grupo);
    return vacio;
  }

  let MAX = 22;
  let ultimoX = Infinity, ultimoZ = Infinity;
  let activos = 0;

  function cargar(malla) {
    const d = malla.userData;
    if (d.loaded || d.loading || d.failed) return;
    d.loading = true;
    cargador.load(
      d.url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        malla.material.map = tex;
        malla.material.needsUpdate = true;
        malla.visible = true;
        d.loaded = true;
        d.loading = false;
        activos++;
      },
      undefined,
      () => {
        d.loading = false;
        d.failed = true;
        console.warn('[fachadas] no se encuentra la foto', d.url);
      },
    );
  }

  function soltar(malla) {
    const d = malla.userData;
    if (!d.loaded) return;
    malla.visible = false;
    malla.material.map?.dispose();
    malla.material.map = null;
    malla.material.needsUpdate = true;
    d.loaded = false;
    activos--;
  }

  /** solo se tienen cargadas las fotos cercanas; al alejarse se sueltan */
  function update(px, pz) {
    if (!Number.isFinite(px) || !Number.isFinite(pz)) return;
    if (Math.hypot(px - ultimoX, pz - ultimoZ) < PASO) return;
    ultimoX = px;
    ultimoZ = pz;

    const orden = slots
      .map((m) => ({ m, d: Math.hypot(m.userData.x - px, m.userData.z - pz) }))
      .sort((a, b) => a.d - b.d);

    const mantener = new Set();
    for (let i = 0; i < orden.length && mantener.size < MAX; i++) {
      if (orden[i].d <= RADIO_CARGA) mantener.add(orden[i].m);
    }
    for (const m of slots) {
      if (mantener.has(m)) cargar(m);
      else if (Math.hypot(m.userData.x - px, m.userData.z - pz) > RADIO_DESCARGA) soltar(m);
      else if (m.userData.loaded) m.visible = true;
    }
    for (const m of mantener) m.visible = m.userData.loaded;
  }

  return {
    update,
    count: slots.length,
    loaded: () => activos,
    setMax(n) {
      MAX = Math.max(0, n | 0);
      if (MAX === 0) {
        for (const m of slots) soltar(m);
      } else {
        ultimoX = Infinity;
      }
    },
    info: () => slots.map((m) => ({
      id: m.userData.id,
      x: +m.userData.x.toFixed(1),
      z: +m.userData.z.toFixed(1),
      ancho: +m.userData.ancho.toFixed(1),
      alto: +m.userData.alto.toFixed(1),
      loaded: m.userData.loaded,
    })),
  };
}
