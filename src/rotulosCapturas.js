import * as THREE from 'three';

/**
 * (Version 168) Tres rótulos vistos en las capturas de Look Around del 23-11-2026 (PC de Arrecife,
 * `Downloads\recursos lava game 2026-11-23\centro`) y confirmados por José Manuel el 24-11-2026 («coloca todo»):
 *  - OCASO SEGUROS: la banda azul de letras blancas sobre los escaparates, en la acera este de la avenida Alcalde
 *    Ginés de la Hoz, un poco antes de la calle Brasilia (foto 0639, «Alcalde Ginés de la Hoz, 25»);
 *  - CLÍNICA SAN VICENTE: el cartel azul del local de al lado, en la misma acera (misma foto);
 *  - CASA DECOR: dos banderolas blancas que salen de la fachada en la calle Fajardo, pasado el cruce de Hermanos
 *    Zerolo: una alta a la derecha y otra más lejos a la izquierda (fotos 0693 y 0695, «Calle Fajardo, 41»).
 * Solo son los rótulos: no se puede entrar y no llevan teléfonos, horarios ni logotipos copiados.
 * A ojo: el sitio exacto a lo largo de la fachada y el tamaño. Cada rótulo se pega a la cara de edificio más
 * cercana al punto apuntado (si no hay ninguna a menos de 6 m, no se pone).
 */

// [punto de la fachada, punto de la calle que tiene delante]
const OCASO = [[-428.9, -276.8], [-435.5, -276.8]];
const CLINICA = [[-431.3, -264.0], [-438, -264.0]];
const DECOR_IZQ = [[-101.8, 121.9], [-105.7, 125.8]];
const DECOR_DER = [[-116.8, 122.6], [-112.9, 118.7]];

function lienzo(w, h, pintar) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  pintar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** la cara de edificio más cercana a T, con la normal hacia la calle (hacia R) */
function cara(map, T, R) {
  let m = null;
  for (const b of map?.buildings || []) {
    const p = b.p;
    if (!p || p.length < 3 || Math.abs(p[0][0] - T[0]) > 150 || Math.abs(p[0][1] - T[1]) > 150) continue;
    for (let i = 0; i < p.length; i++) {
      const a = p[i], c = p[(i + 1) % p.length], dx = c[0] - a[0], dz = c[1] - a[1], L2 = dx * dx + dz * dz;
      if (L2 < 4) continue;
      const t = Math.max(0, Math.min(1, ((T[0] - a[0]) * dx + (T[1] - a[1]) * dz) / L2));
      const d = Math.hypot(a[0] + dx * t - T[0], a[1] + dz * t - T[1]);
      if (!m || d < m.d) m = { d, a, L: Math.sqrt(L2), s: t * Math.sqrt(L2), ux: dx / Math.sqrt(L2), uz: dz / Math.sqrt(L2), h: b.h || 7 };
    }
  }
  if (!m || m.d > 6) return null;
  let nx = -m.uz, nz = m.ux;
  if ((R[0] - T[0]) * nx + (R[1] - T[1]) * nz < 0) { nx = -nx; nz = -nz; }
  return { ...m, nx, nz };
}

/** una banda pegada a la fachada, de ancho w, centrada en el punto apuntado (sin salirse de la cara) */
function banda(grupo, f, w, h, y, textura, nombre) {
  const ancho = Math.min(w, f.L - 0.6);
  if (ancho < 1.5) return null;
  const s = Math.max(ancho / 2 + 0.3, Math.min(f.L - ancho / 2 - 0.3, f.s));
  const x = f.a[0] + f.ux * s + f.nx * 0.14, z = f.a[1] + f.uz * s + f.nz * 0.14;
  const fondo = new THREE.Mesh(new THREE.BoxGeometry(ancho + 0.1, h + 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x20304a, roughness: 0.8 }));
  fondo.position.set(x - f.nx * 0.06, y, z - f.nz * 0.06);
  const cartel = new THREE.Mesh(new THREE.PlaneGeometry(ancho, h), new THREE.MeshStandardMaterial({ map: textura, roughness: 0.75 }));
  cartel.position.set(x, y, z);
  fondo.rotation.y = cartel.rotation.y = Math.atan2(f.nx, f.nz);
  cartel.name = nombre;
  grupo.add(fondo, cartel);
  return cartel;
}

