import * as THREE from 'three';

/**
 * Las otras tres caras de las naves comerciales (Version 134, pedido por José Manuel: «el Burger King y la zona
 * industrial se ven mal»).
 *
 * El Burger King y el Decathlon de Tenderete solo tenían hecha la fachada: por detrás y por los lados eran un cajón
 * de un solo color, liso. Aquí se pintan esas tres caras con lo que lleva cualquier nave: el despiece de la chapa o
 * los listones de madera, el zócalo, el remate de arriba y las puertas de servicio de atrás. No añade rótulos ni
 * nada del negocio: eso está en la fachada.
 *
 * El grupo es el de arrecifeExtras.js: x a lo largo de la fachada (−W/2…W/2) y la fachada en z = −D/2.
 */

const PX = 16;   // píxeles por metro

function lienzo(ancho, alto, estilo, puertas) {
  const k = Math.min(PX, 2048 / ancho);
  const c = document.createElement('canvas');
  c.width = Math.max(8, Math.round(ancho * k)); c.height = Math.max(8, Math.round(alto * k));
  const x = c.getContext('2d');
  x.scale(k, k);
  x.translate(0, alto); x.scale(1, -1);   // se dibuja en metros, con el suelo abajo
  if (estilo === 'madera') {
    // listones de madera abajo y la banda gris de paneles arriba, como su fachada
    x.fillStyle = '#7b5a40'; x.fillRect(0, 0, ancho, alto - 1.6);
    x.fillStyle = '#6a4c35'; for (let y = 0.2; y < alto - 1.6; y += 0.35) x.fillRect(0, y, ancho, 0.05);
    x.fillStyle = '#5d4330'; for (let i = 0; i < ancho; i += 2.4) x.fillRect(i, 0, 0.05, alto - 1.6);
    x.fillStyle = '#a3a7aa'; x.fillRect(0, alto - 1.6, ancho, 1.6);
    x.strokeStyle = '#8c9093'; x.lineWidth = 0.04;
    for (let i = 0; i < ancho; i += 1.25) x.strokeRect(i, alto - 1.55, 1.25, 1.5);
  } else {
    // chapa gris azulada en paneles verticales, con la junta horizontal a media altura
    x.fillStyle = '#c6d0d8'; x.fillRect(0, 0, ancho, alto);
    x.fillStyle = '#b3bec7'; for (let i = 0; i < ancho; i += 1.1) x.fillRect(i, 0, 0.05, alto);
    x.fillStyle = '#aab5be'; x.fillRect(0, alto * 0.55, ancho, 0.06);
    x.fillStyle = '#d7dde2'; x.fillRect(0, alto - 0.5, ancho, 0.5);
  }
  x.fillStyle = '#5a5d60'; x.fillRect(0, 0, ancho, 0.45);   // el zócalo
  if (puertas) {
    // puertas de servicio y salidas de emergencia, repartidas
    const n = Math.max(1, Math.round(ancho / 22));
    for (let i = 0; i < n; i++) {
      const px = ancho * (i + 0.5) / n - 0.5;
      x.fillStyle = '#6f7477'; x.fillRect(px, 0, 1.0, 2.15);
      x.fillStyle = '#4c5053'; x.fillRect(px + 0.78, 1.0, 0.1, 0.06);
      x.strokeStyle = '#3f4346'; x.lineWidth = 0.05; x.strokeRect(px, 0, 1.0, 2.15);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** viste la trasera y los dos costados de una nave de W × D × H; estilo: 'chapa' o 'madera' */
export function vestirLados(group, W, D, H, estilo = 'chapa') {
  const cara = (ancho, x, z, ry, puertas) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, H), new THREE.MeshStandardMaterial({ map: lienzo(ancho, H, estilo, puertas), roughness: 0.75 }));
    m.position.set(x, H / 2, z);
    m.rotation.y = ry;
    m.receiveShadow = true;
    group.add(m);
  };
  cara(W, 0, D / 2 + 0.03, 0, true);                       // la trasera
  cara(D, W / 2 + 0.03, 0, Math.PI / 2, false);            // los costados
  cara(D, -W / 2 - 0.03, 0, -Math.PI / 2, false);
}
