/**
 * EL MAPA POR BARRIOS — cómo se junta al cargar el juego.
 *
 * public/map/ tiene un archivo por barrio (sus edificios, calles y carteles) y
 * comun.json (todo lo demás: mar, árboles, plazas, gasolineras, bancos…). Cada
 * pieza de barrio lleva apuntado el sitio que tenía en arrecife.json (`orden`),
 * así que al juntarlos sale el mismo mapa, pieza a pieza y en el mismo orden.
 *
 * Lo usan world.js (al cargar) y tools/split-barrios.mjs (para comprobarlo).
 * Sin imports a propósito: tiene que funcionar igual en el navegador y en node.
 */

export const CAPAS = ['buildings', 'roads', 'signs'];

/**
 * comun: el contenido de comun.json · partes: los JSON de cada barrio.
 * Devuelve el mapa entero, igual que arrecife.json. Si falta o sobra una pieza, lanza un error.
 */
export function unirBarrios(comun, partes) {
  const mapa = { ...comun };
  for (const capa of CAPAS) {
    const total = comun.total?.[capa];
    if (!Number.isInteger(total)) throw new Error(`comun.json no dice cuántos ${capa} hay`);
    const lista = new Array(total);
    let puestas = 0;
    for (const parte of partes) {
      const piezas = parte[capa] || [];
      const orden = parte.orden?.[capa];
      if (!Array.isArray(orden) || orden.length !== piezas.length) {
        throw new Error(`${parte.barrio?.id || '?'}: le falta el orden de ${capa}`);
      }
      piezas.forEach((f, i) => {
        const sitio = orden[i];
        if (lista[sitio] !== undefined) throw new Error(`${capa} ${sitio} repetido`);
        lista[sitio] = f;
        puestas++;
      });
    }
    if (puestas !== total) throw new Error(`faltan ${total - puestas} ${capa}`);
    mapa[capa] = lista;
  }
  delete mapa.total;
  return mapa;
}

/** descarga el índice, comun.json y todos los barrios a la vez, y los junta */
export async function cargarMapaPorBarrios(base = 'map/') {
  const pedir = async (f) => {
    const res = await fetch(base + f);
    if (!res.ok) throw new Error(`${f}: ${res.status}`);
    return res.json();
  };
  const indice = await pedir('barrios.json');
  if (!indice.comun || !Array.isArray(indice.barrios)) throw new Error('barrios.json sin comun ni barrios');
  const nombre = (f) => f.replace(/^map\//, '');
  const [comun, ...partes] = await Promise.all([
    pedir(nombre(indice.comun)),
    ...indice.barrios.map((b) => pedir(nombre(b.file))),
  ]);
  return unirBarrios(comun, partes);
}
