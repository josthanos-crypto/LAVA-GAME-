import * as THREE from 'three';

/**
 * (Version 167) El aparcamiento de varias plantas de la esquina de Doctor Juan Negrín con Triana y Fajardo (el del
 * mapa «Aparcamiento Público Calle Fajardo»), como en la captura de Look Around del 23-11-2026 (PC de Arrecife,
 * `Downloads\recursos lava game 2026-11-23\centro`, foto 0684 «Doctor Juan Negrín 2-14»): un bloque alto de color
 * arena, de siete plantas, con una franja gris de arriba abajo en la esquina, con agujeros redondos y la palabra
 * PARKING en vertical. En el juego era un bloque gris con ventanas.
 * Solo se le cambia el color y se cuelga la franja: no se puede entrar. La altura es la del mapa (siete plantas).
 */

const ESQUINA = [-182.8, 68.4];       // la esquina norte del bloque (punto del mapa)
const HACIA = [-200.9, 96.3];         // el otro extremo de la cara que da a la placita de Triana
const ALTO = 20;

const cerca = (b, [x0, z0]) => b.p.reduce((m, q) => (Math.hypot(q[0] - x0, q[1] - z0) < Math.hypot(m[0] - x0, m[1] - z0) ? q : m));
// el juego mueve un poco las esquinas de los bloques al cargar el mapa: se busca con margen
const esElBloque = (b) => b.p?.length > 3 && Math.hypot(cerca(b, ESQUINA)[0] - ESQUINA[0], cerca(b, ESQUINA)[1] - ESQUINA[1]) < 2.5
  && Math.hypot(cerca(b, HACIA)[0] - HACIA[0], cerca(b, HACIA)[1] - HACIA[1]) < 2.5;

export function tuneParkingFajardo(map) {
  const b = (map.buildings || []).find(esElBloque);
  if (!b) return;
  // la altura ya la trae bien el mapa (siete plantas): solo se cambia el color
  b.f = [206, 198, 182];
  b.c = [150, 148, 142];
  map.parkingFajardo = { a: cerca(b, ESQUINA).slice(0, 2), b: cerca(b, HACIA).slice(0, 2), h: b.h > 12 ? b.h : ALTO };
}

export function buildParkingFajardo(scene, map) {
  if (!map?.parkingFajardo) return null;
  const { a: A, b: B, h: H } = map.parkingFajardo;
  const ux = B[0] - A[0], uz = B[1] - A[1], L = Math.hypot(ux, uz);
  const u = [ux / L, uz / L], n = [-u[1], u[0]];   // hacia fuera (oeste)
  const c = document.createElement('canvas');
  c.width = 128; c.height = 640;
  const g = c.getContext('2d');
  g.fillStyle = '#a9a59d'; g.fillRect(0, 0, 128, 640);
  g.fillStyle = '#2a2a2c';
  for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(44, 50 + i * 88, 26, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = '#3a3a3c'; g.font = '700 30px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  'PARKING'.split('').forEach((l, i) => g.fillText(l, 104, 200 + i * 40));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const ancho = 3.6, alto = H - 1;
  const franja = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide }));
  franja.position.set(A[0] + u[0] * (ancho / 2 + 0.3) + n[0] * 0.5, alto / 2 + 0.8, A[1] + u[1] * (ancho / 2 + 0.3) + n[1] * 0.5);
  franja.rotation.y = Math.atan2(n[0], n[1]);
  franja.name = 'parkingFajardo';
  scene.add(franja);
  return franja;
}
