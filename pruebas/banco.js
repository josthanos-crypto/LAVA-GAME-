// Banco de pruebas de modelos (coches, peatones, protagonistas): la misma luz, cielo y exposición que el
// juego, pero sin ciudad, para ver un modelo en un segundo. Se abre con el servidor de desarrollo en
// http://localhost:5274/pruebas/banco.html y se maneja desde la consola con window.__b
import * as THREE from 'three';
import { setupLights } from '/src/world.js';
import { SkyEnvironment } from '/src/realism.js';
import { DayNight } from '/src/dayNight.js';
import { asphaltTexture, sidewalkTexture } from '/src/textures.js';

const params = new URLSearchParams(location.search);
const W = +params.get('w') || 1280, H = +params.get('h') || 720;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.7;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = params.has('sombras');
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const L = setupLights(scene, null);
const skyEnv = new SkyEnvironment(renderer, scene, L.sky);
const dayNight = new DayNight({ scene, ...L, renderer, streetHeadMat: null });
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 3000);

// suelo: calzada y una acera a cada lado
const asf = asphaltTexture(8);
asf.wrapS = asf.wrapT = THREE.RepeatWrapping;
asf.repeat.set(40, 40);
const road = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: asf, roughness: 0.95 }));
road.rotation.x = -Math.PI / 2;
road.receiveShadow = true;
scene.add(road);
const ace = sidewalkTexture(8);
ace.wrapS = ace.wrapT = THREE.RepeatWrapping;
ace.repeat.set(60, 2);
for (const sx of [-1, 1]) {
  const s = new THREE.Mesh(new THREE.BoxGeometry(200, 0.1, 5), new THREE.MeshStandardMaterial({ map: ace, roughness: 0.9 }));
  s.position.set(0, 0.05, sx * 8.5);
  s.receiveShadow = true;
  scene.add(s);
}
// un muro claro al fondo, para ver siluetas y reflejos
const wall = new THREE.Mesh(new THREE.BoxGeometry(200, 7, 0.4), new THREE.MeshStandardMaterial({ color: 0xe9e4d8, roughness: 0.9 }));
wall.position.set(0, 3.5, -11.2);
scene.add(wall);

const stage = new THREE.Group();
scene.add(stage);
let night = 0;
const api = {
  THREE, scene, camera, renderer, stage, dayNight,
  setTime(h) {
    night = dayNight.update(h * 60, 0, 0);
    skyEnv.lastSun.set(9, 9, 9);
    skyEnv.update(dayNight.sunDir, night);
    return night;
  },
  get night() { return night; },
  clear() { while (stage.children.length) stage.remove(stage.children[0]); },
  render(pos, look, fov = 40) {
    camera.position.set(...pos);
    camera.fov = fov;
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
    L.sky.position.copy(camera.position);
    L.stars.position.copy(camera.position);
    renderer.info.reset();
    renderer.render(scene, camera);
    return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
  },
  async shot(name, pos, look, fov = 40, q = 0.88) {
    const info = api.render(pos, look, fov);
    const r = await fetch('/__shot/' + name, { method: 'POST', body: renderer.domElement.toDataURL('image/jpeg', q) });
    return [await r.text(), info];
  },
  /** triángulos y llamadas de dibujo de un objeto */
  tris(root) {
    let t = 0, calls = 0;
    root.traverse(o => {
      if (!o.isMesh) return;
      for (let q = o; q && q !== root.parent; q = q.parent) if (!q.visible) return;
      const g = o.geometry, n = g.index ? g.index.count : (g.getAttribute('position')?.count || 0);
      t += (n / 3) * (o.isInstancedMesh ? o.count : 1);
      calls += Array.isArray(o.material) ? (g.groups.length || 1) : 1;
    });
    return { tris: Math.round(t), calls };
  },
};
api.setTime(12);
window.__b = api;
