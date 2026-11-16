/**
 * Memoria en el móvil. Entre fotos, rótulos y suelos dibujados, el juego llegaba a ~1,2 GB y Safari o
 * el visor del móvil lo cerraban a los pocos segundos. Aquí, solo en el móvil:
 *  - los lienzos grandes (atlas de rótulos, suelos y paredes de 512 px o más) se pasan a la mitad:
 *    ocupan la cuarta parte y en una pantalla pequeña no se nota;
 *  - el relieve (bumpMap) y el mapa de brillo (roughnessMap) de esos lienzos grandes se quitan:
 *    con la calidad baja del móvil apenas se ven y gastan memoria y tiempo de dibujo.
 * Se repasa la escena de vez en cuando porque los interiores y los coches nuevos se montan sobre la marcha.
 */
const seen = new WeakSet();
const dropped = new WeakSet();
const BIG = 512 * 512;
const MB = (w, h) => (w * h * 4 * 1.33) / 1048576;

/** el lienzo a la mitad; el grande se libera (nadie más lo usa: cada textura tiene su lienzo) */
function halve(t) {
  const src = t.image;
  const w = Math.max(1, src.width >> 1), h = Math.max(1, src.height >> 1);
  const small = document.createElement('canvas');
  small.width = w;
  small.height = h;
  const g = small.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, w, h);
  const before = MB(src.width, src.height);
  seen.add(small);
  // si ya estaba en la tarjeta gráfica con el tamaño grande, se suelta primero (si no, se quedaría reservado)
  t.dispose();
  t.image = small;
  t.needsUpdate = true;
  src.width = src.height = 1;
  return before - MB(w, h);
}

const isCanvas = (im) => typeof HTMLCanvasElement !== 'undefined' && im instanceof HTMLCanvasElement;

/** repasa la escena; devuelve los MB que se ahorran */
export function slimTextures(root) {
  let saved = 0;
  root.traverse((o) => {
    if (!o.material) return;
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      if (seen.has(m)) continue;
      seen.add(m);
      for (const slot of ['bumpMap', 'roughnessMap']) {
        const t = m[slot], im = t?.image;
        if (dropped.has(t)) { m[slot] = null; m.needsUpdate = true; continue; }
        if (isCanvas(im) && !seen.has(im) && im.width * im.height >= BIG) {
          saved += MB(im.width, im.height);
          dropped.add(t);
          m[slot] = null;
          m.needsUpdate = true;
          // fuera de la tarjeta gráfica; si otro material la sigue usando, se vuelve a subir sola
          t.dispose();
        }
      }
      for (const k in m) {
        const t = m[k];
        if (!t?.isTexture || seen.has(t)) continue;
        seen.add(t);
        const im = t.image;
        if (!isCanvas(im) || seen.has(im) || im.width * im.height < BIG) continue;
        saved += halve(t);
      }
    }
  });
  return saved;
}

/**
 * Las formas grandes (edificios, aceras, rotondas: 40 000 vértices o más) se guardan dos veces: en la memoria
 * y en la tarjeta gráfica. En el móvil, en cuanto llegan a la tarjeta, se suelta la copia de la memoria
 * (unos 170 MB): son fijas y después de montar la ciudad nadie las vuelve a leer. Si el navegador apaga el 3D,
 * el aviso de main.js vuelve a cargar la partida, así que no hace falta tenerlas para resubirlas.
 */
const FREE_MIN = 40000;
function release() { this.array = null; }

export function freeBigGeometry(root) {
  let mb = 0;
  const done = new Set();
  root.traverse((o) => {
    const g = o.isMesh ? o.geometry : null;
    if (!g || done.has(g) || (g.attributes.position?.count || 0) < FREE_MIN) return;
    done.add(g);
    // lo que se calcula con los vértices, antes de soltarlos (para saber si se ve o no)
    if (!g.boundingSphere) g.computeBoundingSphere();
    if (!g.boundingBox) g.computeBoundingBox();
    for (const a of [...Object.values(g.attributes), g.index]) {
      if (!a?.array || a.isInterleavedBufferAttribute) continue;
      mb += a.array.byteLength / 1048576;
      a.onUpload(release);
    }
  });
  return mb;
}
