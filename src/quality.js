/**
 * Perfiles de calidad para PCs distintos.
 * Tecla Q en el juego para ciclar.
 *  post: 'full' = oclusión ambiental + bloom + etalonaje + SMAA
 *        'lite' = bloom + etalonaje + SMAA (sin oclusión ambiental)
 *        'off'  = render directo
 */
const DPR = typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1;

export const QUALITY = {
  low: {
    label: 'Calidad baja',
    pixelRatio: Math.min(DPR, 1),
    shadows: false,
    shadowSize: 1024,
    post: 'off',
    maxStreetPhotos: 0,
    maxFacadePhotos: 0,
    aniso: 2,
  },
  medium: {
    label: 'Calidad media',
    pixelRatio: Math.min(DPR, 1.25),
    shadows: true,
    shadowSize: 2048,
    post: 'lite',
    maxStreetPhotos: 16,
    maxFacadePhotos: 12,
    aniso: 4,
  },
  high: {
    label: 'Calidad alta (cine)',
    pixelRatio: Math.min(DPR, 1.5),
    shadows: true,
    shadowSize: 4096,
    post: 'full',
    maxStreetPhotos: 28,
    maxFacadePhotos: 22,
    aniso: 8,
  },
};

export const QUALITY_ORDER = ['low', 'medium', 'high'];

export function applyQuality(level, { renderer, sun, streetPhotos, facadePhotos, postfx }) {
  const q = QUALITY[level] || QUALITY.high;
  renderer.setPixelRatio(q.pixelRatio);
  renderer.shadowMap.enabled = q.shadows;
  if (sun) {
    sun.castShadow = q.shadows;
    sun.shadow.mapSize.set(q.shadowSize, q.shadowSize);
    if (sun.shadow.map) {
      sun.shadow.map.dispose();
      sun.shadow.map = null;
    }
  }
  postfx?.setMode(q.post);
  if (streetPhotos) streetPhotos.setMax?.(q.maxStreetPhotos);
  if (facadePhotos) facadePhotos.setMax?.(q.maxFacadePhotos);
  return q;
}
