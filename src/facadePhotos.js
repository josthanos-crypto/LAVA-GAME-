import * as THREE from 'three';

/**
 * Proyecta fotos Mapillary como decals pegados a la pared del edificio más cercano.
 * Complementa streetPhotos (paneles libres) con fachadas “reales”.
 */
export async function buildFacadePhotos(scene, map, onProgress) {
  onProgress?.('Proyectando fachadas reales…', 84);
  let list = [];
  try {
    list = await (await fetch('mapillary/photos.json')).json();
  } catch {
    return { update() {} };
  }
  if (!list.length || !map.buildings?.length) return { update() {} };

  // precomputar paredes largas de edificios (segmentos)
  const walls = [];
  for (const b of map.buildings) {
    const pts = b.p;
    const h = Math.min(b.h || 9, 18);
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 5 || len > 45) continue;
      const nx = (bz - az) / len, nz = -(bx - ax) / len;
      walls.push({
        ax, az, bx, bz, len, nx, nz, h,
        mx: (ax + bx) / 2, mz: (az + bz) / 2,
      });
    }
  }

  // emparejar foto → pared (ángulo + distancia)
  const pairs = [];
  const used = new Set();
  for (const p of list) {
    const rad = (p.a || 0) * Math.PI / 180;
    const fx = Math.sin(rad), fz = -Math.cos(rad);
    let best = null, bestScore = Infinity;
    for (let wi = 0; wi < walls.length; wi++) {
      if (used.has(wi)) continue;
      const w = walls[wi];
      const dx = w.mx - p.x, dz = w.mz - p.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 4 || dist > 28) continue;
      // la foto debe mirar hacia la pared (normal de pared vs dirección cámara)
      const face = fx * w.nx + fz * w.nz;
      if (face < 0.25) continue; // no de espaldas
      const along = Math.abs((dx * (w.bx - w.ax) + dz * (w.bz - w.az)) / w.len);
      if (along > w.len * 0.45) continue;
      const score = dist * (1.4 - face) + along * 0.05;
      if (score < bestScore) { bestScore = score; best = wi; }
    }
    if (best == null) continue;
    used.add(best);
    const w = walls[best];
    pairs.push({ id: p.id, wall: w, x: w.mx + w.nx * 0.12, z: w.mz + w.nz * 0.12 });
    if (pairs.length >= 90) break;
  }

  const loader = new THREE.TextureLoader();
  const group = new THREE.Group();
  group.name = 'facadePhotos';
  scene.add(group);

  let MAX = 22;
  const LOAD_R = 110;
  const UNLOAD_R = 160;
  const slots = pairs.map((p) => {
    const w = p.wall;
    const fw = Math.min(w.len * 0.85, 10);
    const fh = Math.min(w.h * 0.85, 9);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(fw, fh),
      new THREE.MeshBasicMaterial({
        color: 0x777777,
        transparent: true,
        opacity: 0.12,
        side: THREE.FrontSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    );
    mesh.position.set(p.x, fh * 0.5 + 0.3, p.z);
    // mirar hacia la calle (opuesto a la normal de la pared = hacia fuera del edificio)
    mesh.rotation.y = Math.atan2(w.nx, w.nz);
    mesh.visible = false;
    mesh.userData = { id: p.id, x: p.x, z: p.z, loaded: false, loading: false };
    group.add(mesh);
    return mesh;
  });

  function loadOne(mesh) {
    if (mesh.userData.loaded || mesh.userData.loading) return;
    mesh.userData.loading = true;
    loader.load(
      `mapillary/cache/${mesh.userData.id}.jpg`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        // recortar banda central de la foto (fachada, no cielo/suelo)
        tex.offset.set(0.12, 0.22);
        tex.repeat.set(0.76, 0.55);
        mesh.material.map = tex;
        mesh.material.color.set(0xffffff);
        mesh.material.opacity = 0.95;
        mesh.material.depthWrite = true;
        mesh.material.needsUpdate = true;
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
    mesh.material.opacity = 0.12;
    mesh.material.depthWrite = false;
    mesh.userData.loaded = false;
  }

  let lastX = 1e9, lastZ = 1e9, missing = false;
  function update(px, pz) {
    if (missing) return;
    if (Math.hypot(px - lastX, pz - lastZ) < 7) return;
    lastX = px; lastZ = pz;
    const scored = slots.map(m => ({ m, d: Math.hypot(m.userData.x - px, m.userData.z - pz) }));
    scored.sort((a, b) => a.d - b.d);
    const keep = new Set();
    for (let i = 0; i < scored.length && keep.size < MAX; i++) {
      if (scored[i].d <= LOAD_R) keep.add(scored[i].m);
    }
    for (const m of slots) {
      if (keep.has(m)) loadOne(m);
      else if (Math.hypot(m.userData.x - px, m.userData.z - pz) > UNLOAD_R) unloadOne(m);
    }
  }

  return {
    update,
    count: pairs.length,
    setMax(n) {
      MAX = Math.max(0, n | 0);
      if (MAX === 0) {
        for (const m of slots) unloadOne(m);
      }
    },
  };
}
