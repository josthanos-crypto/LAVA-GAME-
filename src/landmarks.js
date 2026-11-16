import * as THREE from 'three';

function centroid(pts) {
  let x = 0, z = 0;
  for (const [px, pz] of pts) { x += px; z += pz; }
  return [x / pts.length, z / pts.length];
}

function glassTex() {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 256;
  const ctx = c.getContext('2d');
  // bandas de cristal del Gran Hotel
  for (let y = 0; y < 256; y += 16) {
    const g = ctx.createLinearGradient(0, y, 128, y + 16);
    g.addColorStop(0, '#4a6a7a');
    g.addColorStop(0.4, '#7ab0c8');
    g.addColorStop(0.7, '#3a5568');
    g.addColorStop(1, '#2a4050');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, 128, 15);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(0, y, 128, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, y + 13, 128, 2);
  }
  // montantes verticales
  for (let x = 0; x < 128; x += 16) {
    ctx.fillStyle = 'rgba(30,40,50,0.45)';
    ctx.fillRect(x, 0, 2, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(4, 8);
  return tex;
}

function hotelSignTex() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0a1a28';
  ctx.fillRect(0, 0, 512, 96);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, 500, 84);
  ctx.fillStyle = '#e8f0f8';
  ctx.font = 'bold 36px "Arial Narrow", Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ARRECIFE GRAN HOTEL', 256, 40);
  ctx.fillStyle = '#c9a227';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('LANZAROTE · ★★★★★', 256, 70);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Torre de cristal del Arrecife Gran Hotel (62 m) */
function buildGranHotel(scene, map) {
  const b = (map.buildings || []).find(x => x.h >= 50);
  if (!b) return null;
  const [cx, cz] = centroid(b.p);
  const group = new THREE.Group();
  group.name = 'granHotel';

  // corona iluminada en la azotea
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(14, 2.2, 14),
    new THREE.MeshStandardMaterial({
      color: 0x1a2838, metalness: 0.6, roughness: 0.35,
      emissive: 0x224466, emissiveIntensity: 0.4,
    }),
  );
  crown.position.set(cx, b.h + 1.1, cz);
  crown.castShadow = true;
  group.add(crown);

  // antena / mástil
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 8, 6),
    new THREE.MeshStandardMaterial({ color: 0x888c92, metalness: 0.8, roughness: 0.3 }),
  );
  mast.position.set(cx, b.h + 6, cz);
  group.add(mast);

  // letrero luminoso
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 3.2),
    new THREE.MeshBasicMaterial({ map: hotelSignTex(), transparent: true, side: THREE.DoubleSide }),
  );
  sign.position.set(cx, b.h + 3.8, cz + 8);
  group.add(sign);
  const sign2 = sign.clone();
  sign2.position.z = cz - 8;
  sign2.rotation.y = Math.PI;
  group.add(sign2);

  // paneles de cristal superpuestos a la torre (4 caras aproximadas por bounding)
  const xs = b.p.map(p => p[0]), zs = b.p.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const z0 = Math.min(...zs), z1 = Math.max(...zs);
  const w = x1 - x0, d = z1 - z0;
  const glass = glassTex();
  const gmat = new THREE.MeshStandardMaterial({
    map: glass, metalness: 0.55, roughness: 0.18,
    transparent: true, opacity: 0.88, envMapIntensity: 1.3,
    side: THREE.DoubleSide,
  });
  const faces = [
    { w, h: b.h - 3, x: cx, y: 3 + (b.h - 3) / 2, z: z1 + 0.15, ry: 0 },
    { w, h: b.h - 3, x: cx, y: 3 + (b.h - 3) / 2, z: z0 - 0.15, ry: Math.PI },
    { w: d, h: b.h - 3, x: x1 + 0.15, y: 3 + (b.h - 3) / 2, z: cz, ry: Math.PI / 2 },
    { w: d, h: b.h - 3, x: x0 - 0.15, y: 3 + (b.h - 3) / 2, z: cz, ry: -Math.PI / 2 },
  ];
  for (const f of faces) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(f.w * 0.92, f.h), gmat);
    m.position.set(f.x, f.y, f.z);
    m.rotation.y = f.ry;
    group.add(m);
  }

  // luz de corona (noche)
  const light = new THREE.PointLight(0xaaccff, 0, 80, 2);
  light.position.set(cx, b.h + 4, cz);
  group.add(light);
  group.userData.nightLight = light;
  group.userData.crown = crown;

  scene.add(group);
  return { group, cx, cz, h: b.h };
}

