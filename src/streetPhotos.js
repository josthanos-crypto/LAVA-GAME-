import * as THREE from 'three';

/**
 * Paneles con fotos reales de calle (Mapillary CC BY-SA) colocados
 * en las posiciones de captura. Carga por proximidad para no saturar VRAM.
 */
export async function buildStreetPhotos(scene, onProgress) {
  onProgress?.('Fotos reales de Arrecife…', 82);
  let list = [];
  try {
    const res = await fetch('mapillary/photos.json');
    list = await res.json();
  } catch {
    return { update() {} };
  }
  if (!list.length) return { update() {} };

  const loader = new THREE.TextureLoader();
  const group = new THREE.Group();
  group.name = 'streetPhotos';
  scene.add(group);

  let MAX_ACTIVE = 28;
  const LOAD_R = 95;
  const UNLOAD_R = 140;
  const W = 7.2;
  const H = 4.4;

  const slots = list.map((p) => {
    // Mapillary: 0° = norte, 90° = este. En Three, +Z es "sur" del mapa local.
    const rad = (p.a || 0) * Math.PI / 180;
    // dirección de la cámara en el plano XZ del juego
    const fx = Math.sin(rad);
    const fz = -Math.cos(rad);
    // empujar el panel hacia la fachada (lo que miraba la cámara) y un poco a un lado
    const dist = 9.5;
    const side = 1.2;
    const px = p.x + fx * dist + (-fz) * side;
    const pz = p.z + fz * dist + fx * side;
    // el panel mira de vuelta a la calle (hacia el punto de captura)
    const yaw = Math.atan2(p.x - px, p.z - pz);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(W, H),
      new THREE.MeshBasicMaterial({
        color: 0x8899aa,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    mesh.position.set(px, H * 0.55 + 0.4, pz);
    mesh.rotation.y = yaw;
    mesh.visible = false;
    mesh.userData = { id: p.id, x: px, z: pz, loaded: false, loading: false, tex: null };
    group.add(mesh);
    return mesh;
  });

  // marco sutil alrededor de cada foto (se clona con el mesh visible)
  const frameMat = new THREE.MeshBasicMaterial({ color: 0x111418, transparent: true, opacity: 0.55 });
  const frames = new THREE.Group();
  scene.add(frames);

  function loadOne(mesh) {
    if (mesh.userData.loaded || mesh.userData.loading) return;
    mesh.userData.loading = true;
    const url = `mapillary/cache/${mesh.userData.id}.jpg`;
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        mesh.material.map = tex;
        mesh.material.color.set(0xffffff);
        mesh.material.opacity = 0.92;
        mesh.material.depthWrite = true;
        mesh.material.needsUpdate = true;
        mesh.userData.tex = tex;
        mesh.userData.loaded = true;
        mesh.userData.loading = false;
        mesh.visible = true;
      },
      undefined,
      () => { mesh.userData.loading = false; missing = true; },
    );
  }

  function unloadOne(mesh) {
    if (!mesh.userData.loaded) return;
    mesh.visible = false;
    if (mesh.material.map) {
      mesh.material.map.dispose();
      mesh.material.map = null;
    }
    mesh.material.color.set(0x8899aa);
    mesh.material.opacity = 0.15;
    mesh.material.depthWrite = false;
    mesh.userData.tex = null;
    mesh.userData.loaded = false;
  }

  let lastX = 1e9, lastZ = 1e9, missing = false;
  function update(px, pz) {
    if (missing) return;
    if (Math.hypot(px - lastX, pz - lastZ) < 6) return;
    lastX = px;
    lastZ = pz;

    const scored = [];
    for (const m of slots) {
      const d = Math.hypot(m.userData.x - px, m.userData.z - pz);
      scored.push({ m, d });
    }
    scored.sort((a, b) => a.d - b.d);

    const keep = new Set();
    for (let i = 0; i < scored.length && keep.size < MAX_ACTIVE; i++) {
      if (scored[i].d <= LOAD_R) keep.add(scored[i].m);
    }
    for (const m of slots) {
      if (keep.has(m)) loadOne(m);
      else if (Math.hypot(m.userData.x - px, m.userData.z - pz) > UNLOAD_R) unloadOne(m);
    }
  }

  void frameMat;
  void frames;

  return {
    update,
    count: list.length,
    setMax(n) {
      MAX_ACTIVE = Math.max(0, n | 0);
      if (MAX_ACTIVE === 0) {
        for (const m of slots) unloadOne(m);
      }
    },
  };
}
