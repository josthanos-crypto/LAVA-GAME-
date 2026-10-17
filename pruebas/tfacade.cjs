// fotos: fachada y lateral del tanatorio (de día y de noche), funeraria, Sakura por dentro e Iria
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/mapillary|404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/sub/index.html?t=12');
  await p.waitForFunction(() => { const b = document.getElementById('start-btn'); return b && getComputedStyle(b).display !== 'none'; }, null, { timeout: 240000 });
  await p.click('#start-btn');
  await p.waitForTimeout(2000);
  await p.evaluate(() => { const g = window.__game; g.player.vel.set(0, 0); g.toggleFoot(); });
  const shot = async (name, cam, wait = 3000) => {
    await p.evaluate((cam) => { window.__game.camOverride = cam; }, cam);
    await p.waitForTimeout(wait);
    await p.screenshot({ path: name });
  };
  // el personaje cerca, para que la ciudad se cargue alrededor
  await p.evaluate(() => { const g = window.__game; g.onFoot.placeAt(686, -30, 0); });
  await p.waitForTimeout(2500);
  const C = [684.8, -48.2], nf = [0.726, 0.688], ns = [0.702, -0.712];
  const t = [-nf[1], nf[0]];
  const door = [C[0] + t[0] * 7.5, C[1] + t[1] * 7.5];
  await shot('fac_tanatorio_frente.png', { pos: [door[0] + nf[0] * 12.5, 1.7, door[1] + nf[1] * 12.5], look: [door[0], 2.4, door[1]], fov: 62 });
  const up = [-ns[1], ns[0]].map(v => -v); // calle arriba, desde la esquina
  const mid = [C[0] + up[0] * 12, C[1] + up[1] * 12];
  await shot('fac_tanatorio_lateral.png', { pos: [mid[0] + ns[0] * 11, 1.6, mid[1] + ns[1] * 11], look: [mid[0], 2.2, mid[1]], fov: 66 });
  await p.evaluate(() => window.__game.setTime(22));
  await p.waitForTimeout(1500);
  await shot('fac_tanatorio_lateral_noche.png', { pos: [mid[0] + ns[0] * 11, 1.6, mid[1] + ns[1] * 11], look: [mid[0], 2.2, mid[1]], fov: 66 }, 3500);
  await shot('fac_tanatorio_frente_noche.png', { pos: [door[0] + nf[0] * 12.5, 1.7, door[1] + nf[1] * 12.5], look: [door[0], 2.4, door[1]], fov: 62 }, 2500);
  await p.evaluate(() => window.__game.setTime(12));
  // la funeraria de cerca
  await p.evaluate(() => { const g = window.__game; g.onFoot.placeAt(-227, 324, Math.PI); });
  await p.waitForTimeout(2500);
  await shot('fac_funeraria.png', { pos: [-227 + 0.088 * 6 + 3, 1.7, 316 + 0.996 * 6], look: [-227, 2.2, 316], fov: 66 });
  await p.evaluate(() => { window.__game.camOverride = null; });
  // el Sakura por dentro
  await p.evaluate(() => {
    const g = window.__game, d = g.locales.defs.find(q => q.id === 'sakura');
    g.onFoot.placeAt(d.spot.x + d.door.nx * 0.4, d.spot.z + d.door.nz * 0.4, Math.atan2(-d.door.nx, -d.door.nz));
  });
  await p.waitForTimeout(1500);
  await p.keyboard.press('f');
  for (let i = 0; i < 3; i++) { await p.evaluate(() => { const L = window.__game.locales; if (L.pending) L.pending.t += 0.31; }); await p.waitForTimeout(400); }
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'fac_sakura_dentro.png' });
  // Iria
  await p.keyboard.press('4');
  await p.waitForTimeout(1500);
  const iria = await p.evaluate(() => ({ toast: document.getElementById('toast').textContent, key: window.__game.onFoot.charKey, fem: window.__game.dialog.fem }));
  console.log('Iria', JSON.stringify(iria));
  await p.evaluate(() => {
    const g = window.__game, o = g.onFoot, a = o.heading;
    g.camOverride = { pos: [o.pos.x + Math.sin(a) * 2.4, 1.3, o.pos.y + Math.cos(a) * 2.4], look: [o.pos.x, 1.0, o.pos.y], fov: 50 };
  });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: 'fac_iria.png' });
  await p.evaluate(() => { window.__game.camOverride = null; });
  // Willy le habla en femenino
  await p.evaluate(() => {
    const g = window.__game, n = g.locales.inside.built.npcs.find(q => q.name === 'Willy');
    g.onFoot.placeAt(n.x - 1.2, n.z - 0.6, 0);
  });
  await p.waitForTimeout(1500);
  await p.keyboard.press('t');
  await p.waitForTimeout(400);
  await p.keyboard.press('t');
  await p.waitForTimeout(1200);
  console.log('Willy dice:', await p.evaluate(() => document.querySelector('#dialog .text').textContent));
  console.log(errs.slice(0, 10).join('\n') || 'sin errores');
  await b.close();
})();