/** El Charco de San Ginés: muelles, barcas y farolas de marina */
function buildCharco(scene, map) {
  const group = new THREE.Group();
  group.name = 'charco';
  // centro aproximado del Charco (cerca de Charco Vivo / Chalana)
  const CX = 420, CZ = 40;
  const rng = (() => { let s = 4242; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

  const wood = new THREE.MeshStandardMaterial({ color: 0x8a6a42, roughness: 0.9 });
  const woodDark = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.92 });
  const white = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.75 });
  const hullCols = [0xc8452e, 0x2a6db5, 0xe8e4dc, 0x3e8a4f, 0xd9a520];

  // muelle perimetral (rectángulos de madera)
  const docks = [
    [CX - 35, CZ - 5, 40, 3.5, 0],
    [CX + 10, CZ + 25, 3.5, 28, 0],
    [CX - 20, CZ + 40, 50, 3.2, 0.1],
  ];
  for (const [x, z, w, d, ry] of docks) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), wood);
    plank.position.set(x, 0.35, z);
    plank.rotation.y = ry;
    plank.receiveShadow = true;
    plank.castShadow = true;
    group.add(plank);
    // barandilla
    for (let i = 0; i < 8; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 5), woodDark);
      const t = i / 7;
      post.position.set(x + (t - 0.5) * w * 0.9, 0.85, z + d * 0.4);
      group.add(post);
    }
  }

  // barcas amarradas
  for (let i = 0; i < 9; i++) {
    const boat = new THREE.Group();
    const col = hullCols[i % hullCols.length];
    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.55, 5.2),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, metalness: 0.1 }),
    );
    hull.position.y = 0.35;
    boat.add(hull);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 1.6), white);
    cabin.position.set(0, 0.9, -0.4);
    boat.add(cabin);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 5), woodDark);
    mast.position.set(0, 2.0, 0.6);
    boat.add(mast);
    const ang = (i / 9) * Math.PI * 1.4 + 0.3;
    const r = 22 + rng() * 18;
    boat.position.set(CX + Math.cos(ang) * r, 0.15, CZ + Math.sin(ang) * r * 0.7);
    boat.rotation.y = ang + Math.PI / 2 + (rng() - 0.5) * 0.4;
    boat.traverse(o => { if (o.isMesh) o.castShadow = true; });
    group.add(boat);
  }

  // farolas de marina
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xfff0c0, emissive: 0xffe8a0, emissiveIntensity: 0,
  });
  const nightLamps = [];
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x = CX + Math.cos(a) * 48;
    const z = CZ + Math.sin(a) * 32;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 4.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x3a3f45, metalness: 0.5, roughness: 0.5 }));
    pole.position.set(x, 2.1, z);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), lampMat.clone());
    lamp.position.set(x, 4.3, z);
    group.add(pole, lamp);
    nightLamps.push(lamp.material);
  }

  // toldos de terraza del charco
  for (let i = 0; i < 5; i++) {
    const awn = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.08, 3.2),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xc8452e : 0xf0e8d8, roughness: 0.85 }),
    );
    awn.position.set(CX - 50 + i * 8, 2.6, CZ + 55);
    group.add(awn);
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 5), woodDark);
    p1.position.set(CX - 50 + i * 8 - 1.8, 1.3, CZ + 55);
    const p2 = p1.clone();
    p2.position.x += 3.6;
    group.add(p1, p2);
  }

  // rótulo El Charco
  const tc = document.createElement('canvas');
  tc.width = 512; tc.height = 128;
  const ctx = tc.getContext('2d');
  ctx.fillStyle = '#1a3040';
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = '#e8f4f8';
  ctx.font = 'bold 42px "Arial Narrow", Arial';
  ctx.textAlign = 'center';
  ctx.fillText('EL CHARCO DE SAN GINÉS', 256, 55);
  ctx.fillStyle = '#7ec4ec';
  ctx.font = '20px Arial';
  ctx.fillText('Arrecife · Lanzarote', 256, 95);
  const ttex = new THREE.CanvasTexture(tc);
  ttex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 2.5),
    new THREE.MeshBasicMaterial({ map: ttex, side: THREE.DoubleSide }),
  );
  board.position.set(CX - 10, 4.5, CZ + 55);
  group.add(board);

  scene.add(group);
  return { group, nightLamps, cx: CX, cz: CZ };
}

