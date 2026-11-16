import * as THREE from 'three';

/**
 * Postales de Playa Honda: paneles con fotos reales del pueblo (Wikimedia Commons,
 * CC BY / CC BY-SA) colocados donde se hicieron las fotos. Cada panel lleva el nombre
 * del sitio y, debajo, el autor y la licencia.
 *
 * Los datos vienen de `public/fotos/sitios.json`, que genera `tools/fotos_playa_honda.py`
 * (posición, orientación hacia la calle y créditos). Aquí solo se monta la chapa.
 *
 * Las texturas se cargan por proximidad, como las fotos de calle de Arrecife: el panel
 * (marco y patas) se ve siempre; la foto aparece cuando el jugador se acerca.
 */
export async function buildFotosSitios(scene, onProgress) {
  onProgress?.('Postales de Playa Honda…', 85);
  let list = [];
  try {
    const res = await fetch('fotos/sitios.json');
    const data = await res.json();
    list = data.sitios || [];
  } catch {
    return { update() {}, sites: [] };
  }
  if (!list.length) return { update() {}, sites: [] };

  const loader = new THREE.TextureLoader();
  const group = new THREE.Group();
  group.name = 'fotosSitios';
  scene.add(group);

  const W = 4.3;          // ancho de la foto
  const LEG = 1.25;       // alto de las patas
  const CAP = 0.9;        // banda de abajo, con el nombre y el crédito
  const ANCHO_TOTAL = W + 0.34;
  const hierro = new THREE.MeshStandardMaterial({ color: 0x23282e, roughness: 0.62, metalness: 0.35 });
  const dorso = new THREE.MeshStandardMaterial({ color: 0x151a1f, roughness: 0.85, metalness: 0.1 });

  /** la chapa de abajo: nombre del sitio y crédito de la foto */
  function placa(s) {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 190;
    const g = c.getContext('2d');
    g.fillStyle = '#12161b';
    g.fillRect(0, 0, 1024, 190);
    g.fillStyle = '#e8a026';
    g.fillRect(0, 0, 1024, 7);
    // el nombre, encogiendo la letra si no cabe
    g.fillStyle = '#f4f1e8';
    let px = 58;
    const fuente = (n) => `700 ${n}px "Barlow Condensed", "Arial Narrow", Arial, sans-serif`;
    do { g.font = fuente(px); px -= 2; } while (px > 30 && g.measureText(s.place).width > 900);
    g.textBaseline = 'alphabetic';
    g.fillText(s.place, 34, 88);
    g.fillStyle = '#93a3b0';
    g.font = '500 32px "Barlow Condensed", "Arial Narrow", Arial, sans-serif';
    const credito = `Foto: ${s.autor || 'Wikimedia Commons'} · ${s.lic || 'CC'}`;
    g.fillText(credito, 34, 148);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  const sitios = list.map((s) => {
    const H = Math.max(2.2, Math.min(3.4, W * (s.h / s.w)));   // alto según la foto
    const altoChapa = CAP + H;
    const g = new THREE.Group();
    g.position.set(s.x, 0.3, s.z);   // un poco sobre el suelo: la chapa no se entierra en las cuestas
    g.rotation.y = s.yaw;
    g.name = 'postal:' + s.id;

    // el canto (una caja fina): da grosor y sombra al panel
    const canto = new THREE.Mesh(new THREE.BoxGeometry(ANCHO_TOTAL, altoChapa, 0.16), dorso);
    canto.position.set(0, LEG + altoChapa / 2, 0);
    g.add(canto);

    // patas
    for (const sx of [-1, 1]) {
      const pata = new THREE.Mesh(new THREE.BoxGeometry(0.11, LEG + 0.1, 0.11), hierro);
      pata.position.set(sx * (ANCHO_TOTAL / 2 - 0.34), LEG / 2, 0);
      g.add(pata);
      const pie = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.36), hierro);
      pie.position.set(sx * (ANCHO_TOTAL / 2 - 0.34), 0.04, 0);
      g.add(pie);
    }

    // el hueco de la foto (antes de cargar): gris oscuro
    // la foto se ilumina un poco por dentro: a contraluz o de noche se sigue leyendo
    const foto = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshStandardMaterial({ color: 0x3a424b, roughness: 0.9, metalness: 0, emissiveIntensity: 0.85 }),
    );
    foto.position.set(0, LEG + CAP + H / 2, 0.085);
    g.add(foto);

    // la placa con el nombre y el crédito
    const placaTex = placa(s);
    const chapa = new THREE.Mesh(
      new THREE.PlaneGeometry(W, CAP - 0.2),
      new THREE.MeshStandardMaterial({ map: placaTex, emissiveMap: placaTex, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.8, metalness: 0 }),
    );
    chapa.position.set(0, LEG + CAP / 2 - 0.04, 0.085);
    g.add(chapa);

    group.add(g);
    return { s, g, foto, H, loaded: false, loading: false, dist: 1e9 };
  });

  let MAX = 12;
  const LOAD_R = 150;
  const UNLOAD_R = 215;
  const limpia = (o) => {
    o.foto.material.map?.dispose();
    o.foto.material.map = null;
    o.foto.material.emissiveMap = null;
    o.foto.material.color.set(0x3a424b);
    o.foto.material.needsUpdate = true;
    o.loaded = false;
  };

  function carga(o) {
    if (o.loaded || o.loading) return;
    o.loading = true;
    loader.load(
      o.s.file,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        o.foto.material.map = tex;
        o.foto.material.emissiveMap = tex;
        o.foto.material.color.set(0xffffff);
        o.foto.material.needsUpdate = true;
        o.loaded = true;
        o.loading = false;
      },
      undefined,
      () => { o.loading = false; },
    );
  }

  /** acerca la cámara: carga las postales que toca y descarga las de lejos */
  function update(px, pz) {
    for (const o of sitios) o.dist = Math.hypot(o.s.x - px, o.s.z - pz);
    // las más cercanas primero, hasta MAX
    const orden = sitios.filter(o => o.dist < LOAD_R).sort((a, b) => a.dist - b.dist);
    for (let i = 0; i < orden.length && i < MAX; i++) carga(orden[i]);
    for (const o of sitios) if (o.loaded && o.dist > UNLOAD_R) limpia(o);
  }

  function setMax(n) {
    MAX = Math.max(0, n | 0);
    if (!MAX) for (const o of sitios) if (o.loaded) limpia(o);
  }

  update(0, 0);
  return { update, setMax, sites: sitios.map(o => o.s) };
}