/** una banderola: un cartel de dos caras que sale de la fachada */
function banderola(grupo, f, lado, y, textura, nombre) {
  const x = f.a[0] + f.ux * f.s + f.nx * (0.3 + lado / 2), z = f.a[1] + f.uz * f.s + f.nz * (0.3 + lado / 2);
  const giro = Math.atan2(f.ux, f.uz);
  const caja = new THREE.Mesh(new THREE.BoxGeometry(lado + 0.08, lado + 0.08, 0.1), new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.7 }));
  caja.position.set(x, y, z);
  caja.rotation.y = giro;
  caja.name = nombre;
  grupo.add(caja);
  for (const k of [1, -1]) {
    const c = new THREE.Mesh(new THREE.PlaneGeometry(lado, lado), new THREE.MeshStandardMaterial({ map: textura, roughness: 0.7 }));
    c.position.set(x + f.ux * 0.056 * k, y, z + f.uz * 0.056 * k);
    c.rotation.y = giro + (k > 0 ? 0 : Math.PI);
    grupo.add(c);
  }
  // el brazo que la sujeta a la pared
  const brazo = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.34), new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: 0.7 }));
  brazo.position.set(f.a[0] + f.ux * f.s + f.nx * 0.15, y + lado * 0.3, f.a[1] + f.uz * f.s + f.nz * 0.15);
  brazo.rotation.y = Math.atan2(f.nx, f.nz);
  grupo.add(brazo);
  return caja;
}

const pintarOcaso = (g, w, h) => {
  g.fillStyle = '#17479e'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; g.textAlign = 'center';
  for (const cx of [w * 0.25, w * 0.75]) {
    g.font = `800 ${Math.round(h * 0.6)}px Georgia, "Times New Roman", serif`;
    g.fillText('OCASO', cx - h * 1.4, h * 0.54);
    g.font = `600 ${Math.round(h * 0.4)}px Arial, sans-serif`;
    g.fillText('SEGUROS', cx + h * 1.9, h * 0.56);
  }
};
const pintarClinica = (g, w, h) => {
  g.fillStyle = '#2a5caa'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; g.fillRect(0, h - 8, w, 8);
  g.textBaseline = 'middle'; g.textAlign = 'center';
  g.font = `600 ${Math.round(h * 0.26)}px Arial, sans-serif`;
  g.fillText('CLÍNICA', w / 2, h * 0.28);
  g.font = `800 ${Math.round(h * 0.36)}px Arial, sans-serif`;
  g.fillText('SAN VICENTE', w / 2, h * 0.62);
};
const pintarDecor = (g, w, h) => {
  g.fillStyle = '#f4f3ee'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#3c3c3e'; g.textBaseline = 'middle'; g.textAlign = 'center';
  g.font = `300 ${Math.round(h * 0.3)}px Arial, sans-serif`;
  g.fillText('casa', w / 2, h * 0.34);
  g.font = `700 ${Math.round(h * 0.3)}px Arial, sans-serif`;
  g.fillText('decor', w / 2, h * 0.66);
};

export function buildRotulosCapturas(scene, map) {
  const grupo = new THREE.Group();
  grupo.name = 'rotulosCapturas';
  const puestos = {};
  let f = cara(map, ...OCASO);
  if (f) puestos.ocaso = !!banda(grupo, f, 13, 0.85, 3.25, lienzo(1536, 100, pintarOcaso), 'rotuloOcasoSeguros');
  f = cara(map, ...CLINICA);
  if (f) puestos.clinica = !!banda(grupo, f, 4.2, 0.9, 3.25, lienzo(512, 110, pintarClinica), 'rotuloClinicaSanVicente');
  const decor = lienzo(256, 256, pintarDecor);
  f = cara(map, ...DECOR_IZQ);
  if (f) puestos.decorIzq = !!banderola(grupo, f, 1.1, Math.min(4.6, f.h - 1), decor, 'rotuloCasaDecor');
  f = cara(map, ...DECOR_DER);
  if (f) puestos.decorDer = !!banderola(grupo, f, 1.3, Math.max(4.6, Math.min(9, f.h - 1.5)), decor, 'rotuloCasaDecorAlto');
  grupo.userData.puestos = puestos;
  scene.add(grupo);
  return grupo;
}
