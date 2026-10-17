// prueba de la terraza del Reducto, los perros salchicha y los patinadores
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const mobile = process.argv[2] === 'm';
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext(mobile ? { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } : { viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/mapillary|404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/sub/index.html?t=12.5');
  await p.waitForFunction(() => { const b = document.getElementById('start-btn'); return b && getComputedStyle(b).display !== 'none'; }, null, { timeout: 240000 });
  await p.click('#start-btn');
  await p.waitForTimeout(2000);
  const pre = mobile ? 'mv_' : 'pc_';
  // marco de la plaza: u a lo largo de la fachada, n hacia el paseo, F = la fachada
  await p.evaluate(() => {
    const g = window.__game, P = g.terrace.plaza.pts;
    const u = [P[1][0] - P[0][0], P[1][1] - P[0][1]], lu = Math.hypot(...u);
    const n = [P[3][0] - P[0][0], P[3][1] - P[0][1]], ln = Math.hypot(...n);
    const U = [u[0] / lu, u[1] / lu], N = [n[0] / ln, n[1] / ln];
    window.__T = { U, N, A: [P[0][0] - N[0] * 9.2 - U[0] * 2, P[0][1] - N[1] * 9.2 - U[1] * 2] };
    window.__at = (s, d) => [window.__T.A[0] + U[0] * s + N[0] * d, window.__T.A[1] + U[1] * s + N[1] * d];
    g.player.vel.set(0, 0);
    g.toggleFoot();
    const [x, z] = window.__at(28, 12);
    g.onFoot.placeAt(x, z, Math.atan2(-N[0], -N[1]));
  });
  await p.waitForTimeout(6000);
  const census = () => p.evaluate(() => {
    const g = window.__game;
    return {
      perros: g.dogs.dogs.filter(d => d.visible).length, sueltos: g.dogs.dogs.filter(d => d.visible && !d.owner).length,
      patines: g.skaters.list.filter(s => s.visible).map(s => s.kind + ':' + s.state).join(' '),
      gente: g.locales.street.length,
    };
  });
  console.log('plaza', JSON.stringify(await census()));
  // la terraza desde el paseo
  await p.evaluate(() => {
    const g = window.__game, at = window.__at;
    const [cx, cz] = at(20, 24), [lx, lz] = at(28, 3);
    g.camOverride = { pos: [cx, 3.2, cz], look: [lx, 1.6, lz], fov: 62 };
  });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `${pre}ter_dia.png` });
  // de cerca, bajo el toldo de La Cervecería
  await p.evaluate(() => {
    const g = window.__game, at = window.__at;
    const [cx, cz] = at(33, 10.5), [lx, lz] = at(26, 2.5);
    g.camOverride = { pos: [cx, 1.7, cz], look: [lx, 1.1, lz], fov: 64 };
  });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `${pre}ter_cerca.png` });
  // un perro suelto y un patinador de la plaza, de cerca
  await p.evaluate(() => {
    const g = window.__game, d = g.dogs.dogs.find(q => q.visible && !q.owner) || g.dogs.dogs.find(q => q.visible);
    if (!d) return;
    g.camOverride = { pos: [d.x + 1.6, 0.8, d.z + 1.2], look: [d.x, 0.25, d.z], fov: 50 };
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${pre}ter_perro.png` });
  await p.evaluate(() => {
    const g = window.__game, s = g.skaters.list.find(q => q.visible && q.kind === 'loop') || g.skaters.list.find(q => q.visible);
    if (!s) return;
    g.camOverride = { pos: [s.x + 3, 1.6, s.z + 2.5], look: [s.x, 0.9, s.z], fov: 55 };
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${pre}ter_patin.png` });
  // un perro con correa por la calle
  await p.evaluate(() => {
    const g = window.__game, d = g.dogs.dogs.find(q => q.visible && q.owner);
    if (!d) return;
    g.camOverride = { pos: [d.x + 2.4, 1.5, d.z + 2.0], look: [d.x, 0.5, d.z], fov: 55 };
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${pre}ter_correa.png` });
  await p.evaluate(() => { window.__game.camOverride = null; });
  // el camarero
  await p.evaluate(() => {
    const g = window.__game, w = g.locales.street.find(n => n.name === 'Camarero');
    g.onFoot.placeAt(w.x + 1.2, w.z + 0.8, Math.atan2(-1.2, -0.8));
  });
  await p.waitForTimeout(1200);
  const prompt = await p.evaluate(() => document.getElementById('prompt').textContent);
  await p.keyboard.press('t');
  await p.waitForTimeout(1500);
  console.log('camarero | aviso:', prompt, '| dice:', await p.evaluate(() => document.querySelector('#dialog .text').textContent));
  await p.screenshot({ path: `${pre}ter_camarero.png` });
  // de noche: las guirnaldas encendidas
  await p.evaluate(() => { window.__game.setTime(21.5); });
  await p.waitForTimeout(2500);
  await p.evaluate(() => {
    const g = window.__game, at = window.__at;
    const [cx, cz] = at(22, 22), [lx, lz] = at(30, 3);
    g.camOverride = { pos: [cx, 2.6, cz], look: [lx, 1.8, lz], fov: 62 };
  });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: `${pre}ter_noche.png` });
  await p.evaluate(() => { window.__game.camOverride = null; window.__game.setTime(12.5); });
  // atropellos: al perro no le pasa nada; el patinador sale volando y se levanta
  const crash = await p.evaluate(async () => {
    const g = window.__game;
    const dog = g.dogs.dogs.find(q => q.visible && !q.owner);
    const sk = g.skaters.list.find(q => q.visible && q.kind === 'loop');
    const out = {};
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    if (dog) {
      const ctxCar = { driving: true, carSpeed: 12, carVel: { x: 12, y: 0 } };
      const fake = { pos: { x: dog.x - 1.0, y: dog.z } };
      for (let i = 0; i < 10; i++) { g.dogs.update(0.05, fake, ctxCar); fake.pos.x += 0.6; }
      out.perro = { distCoche: +Math.hypot(dog.x - fake.pos.x, dog.z - fake.pos.y).toFixed(2), visible: dog.visible, salto: dog.hop > 0 || dog.y > 0 };
    }
    if (sk) {
      const ctxCar = { driving: true, carSpeed: 14, carVel: { x: 14, y: 0 } };
      g.skaters.update(0.05, { pos: { x: sk.x - 0.5, y: sk.z }, heading: 0 }, ctxCar);
      out.patinador = sk.state;
      await wait(200);
    }
    return out;
  });
  console.log('atropellos', JSON.stringify(crash));
  await p.waitForTimeout(8000);
  console.log('después', JSON.stringify(await p.evaluate(() => window.__game.skaters.list.filter(s => s.kind === 'loop').map(s => s.state))));
  console.log(errs.slice(0, 10).join('\n') || 'sin errores');
  await b.close();
})();
