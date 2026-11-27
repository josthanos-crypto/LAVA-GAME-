/**
 * Recorrido de prueba de los puentes y túneles de la circunvalación (trinchera.js). Con el servidor de desarrollo y
 * el juego en marcha (pulsar «Conducir»), en la consola o desde las herramientas del navegador:
 *
 *   const P = await import('/pruebas/puentes.js');
 *   P.lista();                       // los cruces: número, nombre, tipo y puentes
 *   await P.ir(0, 0, 'abajo', 4);    // el coche por la calle de abajo, 4 m antes del puente 0 del cruce 0
 *   await P.ir(0, 0, 'arriba', 14);  // por la calle de arriba
 *   P.revisar();                     // comprobaciones automáticas (ver abajo)
 *
 * 'abajo' es la calle que pasa por debajo: en una 'trinchera' la circunvalación (a lo largo de u); en un 'terraplen'
 * la calle del túnel (a lo largo de c). La cámara del juego sigue al coche: se hace una foto de cada sitio.
 *
 * revisar() mira, sin fotos:
 *  - vallas: ningún trozo de barrera, barandilla, valla o aleta de los puentes encima de la calzada de una calle que no
 *    sea la circunvalación de su franja;
 *  - coche: el coche del jugador se dibuja (no lo descarta three.js por estar fuera de cámara) dentro de la franja;
 *  - caja vieja: la del paso de Tenderete de arrecifeExtras.js, escondida y sin sus losetas.
 */
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const juego = () => window.__game;

async function trincheras() {
  return (await import('/src/trinchera.js')).TRINCHERAS;
}

export async function lista() {
  return (await trincheras()).map((t, k) => `${k}: ${t.nombre} (${t.tipo}) · ${t.puentes.length} puente(s)${t.puentes.some(p => p.peatonal) ? ', uno peatonal' : ''}`);
}

export async function ir(k, i, modo = 'abajo', s = 14, lado = -1, hora = 12) {
  const g = juego(), T = (await trincheras())[k], p = T.puentes[i];
  const abajoU = T.tipo === 'trinchera';
  let o, d, off;
  if ((modo === 'abajo') === abajoU) { d = T.u; o = p.o; off = (T.ancho > 10 ? T.ancho * 0.35 : 2) * lado; }
  else { d = p.c; o = p.o; off = Math.min(p.w / 4, 3) * lado; }
  const n = [-d[1], d[0]];
  g.camOverride = null;
  g.setTime(hora);
  g.player.pos.x = o[0] - d[0] * s + n[0] * off;
  g.player.pos.y = o[1] - d[1] * s + n[1] * off;
  g.player.heading = Math.atan2(d[0], d[1]);
  g.player.vel.x = g.player.vel.y = 0;
  // a ras de suelo (si no, conserva la altura del sitio de antes y cae desde el cielo)
  if ('y' in g.player) g.player.y = g.terrainY(g.player.pos.x, g.player.pos.y);
  if ('vy' in g.player) g.player.vy = 0;
  await esperar(4500);
  return `${T.nombre} #${i} ${modo}`;
}

export async function revisar() {
  const g = juego(), T = await trincheras(), V = g.camera.position.constructor, v = new V();
  const fallos = [];
  // vallas encima de la calzada de otra calle
  const segs = [];
  for (const r of g.map.roads) {
    if (r.ped || r.dirt || r.p.length < 2) continue;
    for (let i = 0; i < r.p.length - 1; i++) segs.push([...r.p[i], ...r.p[i + 1], r.w / 2 - 0.6]);
  }
  const dist = (x, z, ax, az, bx, bz) => {
    const dx = bx - ax, dz = bz - az, L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L));
    return Math.hypot(ax + dx * t - x, az + dz * t - z);
  };
  g.scene.updateMatrixWorld(true);
  let malas = 0;
  g.scene.traverse((o) => {
    if (!o.isMesh || !/^(trincheraPuente|terraplenAletas)$/.test(o.parent?.name || '')) return;
    const pa = o.geometry.attributes.position, alto = o.geometry.userData.alturaPuente;
    for (let i = 0; i < pa.count; i += 3) {
      v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld);
      // la altura sobre el tablero (trinchera.js la guarda antes de pegar el puente a su losa)
      const y = alto ? alto[i] : v.y;
      if (y < 0.45 || y > 3.5) continue;
      const t = T.find(t => Math.abs((v.x - t.o[0]) * t.u[0] + (v.z - t.o[1]) * t.u[1]) < t.llano + t.rampa + 20
        && Math.abs(-(v.x - t.o[0]) * t.u[1] + (v.z - t.o[1]) * t.u[0]) < t.ancho + t.talud + 20);
      for (const [ax, az, bx, bz, h] of segs) {
        if (h < 0.5 || dist(v.x, v.z, ax, az, bx, bz) >= h) continue;
        const L = Math.hypot(bx - ax, bz - az) || 1;
        const along = t && Math.abs(((bx - ax) * t.u[0] + (bz - az) * t.u[1]) / L) > 0.85 && Math.abs(-(v.x - t.o[0]) * t.u[1] + (v.z - t.o[1]) * t.u[0]) < t.ancho + 1;
        if (!along) { malas++; break; }
      }
    }
  });
  if (malas > 20) fallos.push(`vallas: ${malas} puntos de vallas de puentes encima de una calzada`);
  // el coche se dibuja en la franja (cocheTrinchera.js le quita el descarte por cámara)
  let culled = 0;
  g.player.mesh.traverse(o => { if (o.isMesh && o.frustumCulled && g.player.mesh.userData.enFranja) culled++; });
  if (culled) fallos.push(`coche: ${culled} piezas del coche se pueden dejar de dibujar en la franja`);
  // la caja vieja del paso de Tenderete
  const paso = g.extras?.paso;
  if (paso?.group?.visible) fallos.push('Tenderete: la caja vieja de arrecifeExtras.js sigue visible');
  if (paso) {
    let losetas = 0;
    for (const arr of g.player.roofs.cells.values()) for (const r of arr) if (r.x1 - r.x0 < 1.9 && r.z1 - r.z0 < 1.9 && Math.hypot((r.x0 + r.x1) / 2 - paso.x, (r.z0 + r.z1) / 2 - paso.z) < 40) losetas++;
    if (losetas) fallos.push(`Tenderete: quedan ${losetas} losetas del puente viejo (suben el coche dentro del túnel)`);
  }
  return fallos.length ? fallos : ['bien: sin vallas en la calzada, coche visible, sin la caja vieja de Tenderete'];
}
