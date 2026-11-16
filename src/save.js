/**
 * Guardado de la partida en el navegador. En la demo (demo.html, o ?nueva en la dirección)
 * no se lee ni se guarda nada: cada vez se empieza de cero, y lo de esa partida vive solo en memoria.
 */
export const DEMO = typeof window !== 'undefined'
  && (window.LAVA_DEMO === true || new URLSearchParams(window.location.search).has('nueva'));

const memory = new Map();

export const store = {
  get(k) {
    if (DEMO) return memory.has(k) ? memory.get(k) : null;
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k, v) {
    if (DEMO) { memory.set(k, String(v)); return; }
    try { localStorage.setItem(k, String(v)); } catch { /* sin almacenamiento: vale para esta partida */ }
  },
  remove(k) {
    if (DEMO) { memory.delete(k); return; }
    try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ }
  },
};