/** Mejora castillos: bandera canaria, textura piedra, torreta */
function enhanceCastles(scene, map) {
  const all = map.castles || [];
  if (!all.length) return null;
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb09468, roughness: 0.92, metalness: 0.05 });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x7a6548, roughness: 0.95 });

  // bandera de Canarias (blanco-azul-amarillo)
  const fc = document.createElement('canvas');
  fc.width = 128; fc.height = 72;
  const fctx = fc.getContext('2d');
  fctx.fillStyle = '#ffffff'; fctx.fillRect(0, 0, 42, 72);
  fctx.fillStyle = '#0033a0'; fctx.fillRect(42, 0, 44, 72);
  fctx.fillStyle = '#ffcc00'; fctx.fillRect(86, 0, 42, 72);
  const ftex = new THREE.CanvasTexture(fc);
  ftex.colorSpace = THREE.SRGBColorSpace;

  for (const c of all) {
    const [cx, cz] = centroid(c.p);
    const H = c.h || 6;
    // torreta central
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, H + 2, 8), stoneMat);
    tower.position.set(cx, (H + 2) / 2, cz);
    tower.castShadow = true;
    group.add(tower);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 1.8, 0.6, 8), darkStone);
    top.position.set(cx, H + 2.2, cz);
    group.add(top);
    // almenas en anillo
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.45), stoneMat);
      m.position.set(cx + Math.cos(a) * 1.7, H + 2.7, cz + Math.sin(a) * 1.7);
      group.add(m);
    }
    // bandera canaria
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4, 5),
      new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.7, roughness: 0.4 }));
    pole.position.set(cx, H + 4.5, cz);
    group.add(pole);
    const flag = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.0),
      new THREE.MeshBasicMaterial({ map: ftex, side: THREE.DoubleSide }),
    );
    flag.position.set(cx + 0.95, H + 6.0, cz);
    group.add(flag);
  }
  scene.add(group);
  return group;
}

/** Playa del Reducto: más sombrillas, hamacas, chiringuito */
export function buildLandmarks(scene, map, onProgress) {
  onProgress?.('Landmarks de Arrecife…', 80);
  const hotel = buildGranHotel(scene, map);
  const charco = buildCharco(scene, map);
  const castles = enhanceCastles(scene, map);
  return {
    hotel,
    charco,
    castles,
    setNight(night) {
      if (hotel?.group?.userData?.nightLight) {
        hotel.group.userData.nightLight.intensity = night * 4.5;
        if (hotel.group.userData.crown?.material) {
          hotel.group.userData.crown.material.emissiveIntensity = 0.3 + night * 1.4;
        }
      }
      if (charco?.nightLamps) {
        for (const m of charco.nightLamps) {
          m.emissiveIntensity = night * 2.2;
        }
      }
    },
  };
}
